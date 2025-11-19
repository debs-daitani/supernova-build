import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for memory storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and audio
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and audio files are allowed.'));
    }
  },
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'daitaniverse',
      resource_type: options.resourceType || 'auto',
      public_id: options.publicId || uuidv4(),
      transformation: options.transformation || [],
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload image with optimization
 */
export const uploadImage = async (fileBuffer) => {
  return uploadToCloudinary(fileBuffer, {
    folder: 'daitaniverse/images',
    resourceType: 'image',
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });
};

/**
 * Upload avatar with circular crop
 */
export const uploadAvatar = async (fileBuffer) => {
  return uploadToCloudinary(fileBuffer, {
    folder: 'daitaniverse/avatars',
    resourceType: 'image',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { radius: 'max' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });
};

/**
 * Upload marketplace listing images
 */
export const uploadListingImage = async (fileBuffer, index) => {
  return uploadToCloudinary(fileBuffer, {
    folder: 'daitaniverse/marketplace',
    resourceType: 'image',
    transformation: [
      { width: 1000, height: 750, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });
};

/**
 * Upload content files (PDFs, audio)
 */
export const uploadContentFile = async (fileBuffer, fileType) => {
  const folder = fileType === 'pdf' ? 'daitaniverse/content/pdfs' : 'daitaniverse/content/audio';

  return uploadToCloudinary(fileBuffer, {
    folder,
    resourceType: fileType === 'pdf' ? 'image' : 'video',
  });
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export default {
  upload,
  uploadToCloudinary,
  uploadImage,
  uploadAvatar,
  uploadListingImage,
  uploadContentFile,
  deleteFromCloudinary,
};
