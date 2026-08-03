import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/servicios', label: 'Servicios' },
  { to: '/soluciones', label: 'Soluciones' },
  { to: '/metodo-cgj563', label: 'Metodo CGJ563' },
  { to: '/sectores', label: 'Sectores' },
  { to: '/casos-experiencia', label: 'Casos y experiencia' },
  { to: '/empresa', label: 'Empresa' },
  { to: '/conocimiento', label: 'Conocimiento' },
  { to: '/contacto', label: 'Contacto' }
];

export default function SiteShell({ children }) {
  return (
    <div className="institutional-shell">
      <header className="institutional-header">
        <div className="page-container institutional-header-inner">
          <Link className="brand-link" to="/">
            <span className="brand-name">CGJ563 S.A.</span>
            <span className="brand-tagline">Procesos, datos y tecnologia trabajando como un unico sistema.</span>
          </Link>
          <nav aria-label="Navegacion principal" className="institutional-nav">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/contacto" className="header-cta">Solicitar diagnostico</Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="institutional-footer">
        <div className="page-container institutional-footer-grid">
          <div>
            <h2>CGJ563 S.A.</h2>
            <p>
              Consultora de transformacion operativa e integracion tecnologica para organizaciones
              que necesitan mejorar procesos, integrar sistemas y trabajar con datos confiables.
            </p>
          </div>
          <div>
            <h3>Secciones</h3>
            <ul>
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Contacto</h3>
            <ul>
              <li><a href="mailto:info@cgj563.com">info@cgj563.com</a></li>
              <li><a href="tel:+541136154077">+54 11 3615 4077</a></li>
              <li><a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn [COMPLETAR URL OFICIAL]</a></li>
            </ul>
          </div>
        </div>
        <div className="page-container institutional-footer-bottom">
          <p>{`Copyright ${new Date().getFullYear()} CGJ563 S.A.`}</p>
        </div>
      </footer>
    </div>
  );
}
