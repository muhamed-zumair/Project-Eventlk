const express = require('express');
const router = express.Router();
const { getBudgetOverview, addBudgetCategory, addExpense } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:eventId', protect, getBudgetOverview);
router.post('/:eventId/category', protect, addBudgetCategory);
router.post('/:eventId/expense', protect, addExpense);

module.exports = router;