const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { sendExistingUserInviteEmail, sendNewUserInviteEmail } = require('../utils/emailService');

const createEvent = async (req, res) => {
    const { title, date, category, expectedAttendees, budget, description, venue, venueAddress, isAiAssisted, theme, plan, budgetAllocation } = req.body;
    const userId = req.user.userId;

    if (!title || !date || !category || !expectedAttendees || !budget) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (inputDate < today) {
        return res.status(400).json({ success: false, message: 'Cannot create events in the past. Please select a future date.' });
    }

    try {
        await pool.query('BEGIN');
        let venueId = null;
        if (venue) {
            venueId = uuidv4();
            await pool.query(`INSERT INTO "Venues" (id, name, address) VALUES ($1, $2, $3)`, [venueId, venue, venueAddress || '']);
        }

        const eventId = uuidv4();
        
        const insertEventQuery = `
            INSERT INTO "Events" (id, title, start_date, type, expected_headcount, total_budget, description, created_by, venue_id, is_ai_assisted, theme_colors, ai_recommended_plan)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;`;

        await pool.query(insertEventQuery, [
            eventId, title, date, category, expectedAttendees, budget, description, userId, venueId,
            isAiAssisted || false, theme ? JSON.stringify(theme) : null, plan ? JSON.stringify(plan) : null
        ]);

        if (budgetAllocation && budgetAllocation.length > 0) {
            for (let item of budgetAllocation) {
                await pool.query(`INSERT INTO "Budget_Categories" (id, event_id, name, allocated_amount) VALUES ($1, $2, $3, $4)`, [uuidv4(), eventId, item.name, item.value]);
            }
        }

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
        await pool.query(`
            UPDATE "Events" SET status = 'Done'
            WHERE start_date < CURRENT_DATE AND status = 'In Progress' AND id IN (SELECT event_id FROM "Event_Team" WHERE user_id = $1);`,
            [userId]
        );

        // --- 🚀 UPGRADED: Now dynamically calculates total_spent from the Expenses table ---
        const fetchEventsQuery = `
        SELECT 
            e.id, e.title, e.type, e.status, e.start_date, e.expected_headcount, e.total_budget, e.description, e.is_ai_assisted,
            v.name as venue, t.role,
            COALESCE((SELECT SUM(amount) FROM "Expenses" WHERE event_id = e.id), 0) as total_spent,
            (SELECT COUNT(*) FROM "Tasks" WHERE event_id = e.id) as total_tasks,
            (SELECT COUNT(*) FROM "Tasks" WHERE event_id = e.id AND status = 'Done') as completed_tasks,
            (SELECT COUNT(*) FROM "Tasks" WHERE event_id = e.id AND priority = 'High' AND status != 'Done') as pending_high_tasks,
            (SELECT COUNT(*) FROM "Attendees" WHERE event_id = e.id AND status = 'Checked In') as checked_in_count
        FROM "Events" e
        INNER JOIN "Event_Team" t ON e.id = t.event_id
        LEFT JOIN "Venues" v ON e.venue_id = v.id
        WHERE t.user_id = $1 AND e.status = 'In Progress'
        ORDER BY e.start_date ASC;`;

        const result = await pool.query(fetchEventsQuery, [userId]);
        return res.status(200).json({ success: true, count: result.rows.length, events: result.rows });
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch events.' });
    }
};

