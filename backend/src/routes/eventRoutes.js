const express = require('express');
const router = express.Router();
const { createEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');// Import the protect middleware to secure the route

// Route to create a new event (protected route)
router.post('/', protect, createEvent);

module.exports = router;