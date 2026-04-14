// ============================================================
// server/index.js — THE ENTRY POINT OF THE BACKEND SERVER
//
// This is the first file Node.js runs when you do `npm run dev`.
// Its job is to:
//   1. Load environment variables (PORT, MongoDB URI) from .env
//   2. Create the Express app and attach middleware
//   3. Mount the expense routes at /api/expenses
//   4. Connect to MongoDB
//   5. Start listening for requests on port 5001
// ============================================================

// Express is the framework that makes it easy to build a web server in Node.js
import express from 'express';

// CORS = Cross-Origin Resource Sharing.
// Browsers block requests from one port to another by default (security).
// This middleware tells the browser: "it's okay to talk to this server from port 5173"
import cors from 'cors';

// dotenv reads the .env file and loads its values into process.env
// So process.env.PORT becomes 5001, process.env.MONGODB_URI becomes the DB address
import dotenv from 'dotenv';

// Mongoose is the library that lets Node.js talk to MongoDB
// It adds structure (schemas) on top of MongoDB's flexible documents
import mongoose from 'mongoose';

// Import all the expense-related routes (CRUD operations) from the routes file
import expenseRoutes from './routes/expenses.js';

// Load the .env file — must happen before accessing process.env
dotenv.config();

// Create the Express application instance
// Think of this as the "server object" that handles all incoming requests
const app = express();

// Read PORT from .env (5001) — fallback to 5000 if not set
const PORT = process.env.PORT || 5000;

// Read MongoDB connection string from .env
// Format: mongodb://host:port/databaseName
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

// ============================================================
// MIDDLEWARE
// Middleware = functions that run on EVERY request before it
// reaches the route handler. Like a security check at the door.
// ============================================================

// Allow requests from the React dev server (port 5173) and port 3000
// Without this, the browser would block all API calls with a CORS error
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Parse incoming JSON request bodies automatically
// Without this, req.body would be undefined when we POST/PUT data
app.use(express.json());

// ============================================================
// ROUTES
// Tell Express: "any request starting with /api/expenses
// should be handled by the expenseRoutes file"
// ============================================================
app.use('/api/expenses', expenseRoutes);

// Health check endpoint — quick way to verify the server is alive
// Visit http://localhost:5001/api/health in the browser to test
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Aurum Expense Tracker API is running' });
});

// 404 handler — runs when no route matched the request
// Express looks through routes top-to-bottom; if nothing matched, this catches it
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler — catches any errors thrown inside route handlers
// The 4-parameter signature (err, req, res, next) tells Express this is an error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ============================================================
// CONNECT TO MONGODB, THEN START THE SERVER
// We connect to the database FIRST, and only start listening
// for requests once the DB connection is confirmed.
// If MongoDB is down, the server refuses to start.
// ============================================================
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    // MongoDB connected successfully — now start the HTTP server
    console.log('Connected to MongoDB:', MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Aurum API server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // If MongoDB connection fails, log the error and exit the process
    // process.exit(1) means "quit with error code 1"
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
