const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =====================================================
// Restaurant logo upload karanna multer config (Member 2)
// Food upload eka wage — file name eka 'restaurant-' prefix eken distinguish karanawa
// =====================================================
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    // File eka save wena folder eka — uploads/
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    // Unique name — restaurant-1730... .png wage
    filename: function (req, file, cb) {
        cb(null, 'restaurant-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // 2MB limit
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Logo ekata photos witharak! (jpeg, jpg, png)'));
    }
});

module.exports = upload;

/*
 * File eke mul sangrahaya (Sinhala):
 * Me middleware eken restaurant logo eka server eke uploads folder ekata save karanawa.
 * Multer library eka use kara beginner-friendly widihata disk eke file store karanawa.
 */
