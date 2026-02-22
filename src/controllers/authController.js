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

    //4. Check if the user already exists in database

    //5.Hash the password using bcrypt

    //saving the new user to the database

    //temporary response until databser integration is done
    return res.status(201).json({
        success:true,
        message: "User Registered Successfully!"
    })
}

module.exports = {
    registerUser
}









