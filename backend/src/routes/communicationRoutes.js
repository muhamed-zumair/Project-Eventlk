const express = require('express');
const router = express.Router();
const { getEventTeam, getMessages, sendMessage } = require('../controllers/communicationController');
const { protect } = require('../middleware/authMiddleware'); // Require login!
const upload = require('../middleware/uploadMiddleware'); // Multer middleware for file uploads

router.get('/:eventId/team', protect, getEventTeam);
router.get('/:eventId/messages', protect, getMessages);
router.post('/:eventId/messages', protect, upload.single('file'), sendMessage);


module.exports = router;