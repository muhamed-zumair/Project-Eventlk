const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all budget categories and expenses for an event
// @route   GET /api/budgets/:eventId
const getBudgetOverview = async (req, res) => {
    const { eventId } = req.params;

    try {
        // 1. Fetch Categories
        const catRes = await pool.query(
            'SELECT id, event_id as "eventId", name, allocated_amount as total FROM "Budget_Categories" WHERE event_id = $1', 
            [eventId]
        );
        
        // 2. Fetch Expenses with User Details
        const expRes = await pool.query(`
            SELECT e.id, e.category_id as "categoryId", e.amount, e.description, e.logged_at as date, 
                   u.first_name || ' ' || u.last_name as "loggedBy"
            FROM "Expenses" e
            JOIN "Users" u ON e.logged_by = u.id
            WHERE e.event_id = $1
            ORDER BY e.logged_at DESC
        `, [eventId]);

        const expenses = expRes.rows.map(exp => ({
            ...exp,
            amount: parseFloat(exp.amount)
        }));

        // 3. Map categories and auto-calculate "spent" based on expenses
        const categories = catRes.rows.map(cat => {
            const spent = expenses
                .filter(exp => exp.categoryId === cat.id)
                .reduce((sum, exp) => sum + exp.amount, 0);
                
            return { 
                ...cat, 
                total: parseFloat(cat.total), 
                spent 
            };
        });

        res.status(200).json({ success: true, categories, expenses });
    } catch (error) {
        console.error('Error fetching budget overview:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch budget data.' });
    }
};

// @desc    Add a new budget category (Manual Events Only)
// @route   POST /api/budgets/:eventId/category
const addBudgetCategory = async (req, res) => {
    const { eventId } = req.params;
    const { name, amount } = req.body;

    try {
        // SECURITY CHECK: Ensure the event is NOT AI-assisted
        const eventRes = await pool.query('SELECT is_ai_assisted FROM "Events" WHERE id = $1', [eventId]);
        if (eventRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found' });
        
        if (eventRes.rows[0].is_ai_assisted) {
            return res.status(403).json({ success: false, message: 'Cannot manually add categories to an AI-managed budget.' });
        }

        const newCatId = uuidv4();
        await pool.query(
            'INSERT INTO "Budget_Categories" (id, event_id, name, allocated_amount) VALUES ($1, $2, $3, $4)', 
            [newCatId, eventId, name, amount]
        );

        res.status(201).json({ 
            success: true, 
            category: { id: newCatId, eventId, name, total: parseFloat(amount), spent: 0 } 
        });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ success: false, message: 'Failed to create category.' });
    }
};

// @desc    Add a new expense transaction
// @route   POST /api/budgets/:eventId/expense
const addExpense = async (req, res) => {
    const { eventId } = req.params;
    const { categoryId, amount, description } = req.body;
    const userId = req.user.userId;

    try {
        const newExpId = uuidv4();
        await pool.query(
            'INSERT INTO "Expenses" (id, category_id, amount, description, logged_by, event_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [newExpId, categoryId, amount, description || 'Uncategorized Expense', userId, eventId]
        );

        res.status(201).json({ success: true, message: "Expense logged successfully." });
    } catch (error) {
        console.error('Error logging expense:', error);
        res.status(500).json({ success: false, message: 'Failed to log expense.' });
    }
};

module.exports = { getBudgetOverview, addBudgetCategory, addExpense };