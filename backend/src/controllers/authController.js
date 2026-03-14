const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/emailService');

//function to handle the user registration
const registerUser = async (req, res) => {

    // Extract user details from the request body
    const { firstName, lastName, email, password } = req.body;

    //1. Validation check for empty fields
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill the required fields!"
        })
    }

    //2. Validation check for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address!"
        })
    }

    //3. Validation check for password strength

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be atleast 8 characters long and contain at least one letter, one number and one special character!"
        })
    }
    try {
        //4. Check if the user already exists in database
        const checkUserQuery = 'SELECT * FROM "Users" WHERE email = $1';
        const existingUser = await pool.query(checkUserQuery, [email]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists!"
            })
        }

        //5.Hash the password using bcrypt
        const salt = await bycrypt.genSalt(10);
        const hashedPassword = await bycrypt.hash(password, salt);

        //saving the new user to the database
        const newUserId = uuidv4(); // Generate a unique ID for the user
        const defaultRole = 'User'; // Default role for new users

        const insertUserQuery = `INSERT INTO "Users" (id, first_name, last_name, email, password_hash, role) 
                         VALUES ($1, $2, $3, $4, $5, $6)`;
        const values = [newUserId, firstName, lastName, email, hashedPassword, defaultRole];
        await pool.query(insertUserQuery, values);

        sendWelcomeEmail(email, firstName);

        const token = jwt.sign(
            { userId: newUserId, role: defaultRole },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );


        return res.status(201).json({
            success: true,
            message: "User Registered Successfully!",
            token: token,
            user: {
                id: newUserId,
                firstName: firstName,
                lastName: lastName,
                email: email,
                role: defaultRole
            }
        })
    } catch (error) {
        console.error("Error occurred while registering user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error; Could not register user at this time."
        });


    }

}

//function to handle user login
const loginUser = async (req, res) => {

    const { email, password } = req.body;

    //1. Validation check for empty fields
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill the required fields!"
        })
    }
    //2. Validation check for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address!"
        })
    }

    //3. Check if the user exists in database
    try {
        const userQuery = 'SELECT * FROM "Users" WHERE email = $1';
        const result = await pool.query(userQuery, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "User with this email does not exist!"
            })
        }

        const user = result.rows[0];

        // --- NEW LOGIC FOR GOOGLE USERS ---
        // If the user signed up via Google, they might not have a password_hash
        if (!user.password_hash) {
            return res.status(400).json({
                success: false,
                message: "This account was created using Google. Please log in with Google."
            });
        }

        //4. Compare the provided password with the hashed password in the database using bcrypt
        const isMatch = await bycrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password!"
            })
        }

        //5. If the password matches, generate a JWT token for authentication
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );


        //temporary response until database integration is done
        return res.status(200).json({
            success: true,
            message: "User Logged in Successfully!",
            token: token,
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (error) {
        console.error("Error occurred while logging in user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error; Could not log in user at this time."
        });
    }
}

module.exports = {
    registerUser,
    loginUser
}

