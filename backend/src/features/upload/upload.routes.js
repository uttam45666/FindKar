import { Router } from 'express';
import { upload } from '../../config/cloudinary.js';

const router = Router();

// Upload image to Cloudinary
router.post('/image', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    res.json({ imageUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

export default router;
