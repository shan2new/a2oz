import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import './store/settingsStore'; // side-effect: applies data-ed-* before render
import { useUserStore } from './store/userStore';
import { router } from './routes/router';

// Rehydrate user state from IndexedDB before first render. Non-blocking;
// the UI shows a loading state until profile lands.
useUserStore.getState().bootstrap();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
