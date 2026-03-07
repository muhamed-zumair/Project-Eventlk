const {v4: uuidv4} = require('uuid');
const pool=require ('../config/db');
const bycrypt = require('bcryptjs');

//function to handle the user registration
const registerUser = async(req, res) => {

    // Extract user details from the request body
    const{firstName, lastName, email, organization, password} = req.body;

    //1. Validation check for empty fields
    if (!firstName || !lastName || !email || !password){
        return res.status(400).json({
            success: false,
            message: "Please fill the required fields!"
        })
    }

    //2. Validation check for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)){
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address!"
        })
    }

    //3. Validation check for password strength

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(password)){
        return res.status(400).json({
            success:false,
            message: "Password must be atleast 8 characters long and contain at least one letter, one number and one special character!"
        })
    }
    try{
        //4. Check if the user already exists in database
        const checkUserQuery = 'SELECT * FROM "Users" WHERE email = $1';
        const existingUser = await pool.query(checkUserQuery, [email]);

        if (existingUser.rows.length > 0){
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
        const defaultRole = 'Attendee';

        const orgId = organization ? organization : null; // Generate an organization ID if organization is provided

        const insertUserQuery = `INSERT INTO "Users" (id, first_name, last_name, email, password_hash, role, organization_id) 
                                 VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        const values = [newUserId, firstName, lastName, email, hashedPassword, defaultRole, orgId];
        await pool.query(insertUserQuery, values);

        return res.status(201).json({
            success:true,
            message: "User Registered Successfully!"
        })
    } catch (error) {
        console.error("Error occurred while registering user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error; Could not register user at this time."
        });


    }
    
}

const loginUser = async(req, res) => {

    const {email, password} = req.body;

    //1. Validation check for empty fields
    if (!email || !password){
        return res.status(400).json({
            success: false,
            message: "Please fill the required fields!"
        })
    }
    //2. Validation check for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)){   
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address!"
        })
    }

    //3. Check if the user exists in database

    //4. Compare the provided password with the hashed password in the database using bcrypt

    //5. If the password matches, generate a JWT token for authentication

    //temporary response until database integration is done
    return res.status(200).json({
        success:true,
        message: "User Logged in Successfully!"
    })
}
module.exports = {
    registerUser,
    loginUser
}









