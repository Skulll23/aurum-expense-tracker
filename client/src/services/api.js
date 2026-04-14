// ============================================================
// client/src/services/api.js — THE API CLIENT
//
// This file is the bridge between React and the Express backend.
// Instead of writing fetch() calls scattered across every component,
// all API communication is centralised here.
//
// Each function:
//   1. Builds the correct URL with any query parameters
//   2. Calls fetch() with the right HTTP method and headers
//   3. Checks if the response was successful
//   4. Returns the parsed JSON data (or throws an error)
//
// HOW FETCH WORKS:
//   fetch() is the browser's built-in function for making HTTP requests.
//   It returns a Promise — meaning it doesn't block execution;
//   we use async/await to wait for the response.
// ============================================================

// Base URL for all expense API calls
// Because of Vite's proxy, /api gets forwarded to http://localhost:5001/api
const BASE_URL = '/api/expenses';

// ============================================================
// handleResponse — shared helper to check every API response
// If the server returned an error (status 400, 404, 500 etc.),
// this throws an Error so the calling code's catch block runs
// ============================================================
async function handleResponse(res) {
  const data = await res.json(); // parse the JSON body from the response
  if (!res.ok) {
    // res.ok is false when status code is 400-599 (client/server errors)
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data; // return the full { success, data, count } object
}

// ============================================================
// getExpenses — READ all expenses with optional filters
// Called every time filters change (search, category, sort)
//
// URLSearchParams converts a JS object into a query string:
//   { category: 'Travel', sort: '-date' }
//   becomes: ?category=Travel&sort=-date
// ============================================================
export async function getExpenses(filters = {}) {
  const params = new URLSearchParams();

  // Only add a parameter if it has a real value
  if (filters.category && filters.category !== 'All') {
    params.set('category', filters.category);
  }
  if (filters.sort) {
    params.set('sort', filters.sort);
  }
  if (filters.startDate) {
    params.set('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.set('endDate', filters.endDate);
  }

  // Build the final URL: /api/expenses?category=Travel&sort=-date
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}${query}`);
  return handleResponse(res);
}

// ============================================================
// getStats — READ aggregated chart data
// Returns { categoryStats: [...], monthlyStats: [...] }
// Used by Dashboard to populate both charts
// ============================================================
export async function getStats(month, year) {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (year) params.set('year', year);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/stats/summary${query}`);
  return handleResponse(res);
}

// ============================================================
// createExpense — CREATE a new expense
// Sends a POST request with the form data as JSON in the body
// The server saves it to MongoDB and returns the saved document
// ============================================================
export async function createExpense(data) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // tell server we're sending JSON
    body: JSON.stringify(data), // convert JS object → JSON string
  });
  return handleResponse(res);
}

// ============================================================
// updateExpense — UPDATE an existing expense
// Sends a PUT request to /api/expenses/:id with new data
// The :id in the URL tells the server WHICH expense to update
// ============================================================
export async function updateExpense(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ============================================================
// deleteExpense — DELETE an expense by ID
// Sends a DELETE request to /api/expenses/:id
// No body needed — the ID in the URL is enough
// ============================================================
export async function deleteExpense(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}
