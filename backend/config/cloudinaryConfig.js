const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();


// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'QuickBite_Project', // Cloudinary eke hadena folder eke nama
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const cloudinaryUpload = multer({ storage: storage });

module.exports = { cloudinary, cloudinaryUpload };