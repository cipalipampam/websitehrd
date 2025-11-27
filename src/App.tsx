import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Departemen } from './pages/Departemen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Jabatan } from './pages/Jabatan';
import { Karyawan } from './pages/Karyawan';
import { Kpi } from './pages/Kpi';
import { KpiIndicators } from './pages/KpiIndicators';
import { Penghargaan } from './pages/penghargaan';
import { Predict } from './pages/Predict';
import { Pelatihan } from './pages/Pelatihan';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import ManajemenKehadiran from './pages/ManajemenKehadiran';

function App() {
  // Apply saved theme on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('site-theme') || 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(savedTheme);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departemen"
          element={
            <ProtectedRoute>
              <Departemen />
            </ProtectedRoute>
          }
        />
          <Route
          path="/jabatan"
          element={
            <ProtectedRoute>
              <Jabatan />
            </ProtectedRoute>
          }
        />
         <Route
          path="/karyawan"
          element={
            <ProtectedRoute>
              <Karyawan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kpi"
          element={
            <ProtectedRoute>
              <Kpi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kpi-indicators"
          element={
            <ProtectedRoute>
              <KpiIndicators />
            </ProtectedRoute>
          }
        />
         <Route
          path="/penghargaan"
          element={
            <ProtectedRoute>
              <Penghargaan />
            </ProtectedRoute>
          }
        />
         <Route
          path="/predict"
          element={
            <ProtectedRoute>
              <Predict />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pelatihan"
          element={
            <ProtectedRoute>
              <Pelatihan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/izin-approval"
          element={
            <ProtectedRoute>
              <ManajemenKehadiran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;