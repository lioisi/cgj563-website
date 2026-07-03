import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import ValueProposition from './components/ValueProposition';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
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
      <div className="app">
        <Header onLogout={handleLogout} />
        <Dashboard />
        <Footer />
      </div>
    );
  }

  // Página principal
  return (
    <div className="app">
      <Header />
      <Hero />
      <ValueProposition />
      <Services />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
