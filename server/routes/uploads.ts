import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'company-logos');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const employerId = req.user?.userId;
    const extension = path.extname(file.originalname);
    const filename = `${employerId}-${Date.now()}${extension}`;
    cb(null, filename);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

/**
 * Upload company logo
 */
router.post('/company-logo', upload.single('logo'), async (req, res) => {
  try {
    const employerId = req.user?.userId;
    if (!employerId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // TODO: Save logo path to company database record
    const logoUrl = `/uploads/company-logos/${req.file.filename}`;
    
    res.json({
      success: true,
      logoUrl,
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ success: false, error: 'Failed to upload logo' });
  }
});

/**
 * Delete company logo
 */
router.delete('/company-logo/:filename', async (req, res) => {
  try {
    const employerId = req.user?.userId;
    const { filename } = req.params;
    
    if (!employerId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Security check: ensure the filename belongs to this employer
    if (!filename.startsWith(employerId)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'company-logos', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      
      // TODO: Update company database record to remove logo
      
      res.json({
        success: true,
        message: 'Logo deleted successfully'
      });
    } else {
      res.status(404).json({ success: false, error: 'File not found' });
    }
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ success: false, error: 'Failed to delete logo' });
  }
});

export default router;
