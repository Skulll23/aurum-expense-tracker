// ============================================================
// server/models/Expense.js — THE DATABASE BLUEPRINT
//
// This file defines the SCHEMA — the shape/structure that every
// expense document must follow when stored in MongoDB.
//
// Think of it like a form template:
//   - Every expense MUST have a title, amount, category, date
//   - description is optional
//   - MongoDB will REJECT any data that doesn't follow these rules
// ============================================================

import mongoose from 'mongoose';

// A Schema defines the structure of documents in a MongoDB collection
// It's like defining columns in a SQL table, but more flexible
const expenseSchema = new mongoose.Schema(
  {
    // TITLE — the name of the expense (e.g. "Coffee at Starbucks")
    title: {
      type: String,          // must be text
      required: [true, 'Title is required'],  // cannot be empty
      trim: true,            // automatically removes leading/trailing spaces
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    // AMOUNT — how much the expense cost (e.g. 6.50)
    amount: {
      type: Number,          // must be a number
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be at least $0.01'],  // no zero or negative amounts
    },

    // CATEGORY — which bucket this expense belongs to
    // enum means the value MUST be one of these 9 options — nothing else is accepted
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Food & Dining',
          'Transportation',
          'Shopping',
          'Entertainment',
          'Health & Fitness',
          'Housing & Utilities',
          'Education',
          'Travel',
          'Other',
        ],
        message: '{VALUE} is not a valid category',  // error if someone sends something else
      },
    },

    // DATE — when the expense occurred
    // Defaults to right now if no date is provided
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,  // auto-fills with current timestamp if not provided
    },

    // DESCRIPTION — optional note about the expense
    // Not required — can be left blank
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    // timestamps: true tells Mongoose to automatically add two fields:
    //   createdAt — timestamp when the document was first saved
    //   updatedAt — timestamp when the document was last modified
    timestamps: true,
  }
);

// Create the Model from the Schema
// mongoose.model('Expense', expenseSchema) does two things:
//   1. Creates a class called Expense we can use to query the DB
//   2. Links it to the 'expenses' collection in MongoDB (lowercase + plural)
const Expense = mongoose.model('Expense', expenseSchema);

// Export so routes/expenses.js can import and use it
export default Expense;
