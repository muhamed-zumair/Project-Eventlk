const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private(requires authentication)

const createEvent = async (req, res) => {
    // 1. Ensure all these fields are captured from req.body
    const { title, date, category, expectedAttendees, budget, description, venue, venueAddress } = req.body;
    const userId = req.user.userId;

    console.log("Creating event with payload:", req.body);

    if (!title || !date || !category || !expectedAttendees || !budget) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields'
        });
    }

    try {
        await pool.query('BEGIN');

        const safeHeadcount = Number(expectedAttendees) || 0; // Default to 0 if not a valid number
        const safeBudget = Number(budget) || 0; // Default to 0 if not a valid number
        
        // 2. Handle Venue creation if AI provided one
        let venueId = null;
        if (venue) {
            venueId = uuidv4();
            await pool.query(
                `INSERT INTO "Venues" (id, name, address) VALUES ($1, $2, $3)`,
                [venueId, venue, venueAddress || '']
            );
        }

        const eventId = uuidv4();
        const insertEventQuery = `
            INSERT INTO "Events" (id, title, start_date, type, expected_headcount, total_budget, description, created_by, venue_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;`;

        await pool.query(insertEventQuery, [eventId, title, date, category, expectedAttendees, budget, description, userId, venueId]);

        // 3. Keep the team assignment
        await pool.query(`INSERT INTO "Event_Team" (event_id, user_id, role) VALUES ($1, $2, 'President')`, [eventId, userId]);

        await pool.query('COMMIT');
        res.status(201).json({ success: true, message: 'Event created successfully', eventId });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error creating event:', error);
        res.status(500).json({ success: false, message: 'Failed to create event' });
    }
};

const getEvents = async (req, res) => {
    const userId = req.user.userId;

    try {
        // 1. Corrected Syntax: Added the missing comma before [userId]
        // 2. Corrected Logic: Now targets 'In Progress' events that have passed their date
        await pool.query(`
            UPDATE "Events" 
            SET status = 'Done'
            WHERE start_date < CURRENT_DATE 
            AND status = 'In Progress'
            AND id IN (SELECT event_id FROM "Event_Team" WHERE user_id = $1);`, 
            [userId] 
        );

        const fetchEventsQuery = `
            SELECT 
                e.id, e.title, e.type, e.status, e.start_date, e.expected_headcount, e.total_budget, e.description,
                v.name as venue, t.role
            FROM "Events" e
            INNER JOIN "Event_Team" t ON e.id = t.event_id
            LEFT JOIN "Venues" v ON e.venue_id = v.id
            WHERE t.user_id = $1 AND e.status = 'In Progress'
            ORDER BY e.start_date ASC;`;

        const result = await pool.query(fetchEventsQuery, [userId]);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            events: result.rows
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch events..Please try again later'
        });
    }
};

const getPastEvents = async (req, res) => {
    const userId = req.user.userId;

    try {
        const fetchPastEventsQuery = `
            SELECT
                e.*, v.name as venue_name
            FROM "Events" e
            INNER JOIN "Event_Team" t ON e.id = t.event_id
            LEFT JOIN "Venues" v ON e.venue_id = v.id
            WHERE t.user_id = $1 AND e.status = 'Done'
            ORDER BY e.start_date DESC;`;

        const result = await pool.query(fetchPastEventsQuery, [userId]);

        // Added missing return statement!
        return res.status(200).json({
            success: true,
            events: result.rows
        });
    } catch (error) {
        console.error('Error fetching past events:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch past events..Please try again later'
        });
    }
};



