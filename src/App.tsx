import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import trTR from 'antd/locale/tr_TR';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { MainLayout } from './components/Layout/MainLayout';
import { Login } from './pages/Login/Login';
import UserDashboard from './pages/Dashboard/UserDashboard';
import { Assets } from './pages/Assets/Assets';
import { Assignments } from './pages/Assignments/Assignments';
import DepartmentAdminDashboard from './pages/Dashboard/DepartmentAdminDashboard';
import './App.css';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route component (sadece giriş yapmamışlar erişebilir)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Role-based Dashboard Component
const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuthStore();
  
  // Rol kontrolü: Admin/ZimmetManager ise departman paneli, diğerleri user dashboard
  if (user?.role === 'Admin' || user?.role === 'ZimmetManager') {
    return <DepartmentAdminDashboard />;
  }
  
  return <UserDashboard />;
};

function App() {
  const { initAuth } = useAuthStore();

  // Sayfa yüklendiğinde auth durumunu kontrol et
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <ConfigProvider locale={trTR}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <RoleBasedDashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/assets" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Assets />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/assignments" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Assignments />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* Sadece Admin ve ZimmetManager erişebilir */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminOnlyRoute>
                    <DepartmentAdminDashboard />
                  </AdminOnlyRoute>
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

// Admin/ZimmetManager Only Route component
const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  
  if (user?.role === 'Admin' || user?.role === 'ZimmetManager') {
    return <>{children}</>;
  }
  
  return <Navigate to="/dashboard" replace />;
};

export default App;