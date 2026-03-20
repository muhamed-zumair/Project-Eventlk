const express = require('express');
const router = express.Router();
const { receiveWebhook, getEventAttendees, issueTickets } = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');// Import the protect middleware to secure the route

router.post('/webhooks/:eventId', receiveWebhook);

router.get('/:eventId', protect, getEventAttendees);
router.post('/:eventId/issue-tickets', protect, issueTickets); //  New route for issuing tickets

module.exports = router;