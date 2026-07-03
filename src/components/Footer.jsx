import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h4>CGJ563 S.A.</h4>
          <p>Transformación Operativa e Integración de Procesos</p>
        </div>
        <div className="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#servicios">Servicios</a></li>
            <li><a href="#nosotros">Nosotros</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacidad</a></li>
            <li><a href="#">Términos</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024-2026 CGJ563 S.A. Todos los derechos reservados. • Última actualización: Julio 2026</p>
      </div>
    </footer>
  );
}
