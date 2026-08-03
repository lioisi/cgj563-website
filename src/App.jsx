import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import ConsultingSite from './components/ConsultingSite';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { institutionalPages } from './content/institutionalPages';
import InstitutionalPage from './pages/InstitutionalPage';
import NotFoundPage from './pages/NotFoundPage';

function DashboardRoute() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('dashboardToken')));

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem('dashboardToken');
    setIsAuthenticated(false);
    navigate('/');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-shell-header">
        <a href="/" className="dashboard-shell-link">Volver al sitio</a>
        <button className="dashboard-shell-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
      <Dashboard />
    </div>
  );
}

function HashDashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const syncHashRoute = () => {
      if (window.location.hash === '#dashboard') {
        navigate('/dashboard', { replace: true });
      }
    };

    syncHashRoute();
    window.addEventListener('hashchange', syncHashRoute);
    return () => window.removeEventListener('hashchange', syncHashRoute);
  }, [navigate]);

  return null;
}

function AppRouter() {
  const pages = useMemo(() => Object.values(institutionalPages), []);

  return (
    <>
      <HashDashboardRedirect />
      <Routes>
        <Route path="/" element={<ConsultingSite />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        {pages.map((page) => (
          <Route key={page.path} path={page.path} element={<InstitutionalPage page={page} />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
