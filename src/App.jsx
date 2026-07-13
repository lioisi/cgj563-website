import React, { useState, useEffect } from 'react';
import './App.css';
import ConsultingSite from './components/ConsultingSite';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
  const [page, setPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si ya está autenticado
    const token = localStorage.getItem('dashboardToken');
    if (token) {
      setIsAuthenticated(true);
    }

    // Detectar ruta por hash
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      setPage(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboardToken');
    setIsAuthenticated(false);
    window.location.hash = '#home';
  };

  // Página del dashboard
  if (page === 'dashboard') {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }

    return (
      <div className="dashboard-shell">
        <div className="dashboard-shell-header">
          <a href="#home" className="dashboard-shell-link">Volver al sitio</a>
          <button className="dashboard-shell-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
        <Dashboard />
      </div>
    );
  }

  return <ConsultingSite />;
}

export default App;
