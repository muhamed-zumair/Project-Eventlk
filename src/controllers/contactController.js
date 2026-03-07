const {v4: uuidv4} = require('uuid');
const pool=require ('../config/db');
const nodemailer = require ('nodemailer');



const contactForm= async (req, res) => {

    const { name, email, phone, subject, message} = req.body;

    //1. Validation check for empty fields
    if (!name || !email  || !subject || !message){
        return res.status(400).json({
            success:false,
            message: "Please fill all the required fields!",
        })
    }

    //2. Validation check for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;    
    if (!emailRegex.test(email)){
        return res.status(400).json({
            success:false,
            message: "Please provide a valid email address!",
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

    try{
        //Database integration
        const newInquiryId = uuidv4(); // Generate a unique ID for the inquiry

        const insertQuery = `INSERT INTO "Platform_Inquiries" (id, name, email, phone, subject, message_body) 
                             VALUES ($1, $2, $3, $4, $5, $6)`;
        const values = [newInquiryId, name, email, phone || null, subject, message];

        await pool.query(insertQuery, values);

        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send the notification to the admin email
            subject: `EventLK - New Inquiry: ${subject}`,
            html: `
                <p>You have received a new inquiry from the contact form:</p>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone:</strong> ${phone || 'Not Provided'}</li>
                    <li><strong>Message:</strong> ${message}</li>
                </ul>
                
                <p>Please respond to the inquiry as soon as possible.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("Notification email has been sent to the admin successfully!!");
        


        return res.status(200).json({
            success: true,
            message: "Your message has been received! We will get back to you shortly."
        });

    } catch (error) {
        console.error("Error occurred while saving contact form data:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while saving your message. Please try again later."
        });
    }

    
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