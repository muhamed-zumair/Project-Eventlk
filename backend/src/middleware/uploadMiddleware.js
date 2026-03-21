const multer = require('multer');

// Tell Multer to temporarily store the file in server memory (RAM) 
// instead of saving it to your local hard drive
const storage = multer.memoryStorage();

// Set a file size limit (e.g., 10MB to protect your server from massive files)
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } 
});

module.exports = upload;