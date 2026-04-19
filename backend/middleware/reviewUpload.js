// Multer library eka require karanawa — file upload handle karanawa
const multer = require('multer');

// Path library eka — file extension ganna saha folder path hadanna
const path = require('path');

// fs library eka — folder thiyenawada kiyala check karanna saha hadanna
const fs = require('fs');

// =====================================================
// Review images save wena folder eka — uploads/reviews/
// Me folder eka naththam auto hadanawa — server crash wen na
// Food upload middleware ekai same logic — easy to understand
// =====================================================

// uploads/reviews/ folder eke absolute path eka hadanawa
// __dirname = middleware/ folder; '../uploads/reviews' = backend/uploads/reviews/
const uploadDir = path.join(__dirname, '..', 'uploads', 'reviews');

// Folder eka naththam hadanawa — { recursive: true } = parent folders also create
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config — file save wena hati define karanawa
const storage = multer.diskStorage({

    // File save wena folder eka — uploads/reviews/
    destination: function (req, file, cb) {
        cb(null, uploadDir); // null = error naha, uploadDir = save location
    },

    // File eke unique name eka — review- + timestamp + original extension
    // Eg: review-1712345678901.jpg — same name file overwrite wen na
    filename: function (req, file, cb) {
        cb(null, 'review-' + Date.now() + path.extname(file.originalname));
    }
});

// Multer upload object eka — storage + limits + fileFilter
const upload = multer({
    storage: storage,

    // Max file size 2MB — bithara files reject karanawa
    limits: { fileSize: 2000000 },

    // jpeg, jpg, png witharak accept karanawa — other files reject
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpeg|jpg|png/; // Allowed types regex

        // File extension eka check karanawa
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

        // File mimetype eka check karanawa (eg: image/jpeg)
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            // Rende check pass unoth accept
            return cb(null, true);
        } else {
            // Fail unoth error ekak
            cb(new Error('Review image ekakata photos witharak! (jpeg, jpg, png)'));
        }
    }
});

// Me upload object eka routes file ekata export karanawa
module.exports = upload;

/*
 * Mul sangrahaya (Sinhala):
 * Me middleware eken review image eka uploads/reviews/ folder ekata save karanawa.
 * food/restaurant upload middleware ekai same pattern — beginner-friendly.
 * File name eka timestamp eken unique karanawa — overwrite naha.
 * 2MB limit saha jpeg/jpg/png witharak allow — data quality protect karanawa.
 */