const updateEvent = async (req, res) => {

    const eventId = req.params.id;
    const userId = req.user.userId;

    const { title, date, expectedAttendees, budget, description, agenda, speakers, sponsors, startTime, endTime, venue, venueAddress, organizerRole } = req.body;

    try {
        await pool.query('BEGIN');
        let venueId = null;
        if (venue) {
            venueId = uuidv4();
            await pool.query(`
                INSERT INTO "Venues" (id, name, address)
                VALUES ($1, $2, $3);`, [venueId, venue, venueAddress]
            );
        }
        const checkTeam = await pool.query(`
            SELECT role FROM "Event_Team" 
            WHERE event_id = $1 AND user_id = $2;`, [eventId, userId]);

        if (checkTeam.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(403).json({
                success: false,
                message: 'Access denied..You are not part of this event team'
            });
        }

        const updateEventQuery = `
            UPDATE "Events"
            SET title = $1, start_date = $2, expected_headcount = $3, total_budget = $4, description = $5, start_time = $6, end_time = $7, venue_id = $8
            WHERE id = $9
            RETURNING *;`;

        // Safely convert empty strings to NULL so PostgreSQL doesn't panic
        const safeStartTime = startTime === "" ? null : startTime;
        const safeEndTime = endTime === "" ? null : endTime;

        await pool.query(updateEventQuery, [title, date, expectedAttendees, budget, description, safeStartTime, safeEndTime, venueId, eventId]);

        await pool.query('DELETE FROM "Agenda" WHERE event_id = $1;', [eventId]);
        await pool.query('DELETE FROM "Guest_Speakers" WHERE event_id = $1;', [eventId]);
        await pool.query('DELETE FROM "Sponsors" WHERE event_id = $1;', [eventId]);

        if (agenda && agenda.length > 0) {
            for (let item of agenda) {
                // Safely grab the time whether it arrives as camelCase or snake_case, 
                // and force a fallback to "00:00" so it NEVER inserts NULL again!
                const safeStartTime = item.startTime || item.start_time || "00:00";
                const safeEndTime = item.endTime || item.end_time || "00:00";
                const safeTitle = item.title || "Untitled Session";

                await pool.query(`
                    INSERT INTO "Agenda" (id, event_id, start_time, end_time, title)
                    VALUES ($1, $2, $3, $4, $5);`, 
                    [uuidv4(), eventId, safeStartTime, safeEndTime, safeTitle]
                );
            }
        }

        if (speakers && speakers.length > 0) {
            for (let speaker of speakers) {
                await pool.query(`
                    INSERT INTO "Guest_Speakers" (id, event_id, name, designation)
                    VALUES ($1, $2, $3, $4);`, [uuidv4(), eventId, speaker.name, speaker.designation]);
            }
        }

        if (sponsors && sponsors.length > 0) {
            for (let sponsor of sponsors) {
                await pool.query(`
                    INSERT INTO "Sponsors" (id, event_id, name, tier,contribution_amount)
                    VALUES ($1, $2, $3, $4, $5);`, [uuidv4(), eventId, sponsor.name, sponsor.tier, sponsor.amount]);
            }
        }

        // Update the Organizer's role in the Event_Team table
        if (organizerRole) {
            await pool.query(`
                UPDATE "Event_Team" 
                SET role = $1 
                WHERE event_id = $2 AND user_id = $3;`, 
                [organizerRole, eventId, userId]
            );
        }

        await pool.query('COMMIT');// Commit the transaction after all operations are successful

        res.status(200).json({
            success: true,
            message: 'Event details updated successfully'
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error updating event:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update event..Please try again later'
        });
    }
};

const getEventById = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.userId;

    try{
        const eventQuery = `
            SELECT 
                e.*, t.role as my_role, v.name as venue, v.address as venue_address
            FROM "Events" e
            INNER JOIN "Event_Team" t ON e.id = t.event_id
            LEFT JOIN "Venues" v ON e.venue_id = v.id
            WHERE e.id = $1 AND t.user_id = $2;`;
        const eventResult = await pool.query(eventQuery, [eventId, userId]);

        if(eventResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or you do not have access to it'
            });
        }

        const eventData = eventResult.rows[0];

        const [agendaRes , speakersRes, sponsorsRes, docRes, teamRes] = await Promise.all([
            pool.query('SELECT * FROM "Agenda" WHERE event_id = $1 ORDER BY start_time ASC', [eventId]),
            pool.query('SELECT * FROM "Guest_Speakers" WHERE event_id = $1', [eventId]),
            pool.query('SELECT * FROM "Sponsors" WHERE event_id = $1', [eventId]),
            pool.query('SELECT * FROM "Event_Documents" WHERE event_id = $1', [eventId]),
            pool.query(`
                SELECT u.id, u.first_name, u.last_name,u.email, t.role
                FROM "Event_Team" t
                JOIN "Users" u ON t.user_id = u.id
                WHERE t.event_id = $1;`, [eventId])
        ]);

        const fullEventDetails = {
            ...eventData,
            agenda: agendaRes.rows,
            speakers: speakersRes.rows,
            sponsors: sponsorsRes.rows,
            documents: docRes.rows,
            team: teamRes.rows
        };

        return res.status(200).json({
            success: true,
            event: fullEventDetails
        });
    }catch (error) {
        console.error('Error fetching event details:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch event details..Please try again later'
        });
    }
};



module.exports = {
    createEvent,
    getEvents,
    updateEvent,
    getEventById,
    getPastEvents
};
