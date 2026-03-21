const express = require('express');
const passport = require('passport');
const { registerUser, loginUser ,getUserSettings, updateProfile, updateNotifications, updatePassword} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

const router = express.Router();

// A dummy route to test if the "Security Guard" lets us in
router.get('/profile', protect, (req, res) => {
    res.status(200).json({
        message: "You have accessed a protected route!",
        user: req.user // This contains the ID and Role from the token
    });
});



// --- STANDARD EMAIL/PASSWORD ROUTES ---
router.post('/signup', registerUser);
router.post('/login', loginUser);

// --- GOOGLE OAUTH ROUTES ---
// 1. The route the user hits when they click "Login with Google"
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. The callback route (Fixed to use Supabase columns!)
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: 'http://localhost:3000/signin' }),
    (req, res) => {
        const token = jwt.sign(
            { userId: req.user.id, role: req.user.global_role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Make sure these keys (firstName) match what your Dashboard expects!
        const userData = encodeURIComponent(JSON.stringify({
            id: req.user.id,
            firstName: req.user.first_name, 
            lastName: req.user.last_name,
            email: req.user.email
        }));

        res.redirect(`http://localhost:3000/auth-success?token=${token}&user=${userData}`);
    }
);

// 3. A route to handle logging out
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.send('Logged out successfully');
    });
});

// --- SETTINGS ROUTES ---
router.get('/settings', protect, getUserSettings);
router.put('/settings/profile', protect, updateProfile);
router.put('/settings/notifications', protect, updateNotifications);
router.put('/settings/password', protect, updatePassword);

// Export the router exactly once at the very bottom
module.exports = router;