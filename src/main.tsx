import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
// Side-effect import: settingsStore writes data-ed-theme / data-ed-density
// onto <html> at module load, before the first React render — no theme flash.
import './store/settingsStore';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
