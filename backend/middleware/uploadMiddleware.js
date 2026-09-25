const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: event-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let extension = path.extname(file.originalname).toLowerCase();
    if (!extension || extension === '.') {
      if (file.mimetype === 'image/png') extension = '.png';
      else if (file.mimetype === 'image/webp') extension = '.webp';
      else extension = '.jpg';
    }
    cb(null, `event-${uniqueSuffix}${extension}`);
  },
});

// File validation: check file type (JPEG, JPG, PNG, WEBP)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = /jpeg|jpg|png|webp/;

  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const isExtValid = ext ? allowedExtensions.test(ext) : true;
  const isMimeValid = allowedMimeTypes.includes(file.mimetype) || (file.mimetype && file.mimetype.startsWith('image/'));

  if (isMimeValid && isExtValid) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid image file format. Only JPEG, JPG, PNG, and WEBP are supported.'));
  }
};

// Multer upload instance with 5MB file size limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

/**
 * Helper to generate public image URL
 * Compatible with local development and hosted URLs (Render/Railway)
 */
const getImageUrl = (req, filename) => {
  if (!filename) return null;
  // If already an absolute URL (for future cloud storage integrations like Cloudinary/S3)
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  // Construct dynamic host URL from request
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

module.exports = {
  upload,
  getImageUrl,
};