const getEventById = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.userId;

    try {
        // --- 🚀 UPGRADED: Also calculates total_spent for the detailed view modal ---
        const eventQuery = `
        SELECT 
            e.*, t.role as my_role, v.name as venue, v.address as venue_address,
            COALESCE((SELECT SUM(amount) FROM "Expenses" WHERE event_id = e.id), 0) as total_spent,
            (SELECT COUNT(*) FROM "Tasks" WHERE event_id = e.id) as total_tasks,
            (SELECT COUNT(*) FROM "Tasks" WHERE event_id = e.id AND status = 'Done') as completed_tasks,
            (SELECT COUNT(*) FROM "Tasks" WHERE event_id = e.id AND priority = 'High' AND status != 'Done') as pending_high_tasks
        FROM "Events" e
        INNER JOIN "Event_Team" t ON e.id = t.event_id
        LEFT JOIN "Venues" v ON e.venue_id = v.id
        WHERE e.id = $1 AND t.user_id = $2;`;
        
        const eventResult = await pool.query(eventQuery, [eventId, userId]);

        if (eventResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found or access denied.' });

        const eventData = eventResult.rows[0];

        const [agendaRes, speakersRes, sponsorsRes, docRes, teamRes, budgetRes] = await Promise.all([
            pool.query('SELECT * FROM "Agenda" WHERE event_id = $1 ORDER BY start_time ASC', [eventId]),
            pool.query('SELECT * FROM "Guest_Speakers" WHERE event_id = $1', [eventId]),
            pool.query('SELECT * FROM "Sponsors" WHERE event_id = $1', [eventId]),
            pool.query('SELECT * FROM "Event_Documents" WHERE event_id = $1', [eventId]),
            pool.query(`
                SELECT u.id::varchar, u.first_name, u.last_name, u.email, t.role, 'Active' as status FROM "Event_Team" t JOIN "Users" u ON t.user_id = u.id WHERE t.event_id = $1
                UNION ALL
                SELECT id::varchar, NULL::varchar as first_name, NULL::varchar as last_name, email, role, status::varchar FROM "Event_Invitations" WHERE event_id = $1 AND status IN ('Pending', 'Declined');
            `, [eventId]),
            pool.query('SELECT * FROM "Budget_Categories" WHERE event_id = $1', [eventId])
        ]);

        const fullEventDetails = {
            ...eventData, agenda: agendaRes.rows, speakers: speakersRes.rows, sponsors: sponsorsRes.rows,
            documents: docRes.rows, team: teamRes.rows, budgetCategories: budgetRes.rows
        };

        return res.status(200).json({ success: true, event: fullEventDetails });
    } catch (error) {
        console.error('Error fetching event details:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch event details.' });
    }
};

