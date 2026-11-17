import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MealRecords from './pages/MealRecords.jsx';
import Prediction from './pages/Prediction.jsx';
import WasteAnalytics from './pages/WasteAnalytics.jsx';

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <AppShell mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onOpen={() => setMobileOpen(true)}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/records" element={<MealRecords />} />
        <Route path="/predictions" element={<Prediction />} />
        <Route path="/analytics" element={<WasteAnalytics />} />
      </Routes>
    </AppShell>
  );
}

