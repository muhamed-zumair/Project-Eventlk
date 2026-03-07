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

module.exports = { protect };