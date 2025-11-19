import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload, uploadImage, uploadAvatar, uploadListingImage } from '../services/uploadService.js';

const router = express.Router();

router.use(authenticateToken);

// POST /api/upload/image - Generic image upload
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadImage(req.file.buffer);

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST /api/upload/avatar - Upload user avatar
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadAvatar(req.file.buffer);

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// POST /api/upload/listing-images - Upload multiple listing images
router.post('/listing-images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = req.files.map((file, index) =>
      uploadListingImage(file.buffer, index)
    );

    const results = await Promise.all(uploadPromises);

    const urls = results.map(result => result.secure_url);

    res.json({ urls });
  } catch (error) {
    console.error('Listing images upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

export default router;
