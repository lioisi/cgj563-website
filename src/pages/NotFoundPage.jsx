import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import SiteShell from '../components/common/SiteShell';

export default function NotFoundPage() {
  return (
    <SiteShell>
      <SEOHead
        title="CGJ563 S.A. | Pagina no encontrada"
        description="La pagina solicitada no existe o fue movida."
        canonicalPath="/404"
      />
      <section className="page-container page-section notfound">
        <h1>Pagina no encontrada</h1>
        <p>La URL solicitada no existe o fue movida.</p>
        <Link to="/" className="cta-strip-button">Volver al inicio</Link>
      </section>
    </SiteShell>
  );
}
