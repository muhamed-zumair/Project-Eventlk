const express = require('express');
const router = express.Router();
const { createEvent,getEvents,updateEvent, getEventById , getPastEvents,getPostEventReport,deleteEvent,inviteTeamMember} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');// Import the protect middleware to secure the route

// Route to create a new event (protected route)
router.post('/', protect, createEvent);

// Route to get all events for the authenticated user (protected route)
router.get('/', protect, getEvents);

router.put('/:id', protect, updateEvent);
router.get('/past', protect, getPastEvents);
router.get('/report/:id', protect, getPostEventReport);

router.get('/:id', protect, getEventById);

router.delete('/:id', protect, deleteEvent);

router.post('/:id/invite', protect, inviteTeamMember);



module.exports = router;