const updateEvent = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const { title, date, expectedAttendees, budget, description, agenda, speakers, sponsors, startTime, endTime, venue, venueAddress, organizerRole } = req.body;
    
    if (date) {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (inputDate < today) return res.status(400).json({ success: false, message: 'Cannot update event to a past date.' });
    } 
    
    try {
        await pool.query('BEGIN');
        const checkTeam = await pool.query(`SELECT role FROM "Event_Team" WHERE event_id = $1 AND user_id = $2;`, [eventId, userId]);
        if (checkTeam.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const currentEventRes = await pool.query(`SELECT is_ai_assisted, expected_headcount, total_budget, venue_id FROM "Events" WHERE id = $1`, [eventId]);
        const isAi = currentEventRes.rows[0]?.is_ai_assisted;

        const finalHeadcount = isAi ? currentEventRes.rows[0].expected_headcount : expectedAttendees;
        const finalBudget = isAi ? currentEventRes.rows[0].total_budget : budget;
        let finalVenueId = currentEventRes.rows[0].venue_id; 
        
        if (!isAi && venue) {
            finalVenueId = uuidv4();
            await pool.query(`INSERT INTO "Venues" (id, name, address) VALUES ($1, $2, $3);`, [finalVenueId, venue, venueAddress]);
        }

        const updateEventQuery = `
            UPDATE "Events" SET title = $1, start_date = $2, expected_headcount = $3, total_budget = $4, description = $5, start_time = $6, end_time = $7, venue_id = $8
            WHERE id = $9 RETURNING *;`;

        await pool.query(updateEventQuery, [title, date, finalHeadcount, finalBudget, description, startTime === "" ? null : startTime, endTime === "" ? null : endTime, finalVenueId, eventId]);

        await pool.query('DELETE FROM "Agenda" WHERE event_id = $1;', [eventId]);
        await pool.query('DELETE FROM "Guest_Speakers" WHERE event_id = $1;', [eventId]);
        await pool.query('DELETE FROM "Sponsors" WHERE event_id = $1;', [eventId]);

        if (agenda && agenda.length > 0) {
            for (let item of agenda) await pool.query(`INSERT INTO "Agenda" (id, event_id, start_time, end_time, title) VALUES ($1, $2, $3, $4, $5);`, [uuidv4(), eventId, item.startTime || item.start_time || "00:00", item.endTime || item.end_time || "00:00", item.title || "Untitled Session"]);
        }

        if (speakers && speakers.length > 0) {
            for (let speaker of speakers) await pool.query(`INSERT INTO "Guest_Speakers" (id, event_id, name, designation) VALUES ($1, $2, $3, $4);`, [uuidv4(), eventId, speaker.name, speaker.designation]);
        }

        if (sponsors && sponsors.length > 0) {
            for (let sponsor of sponsors) await pool.query(`INSERT INTO "Sponsors" (id, event_id, name, tier,contribution_amount) VALUES ($1, $2, $3, $4, $5);`, [uuidv4(), eventId, sponsor.name, sponsor.tier, sponsor.amount]);
        }

        if (organizerRole) await pool.query(`UPDATE "Event_Team" SET role = $1 WHERE event_id = $2 AND user_id = $3;`, [organizerRole, eventId, userId]);

        await pool.query('COMMIT');
        res.status(200).json({ success: true, message: 'Event details updated successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error updating event:', error);
        return res.status(500).json({ success: false, message: 'Failed to update event.' });
    }
};

const getPastEvents = async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await pool.query(`SELECT e.*, v.name as venue_name FROM "Events" e INNER JOIN "Event_Team" t ON e.id = t.event_id LEFT JOIN "Venues" v ON e.venue_id = v.id WHERE t.user_id = $1 AND e.status = 'Done' ORDER BY e.start_date DESC;`, [userId]);
        return res.status(200).json({ success: true, events: result.rows });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch past events.' });
    }
};

