const pool = require('../config/db');
const { uploadAttachmentToS3 } = require('../utils/s3Service');

// @desc    Get all team members for an event (for the left sidebar)
// @route   GET /api/communication/:eventId/team
// @desc    Get all team members for an event (for the left sidebar)
// @route   GET /api/communication/:eventId/team
const getEventTeam = async (req, res) => {
    try {
        const { eventId } = req.params;
        const loggedInUserId = req.user.id;

        console.log(`\n--- 🕵️‍♂️ DEBUG: FETCHING TEAM FOR EVENT ---`);
        console.log(`Event ID: ${eventId}`);
        console.log(`Logged-in User ID: ${loggedInUserId}`);

        // We temporarily removed the '!= loggedInUserId' rule so we can see EVERYONE
        const result = await pool.query(`
            SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, et.role 
            FROM "Event_Team" et 
            JOIN "Users" u ON et.user_id = u.id 
            WHERE et.event_id = $1
            ORDER BY u.first_name ASC
        `, [eventId]);

        console.log(`Database found ${result.rows.length} people in the Event_Team table for this event!`);
        console.log(`Raw Database Data:`, result.rows);
        console.log(`------------------------------------------\n`);

        // Now we filter out the logged-in user in Javascript instead of SQL
        const filteredTeam = result.rows.filter(member => member.id !== loggedInUserId);

        res.status(200).json({ success: true, team: filteredTeam });
    } catch (error) {
        console.error("Team Fetch Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching team." });
    }
};

// @desc    Get private messages for the logged-in user in an event
// @route   GET /api/communication/:eventId/messages
const getMessages = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // 🚀 FIX: Look for 'userId' first, which matches your JWT payload structure
        const userId = req.user?.userId || req.user?.id;

        if (!userId) {
            console.log("Error: Could not identify user from token.");
            return res.status(400).json({ success: false, message: "Authentication error: User ID missing." });
        }

        const result = await pool.query(`
            SELECT 
                m.id as message_id, m.message_text as text, m.attachment_name, 
                to_char(m.sent_at, 'HH12:MI AM') as time,
                to_char(m.sent_at, 'Mon DD') as date,
                CONCAT(u.first_name, ' ', u.last_name) as sender,
                m.sender_id,
                (
                    SELECT string_agg(CONCAT(u2.first_name, ' ', u2.last_name), ', ')
                    FROM "Message_Recipients" mr
                    JOIN "Users" u2 ON mr.recipient_id = u2.id
                    WHERE mr.message_id = m.id
                ) as to_text
            FROM "Internal_Messages" m
            JOIN "Users" u ON m.sender_id = u.id
            WHERE m.event_id = $1
              AND (m.sender_id = $2 OR EXISTS (
                  SELECT 1 FROM "Message_Recipients" mr2 
                  WHERE mr2.message_id = m.id AND mr2.recipient_id = $2
              ))
            ORDER BY m.sent_at ASC
        `, [eventId, userId]);

        res.status(200).json({ success: true, messages: result.rows });
    } catch (error) {
        console.error("Message Fetch Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching messages." });
    }
};



const { uploadAttachmentToS3 } = require('../utils/s3Service');

const sendMessage = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { text, recipients, senderId, fileType } = req.body;
        const finalSenderId = senderId || req.user?.userId;

        await pool.query('BEGIN'); // Start transaction for safety

        // 1. Save the Message text
        const msgRes = await pool.query(`
            INSERT INTO "Internal_Messages" (id, event_id, sender_id, message_text)
            VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *
        `, [eventId, finalSenderId, text]);
        const newMessageId = msgRes.rows[0].id;

        // 2. If there is a file, save it to S3 and the Attachments table
        let fileData = null;
        if (req.file) {
            const awsKey = await uploadAttachmentToS3(req.file, eventId, 'chat');
            const sizeInMB = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
            
            const attachRes = await pool.query(`
                INSERT INTO "Attachments" (id, file_name, aws_key, file_type, file_size, message_id, uploaded_by)
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING *
            `, [req.file.originalname, awsKey, fileType, sizeInMB, newMessageId, finalSenderId]);
            
            fileData = attachRes.rows[0];
        }

        // 3. Save Recipients
        await Promise.all(recipients.map(rId => 
            pool.query(`INSERT INTO "Message_Recipients" (message_id, recipient_id) VALUES ($1, $2)`, [newMessageId, rId])
        ));

        await pool.query('COMMIT');

        // 4. Construct response for WebSockets
        const senderRes = await pool.query(`SELECT CONCAT(first_name, ' ', last_name) as name FROM "Users" WHERE id = $1`, [finalSenderId]);
        
        const fullMessage = {
            id: newMessageId,
            text,
            sender: senderRes.rows[0]?.name || 'User',
            sender_id: finalSenderId,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachment: fileData, // Include the new attachment data
            isMe: false
        };

        const io = req.app.get('io');
        recipients.forEach(rId => io.to(rId).emit('NEW_INTERNAL_MESSAGE', fullMessage));

        res.status(200).json({ success: true, message: { ...fullMessage, isMe: true } });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ success: false, message: "Error sending message." });
    }
};


module.exports = { getEventTeam, getMessages, sendMessage };