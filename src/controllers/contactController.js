const contactForm= async (req, res) => {

    const { name, email, phone, subject, message} = req.body;

    //1. Validation check for empty fields
    if (!name || !email  || !subject || !message){
        return res.status(400).json({
            success:false,
            message: "Please fill all the required fields!";
        })
    }

    //2. Validation check for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;    
    if (!emailRegex.test(email)){
        return res.status(400).json({
            success:false,
            message: "Please provide a valid email address!";
        })

    }

    //3. Validation check for phone number format (if provided)
    if (phone) {
        // This Regex allows numbers, spaces, plus signs, and dashes (e.g., +94 11 234 5678)
        const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid phone number."
            });
        }
    }

    //4. Save the contact form data to the database (this part will be implemented later with database integration)
    //sending an email notification to the admin (this part will be implemented later with email service integration) using nodemailer or similar package

    //temporary response until database and email service integration is done
    return res.status(200).json({
        success:true,
        message: "Your message has been received! We will get back to you shortly."
    })
}

module.exports = {
    contactForm
}