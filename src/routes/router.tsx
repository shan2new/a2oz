import { createBrowserRouter } from 'react-router-dom';
import { Shell } from '@/components/shell/Shell'; // Wave 1A — file may not exist yet
import { RequireHandle } from './guards';
import Home from '@/pages/Home';
import Ladders from '@/pages/Ladders';
import LadderDetail from '@/pages/LadderDetail';
import LadderComplete from '@/pages/LadderComplete';
import Categories from '@/pages/Categories';
import Progress from '@/pages/Progress';
import Onboarding from '@/pages/onboarding/Onboarding';

export const router = createBrowserRouter([
  { path: '/onboarding', element: <Onboarding /> },
  {
    element: <RequireHandle><Shell /></RequireHandle>,
    children: [
      { path: '/', element: <Home /> },
      { path: '/ladders', element: <Ladders /> },
      { path: '/ladders/:id', element: <LadderDetail /> },
      { path: '/ladders/:id/complete', element: <LadderComplete /> },
      { path: '/categories', element: <Categories /> },
      { path: '/progress', element: <Progress /> },
    ],
  },
]);
