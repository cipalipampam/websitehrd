import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Departemen } from './pages/Departemen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Jabatan } from './pages/Jabatan';
import { Karyawan } from './pages/Karyawan';

function App() {
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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;