const express = require('express');
const router = express.Router();
const { receiveWebhook, getEventAttendees } = require('../controllers/registrationContoller');
const { protect } = require('../middleware/authMiddleware');// Import the protect middleware to secure the route

router.post('/webhooks/:eventId', receiveWebhook);

router.get('/:eventId', protect, getEventAttendees);

module.exports = router;