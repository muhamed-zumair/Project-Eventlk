const jwt = require('jsonwebtoken');


const protect = (req, res, next) => {
    // 1. Get the token from the header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        // 2. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add the user data to the request
        next(); // Move to the actual controller function
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

// THE NEW POLITE RECEPTIONIST (Add this!)
const optionalProtect = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    // If there is no token, we don't kick them out! 
    // We just move to the next step with no user data.
    if (!token) {
        return next(); 
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // If the token is valid, we tag the user
        next();
    } catch (err) {
        // If the token is fake, we still let them proceed as a guest
        next(); 
    }
};

module.exports = { protect, optionalProtect };