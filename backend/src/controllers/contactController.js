const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const nodemailer = require('nodemailer');

const contactForm = async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // 1. Validation check for empty fields
    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the required fields!",
        });
    }

    // 2. Validation check for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address!",
        });
    }

    // 3. Validation check for phone number format (if provided)
    if (phone) {
        const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid phone number."
            });
        }
    }

    try {
        // Database integration
        const newInquiryId = uuidv4(); 

        const insertQuery = `INSERT INTO "Platform_Inquiries" (id, name, email, phone, subject, message_body) 
                             VALUES ($1, $2, $3, $4, $5, $6)`;
        const values = [newInquiryId, name, email, phone || null, subject, message];

        await pool.query(insertQuery, values);

        // Nodemailer Setup
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Impressive Admin Notification Email
        const mailOptions = {
            from: `"${name} (via EventLK)" <${process.env.EMAIL_USER}>`, // Shows sender's name
            to: process.env.EMAIL_USER, 
            replyTo: email, // Clicking "Reply" in Gmail will reply directly to the user!
            subject: `New Inquiry: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0;">New EventLK Inquiry</h2>
                    </div>
                    <div style="padding: 30px; background-color: #f9fafb;">
                        <p style="font-size: 16px; color: #374151;">Hello Admin,</p>
                        <p style="font-size: 16px; color: #374151;">You have received a new message from the contact form. Here are the details:</p>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <tr>
                                <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #4f46e5; width: 30%;">Name</td>
                                <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #111827;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #4f46e5;">Email</td>
                                <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #111827;"><a href="mailto:${email}" style="color: #4f46e5;">${email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #4f46e5;">Phone</td>
                                <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #111827;">${phone || 'Not Provided'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; font-weight: bold; color: #4f46e5;">Subject</td>
                                <td style="padding: 12px 15px; color: #111827;">${subject}</td>
                            </tr>
                        </table>

                        <div style="margin-top: 25px; background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <h3 style="margin-top: 0; color: #4f46e5; font-size: 14px; text-transform: uppercase;">Message</h3>
                            <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                        </div>
                    </div>
                </div>
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
}

module.exports = {
    contactForm
};