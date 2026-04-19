const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =====================================================
// uploads folder eka backend root eke thiyenawa
// __dirname = middleware/ folder — eka nisa '..' eken backend/ ekata yawanawa
// =====================================================
const uploadDir = path.join(__dirname, '..', 'uploads');

// Folder eka naththam automatically hadanawa (path eka waradiy unoth crash wenawa)
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Multer eka files save karana actual folder path eka (absolute path)
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // req.user.id = protect middleware eken — JWT verify wela thiyena user
        // Unique nama: userId-timestamp.ext
        cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 },
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Photos witharak upload karanna! (jpeg, jpg, png)'));
        }
    }
});

module.exports = upload;
