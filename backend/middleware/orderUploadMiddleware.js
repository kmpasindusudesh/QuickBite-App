const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =====================================================
// Order payment slip upload middleware (Member 4)
// reviewUpload.js eke same pattern — easy to understand
// Files save wena thana: uploads/slips/
// =====================================================

// uploads/slips/ folder eke absolute path hadanawa
const uploadDir = path.join(__dirname, '..', 'uploads', 'slips');

// Folder naththam auto hadanawa — server crash wen na
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    // File save wena folder eka
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    // Unique filename — slip- + timestamp + extension
    // Eg: slip-1712345678901.jpg — overwrite wen na
    filename: function (req, file, cb) {
        cb(null, 'slip-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 3000000 }, // 3 MB — bank slip screenshots gedara thiyenawa
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpeg|jpg|png/;
        const extOk = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeOk = fileTypes.test(file.mimetype);
        if (extOk && mimeOk) {
            return cb(null, true);
        }
        cb(new Error('Bank slip eka JPEG hari PNG widihata upload karanna!'));
    }
});

module.exports = upload;

/*
 * Mul sangrahaya (Sinhala):
 * Bank slip image eka uploads/slips/ folder ekata save karanawa.
 * Filename eka unique wenawa slip-timestamp.ext widihata.
 * 3 MB limit — bank slip screenshot ekakata hari.
 */
