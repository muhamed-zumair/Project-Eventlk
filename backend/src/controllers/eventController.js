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

module.exports = {
    createEvent
};
