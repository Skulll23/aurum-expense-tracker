<div align="center">
  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80" alt="AURUM banner" width="100%" style="border-radius:12px;" />
</div>

<br />

# AURUM — Expense Tracker

Most people have no clear picture of where their money goes each month. AURUM solves this by giving you a single place to log, categorise, and visualise every expense — so patterns become obvious at a glance. It is a production-quality full-stack Single Page Application with a luxury black-and-white aesthetic, built for university assignment submission.

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite 5, Recharts 2                  |
| Backend    | Node.js, Express 4, Mongoose 8                |
| Database   | MongoDB (local instance via Homebrew)         |
| Fonts      | DM Sans 300–700 (Google Fonts)                |
| Styling    | Pure CSS with CSS variables design system     |
| Routing    | State-based SPA (no React Router — single HTML page) |

---

## Features

- **Dashboard** — real-time stat cards (This Month, All Time, Entry Count, Largest), animated area trend chart, donut category breakdown, recent expenses list (last 5)
- **Create** — accessible modal form with full client-side validation (title, amount, category, date, optional description); keyboard-navigable with Escape-to-close and auto-focus
- **Read** — expense list with live text search, category filter, and sort controls (date, amount, title)
- **Update** — edit modal pre-filled with existing expense data; same validation as create
- **Delete** — two-step confirmation per expense card (click once to arm, again to confirm) prevents accidental deletion
- **Stats API** — MongoDB aggregation pipeline for per-category totals and 12-month trend data; fetched in parallel with expenses
- **Toast notifications** — non-blocking success/error/info messages auto-dismiss after 3.5 s
- **Error state** — full-page error UI with retry button when the server or database is unreachable
- **Skeleton loaders** — shimmer placeholders during data fetch for each section
- **Accessibility** — ARIA roles (`role="dialog"`, `aria-modal`, `aria-labelledby`), all form inputs labelled with `htmlFor`/`id`, `aria-describedby`/`aria-invalid` on error fields, `role="alert"` on inline errors, descriptive `aria-label` on icon buttons
- **Responsive** — mobile-first CSS grid/flexbox layout; touch devices always show edit/delete actions (no hover required)
- **Animations** — `fadeInUp` staggered entrance animations, smooth modal zoom-in with backdrop blur

---

## Folder Structure

```
expense-tracker/
├── server/
│   ├── models/
│   │   └── Expense.js          # Mongoose schema (title, amount, category, date, description)
│   ├── routes/
│   │   └── expenses.js         # Full CRUD + /stats/summary aggregation endpoint
│   ├── index.js                # Express app entry, MongoDB connection
│   ├── .env                    # PORT=5001, MONGODB_URI
│   └── package.json            # ESM Node project
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top nav with view switching + Add button
│   │   │   ├── Dashboard.jsx       # Overview page with charts and stats
│   │   │   ├── StatsCard.jsx       # Individual stat tile
│   │   │   ├── TrendChart.jsx      # Recharts AreaChart (monthly trend)
│   │   │   ├── CategoryChart.jsx   # Recharts PieChart donut + legend
│   │   │   ├── ExpenseList.jsx     # Searchable, filterable expense list
│   │   │   ├── ExpenseCard.jsx     # Individual expense row with edit/delete
│   │   │   ├── ExpenseModal.jsx    # Create/edit form modal (fully accessible)
│   │   │   └── Toast.jsx           # Toast notification container
│   │   ├── services/
│   │   │   └── api.js              # Fetch-based API client (CRUD + stats)
│   │   ├── constants.js            # CATEGORIES array, CATEGORY_COLORS map
│   │   ├── App.jsx                 # Root state, CRUD handlers, view routing
│   │   ├── main.jsx                # React 18 root render
│   │   └── index.css               # Full luxury dark theme (~1400 lines)
│   ├── index.html                  # Single HTML file (DM Sans font link)
│   ├── vite.config.js              # Dev proxy /api → localhost:5001
│   └── package.json
├── expenses.json                   # Sample MongoDB export (8 records)
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod` or `brew services start mongodb/brew/mongodb-community`)

### 1. Install server dependencies
```bash
cd expense-tracker/server
npm install
```

### 2. Install client dependencies
```bash
cd expense-tracker/client
npm install
```

### 3. Configure environment
The server `.env` is pre-configured for a local MongoDB instance:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/expense-tracker
```
Update `MONGODB_URI` if your MongoDB runs on a different host or port.

### 4. Start MongoDB
```bash
brew services start mongodb/brew/mongodb-community
# or
mongod
```

### 5. Start the backend server
```bash
cd expense-tracker/server
npm run dev       # development with nodemon
# or
npm start         # production
```
Server will be available at `http://localhost:5001`.

### 6. Start the frontend dev server
```bash
cd expense-tracker/client
npm run dev
```
App will be available at `http://localhost:5173`. Vite proxies all `/api` calls to the Express server automatically.

---

## Challenges Overcome

**MongoDB Aggregation Pipeline** — The stats endpoint uses two separate `$group` stages to compute per-category totals and per-month totals in a single round-trip each; the monthly stats pipeline sorts by `_id.year` then `_id.month` to produce a correctly ordered 12-month window regardless of missing months.

**Recharts `CenterLabel` Bug** — Placing a custom `<Label>` component directly on the `<Pie>` element caused React to render one label per data slice (with an incorrect `viewBox`), crashing the tree. Fixed by rendering `<Label content={<CenterLabel />} position="center" />` as a *child* of `<Pie>` and importing `Label` from recharts.

**Recharts Responsive Sizing** — `ResponsiveContainer` requires a defined parent height; wrapping each chart in a `.chart-card` div with explicit CSS height ensures the SVG renders correctly in both the 2-column desktop grid and the stacked mobile layout.

**macOS Port 5000 Conflict** — macOS Control Center permanently occupies port 5000 on Apple Silicon. Resolved by setting `PORT=5001` in `.env` and updating the Vite proxy target to match.

**Modal Entrance Animation** — Combining `scale(0.95)` with `opacity: 0` on a `@keyframes modalIn` produces the premium "zoom-in" feel without layout thrash; the overlay uses `backdrop-filter: blur(8px)` for the frosted glass effect behind the modal.

---

## Database Export

To export the expenses collection for submission, use:
```bash
mongoexport --db expense-tracker --collection expenses --out expenses.json
```
Or for CSV format:
```bash
mongoexport --db expense-tracker --collection expenses --type csv \
  --fields title,amount,category,date,description --out expenses.csv
```
