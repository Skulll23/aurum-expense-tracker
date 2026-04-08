import express from 'express';
import Expense from '../models/Expense.js';

const router = express.Router();

// GET /api/expenses/stats/summary — MUST be before /:id
router.get('/stats/summary', async (req, res) => {
  try {
    const { month, year } = req.query;

    // Category stats — all time
    const categoryStats = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly stats — last 12 months
    const monthlyStats = await Expense.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        categoryStats,
        monthlyStats,
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/expenses — list with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, sort = '-date' } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort(sort).lean();

    res.json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/expenses/:id — single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).lean();

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, data: expense });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid expense ID' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/expenses — create
router.post('/', async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Create expense error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/expenses/:id — update
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, data: expense });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid expense ID' });
    }
    console.error('Update expense error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/expenses/:id — delete
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, message: 'Expense deleted successfully', data: expense });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid expense ID' });
    }
    console.error('Delete expense error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
