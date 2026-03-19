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
    const assignerId = req.user.userId;

    try {
        // 1. Fetch current task to compare changes and get the Event Name
        const currentTaskRes = await pool.query(`
            SELECT t.*, e.title as event_title
            FROM "Tasks" t
            JOIN "Events" e ON t.event_id = e.id
            WHERE t.id = $1
        `, [taskId]);

        if (currentTaskRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        
        const currentTask = currentTaskRes.rows[0];

        // 2. Safely apply only the fields that were passed in the request
        const newTitle = title !== undefined ? title : currentTask.title;
        const newStatus = status !== undefined ? status : currentTask.status;
        const newPriority = priority !== undefined ? priority : currentTask.priority;
        const newAssigneeId = assigneeId !== undefined ? (assigneeId === "" ? null : assigneeId) : currentTask.assignee_id;

        // 3. Update the database
        await pool.query(
            `UPDATE "Tasks"
             SET title = $1, status = $2, priority = $3, assignee_id = $4
             WHERE id = $5`,
            [newTitle, newStatus, newPriority, newAssigneeId, taskId]
        );

        // 4. 🚀 THE NOTIFICATION LOGIC
        // Only trigger if assignee changed, it's a real person, and they didn't just assign it to themselves
        if (newAssigneeId && newAssigneeId !== currentTask.assignee_id && newAssigneeId !== assignerId) {
            
            const msg = `You have been assigned a task: "${newTitle || 'Untitled Task'}" for ${currentTask.event_title}.`;

            // Save to persistent Notifications table
            await pool.query(
                `INSERT INTO "Notifications" (id, user_id, event_id, message, type) VALUES ($1, $2, $3, $4, 'task_assigned')`,
                [uuidv4(), newAssigneeId, currentTask.event_id, msg]
            );

            // Fire the Live WebSocket Alert!
            const io = req.app.get('io');
            const targetSocket = req.app.get('connectedUsers').get(newAssigneeId);
            
            if (targetSocket) {
                io.to(targetSocket).emit('TASK_ASSIGNED', { message: msg });
            }
        }

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