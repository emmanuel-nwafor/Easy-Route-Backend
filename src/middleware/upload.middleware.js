const multer = require('multer');

// Use memory storage so we can upload the buffer to Cloudinary directly
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    }
});

module.exports = upload;
