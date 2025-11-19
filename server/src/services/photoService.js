/**
 * Photo Processing Service
 * Handles image processing, EXIF extraction, RAW conversion, thumbnails
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Extract EXIF metadata from image
 */
async function extractExifData(filePath) {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Extract EXIF data
    const exif = metadata.exif || {};
    const exifData = {};

    // Parse common EXIF fields
    if (exif) {
      // Camera info
      exifData.camera = exif.Model || exif.Make || null;
      exifData.lens = exif.LensModel || null;

      // Capture settings
      exifData.iso = exif.ISOSpeedRatings || exif.ISO || null;
      exifData.aperture = exif.FNumber || exif.ApertureValue || null;
      exifData.shutterSpeed = exif.ExposureTime || null;
      exifData.focalLength = exif.FocalLength || null;

      // Date
      const dateStr = exif.DateTimeOriginal || exif.DateTime || exif.CreateDate;
      if (dateStr) {
        exifData.captureDate = parseExifDate(dateStr);
      }

      // GPS
      if (exif.GPSLatitude && exif.GPSLongitude) {
        exifData.gpsLatitude = parseGPSCoordinate(exif.GPSLatitude, exif.GPSLatitudeRef);
        exifData.gpsLongitude = parseGPSCoordinate(exif.GPSLongitude, exif.GPSLongitudeRef);
      }
    }

    // Image dimensions
    exifData.width = metadata.width;
    exifData.height = metadata.height;
    exifData.format = metadata.format;
    exifData.space = metadata.space;
    exifData.hasAlpha = metadata.hasAlpha;

    // Store full metadata for reference
    exifData.fullMetadata = metadata;

    return exifData;
  } catch (error) {
    console.error('Error extracting EXIF:', error);
    return {
      width: null,
      height: null,
      metadata: { error: error.message }
    };
  }
}

/**
 * Parse EXIF date string to JavaScript Date
 */
function parseExifDate(dateStr) {
  try {
    // EXIF format: "YYYY:MM:DD HH:MM:SS"
    const [datePart, timePart] = dateStr.split(' ');
    const [year, month, day] = datePart.split(':');
    const [hour, minute, second] = (timePart || '00:00:00').split(':');

    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
  } catch (error) {
    return null;
  }
}

/**
 * Parse GPS coordinates from EXIF
 */
function parseGPSCoordinate(coord, ref) {
  if (!coord || !Array.isArray(coord)) return null;

  try {
    // GPS coordinates are often in [degrees, minutes, seconds] format
    const [degrees, minutes, seconds] = coord;
    let decimal = degrees + minutes / 60 + seconds / 3600;

    // Apply reference (N/S, E/W)
    if (ref === 'S' || ref === 'W') {
      decimal = -decimal;
    }

    return decimal;
  } catch (error) {
    return null;
  }
}

/**
 * Generate thumbnail for photo
 */
