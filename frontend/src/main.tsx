import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// Auto-recover from Vite dynamic import chunk mismatch when a new deployment occurs
window.addEventListener('vite:preloadError', (event: any) => {
  event?.preventDefault?.();
  const lastReload = sessionStorage.getItem('vite_preload_reload');
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem('vite_preload_reload', now.toString());
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
