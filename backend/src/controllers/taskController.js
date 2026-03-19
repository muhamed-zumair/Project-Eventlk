const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all tasks and team members for a specific event
// @route   GET /api/tasks/:eventId
const getEventTasks = async (req, res) => {
    const { eventId } = req.params;

    try {
        // 1. Fetch Tasks with Assignee Names
        const tasksRes = await pool.query(`
            SELECT t.id, t.event_id as "eventId", t.title, t.priority, t.status, 
                   t.assignee_id as "assigneeId",
                   u.first_name || ' ' || u.last_name as "assigneeName"
            FROM "Tasks" t
            LEFT JOIN "Users" u ON t.assignee_id = u.id
            WHERE t.event_id = $1
            ORDER BY t.created_at ASC
        `, [eventId]);

        // 2. Fetch valid Team Members for this event (for the Assignee Dropdown)
        const teamRes = await pool.query(`
            SELECT u.id, u.first_name || ' ' || u.last_name as name
            FROM "Event_Team" et
            JOIN "Users" u ON et.user_id = u.id
            WHERE et.event_id = $1
        `, [eventId]);

        res.status(200).json({ 
            success: true, 
            tasks: tasksRes.rows,
            teamMembers: teamRes.rows 
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks/:eventId
const createTask = async (req, res) => {
    const { eventId } = req.params;
    const { title, priority, status } = req.body;
    const userId = req.user.userId;

    try {
        const taskId = uuidv4();
        await pool.query(
            `INSERT INTO "Tasks" (id, event_id, title, priority, status, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [taskId, eventId, title || '', priority || 'Medium', status || 'To Do', userId]
        );

        res.status(201).json({ success: true, taskId, message: "Task created." });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ success: false, message: 'Failed to create task.' });
    }
};

// @desc    Update a task (Title, Status, Priority, Assignee)
// @route   PUT /api/tasks/:taskId
const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, status, priority, assigneeId } = req.body;

    try {
        await pool.query(
            `UPDATE "Tasks" 
             SET title = COALESCE($1, title), 
                 status = COALESCE($2, status), 
                 priority = COALESCE($3, priority), 
                 assignee_id = $4
             WHERE id = $5`,
            [title, status, priority, assigneeId || null, taskId]
        );

        res.status(200).json({ success: true, message: "Task updated." });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ success: false, message: 'Failed to update task.' });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:taskId
const deleteTask = async (req, res) => {
    const { taskId } = req.params;

    try {
        await pool.query('DELETE FROM "Tasks" WHERE id = $1', [taskId]);
        res.status(200).json({ success: true, message: "Task deleted." });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, message: 'Failed to delete task.' });
    }
};

module.exports = { getEventTasks, createTask, updateTask, deleteTask };