async function generateThumbnail(filePath, outputPath, size = 400) {
  try {
    await sharp(filePath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
}

/**
 * Generate multiple thumbnail sizes
 */
async function generateThumbnails(filePath, outputDir, basename) {
  const sizes = {
    small: 200,
    medium: 400,
    large: 800
  };

  const thumbnails = {};

  for (const [name, size] of Object.entries(sizes)) {
    const outputPath = path.join(outputDir, `${basename}_${name}.jpg`);
    try {
      await generateThumbnail(filePath, outputPath, size);
      thumbnails[name] = outputPath;
    } catch (error) {
      console.error(`Error generating ${name} thumbnail:`, error);
    }
  }

  return thumbnails;
}

/**
 * Process RAW file
 * Note: This is a simplified version. For production, use libraw or dcraw
 */
async function processRawFile(filePath) {
  try {
    // For now, sharp can handle some RAW formats
    // In production, you'd use libraw or dcraw for better RAW support
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Check if it's a RAW format
    const rawFormats = ['dng', 'cr2', 'nef', 'arw', 'orf', 'raf', 'rw2', 'pef'];
    const ext = path.extname(filePath).toLowerCase().replace('.', '');

    if (rawFormats.includes(ext)) {
      // Extract embedded JPEG preview if available
      // This is faster than full RAW processing
      if (metadata.format === 'jpeg') {
        return { success: true, format: 'jpeg', embedded: true };
      }

      // Convert RAW to JPEG for viewing
      const tempPath = filePath.replace(path.extname(filePath), '_preview.jpg');
      await image
        .jpeg({ quality: 95 })
        .toFile(tempPath);

      return { success: true, format: 'jpeg', previewPath: tempPath };
    }

    return { success: true, format: metadata.format };
  } catch (error) {
    console.error('Error processing RAW file:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Detect file type from extension
 */
function detectFileType(filename) {
  const ext = path.extname(filename).toLowerCase().replace('.', '');

  const typeMap = {
    'jpg': 'JPG',
    'jpeg': 'JPEG',
    'png': 'PNG',
    'tiff': 'TIFF',
    'tif': 'TIFF',
    'webp': 'WEBP',
    'cr2': 'RAW_CR2',
    'nef': 'RAW_NEF',
    'arw': 'RAW_ARW',
    'dng': 'RAW_DNG',
    'raf': 'RAW_RAF',
    'orf': 'RAW_ORF',
    'rw2': 'RAW_RW2',
    'pef': 'RAW_PEF',
    'sr2': 'RAW_SR2',
    'x3f': 'RAW_X3F'
  };

  return typeMap[ext] || 'JPG';
}

/**
 * Check if file is RAW format
 */
function isRawFile(filename) {
  const fileType = detectFileType(filename);
  return fileType.startsWith('RAW_');
}

/**
 * Get image info (dimensions, size, format)
 */
async function getImageInfo(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const image = sharp(filePath);
    const metadata = await image.metadata();

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
      space: metadata.space,
      channels: metadata.channels,
      depth: metadata.depth,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      hasProfile: metadata.hasProfile
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    throw error;
  }
}

/**
 * Import photo and process
 */
async function importPhoto(filePath, userId, options = {}) {
  try {
    const filename = path.basename(filePath);
    const fileType = detectFileType(filename);
    const isRaw = isRawFile(filename);

    // Extract EXIF data
    const exifData = await extractExifData(filePath);

    // Get file info
    const info = await getImageInfo(filePath);

    // Process RAW if needed
    let previewPath = filePath;
    if (isRaw) {
      const rawResult = await processRawFile(filePath);
      if (rawResult.previewPath) {
        previewPath = rawResult.previewPath;
      }
    }

    // Generate thumbnails (from preview if RAW)
    const thumbnailDir = path.join(path.dirname(filePath), 'thumbnails');
    await fs.mkdir(thumbnailDir, { recursive: true });

    const basename = path.parse(filename).name;
    const thumbnails = await generateThumbnails(previewPath, thumbnailDir, basename);

    // Prepare photo data
    const photoData = {
      userId,
      fileName: filename,
      originalFileName: options.originalName || filename,
      fileType,
      width: exifData.width || info.width,
      height: exifData.height || info.height,
      fileSize: info.size,

      // EXIF data
      captureDate: exifData.captureDate,
      camera: exifData.camera,
      lens: exifData.lens,
      iso: exifData.iso,
      aperture: exifData.aperture,
      shutterSpeed: exifData.shutterSpeed,
      focalLength: exifData.focalLength,
      gpsLatitude: exifData.gpsLatitude,
      gpsLongitude: exifData.gpsLongitude,
      metadata: exifData.fullMetadata,

      // Initial organization
      rating: options.rating || 0,
      flagStatus: options.flagStatus || 'NONE',
      colorLabel: options.colorLabel || 'NONE',
      tags: options.tags || [],

      // Edit history (empty initially)
      editHistory: [],
      currentEdit: null
    };

    return {
      success: true,
      photoData,
      thumbnails,
      isRaw
    };
  } catch (error) {
    console.error('Error importing photo:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Apply edits to image (non-destructive)
 * Returns edited image buffer
 */
async function applyEdits(filePath, edits) {
  try {
    let image = sharp(filePath);

    // Basic adjustments
    if (edits.exposure !== undefined) {
      // Exposure adjustment (-100 to +100)
      const multiplier = 1 + (edits.exposure / 100);
      image = image.modulate({ brightness: multiplier });
    }

    if (edits.contrast !== undefined) {
      // Contrast adjustment (-100 to +100)
      const factor = (edits.contrast + 100) / 100;
      image = image.linear(factor, -(128 * factor) + 128);
    }

    if (edits.saturation !== undefined) {
      // Saturation adjustment (-100 to +100)
      const saturation = 1 + (edits.saturation / 100);
      image = image.modulate({ saturation });
    }

    if (edits.vibrance !== undefined) {
      // Vibrance (similar to saturation but more subtle)
      const vibrance = 1 + (edits.vibrance / 200); // Half effect of saturation
      image = image.modulate({ saturation: vibrance });
    }

    // Rotation
    if (edits.rotation !== undefined && edits.rotation !== 0) {
      image = image.rotate(edits.rotation);
    }

    // Crop
    if (edits.crop) {
      const { x, y, width, height } = edits.crop;
      image = image.extract({ left: x, top: y, width, height });
    }

    // Sharpening
    if (edits.sharpen !== undefined && edits.sharpen > 0) {
      const sigma = edits.sharpen / 10; // Scale to appropriate range
      image = image.sharpen(sigma);
    }

    // Blur (noise reduction)
    if (edits.blur !== undefined && edits.blur > 0) {
      image = image.blur(edits.blur);
    }

    // Convert to grayscale if specified
    if (edits.grayscale) {
      image = image.grayscale();
    }

    // Tint
    if (edits.tint) {
      image = image.tint(edits.tint);
    }

    // Color temperature (warm/cool)
    if (edits.temperature !== undefined) {
      // Simplified temperature adjustment
      if (edits.temperature > 0) {
        // Warmer (more red/yellow)
        image = image.modulate({ hue: edits.temperature });
      } else if (edits.temperature < 0) {
        // Cooler (more blue)
        image = image.modulate({ hue: 360 + edits.temperature });
      }
    }

    // Apply and return buffer
    const buffer = await image.toBuffer();
    return { success: true, buffer };
  } catch (error) {
    console.error('Error applying edits:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Export photo with edits and options
 */
async function exportPhoto(filePath, edits, exportOptions = {}) {
  try {
    // Apply edits first
    const edited = await applyEdits(filePath, edits);
    if (!edited.success) {
      throw new Error(edited.error);
    }

    let image = sharp(edited.buffer);

    // Resize if specified
    if (exportOptions.resize) {
      const { width, height, mode } = exportOptions.resize;

      const resizeOptions = {
        width,
        height,
        fit: mode === 'FILL' ? 'cover' : mode === 'EXACT' ? 'fill' : 'inside'
      };

      image = image.resize(resizeOptions);
    }

    // Output sharpening
    if (exportOptions.sharpenOutput) {
      image = image.sharpen();
    }

    // Strip metadata if requested
    if (exportOptions.stripMetadata) {
      image = image.withMetadata({
        exif: {},
        icc: 'srgb'
      });
    }

    // Format and quality
    const format = exportOptions.format || 'jpeg';
    const quality = exportOptions.quality || 90;

    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({ quality });
        break;
      case 'png':
        image = image.png({ quality });
        break;
      case 'webp':
        image = image.webp({ quality });
        break;
      case 'tiff':
        image = image.tiff({ quality });
        break;
    }

    // Export to file or buffer
    if (exportOptions.outputPath) {
      await image.toFile(exportOptions.outputPath);
      return { success: true, path: exportOptions.outputPath };
    } else {
      const buffer = await image.toBuffer();
      return { success: true, buffer };
    }
  } catch (error) {
    console.error('Error exporting photo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch apply preset to multiple photos
 */
async function batchApplyPreset(photoPaths, presetSettings) {
  const results = [];

  for (const photoPath of photoPaths) {
    try {
      const result = await applyEdits(photoPath, presetSettings);
      results.push({
        path: photoPath,
        success: result.success,
        error: result.error
      });
    } catch (error) {
      results.push({
        path: photoPath,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Generate histogram data for photo
 */
async function generateHistogram(filePath) {
  try {
    const image = sharp(filePath);
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Calculate histogram for RGB channels
    const histogram = {
      red: new Array(256).fill(0),
      green: new Array(256).fill(0),
      blue: new Array(256).fill(0),
      luminance: new Array(256).fill(0)
    };

    const channels = info.channels;
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      histogram.red[r]++;
      histogram.green[g]++;
      histogram.blue[b]++;

      // Luminance (simplified)
      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      histogram.luminance[lum]++;
    }

    return { success: true, histogram };
  } catch (error) {
    console.error('Error generating histogram:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  extractExifData,
  generateThumbnail,
  generateThumbnails,
  processRawFile,
  detectFileType,
  isRawFile,
  getImageInfo,
  importPhoto,
  applyEdits,
  exportPhoto,
  batchApplyPreset,
  generateHistogram
};
