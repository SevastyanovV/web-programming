import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CardsPage from '@/components/CardsPage/CardsPage';
import DetailingPage from '@/components/DetailingPage/DetailingPage';
import { ToastProvider } from './toastProvider';

export function App() {
  return (
    <Routes>
      <Route path={'/'} element={<CardsPage />} />
      <Route path={'/detailing/:id'} element={<DetailingPage />} />
    </Routes>
  );
}

function AppContainer() {
  return (
    <BrowserRouter basename="/">
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default AppContainer;
