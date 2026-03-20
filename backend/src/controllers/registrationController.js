const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const qrcode = require('qrcode');
const ics = require('ics');
const { sendTicketEmail } = require('../utils/emailService');

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

// @desc    Generate and Send QR Codes & ICS files to selected attendees
// @route   POST /api/registrations/:eventId/issue-tickets
// @access  PRIVATE
const issueTickets = async (req, res) => {
    const { eventId } = req.params;
    const { attendeeIds } = req.body; // Array of UUIDs

    if (!attendeeIds || attendeeIds.length === 0) {
        return res.status(400).json({ success: false, message: "No attendees selected." });
    }

    try {
        // 1. Fetch Event Details (for the ICS file and Email)
        const eventRes = await pool.query(`
            SELECT title, description, start_date, start_time, end_time, venue_id,
                   (SELECT name FROM "Venues" WHERE id = venue_id) as venue_name
            FROM "Events" WHERE id = $1
        `, [eventId]);

        if (eventRes.rows.length === 0) return res.status(404).json({ success: false, message: "Event not found." });
        const event = eventRes.rows[0];

        // Safely parse dates for the ICS file
        const eventDate = new Date(event.start_date);
        const year = eventDate.getFullYear();
        const month = eventDate.getMonth() + 1;
        const day = eventDate.getDate();
        
        // Default to 9:00 AM if no time is provided
        const startHour = event.start_time ? parseInt(event.start_time.split(':')[0]) : 9;
        const startMin = event.start_time ? parseInt(event.start_time.split(':')[1]) : 0;
        const endHour = event.end_time ? parseInt(event.end_time.split(':')[0]) : startHour + 2;
        const endMin = event.end_time ? parseInt(event.end_time.split(':')[1]) : 0;

        // Create the ICS Event Object
        const icsEvent = {
            title: event.title,
            description: event.description || "Looking forward to seeing you there!",
            location: event.venue_name || "TBA",
            start: [year, month, day, startHour, startMin],
            end: [year, month, day, endHour, endMin],
            status: 'CONFIRMED',
            busyStatus: 'BUSY'
        };

        // Generate the ICS string
        let icsContent;
        ics.createEvent(icsEvent, (error, value) => {
            if (error) throw new Error("Failed to generate calendar file");
            icsContent = value;
        });

        // 2. Fetch the target attendees
        const attendeesRes = await pool.query(`
            SELECT id, name, email FROM "Attendees" 
            WHERE id = ANY($1) AND event_id = $2
        `, [attendeeIds, eventId]);

        // 3. Loop through and dispatch tickets!
        for (let attendee of attendeesRes.rows) {
            // The Secret Token: "evt_[id]_att_[id]" (This is what the scanner reads!)
            const qrToken = `evt_${eventId}_att_${attendee.id}`;
            
            // Generate QR Code as a base64 Data URL
            const qrCodeDataUrl = await qrcode.toDataURL(qrToken, {
                color: { dark: '#111827', light: '#ffffff' }, margin: 2, width: 300
            });

            // Send Email
            await sendTicketEmail(attendee.email, attendee.name, event.title, qrCodeDataUrl, icsContent);

            // Update Database Status
            await pool.query(`UPDATE "Attendees" SET status = 'Sent' WHERE id = $1`, [attendee.id]);
        }

        // 4. Tell the Frontend to refresh the UI live!
        const io = req.app.get('io');
        io.emit('TICKETS_ISSUED', { eventId });

        res.status(200).json({ success: true, message: `Successfully issued ${attendeeIds.length} tickets.` });

    } catch (error) {
        console.error("Error issuing tickets:", error);
        res.status(500).json({ success: false, message: "Failed to issue tickets." });
    }
};

// Export it!
module.exports = { receiveWebhook, getEventAttendees, issueTickets }; // <-- Add issueTickets to the exports