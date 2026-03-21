const multer = require('multer');

// 1. Memory storage is best for AWS S3 because we don't need to 
// save a "junk" copy of the file on your local hard drive.
const storage = multer.memoryStorage();

// 2. Define the security rules for your uploads
const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 50 * 1024 * 1024 // 50MB Max (Professional limit for SDGP)
    },
    fileFilter: (req, file, cb) => {
        // You can add logic here later to block dangerous file types (.exe, etc.)
        cb(null, true);
    }
});

module.exports = upload;