const express = require('express');
const router = express.Router();
const { sendBulkMail, getEmailHistory, generateAIDraft } = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');

// 🚀 1. YOU MUST IMPORT MULTER HERE
const upload = require('../middleware/uploadMiddleware'); 

router.post('/generate', protect, generateAIDraft);
router.get('/:eventId/history', protect, getEmailHistory);

// 🚀 2. MULTER MUST BE IN THIS LINE (upload.array)
router.post('/:eventId/send', protect, upload.array('attachments', 5), sendBulkMail);

module.exports = router;