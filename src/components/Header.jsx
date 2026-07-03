import React, { useState } from 'react';
import LogoSVG from './LogoSVG';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
