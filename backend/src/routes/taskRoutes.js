const express = require('express');
const router = express.Router();
const { getEventTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.get('/event/:eventId', protect, getEventTasks);
router.post('/event/:eventId', protect, createTask);
router.put('/:taskId', protect, updateTask);
router.delete('/:taskId', protect, deleteTask);

module.exports = router;