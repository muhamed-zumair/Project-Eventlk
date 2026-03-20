const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all tasks and team members for a specific event
const getEventTasks = async (req, res) => {
    const { eventId } = req.params;
    try {
        const tasksRes = await pool.query(`
            SELECT t.id, t.event_id as "eventId", t.title, t.priority, t.status, 
                   t.assignee_id as "assigneeId", u.first_name || ' ' || u.last_name as "assigneeName"
            FROM "Tasks" t LEFT JOIN "Users" u ON t.assignee_id = u.id
            WHERE t.event_id = $1 ORDER BY t.created_at ASC
        `, [eventId]);

        const teamRes = await pool.query(`
            SELECT u.id, u.first_name || ' ' || u.last_name as name
            FROM "Event_Team" et JOIN "Users" u ON et.user_id = u.id
            WHERE et.event_id = $1
        `, [eventId]);

        res.status(200).json({ success: true, tasks: tasksRes.rows, teamMembers: teamRes.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
    }
};

// @desc    Create a new task
const createTask = async (req, res) => {
    const { eventId } = req.params;
    const { title, priority, status } = req.body;
    const userId = req.user.userId;

    try {
        const taskId = uuidv4();
        await pool.query(
            `INSERT INTO "Tasks" (id, event_id, title, priority, status, created_by) VALUES ($1, $2, $3, $4, $5, $6)`,
            [taskId, eventId, title || '', priority || 'Medium', status || 'To Do', userId]
        );
        res.status(201).json({ success: true, taskId, message: "Task created." });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create task.' });
    }
};

// @desc    Update a task (Title, Status, Priority, Assignee)
const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, status, priority, assigneeId } = req.body;
    const assignerId = req.user.userId;

    try {
        const currentTaskRes = await pool.query(`SELECT t.*, e.title as event_title FROM "Tasks" t JOIN "Events" e ON t.event_id = e.id WHERE t.id = $1`, [taskId]);
        if (currentTaskRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found' });
        
        const currentTask = currentTaskRes.rows[0];
        const newTitle = title !== undefined ? title : currentTask.title;
        const newStatus = status !== undefined ? status : currentTask.status;
        const newPriority = priority !== undefined ? priority : currentTask.priority;
        const newAssigneeId = assigneeId !== undefined ? (assigneeId === "" ? null : assigneeId) : currentTask.assignee_id;

        // 🚀 NEW: BACKEND VALIDATION - Prevent assigning empty tasks
        if (newAssigneeId && (!newTitle || newTitle.trim() === '')) {
            return res.status(400).json({ success: false, message: 'Cannot assign an unnamed task.' });
        }

        await pool.query(
            `UPDATE "Tasks" SET title = $1, status = $2, priority = $3, assignee_id = $4 WHERE id = $5`,
            [newTitle, newStatus, newPriority, newAssigneeId, taskId]
        );

        if (newAssigneeId && newAssigneeId !== currentTask.assignee_id && newAssigneeId !== assignerId) {
            const msg = `You have been assigned a task: "${newTitle}" for ${currentTask.event_title}.`;
            await pool.query(`INSERT INTO "Notifications" (id, user_id, event_id, message, type) VALUES ($1, $2, $3, $4, 'task_assigned')`, [uuidv4(), newAssigneeId, currentTask.event_id, msg]);
            const targetSocket = req.app.get('connectedUsers').get(newAssigneeId);
            if (targetSocket) req.app.get('io').to(targetSocket).emit('TASK_ASSIGNED', { message: msg });
        }

        res.status(200).json({ success: true, message: "Task updated." });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update task.' });
    }
};

// @desc    Delete a task
const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    const assignerId = req.user.userId;

    try {
        // 🚀 NEW: Check if task has an assignee before deleting
        const taskRes = await pool.query(`SELECT t.*, e.title as event_title FROM "Tasks" t JOIN "Events" e ON t.event_id = e.id WHERE t.id = $1`, [taskId]);
        if (taskRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found' });

        const task = taskRes.rows[0];

        await pool.query('DELETE FROM "Tasks" WHERE id = $1', [taskId]);

        // 🚀 NEW: NOTIFY USER IF THEIR TASK WAS DELETED
        if (task.assignee_id && task.assignee_id !== assignerId) {
            const msg = `A task assigned to you ("${task.title || 'Untitled'}") in ${task.event_title} was deleted.`;
            await pool.query(`INSERT INTO "Notifications" (id, user_id, event_id, message, type) VALUES ($1, $2, $3, $4, 'task_deleted')`, [uuidv4(), task.assignee_id, task.event_id, msg]);
            const targetSocket = req.app.get('connectedUsers').get(task.assignee_id);
            if (targetSocket) req.app.get('io').to(targetSocket).emit('TASK_DELETED', { message: msg });
        }

        res.status(200).json({ success: true, message: "Task deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete task.' });
    }
};

module.exports = { getEventTasks, createTask, updateTask, deleteTask };