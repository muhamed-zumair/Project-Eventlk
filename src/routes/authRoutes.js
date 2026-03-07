const express = require('express');
const passport = require('passport');
const { registerUser, loginUser } = require('../controllers/authController');
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
    passport.authenticate('google', { failureRedirect: '/login-failed' }),
    (req, res) => {
        // Generate a token for the Google User
        const token = jwt.sign(
            { userId: req.user.id, role: req.user.role, organizationId: req.user.organization_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // For now, let's just send the token to the screen so you can copy it for Postman!
        res.json({
            success: true,
            message: "Google Login Successful",
            token: token,
            user: {
                id: req.user.id,
                name: `${req.user.first_name} ${req.user.last_name}`,
                email: req.user.email
            }
        });
    }
);

// 3. A route to handle logging out
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.send('Logged out successfully');
    });
});

// Export the router exactly once at the very bottom
module.exports = router;