const express = require('express');
const router = express.Router();
const { createEvent,getEvents,updateEvent, getEventById , getPastEvents,getPostEventReport,deleteEvent,inviteTeamMember , getUserInvitations, respondToInvitation,dismissNotification,removeTeamMember , changeMemberRole,uploadEventDocument,downloadEventDocument,deleteEventDocument} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');// Import the protect middleware to secure the route
const upload = require('../middleware/uploadMiddleware'); // Import the Multer middleware for file uploads


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

// Routes for managing invitations
router.get('/invitations/me', protect, getUserInvitations);
router.post('/invitations/respond', protect, respondToInvitation);
router.post('/notifications/dismiss', protect, dismissNotification);

router.delete('/:id/team/:userId', protect, removeTeamMember);
router.put('/:id/team/:userId', protect, changeMemberRole);

// --- Document Management Routes ---

// The 'upload.single("file")' is Multer catching the file before it hits the controller!
router.post('/:id/documents',protect, upload.single('file'), uploadEventDocument);

router.get('/documents/:docId/download', protect, downloadEventDocument);
router.delete('/documents/:docId', protect, deleteEventDocument);


module.exports = router;