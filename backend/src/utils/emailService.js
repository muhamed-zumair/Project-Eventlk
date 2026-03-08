const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use a Google App Password here
  },
});

const sendWelcomeEmail = async (userEmail, firstName) => {
  const mailOptions = {
    from: `"EventLK Team" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Welcome to EventLK! 🚀',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Welcome to the family, ${firstName}!</h2>
        <p>We're thrilled to have you at <strong>EventLK</strong>. You’ve just taken the first step toward planning unforgettable experiences.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>What's next?</strong></p>
          <ul style="color: #4b5563;">
            <li>Create your first event dashboard</li>
            <li>Invite your team members</li>
            <li>Explore AI-powered venue suggestions</li>
          </ul>
        </div>
        <a href="http://localhost:3000/dashboard" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
        <p style="margin-top: 25px; font-size: 12px; color: #9ca3af;">If you didn't sign up for EventLK, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', userEmail);
  } catch (error) {
    console.error('Email error:', error);
  }
};

module.exports = { sendWelcomeEmail };