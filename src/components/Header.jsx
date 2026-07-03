import React, { useState, useEffect } from 'react';
import LogoSVG from './LogoSVG';

export default function Header({ onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [page, setPage] = useState('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      setPage(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
  };

  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">
          <LogoSVG />
          <div className="logo-text">
            <h1>CGJ563</h1>
            <p className="tagline">Transformación Operativa e Integración</p>
          </div>
        </div>
        
        <nav className={`nav ${mobileMenuOpen ? 'mobile-active' : ''}`}>
          <a href="#inicio" className="nav-link">Inicio</a>
          <a href="#servicios" className="nav-link">Servicios</a>
          <a href="#nosotros" className="nav-link">Nosotros</a>
          <a href="#contacto" className="nav-link">Contacto</a>
          <a href="#dashboard" className="nav-link dashboard-btn">📊 Dashboard</a>
          {page === 'dashboard' && onLogout && (
            <button className="nav-link logout-btn" onClick={handleLogoutClick}>
              🚪 Salir
            </button>
          )}
        </nav>

        <button 
          className="menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
