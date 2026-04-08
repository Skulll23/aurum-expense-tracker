const BASE_URL = '/api/expenses';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

/**
 * Get all expenses with optional filters.
 * @param {Object} filters - { category, search, sort, startDate, endDate }
 */
export async function getExpenses(filters = {}) {
  const params = new URLSearchParams();

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

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}${query}`);
  return handleResponse(res);
}

/**
 * Get aggregated stats (category breakdown + monthly trend).
 * @param {number} month
 * @param {number} year
 */
export async function getStats(month, year) {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (year) params.set('year', year);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/stats/summary${query}`);
  return handleResponse(res);
}

/**
 * Create a new expense.
 * @param {Object} data - { title, amount, category, date, description }
 */
export async function createExpense(data) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update an existing expense.
 * @param {string} id
 * @param {Object} data
 */
export async function updateExpense(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Delete an expense by ID.
 * @param {string} id
 */
export async function deleteExpense(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}
