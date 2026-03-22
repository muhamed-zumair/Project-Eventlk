const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middleware/authMiddleware');

const{contactForm} = require('../controllers/contactController');

router.post('/contact', optionalProtect, contactForm);

module.exports = router;
