// ============================================================
// client/src/constants.js — SHARED CONSTANTS
//
// This is the single source of truth for category names and colours.
// By defining them here once, every component that needs them
// imports from this file — change it here and it updates everywhere.
//
// CATEGORIES is used by:
//   - ExpenseModal.jsx  → dropdown options in the form
//   - ExpenseList.jsx   → filter dropdown options
//
// CATEGORY_COLORS is used by:
//   - ExpenseCard.jsx   → coloured dot next to each expense
//   - CategoryChart.jsx → slice colours in the donut chart
//   - CategoryChart.jsx → legend dots below the chart
// ============================================================

// The 9 allowed expense categories (must match the enum in server/models/Expense.js)
export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Health & Fitness',
  'Housing & Utilities',
  'Education',
  'Travel',
  'Other',
];

// Each category maps to a unique hex colour for visual identification
// These colours are used in both the chart slices and the category dots on cards
export const CATEGORY_COLORS = {
  'Food & Dining':       '#FF8F7A',  // warm coral
  'Transportation':      '#74B9FF',  // sky blue
  'Shopping':            '#B19BFE',  // soft purple
  'Entertainment':       '#FF85B3',  // pink
  'Health & Fitness':    '#55EFC4',  // mint green
  'Housing & Utilities': '#FDCB6E',  // golden yellow
  'Education':           '#7C6EE6',  // indigo
  'Travel':              '#00D2D3',  // teal
  'Other':               '#7A7880',  // neutral grey
};

// Fallback colour used if a category somehow isn't in the map above
export const DEFAULT_COLOR = '#5A5A7A';
