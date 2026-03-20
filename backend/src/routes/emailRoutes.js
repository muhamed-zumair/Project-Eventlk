const express = require('express');
const router = express.Router();
const { generateAIDraft, sendBulkMail, getEmailHistory } = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateAIDraft);
router.post('/:eventId/send', protect, sendBulkMail);
router.get('/:eventId/history', protect, getEmailHistory);

module.exports = router;