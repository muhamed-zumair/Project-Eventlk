const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc   CATCH WEBHOOK: Receive new registration from Google Forms/Zapier
// @route  POST /api/webhooks/registration
// @access Public (No token required so external forms can hit it)

const receiveWebhook = async (req, res) => {
    try{
        const rawEventId = req.params.eventId; // Get eventId from URL
        const eventId = rawEventId.startsWith('reg_') ? rawEventId.replace('reg_', '') : rawEventId; // Remove 'reg_' prefix if it exists

        const {name,email} = req.body;

        // Basic validation
        if(!name || !email){
            return res.status(400).json({ success: false, message: "Name and email are required!" });
        }

        const eventCheck = await pool.query('SELECT title FROM "Events" WHERE id = $1', [eventId]);
        if(eventCheck.rows.length === 0){
            return res.status(404).json({ success: false, message: "Event not found!" });
        }

        const attendeeId = uuidv4();

        await pool.query(
            'INSERT INTO "Attendees" (id, event_id, name, email) VALUES ($1, $2, $3, $4)',
            [attendeeId, eventId, name, email]
        );

        const io = req.app.get('io');
        io.emit('NEW_REGISTRATION', { eventId, message: `New RSVP: ${name} just registered for ${eventCheck.rows[0].title}!!!` });
        res.status(200).json({ success: true, message: "Registration Successful!!!!" });
    }catch(error){
        console.error('WebHook Error:', error);
        res.status(500).json({ success: false, message: "Server Error processing registration" });
    }
};

const getEventAttendees = async (req, res) => {
    const {eventId }= req.params;

    try{
        const result = await pool.query(`SELECT id,name, email, status, to_char(registered_at, 'Mon DD, YYYY') as date FROM "Attendees" WHERE event_id = $1 ORDER BY registered_at DESC`, [eventId]);
        res.status(200).json({ success: true, attendees: result.rows });
    } catch (error) {
        console.error('Error fetching event attendees:', error);
        res.status(500).json({ success: false, message: "Server Error fetching attendees" });
    }
};

module.exports = {
    receiveWebhook,
    getEventAttendees
};