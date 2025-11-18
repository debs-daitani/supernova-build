import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'daitaniverse',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a buffer (image/video) to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options
 * @returns {Object} Cloudinary response with secure_url
 */
export async function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'uploads',
      resource_type: options.resource_type || 'auto',
      transformation: options.transformation,
      public_id: options.public_id
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Write buffer to stream
    uploadStream.end(buffer);
  });
}

/**
 * Upload from URL to Cloudinary
 * @param {string} url - Image/video URL
 * @param {Object} options - Upload options
 * @returns {Object} Cloudinary response
 */
export async function uploadFromUrl(url, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: options.folder || 'uploads',
      resource_type: options.resource_type || 'auto',
      transformation: options.transformation,
      public_id: options.public_id
    });

    return result;
  } catch (error) {
    console.error('Cloudinary upload from URL error:', error);
    throw error;
  }
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image' or 'video'
 * @returns {Object} Deletion result
 */
export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Image transformations
 * @returns {string} Optimized URL
 */
export function getOptimizedUrl(publicId, transformations = {}) {
  return cloudinary.url(publicId, {
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      ...( transformations.width ? [{ width: transformations.width, crop: 'scale' }] : []),
      ...(transformations.height ? [{ height: transformations.height, crop: 'scale' }] : [])
    ]
  });
}

export default {
  uploadToCloudinary,
  uploadFromUrl,
  deleteFromCloudinary,
  getOptimizedUrl
};
