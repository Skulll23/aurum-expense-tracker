// ============================================================
// client/src/main.jsx — THE REACT ENTRY POINT
//
// This is the first JavaScript file the browser loads.
// Its only job is to "mount" the React app into the HTML page.
//
// In index.html there is:  <div id="root"></div>
// This file finds that div and tells React to take control of it.
// From this point on, React manages everything inside that div.
//
// React.StrictMode is a development helper — it runs components
// twice to catch potential bugs. It has no effect in production.
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';       // the root component of our app
import './index.css';              // global styles — loads once for the whole app

// ReactDOM.createRoot finds the <div id="root"> in index.html
// .render() puts the App component inside it
// Everything visible on screen comes from the App component tree
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
