const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =====================================================
// Delivery proof photo  uploads/delivery/ (Member 5)
// Field name: deliveryProof
// =====================================================
const uploadDir = path.join(__dirname, '..', 'uploads', 'delivery');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        cb(null, 'delivery-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 4000000 },
    fileFilter(req, file, cb) {
        const extOk = /jpeg|jpg|png/i.test(path.extname(file.originalname));
        const mimeOk = /^image\/(jpeg|png)$/i.test(file.mimetype);
        if (extOk && mimeOk) return cb(null, true);
        cb(new Error('Delivery proof eka JPEG hari PNG widihata upload karanna!'));
    },
});

module.exports = upload;



