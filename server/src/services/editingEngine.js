/**
 * Photo Editing Engine
 * Non-destructive editing, presets, edit history
 */

/**
 * Create default edit settings
 */
function getDefaultEditSettings() {
  return {
    // Basic adjustments
    exposure: 0,          // -100 to +100
    contrast: 0,          // -100 to +100
    highlights: 0,        // -100 to +100
    shadows: 0,           // -100 to +100
    whites: 0,            // -100 to +100
    blacks: 0,            // -100 to +100
    clarity: 0,           // -100 to +100
    vibrance: 0,          // -100 to +100
    saturation: 0,        // -100 to +100

    // White balance
    temperature: 0,       // -100 to +100 (cool to warm)
    tint: 0,              // -100 to +100 (green to magenta)

    // Tone curve (simplified)
    toneCurve: null,      // Array of points for custom curve

    // HSL (Hue, Saturation, Luminance)
    hsl: {
      hue: {
        red: 0,
        orange: 0,
        yellow: 0,
        green: 0,
        aqua: 0,
        blue: 0,
        purple: 0,
        magenta: 0
      },
      saturation: {
        red: 0,
        orange: 0,
        yellow: 0,
        green: 0,
        aqua: 0,
        blue: 0,
        purple: 0,
        magenta: 0
      },
      luminance: {
        red: 0,
        orange: 0,
        yellow: 0,
        green: 0,
        aqua: 0,
        blue: 0,
        purple: 0,
        magenta: 0
      }
    },

    // Split toning
    splitToning: {
      highlightsHue: 0,
      highlightsSaturation: 0,
      shadowsHue: 0,
      shadowsSaturation: 0,
      balance: 0
    },

    // Detail
    sharpening: {
      amount: 0,          // 0 to 100
      radius: 1.0,        // 0.5 to 3.0
      detail: 25,         // 0 to 100
      masking: 0          // 0 to 100
    },
    noiseReduction: {
      luminance: 0,       // 0 to 100
      luminanceDetail: 50, // 0 to 100
      color: 25,          // 0 to 100
      colorDetail: 50     // 0 to 100
    },

    // Lens corrections
    lensCorrections: {
      distortion: 0,      // -100 to +100
      chromaticAberration: false,
      vignette: 0         // -100 to +100
    },

    // Transform
    transform: {
      rotation: 0,        // -180 to +180 degrees
      verticalPerspective: 0,  // -100 to +100
      horizontalPerspective: 0, // -100 to +100
      crop: null          // { x, y, width, height }
    },

    // Effects
    effects: {
      vignette: 0,        // -100 to +100
      vignetteFeather: 50, // 0 to 100
      grain: 0,           // 0 to 100
      grainSize: 25,      // 0 to 100
      dehaze: 0           // -100 to +100
    },

    // Camera calibration
    calibration: {
      profile: 'Adobe Standard', // Adobe Standard, Camera Faithful, etc.
      redHue: 0,
      redSaturation: 0,
      greenHue: 0,
      greenSaturation: 0,
      blueHue: 0,
      blueSaturation: 0
    },

    // Other
    grayscale: false,     // Convert to B&W
    colorMix: null        // For B&W: R, G, B channel mix
  };
}

/**
 * Merge edit settings (apply preset on top of current edits)
 */
function mergeEditSettings(currentEdits, newEdits) {
  return {
    ...currentEdits,
    ...newEdits,
    // Deep merge for nested objects
    hsl: { ...currentEdits.hsl, ...newEdits.hsl },
    splitToning: { ...currentEdits.splitToning, ...newEdits.splitToning },
    sharpening: { ...currentEdits.sharpening, ...newEdits.sharpening },
    noiseReduction: { ...currentEdits.noiseReduction, ...newEdits.noiseReduction },
    lensCorrections: { ...currentEdits.lensCorrections, ...newEdits.lensCorrections },
    transform: { ...currentEdits.transform, ...newEdits.transform },
    effects: { ...currentEdits.effects, ...newEdits.effects },
    calibration: { ...currentEdits.calibration, ...newEdits.calibration }
  };
}

/**
 * Save edit to photo history
 */
