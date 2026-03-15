const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private(requires authentication)

// This function creates a new event in the database. It expects the request body to contain the event details such as title, date, category, expected attendees, budget, and description. The user ID of the creator is obtained from the authenticated user (assuming you have authentication middleware that sets req.user). The function uses a transaction to ensure that both the event creation and team assignment are successful. If any part of the process fails, it rolls back the transaction and returns an error response.
const createEvent = async (req, res) => {
    const { title, date, category, expectedAttendees, budget, description } = req.body;
    const userId = req.user.userId; // Assuming you have authentication middleware that sets req.user

    if (!title || !date || !category || !expectedAttendees || !budget) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields'
        });
    }
    // Additional validation can be added here (e.g., check if date is valid, budget is a number, etc.)
    try {
        await pool.query('BEGIN');
        const eventId = uuidv4();
        const insertEventQuery = `
            INSERT INTO "Events" (id, title, start_date, type, expected_headcount, total_budget, description, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;`;

        const eventValues = [eventId, title, date, category, expectedAttendees, budget, description, userId];
        const newEvent = await pool.query(insertEventQuery, eventValues);

        // Insert the creator into the Event_Team with the role of 'President'
        const insertTeamQuery = `
            INSERT INTO "Event_Team" ( event_id, user_id, role)
            VALUES ($1, $2, 'President');`;
        await pool.query(insertTeamQuery, [eventId, userId]);

        await pool.query('COMMIT');
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: newEvent.rows[0]
        });
    }catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error creating event:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create event..Please try again later'
        });
    }

};

const getEvents = async (req, res) => {
    const userId = req.user.userId; // Assuming you have authentication middleware that sets req.user

    try {
        const fetchEventsQuery = `
            SELECT 
                e.id,
                e.title,
                e.type,
                e.status,
                e.start_date,
                e.expected_headcount,   
                e.total_budget,
                e.description,
                t.role
            FROM "Events" e
            INNER JOIN "Event_Team" t ON e.id = t.event_id
            WHERE t.user_id = $1
            ORDER BY e.start_date ASC;`;

            const result = await pool.query(fetchEventsQuery, [userId]);

            return res.status(200).json({
                success: true,
                count: result.rows.length,
                events: result.rows
            });
    }catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch events..Please try again later'
        });
    }
};

const updateEvent = async (req, res) => {

    const eventId = req.params.id;
    const userId = req.user.userId;

    const { title, date, expectedAttendees, budget, description, agenda, speakers, sponsors } = req.body;

    try {
        await pool.query('BEGIN');
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
            SET title = $1, start_date = $2, expected_headcount = $3, total_budget = $4, description = $5
            WHERE id = $6
            RETURNING *;`;

        await pool.query(updateEventQuery, [title, date, expectedAttendees, budget, description, eventId]);

        await pool.query('DELETE FROM "Agenda" WHERE event_id = $1;', [eventId]);
        await pool.query('DELETE FROM "Guest_Speakers" WHERE event_id = $1;', [eventId]);
        await pool.query('DELETE FROM "Sponsors" WHERE event_id = $1;', [eventId]);

        if (agenda && agenda.length > 0) {
            for (let item of agenda) {
                await pool.query(`
                    INSERT INTO "Agenda" (id, event_id, start_time, end_time, title)
                    VALUES ($1, $2, $3, $4, $5);`, [uuidv4(), eventId, item.start_time, item.end_time, item.title]);
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
                e.*, t.role as my_role
            FROM "Events" e
            INNER JOIN "Event_Team" t ON e.id = t.event_id
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
    getEventById
};
