import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Ensure the root element exists
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Render the app
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hot Module Replacement (HMR) support
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    // If we're in development mode, update the app
    const NextApp = require('./App').default;
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <NextApp />
      </React.StrictMode>
    );
  });
}