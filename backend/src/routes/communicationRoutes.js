const express = require('express');
const router = express.Router();
const { getEventTeam, getMessages, sendMessage } = require('../controllers/communicationController');
const { protect } = require('../middleware/authMiddleware'); // Require login!

router.get('/:eventId/team', protect, getEventTeam);
router.get('/:eventId/messages', protect, getMessages);
router.post('/:eventId/messages', protect, sendMessage);

module.exports = router;