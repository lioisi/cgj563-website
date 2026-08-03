import { Link } from 'react-router-dom';

export default function CallToAction({ title, text, primaryTo = '/contacto', primaryLabel = 'Solicitar diagnostico' }) {
  return (
    <section className="cta-strip" aria-label="Llamado a la accion">
      <div className="page-container cta-strip-inner">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <Link className="cta-strip-button" to={primaryTo}>{primaryLabel}</Link>
      </div>
    </section>
  );
}
