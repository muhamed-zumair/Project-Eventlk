const pool = require('../config/db');

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
        const userId = req.user.id;

        // 🚀 FIX: Using CONCAT() here as well!
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

// @desc    Send a private message & emit via WebSockets
// @route   POST /api/communication/:eventId/messages
const sendMessage = async (req, res) => {
    try {
        const { eventId } = req.params;
        // 🚀 FIX 1: Accept senderId from the frontend payload to prevent "Unknown User"
        const { text, recipients, attachmentName, senderId } = req.body;

        // Fallback to req.user.id if senderId isn't in body
        const finalSenderId = senderId || req.user?.id || req.user?.userId;

        if (!recipients || recipients.length === 0) {
            return res.status(400).json({ success: false, message: "Select at least one recipient." });
        }
        if (!finalSenderId) {
            return res.status(400).json({ success: false, message: "Authentication error: Sender ID missing." });
        }

        // 1. Save to Messages Table
        const msgRes = await pool.query(`
            INSERT INTO "Internal_Messages" (id, event_id, sender_id, message_text, attachment_name)
            VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *
        `, [eventId, finalSenderId, text, attachmentName]);

        const newMessageId = msgRes.rows[0].id;
        const sentAt = msgRes.rows[0].sent_at;

        // 2. Save Recipients (Optimized for speed!)
        const recipientPromises = recipients.map(recipientId => {
            return pool.query(`INSERT INTO "Message_Recipients" (message_id, recipient_id) VALUES ($1, $2)`, [newMessageId, recipientId]);
        });
        await Promise.all(recipientPromises);

        // 3. Get Names for UI
        const senderRes = await pool.query(`SELECT CONCAT(first_name, ' ', last_name) as name FROM "Users" WHERE id = $1`, [finalSenderId]);
        const recipientNamesRes = await pool.query(`
            SELECT string_agg(CONCAT(first_name, ' ', last_name), ', ') as names 
            FROM "Users" WHERE id = ANY($1::uuid[])
        `, [recipients]);

        const fullMessage = {
            id: newMessageId,
            eventId: eventId,
            sender: senderRes.rows[0]?.name?.trim() || 'Unknown User',
            sender_id: finalSenderId,
            text: text,
            attachmentName: attachmentName,
            time: new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            to_text: recipientNamesRes.rows[0]?.names || 'Unknown Recipients',
            isMe: false
        };

        // 4. FIRE WEBSOCKETS
        const io = req.app.get('io');
        const connectedUsers = req.app.get('connectedUsers');

        recipients.forEach(recipientId => {
            const socketId = connectedUsers.get(recipientId);
            if (socketId) io.to(socketId).emit('NEW_INTERNAL_MESSAGE', fullMessage);
        });

        res.status(200).json({ success: true, message: { ...fullMessage, isMe: true } });

    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ success: false, message: "Server error sending message." });
    }
};

module.exports = { getEventTeam, getMessages, sendMessage };