const getPostEventReport = async (req, res) => {
    const eventId = req.params.id;
    try {
        const [eventRes, attendanceRes, budgetRes, speakerRes, sponsorsRes, docsRes] = await Promise.all([
            pool.query(`SELECT e.*, v.name as venue_name FROM "Events" e LEFT JOIN "Venues" v ON e.venue_id = v.id WHERE e.id = $1;`, [eventId]),
            pool.query(`SELECT COUNT(*) FROM "Attendees" WHERE event_id=$1 AND status = 'Checked In'`, [eventId]),
            pool.query(`SELECT COALESCE(SUM(amount), 0) as total_spent FROM "Expenses" WHERE event_id = $1;`, [eventId]),
            pool.query('SELECT * FROM "Guest_Speakers" WHERE event_id = $1', [eventId]),
            pool.query('SELECT * FROM "Sponsors" WHERE event_id = $1', [eventId]),
            pool.query('SELECT * FROM "Event_Documents" WHERE event_id = $1', [eventId])
        ]);

        const event = eventRes.rows[0];
        const finalAttendance = Number(attendanceRes.rows[0].count) || 0;
        const totalSpent = Number(budgetRes.rows[0].total_spent) || 0.00;

        return res.status(200).json({
            success: true, report: {
                ...event, finalAttendance, attendanceRate: event.expected_headcount > 0 ? Math.round((finalAttendance / event.expected_headcount) * 100) : 0,
                totalSpent, budgetUtilization: event.total_budget > 0 ? Math.round((totalSpent / event.total_budget) * 100) : 0,
                speakers: speakerRes.rows, sponsors: sponsorsRes.rows, documents: docsRes.rows
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch post-event report.' });
    }
};

const deleteEvent = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.userId;
    try {
        const checkTeam = await pool.query(`SELECT role FROM "Event_Team" WHERE event_id = $1 AND user_id = $2;`, [eventId, userId]);
        if (checkTeam.rows.length === 0) return res.status(403).json({ success: false, message: 'Access denied.' });

        await pool.query('BEGIN');
        await pool.query('DELETE FROM "Agenda" WHERE event_id = $1;', [eventId]);
        await pool.query('DELETE FROM "Guest_Speakers" WHERE event_id = $1;', [eventId]);
        await pool.query('DELETE FROM "Sponsors" WHERE event_id = $1;', [eventId]);
        await pool.query('DELETE FROM "Event_Documents" WHERE event_id = $1;', [eventId]);
        await pool.query('DELETE FROM "Budget_Categories" WHERE event_id = $1;', [eventId]); 
        await pool.query('DELETE FROM "Expenses" WHERE event_id = $1;', [eventId]).catch(() => { }); 
        await pool.query('DELETE FROM "Attendees" WHERE event_id = $1;', [eventId]).catch(() => { });
        await pool.query('DELETE FROM "Event_Team" WHERE event_id = $1;', [eventId]);
        await pool.query('DELETE FROM "Events" WHERE id = $1;', [eventId]);

        await pool.query('COMMIT');
        return res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        return res.status(500).json({ success: false, message: 'Failed to delete event' });
    }
};

const inviteTeamMember = async (req, res) => {
    const eventId = req.params.id;
    const inviterId = req.user.userId;
    const { email, role } = req.body;

    if (!email || !role) return res.status(400).json({ success: false, message: 'Email and role are required' });

    try {
        await pool.query('BEGIN');
        const inviterCheck = await pool.query(`SELECT role FROM "Event_Team" WHERE event_id = $1 AND user_id = $2;`, [eventId, inviterId]);
        if (inviterCheck.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const eventCheck = await pool.query(`SELECT title FROM "Events" WHERE id = $1;`, [eventId]);
        if (eventCheck.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        const eventTitle = eventCheck.rows[0].title;
        const teamCheck = await pool.query(`SELECT * FROM "Event_Team" et JOIN "Users" u ON et.user_id = u.id WHERE et.event_id = $1 AND u.email = $2;`, [eventId, email]);
        
        if (teamCheck.rows.length > 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'User is already part of the team' });
        }

        const inviteCheck = await pool.query(`SELECT * FROM "Event_Invitations" WHERE event_id = $1 AND email = $2;`, [eventId, email]);
        if (inviteCheck.rows.length > 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'An invitation has already been sent.' });
        }

        const userCheck = await pool.query(`SELECT id FROM "Users" WHERE email = $1`, [email]);

        if (userCheck.rows.length > 0) {
            const invitedUserId = userCheck.rows[0].id; 
            await pool.query(`INSERT INTO "Event_Invitations" (event_id, email, role) VALUES ($1, $2, $3)`, [eventId, email, role]);
            await sendExistingUserInviteEmail(email, eventTitle, role, "Event organizer");
            await pool.query('COMMIT');
            
            const io = req.app.get('io');
            const connectedUsers = req.app.get('connectedUsers');
            const targetSocketId = connectedUsers.get(invitedUserId);
            if (targetSocketId) {
                io.to(targetSocketId).emit('NEW_INVITE', { message: `You have been invited to join ${eventTitle}!` });
            }
            return res.status(200).json({ success: true, message: 'Invitation sent successfully!' });
        } else {
            await pool.query(`INSERT INTO "Event_Invitations" (event_id, email, role) VALUES ($1, $2, $3)`, [eventId, email, role]);
            await sendNewUserInviteEmail(email, eventTitle, role, "Event organizer");
            await pool.query('COMMIT');
            return res.status(200).json({ success: true, message: 'Invitation sent successfully!' });
        }
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error inviting team member:', error);
        return res.status(500).json({ success: false, message: 'Failed to process invitation.' });
    }
};