async function saveEdit(photoId, editSettings, prisma, presetId = null) {
  try {
    // Mark previous edits as not current
    await prisma.photoEdit.updateMany({
      where: {
        photoId,
        isCurrent: true
      },
      data: {
        isCurrent: false
      }
    });

    // Create new edit record
    const edit = await prisma.photoEdit.create({
      data: {
        photoId,
        presetId,
        adjustments: editSettings,
        isCurrent: true
      }
    });

    // Update photo's currentEdit field
    await prisma.photo.update({
      where: { id: photoId },
      data: {
        currentEdit: editSettings,
        editHistory: {
          push: {
            id: edit.id,
            timestamp: edit.appliedAt,
            presetId
          }
        }
      }
    });

    return { success: true, edit };
  } catch (error) {
    console.error('Error saving edit:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get edit history for photo
 */
async function getEditHistory(photoId, prisma) {
  try {
    const edits = await prisma.photoEdit.findMany({
      where: { photoId },
      orderBy: { appliedAt: 'desc' },
      include: {
        preset: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return { success: true, edits };
  } catch (error) {
    console.error('Error getting edit history:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Revert to previous edit
 */
async function revertToEdit(photoId, editId, prisma) {
  try {
    const edit = await prisma.photoEdit.findUnique({
      where: { id: editId }
    });

    if (!edit) {
      return { success: false, error: 'Edit not found' };
    }

    // Mark all edits as not current
    await prisma.photoEdit.updateMany({
      where: { photoId },
      data: { isCurrent: false }
    });

    // Mark this edit as current
    await prisma.photoEdit.update({
      where: { id: editId },
      data: { isCurrent: true }
    });

    // Update photo's currentEdit
    await prisma.photo.update({
      where: { id: photoId },
      data: {
        currentEdit: edit.adjustments
      }
    });

    return { success: true, edit };
  } catch (error) {
    console.error('Error reverting edit:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reset photo to original (no edits)
 */
async function resetToOriginal(photoId, prisma) {
  try {
    // Mark all edits as not current
    await prisma.photoEdit.updateMany({
      where: { photoId },
      data: { isCurrent: false }
    });

    // Reset photo's currentEdit
    await prisma.photo.update({
      where: { id: photoId },
      data: {
        currentEdit: null
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error resetting photo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create preset from current edits
 */
async function createPreset(userId, name, description, settings, prisma, isPublic = false) {
  try {
    const preset = await prisma.editPreset.create({
      data: {
        userId,
        name,
        description,
        settings,
        isPublic
      }
    });

    return { success: true, preset };
  } catch (error) {
    console.error('Error creating preset:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's presets
 */
async function getUserPresets(userId, prisma, includePublic = true) {
  try {
    const where = includePublic
      ? { OR: [{ userId }, { isPublic: true }] }
      : { userId };

    const presets = await prisma.editPreset.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return { success: true, presets };
  } catch (error) {
    console.error('Error getting presets:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Apply preset to photo
 */
async function applyPreset(photoId, presetId, prisma, merge = false) {
  try {
    const preset = await prisma.editPreset.findUnique({
      where: { id: presetId }
    });

    if (!preset) {
      return { success: false, error: 'Preset not found' };
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId }
    });

    if (!photo) {
      return { success: false, error: 'Photo not found' };
    }

    // Merge with existing edits or replace
    const newSettings = merge && photo.currentEdit
      ? mergeEditSettings(photo.currentEdit, preset.settings)
      : preset.settings;

    // Save edit
    await saveEdit(photoId, newSettings, prisma, presetId);

    // Increment preset usage count
    await prisma.editPreset.update({
      where: { id: presetId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    });

    return { success: true, settings: newSettings };
  } catch (error) {
    console.error('Error applying preset:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch apply preset to multiple photos
 */
async function batchApplyPreset(photoIds, presetId, prisma) {
  const results = [];

  for (const photoId of photoIds) {
    const result = await applyPreset(photoId, presetId, prisma);
    results.push({
      photoId,
      success: result.success,
      error: result.error
    });
  }

  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  return {
    success: true,
    results,
    successCount,
    failedCount
  };
}

/**
 * Copy settings from one photo to another (sync settings)
 */
async function copySettings(sourcePhotoId, targetPhotoIds, prisma, settingsToSync = null) {
  try {
    const sourcePhoto = await prisma.photo.findUnique({
      where: { id: sourcePhotoId }
    });

    if (!sourcePhoto || !sourcePhoto.currentEdit) {
      return { success: false, error: 'Source photo has no edits' };
    }

    let settingsToCopy = sourcePhoto.currentEdit;

    // If specific settings specified, copy only those
    if (settingsToSync && Array.isArray(settingsToSync)) {
      settingsToCopy = {};
      for (const key of settingsToSync) {
        if (sourcePhoto.currentEdit[key] !== undefined) {
          settingsToCopy[key] = sourcePhoto.currentEdit[key];
        }
      }
    }

    // Apply to target photos
    const results = [];
    for (const targetId of targetPhotoIds) {
      const result = await saveEdit(targetId, settingsToCopy, prisma);
      results.push({
        photoId: targetId,
        success: result.success,
        error: result.error
      });
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    return {
      success: true,
      results,
      successCount,
      failedCount
    };
  } catch (error) {
    console.error('Error copying settings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Auto-enhance photo (AI-powered adjustments)
 * Simplified version - analyzes histogram and applies basic corrections
 */
function autoEnhance(histogram) {
  const settings = getDefaultEditSettings();

  // Analyze histogram to determine adjustments
  const { luminance } = histogram;

  // Calculate average brightness
  let totalPixels = 0;
  let weightedSum = 0;
  for (let i = 0; i < luminance.length; i++) {
    totalPixels += luminance[i];
    weightedSum += i * luminance[i];
  }
  const avgBrightness = weightedSum / totalPixels;

  // Adjust exposure based on average brightness
  if (avgBrightness < 100) {
    // Image is too dark
    settings.exposure = Math.min(50, (100 - avgBrightness) / 2);
    settings.shadows = 30;
  } else if (avgBrightness > 150) {
    // Image is too bright
    settings.exposure = Math.max(-50, (150 - avgBrightness) / 2);
    settings.highlights = -30;
  }

  // Add some contrast
  settings.contrast = 15;

  // Add clarity for sharpness
  settings.clarity = 10;

  // Slight vibrance boost
  settings.vibrance = 15;

  return settings;
}

/**
 * Generate comparison of before/after
 */
function generateComparison(originalSettings, newSettings) {
  const changes = {};

  const flattenSettings = (obj, prefix = '') => {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, flattenSettings(value, `${prefix}${key}.`));
      } else {
        result[`${prefix}${key}`] = value;
      }
    }
    return result;
  };

  const originalFlat = flattenSettings(originalSettings);
  const newFlat = flattenSettings(newSettings);

  for (const [key, newValue] of Object.entries(newFlat)) {
    const oldValue = originalFlat[key];
    if (oldValue !== newValue) {
      changes[key] = { old: oldValue, new: newValue };
    }
  }

  return changes;
}

module.exports = {
  getDefaultEditSettings,
  mergeEditSettings,
  saveEdit,
  getEditHistory,
  revertToEdit,
  resetToOriginal,
  createPreset,
  getUserPresets,
  applyPreset,
  batchApplyPreset,
  copySettings,
  autoEnhance,
  generateComparison
};
