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

// 1. Email for users who ALREADY have an EventLK account
const sendExistingUserInviteEmail = async (userEmail, eventTitle, role, inviterName = "An organizer") => {
  const mailOptions = {
    from: `"EventLK Team" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `You've been added to the team for ${eventTitle}! 🎯`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 30px; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 28px; letter-spacing: -0.5px;">EventLK</h1>
        </div>
        <h2 style="color: #111827; font-size: 22px; margin-bottom: 15px;">You're on the team!</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Great news! <strong>${inviterName}</strong> has added you to the organizing committee for <strong>${eventTitle}</strong>.
        </p>
        <div style="background-color: #eef2ff; border-left: 4px solid #4f46e5; padding: 15px 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
          <p style="margin: 0; color: #312e81; font-size: 15px;">
            <strong>Your Assigned Role:</strong> ${role}
          </p>
        </div>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Your dashboard has been updated with your new permissions. Jump in to see your tasks, collaborate with the team, and start planning.
        </p>
        <div style="text-align: center;">
          <a href="http://localhost:3000/dashboard" style="display: inline-block; background-color: #4f46e5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">Open Your Dashboard</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px;" />
        <p style="text-align: center; font-size: 13px; color: #9ca3af; margin: 0;">
          Powered by EventLK • The smart way to organize events.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Existing user invite sent to: ${userEmail}`);
  } catch (error) {
    console.error('Error sending existing user invite:', error);
  }
};

// 2. Email for NEW users who need to create an account
const sendNewUserInviteEmail = async (userEmail, eventTitle, role, inviterName = "An organizer") => {
  const mailOptions = {
    from: `"EventLK Team" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Invitation: Join the organizing team for ${eventTitle} ✨`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 30px; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 28px; letter-spacing: -0.5px;">EventLK</h1>
        </div>
        <h2 style="color: #111827; font-size: 22px; margin-bottom: 15px;">You've been invited!</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          <strong>${inviterName}</strong> has invited you to collaborate on <strong>EventLK</strong>, the ultimate event management platform. 
        </p>
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
          <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">You are invited to join as</p>
          <p style="margin: 0 0 5px; color: #111827; font-size: 20px; font-weight: 700;">${role}</p>
          <p style="margin: 0; color: #4f46e5; font-size: 16px; font-weight: 500;">for ${eventTitle}</p>
        </div>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          To accept this invitation and access your collaborative dashboard, please create a free EventLK account using this email address.
        </p>
        <div style="text-align: center;">
          <a href="http://localhost:3000/signup?email=${encodeURIComponent(userEmail)}" style="display: inline-block; background-color: #111827; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(17, 24, 39, 0.2);">Create Account to Accept</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px;" />
        <p style="text-align: center; font-size: 13px; color: #9ca3af; margin: 0;">
          If you don't know the organizer or don't wish to join, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`New user invite sent to: ${userEmail}`);
  } catch (error) {
    console.error('Error sending new user invite:', error);
  }
};

const sendDeclineNotificationEmail = async (organizerEmail, organizerName, eventTitle, declinedEmail) => {
  const mailOptions = {
    from: `"EventLK Team" <${process.env.EMAIL_USER}>`,
    to: organizerEmail,
    subject: `Invitation Declined: ${eventTitle} 🛑`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
        <h2 style="color: #111827;">Invitation Declined</h2>
        <p>Hi ${organizerName},</p>
        <p>We wanted to let you know that <strong>${declinedEmail}</strong> has declined your invitation to join the organizing team for <strong>${eventTitle}</strong>.</p>
        <p>You can head back to your Team Dashboard to invite someone else to fill their role.</p>
        <a href="http://localhost:3000/team" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Go to Team Dashboard</a>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Decline notification sent to organizer: ${organizerEmail}`);
  } catch (error) {
    console.error('Email error:', error);
  }
};

const sendRemovalEmail = async (userEmail, eventTitle) => {
  const mailOptions = {
    from: `"EventLK Team" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Access Revoked: ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #fee2e2; padding: 20px; border-radius: 10px;">
        <h2 style="color: #991b1b;">Team Membership Update</h2>
        <p>This is to inform you that you have been removed from the organizing team for <strong>${eventTitle}</strong>.</p>
        <p style="color: #4b5563;">You will no longer have access to the dashboard or private documents for this event.</p>
        <p style="margin-top: 25px; font-size: 12px; color: #9ca3af;">If you believe this was a mistake, please contact the Event President directly.</p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email error:', error);
  }
};


// EXPORT ALL THREE FUNCTIONS
module.exports = { 
  sendWelcomeEmail, 
  sendExistingUserInviteEmail, 
  sendNewUserInviteEmail,
  sendDeclineNotificationEmail,
  sendRemovalEmail
};