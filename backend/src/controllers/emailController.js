const pool = require('../config/db');
const { uploadAttachmentToS3, getPresignedDownloadUrl } = require('../utils/s3service');
const { sendBulkEmail } = require('../utils/emailService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Generate AI Email Draft
// @route   POST /api/emails/generate
const generateAIDraft = async (req, res) => {
    try {
        const { prompt, tone, eventName } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const fullPrompt = `You are an event organizer for an event called "${eventName}". 
        Write a professional email draft based on this prompt: "${prompt}". 
        The tone should be: ${tone}. 
        Format it cleanly with a Subject line on the first line starting with "Subject: ", followed by the body. Keep it concise.`;

        const result = await model.generateContent(fullPrompt);
        const response = result.response.text();
        
        // Parse Subject and Body
        const lines = response.split('\n');
        let subject = "Event Update";
        if (lines[0].startsWith("Subject:")) {
            subject = lines[0].replace("Subject:", "").trim();
            lines.shift();
        }
        const body = lines.join('\n').trim();

        res.status(200).json({ success: true, subject, body });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate AI draft." });
    }
};

// @desc    Send Bulk Email & Log History
// @route   POST /api/emails/:eventId/send
// @desc    Send Bulk Email & Log History
// @route   POST /api/emails/:eventId/send
const sendBulkMail = async (req, res) => {
    try {
        console.log("📩 Incoming Bulk Mail Request");
        console.log("Body:", req.body);
        console.log("Files:", req.files ? req.files.length : 0);

        // 🚀 Safety Check: If body is missing, Multer didn't run!
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: "Invalid form data. Make sure Multer is in your route!" });
        }

        const { eventId } = req.params;
        // 🚀 1. Parse FormData properly (FormData sends boolean as the string "true")
        const { target, venueEmail, subject, body } = req.body;
        const includeSignature = req.body.includeSignature === 'true';
        
        // ... rest of your code stays exactly the same
        
        // FormData arrays need to be safely parsed
        const customEmails = req.body.customEmails ? (Array.isArray(req.body.customEmails) ? req.body.customEmails : [req.body.customEmails]) : [];
        const ccList = req.body.ccList ? (Array.isArray(req.body.ccList) ? req.body.ccList : [req.body.ccList]) : [];

        const userId = req.user?.userId || req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized: Missing User ID" });

        let bccList = [];
        let recipientSummary = {};

        // 1. Determine Recipients based on Target
        if (target === 'registered') {
            const attendees = await pool.query('SELECT email FROM "Attendees" WHERE event_id = $1 AND email IS NOT NULL', [eventId]);
            bccList = attendees.rows.map(a => a.email);
            recipientSummary = { type: 'All Registered Attendees', count: bccList.length };
        } 
        else if (target === 'venue') {
            bccList = [venueEmail];
            recipientSummary = { type: 'Venue Manager', email: venueEmail };
            await pool.query(`UPDATE "Venues" SET manager_email = $1 WHERE id = (SELECT venue_id FROM "Events" WHERE id = $2)`, [venueEmail, eventId]);
        }
        else if (target === 'custom' || target === 'csv') {
            bccList = customEmails; 
            recipientSummary = { type: target === 'csv' ? 'CSV Upload' : 'Custom List', count: bccList.length };
        }

        if (bccList.length === 0) return res.status(400).json({ success: false, message: "No recipients found." });

        // 2. Fetch Organizer Details
        const userRes = await pool.query(`
            SELECT u.first_name, u.last_name, et.role, e.title as event_title 
            FROM "Users" u
            LEFT JOIN "Event_Team" et ON u.id = et.user_id AND et.event_id = $1
            LEFT JOIN "Events" e ON e.id = $1
            WHERE u.id = $2
        `, [eventId, userId]);

        if (userRes.rows.length === 0) return res.status(404).json({ success: false, message: "User not found in database." });

        const senderName = `${userRes.rows[0].first_name || ''} ${userRes.rows[0].last_name || ''}`.trim() || 'Event Organizer';
        const userRole = (userRes.rows[0].role || 'Organizer').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const eventTitle = userRes.rows[0].event_title || 'Event';

        // 3. Format Email Body
        let finalHtmlBody = body.replace(/\n/g, '<br>'); 

        // 🚀 4. THE CLOUD MAGIC: Inject Secure S3 Links into the HTML body
        if (req.files && req.files.length > 0) {
            
            recipientSummary.attachments = []; // 🚀 NEW: Array to store history data
            
            finalHtmlBody += `
                <br><br>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-family: sans-serif;">
                    <h4 style="margin-top: 0; color: #4f46e5;">📎 Secure Event Attachments:</h4>
                    <ul style="margin-bottom: 0; padding-left: 20px;">
            `;
            
            for (const file of req.files) {
                const awsKey = await uploadAttachmentToS3(file, eventId, 'emails');
                const downloadUrl = await getPresignedDownloadUrl(awsKey);
                
                // 🚀 NEW: Save the name and secure link to our database summary
                recipientSummary.attachments.push({ name: file.originalname, url: downloadUrl });

                // Make a clickable hyperlink for the actual email
                finalHtmlBody += `<li style="margin-bottom: 5px;"><a href="${downloadUrl}" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: bold;">${file.originalname}</a></li>`;
            }
            finalHtmlBody += `</ul></div>`;
        }

        if (includeSignature) {
            finalHtmlBody += `
                <br><br>
                <table style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 20px; width: 100%; font-family: sans-serif;">
                    <tr>
                        <td>
                            <p style="margin: 0; color: #111827; font-size: 16px;"><strong>${senderName}</strong></p>
                            <p style="margin: 3px 0; color: #6b7280; font-size: 14px;">${userRole}</p>
                            <p style="margin: 0; color: #4f46e5; font-size: 14px; font-weight: bold;">Organizing Committee of ${eventTitle}</p>
                        </td>
                    </tr>
                </table>
            `;
        }

        // 5. Send the Email via Nodemailer

        
        await sendBulkEmail(senderName, subject, finalHtmlBody, bccList, ccList);

        // 5. Save to History Table
        await pool.query(`
            INSERT INTO "Bulk_Email_Logs" (id, event_id, subject, body, recipient_summary, sent_by)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
        `, [eventId, subject, body, JSON.stringify(recipientSummary), userId]);

        res.status(200).json({ success: true, message: "Emails sent successfully!" });
    } catch (error) {
        console.error("Send Mail Error:", error);
        res.status(500).json({ success: false, message: "Server error sending emails." });
    }
};

// @desc    Get Email History
// @route   GET /api/emails/:eventId/history
const getEmailHistory = async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await pool.query(`
            SELECT id, subject, body, recipient_summary, 
                   to_char(sent_at, 'YYYY-MM-DD HH12:MI AM') as date
            FROM "Bulk_Email_Logs"
            WHERE event_id = $1
            ORDER BY sent_at DESC
        `, [eventId]);

        res.status(200).json({ success: true, history: result.rows });
    } catch (error) {
        console.error("History Fetch Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching history." });
    }
};

module.exports = { generateAIDraft, sendBulkMail, getEmailHistory };