const getUserInvitations = async (req, res) => {
    const userId = req.user.userId; 
    try {
        const userCheck = await pool.query(`SELECT email FROM "Users" WHERE id = $1`, [userId]);
        if (userCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
        const userEmail = userCheck.rows[0].email;

        const myInvitesQuery = `SELECT i.id as notification_id, i.role, e.title as event_title, 'invite' as type, i.email as target_email FROM "Event_Invitations" i JOIN "Events" e ON i.event_id = e.id WHERE i.email = $1 AND i.status = 'Pending';`;
        const myDeclinedAlertsQuery = `SELECT i.id as notification_id, i.role, e.title as event_title, 'declined_alert' as type, i.email as target_email FROM "Event_Invitations" i JOIN "Events" e ON i.event_id = e.id WHERE e.created_by = $1 AND i.status = 'Declined';`;
        
        // 🚀 NEW: Fetch persistent alerts from your new Notifications table!
        const myNotificationsQuery = `SELECT id as notification_id, message, type, event_id FROM "Notifications" WHERE user_id = $1 AND is_read = false ORDER BY created_at DESC;`;

        const [invitesRes, declinedRes, notifRes] = await Promise.all([
            pool.query(myInvitesQuery, [userEmail]),
            pool.query(myDeclinedAlertsQuery, [userId]),
            pool.query(myNotificationsQuery, [userId])
        ]);

        return res.status(200).json({ success: true, notifications: [...invitesRes.rows, ...declinedRes.rows, ...notifRes.rows] });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
    }
};

const respondToInvitation = async (req, res) => {
    const userId = req.user.userId;
    const { inviteId, action } = req.body; 

    if (!['accept', 'decline'].includes(action)) return res.status(400).json({ success: false, message: 'Invalid action.' });

    try {
        await pool.query('BEGIN');
        const userCheck = await pool.query(`SELECT email FROM "Users" WHERE id = $1`, [userId]);
        const userEmail = userCheck.rows[0].email;

        const inviteCheck = await pool.query(`
            SELECT i.*, e.title as event_title, e.created_by, u.email as organizer_email, u.first_name as organizer_name
            FROM "Event_Invitations" i JOIN "Events" e ON i.event_id = e.id JOIN "Users" u ON e.created_by = u.id
            WHERE i.id = $1 AND i.email = $2;
        `, [inviteId, userEmail]);

        if (inviteCheck.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Invitation not found.' });
        }

        const invite = inviteCheck.rows[0];

        if (action === 'accept') {
            await pool.query(`INSERT INTO "Event_Team" (event_id, user_id, role) VALUES ($1, $2, $3)`, [invite.event_id, userId, invite.role]);
            await pool.query(`DELETE FROM "Event_Invitations" WHERE id = $1`, [inviteId]);
            
            // 🚀 NEW: Save Acceptance to the new Notifications Table for the Organizer!
            const msg = `${userEmail} accepted your invite to ${invite.event_title}!`;
            await pool.query(`INSERT INTO "Notifications" (id, user_id, event_id, message, type) VALUES ($1, $2, $3, $4, 'invite_accepted')`, [uuidv4(), invite.created_by, invite.event_id, msg]);
            
            await pool.query('COMMIT');
            
            const io = req.app.get('io');
            const organizerSocket = req.app.get('connectedUsers').get(invite.created_by);
            if (organizerSocket) io.to(organizerSocket).emit('TEAM_UPDATED', { message: msg });
            
            return res.status(200).json({ success: true, message: 'Welcome to the team!' });
        } else if (action === 'decline') {
            await pool.query(`UPDATE "Event_Invitations" SET status = 'Declined' WHERE id = $1`, [inviteId]);
            const { sendDeclineNotificationEmail } = require('../utils/emailService');
            await sendDeclineNotificationEmail(invite.organizer_email, invite.organizer_name, invite.event_title, userEmail);
            await pool.query('COMMIT');
            
            const io = req.app.get('io');
            const organizerSocket = req.app.get('connectedUsers').get(invite.created_by);
            if (organizerSocket) io.to(organizerSocket).emit('TEAM_UPDATED', { message: `${userEmail} declined the invite to ${invite.event_title}.` });
            
            return res.status(200).json({ success: true, message: 'Invitation declined.' });
        }
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error processing invitation:', error);
        return res.status(500).json({ success: false, message: 'Failed to process invitation.' });
    }
};

const dismissNotification = async (req, res) => {
    try {
        const { notificationId } = req.body;
        // 🚀 UPGRADED: Try deleting from invitations first. If not found, it's a general notification, so mark it read!
        const result = await pool.query(`DELETE FROM "Event_Invitations" WHERE id = $1`, [notificationId]);
        if (result.rowCount === 0) {
            await pool.query(`UPDATE "Notifications" SET is_read = true WHERE id = $1`, [notificationId]);
        }
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

const removeTeamMember = async (req, res) => {
    const { id: eventId, userId: targetUserId } = req.params;
    const adminId = req.user.userId;

    try {
        const adminCheck = await pool.query(`SELECT role FROM "Event_Team" WHERE event_id = $1 AND user_id = $2`, [eventId, adminId]);
        if (!adminCheck.rows.length || adminCheck.rows[0].role !== 'President') {
            return res.status(403).json({ success: false, message: 'Only the President can remove members.' });
        }

        if (adminId === targetUserId) return res.status(400).json({ success: false, message: 'You cannot remove yourself.' });

        await pool.query('BEGIN');
        const details = await pool.query(`SELECT u.email, e.title FROM "Users" u, "Events" e WHERE u.id = $1 AND e.id = $2`, [targetUserId, eventId]);
        await pool.query(`DELETE FROM "Event_Team" WHERE event_id = $1 AND user_id = $2`, [eventId, targetUserId]);
        
        // 🚀 NEW: Save Removal to the new Notifications Table!
        const msg = `You have been removed from the team for ${details.rows[0].title}.`;
        await pool.query(`INSERT INTO "Notifications" (id, user_id, event_id, message, type) VALUES ($1, $2, $3, $4, 'removal')`, [uuidv4(), targetUserId, eventId, msg]);

        const { sendRemovalEmail } = require('../utils/emailService');
        await sendRemovalEmail(details.rows[0].email, details.rows[0].title);
        await pool.query('COMMIT');
        
        const targetSocketId = req.app.get('connectedUsers').get(targetUserId);
        if (targetSocketId) {
            req.app.get('io').to(targetSocketId).emit('MEMBER_REMOVED', { message: msg, eventId });
        }
        res.status(200).json({ success: true, message: 'Member removed successfully.' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error removing member:", error);
        res.status(500).json({ success: false, message: 'Failed to remove member.' });
    }
};

const changeMemberRole = async (req, res) => {
    const { id: eventId, userId: targetUserId } = req.params;
    try {
        const eventCheck = await pool.query(`SELECT title FROM "Events" WHERE id = $1`, [eventId]);
        await pool.query(`UPDATE "Event_Team" SET role = $1 WHERE event_id = $2 AND user_id = $3`, [req.body.newRole, eventId, targetUserId]);
        
        // 🚀 NEW: Save Role Change to the new Notifications Table!
        const msg = `Your role for ${eventCheck.rows[0]?.title} was changed to ${req.body.newRole}.`;
        await pool.query(`INSERT INTO "Notifications" (id, user_id, event_id, message, type) VALUES ($1, $2, $3, $4, 'role_change')`, [uuidv4(), targetUserId, eventId, msg]);

        const targetSocketId = req.app.get('connectedUsers').get(targetUserId);
        if (targetSocketId) {
            req.app.get('io').to(targetSocketId).emit('ROLE_CHANGED', { message: msg, eventId });
        }
        res.status(200).json({ success: true, message: 'Role updated successfully.' });
    } catch (error) {
        console.error("Error changing role:", error);
        res.status(500).json({ success: false, message: 'Failed to update role.' });
    }
};

module.exports = {
    createEvent, getEvents, updateEvent, getEventById, getPastEvents, getPostEventReport, 
    deleteEvent, inviteTeamMember, getUserInvitations, respondToInvitation, 
    dismissNotification, changeMemberRole, removeTeamMember
};

