// ============================================================
// server/routes/expenses.js — ALL THE API ENDPOINTS (CRUD)
//
// This file defines what happens when the frontend makes
// requests to /api/expenses. Each route handles one action:
//
//   GET  /api/expenses/stats/summary  → chart data (aggregation)
//   GET  /api/expenses                → get all expenses (with filters)
//   GET  /api/expenses/:id            → get one expense by ID
//   POST /api/expenses                → create a new expense
//   PUT  /api/expenses/:id            → update an existing expense
//   DEL  /api/expenses/:id            → delete an expense
//
// IMPORTANT: The stats route MUST come before /:id
// because Express matches routes top-to-bottom.
// If /:id came first, "stats" would be treated as an ID and fail.
// ============================================================

import express from 'express';
import Expense from '../models/Expense.js';

// Router is like a mini Express app just for these routes
// It gets mounted at /api/expenses in index.js
const router = express.Router();

// ============================================================
// GET /api/expenses/stats/summary
// Returns aggregated data for the two charts:
//   - categoryStats: total spent per category (for donut chart)
//   - monthlyStats:  total spent per month (for area chart)
//
// Uses MongoDB's AGGREGATION PIPELINE — a series of stages
// that transform data, like a conveyor belt of operations.
// ============================================================
router.get('/stats/summary', async (req, res) => {
  try {
    const { month, year } = req.query;

    // CATEGORY STATS — aggregate ALL expenses grouped by category
    // $group works like SQL's GROUP BY — it collapses many documents into one per group
    // $sum adds up the amounts, and counting 1 per document gives us the count
    const categoryStats = await Expense.aggregate([
      {
        $group: {
          _id: '$category',          // group by the category field
          total: { $sum: '$amount' }, // add up all amounts in this category
          count: { $sum: 1 },         // count how many expenses in this category
        },
      },
      { $sort: { total: -1 } },  // sort highest total first (-1 = descending)
    ]);

    // MONTHLY STATS — aggregate expenses grouped by year + month
    // $year and $month are MongoDB date operators that extract parts from a date
    const monthlyStats = await Expense.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },   // extract the year from the date field
            month: { $month: '$date' }, // extract the month (1=Jan, 12=Dec)
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      // Sort chronologically — oldest month first so the chart reads left-to-right
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }, // only show the last 12 months maximum
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

// ============================================================
// GET /api/expenses
// Returns a list of all expenses, with optional filters:
//   ?category=Food%20%26%20Dining  → filter by category
//   ?sort=-amount                  → sort by highest amount first
//   ?startDate=2026-01-01          → expenses after this date
//   ?endDate=2026-12-31            → expenses before this date
// ============================================================
router.get('/', async (req, res) => {
  try {
    // Destructure query parameters from the URL
    // e.g. /api/expenses?category=Travel&sort=-date
    const { category, startDate, endDate, sort = '-date' } = req.query;

    // Build the MongoDB query object dynamically
    // Start empty and add conditions only if they were provided
    const query = {};

    // If a category filter was sent, add it to the query
    if (category) {
      query.category = category;
    }

    // If date range was provided, use MongoDB comparison operators:
    //   $gte = greater than or equal to (start date)
    //   $lte = less than or equal to (end date)
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // .find(query) searches MongoDB for matching documents
    // .sort(sort) orders results ("-date" = newest first, "date" = oldest first)
    // .lean() returns plain JS objects instead of Mongoose Documents — faster
    const expenses = await Expense.find(query).sort(sort).lean();

    res.json({
      success: true,
      data: expenses,
      count: expenses.length,  // handy for the frontend to show "X entries"
    });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// GET /api/expenses/:id
// Returns ONE expense by its MongoDB ID
// :id is a URL parameter — e.g. /api/expenses/abc123 → req.params.id = "abc123"
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    // findById looks up a document by its _id field
    const expense = await Expense.findById(req.params.id).lean();

    // If no document was found, return a 404 error
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, data: expense });
  } catch (err) {
    // CastError happens when the ID format is invalid (not a valid MongoDB ObjectId)
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid expense ID' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// POST /api/expenses
// CREATE a new expense
// The expense data comes in req.body (the JSON sent from the frontend)
// ============================================================
router.post('/', async (req, res) => {
  try {
    // Expense.create() saves a new document to MongoDB
    // Mongoose automatically validates the data against our schema before saving
    const expense = await Expense.create(req.body);

    // 201 = "Created" — the standard HTTP status for a successful creation
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    // ValidationError means the data didn't pass schema rules
    // (e.g. missing title, invalid category, negative amount)
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Create expense error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// PUT /api/expenses/:id
// UPDATE an existing expense
// The ID comes from the URL, new data comes from req.body
// ============================================================
router.put('/:id', async (req, res) => {
  try {
    // findByIdAndUpdate finds the document, applies the changes, and returns the result
    // { new: true }         → return the UPDATED document (not the old one)
    // { runValidators: true } → re-run schema validation on the new data
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

// ============================================================
// DELETE /api/expenses/:id
// DELETE an expense permanently from MongoDB
// ============================================================
router.delete('/:id', async (req, res) => {
  try {
    // findByIdAndDelete removes the document and returns it (so we can confirm what was deleted)
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

// Export the router so index.js can mount it
export default router;
