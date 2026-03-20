const pool = require('../config/db');
const { sendBulkEmail } = require('../utils/emailService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_for_now');

// @desc    Generate AI Email Draft
// @route   POST /api/emails/generate
const generateAIDraft = async (req, res) => {
    try {
        const { prompt, tone, eventName } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
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
const sendBulkMail = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { target, customEmails, venueEmail, subject, body, ccList } = req.body;
        const userId = req.user.id; // From auth middleware

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
            // Update the Venues table with this new email!
            await pool.query(`
                UPDATE "Venues" SET manager_email = $1 
                WHERE id = (SELECT venue_id FROM "Events" WHERE id = $2)
            `, [venueEmail, eventId]);
        }
        else if (target === 'custom' || target === 'csv') {
            bccList = customEmails; // Array of emails passed from frontend
            recipientSummary = { type: target === 'csv' ? 'CSV Upload' : 'Custom List', count: bccList.length };
        }

        if (bccList.length === 0) return res.status(400).json({ success: false, message: "No recipients found." });

        // 2. Fetch Organizer Name
        const userRes = await pool.query(`SELECT first_name, last_name FROM "Users" WHERE id = $1`, [userId]);
        const senderName = `${userRes.rows[0].first_name} ${userRes.rows[0].last_name}`;

        // 3. Send the Email via Nodemailer
        // NOTE: AWS S3 Attachment handling will be injected here later
        await sendBulkEmail(senderName, subject, body, bccList, ccList);

        // 4. Save to History Table
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