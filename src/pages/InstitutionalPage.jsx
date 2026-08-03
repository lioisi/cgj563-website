import Breadcrumb from '../components/common/Breadcrumb';
import CallToAction from '../components/common/CallToAction';
import SEOHead from '../components/common/SEOHead';
import SectionHeader from '../components/common/SectionHeader';
import SiteShell from '../components/common/SiteShell';

export default function InstitutionalPage({ page }) {
  return (
    <SiteShell>
      <SEOHead
        title={`CGJ563 S.A. | ${page.title}`}
        description={page.description}
        canonicalPath={page.path}
      />

      <div className="page-container page-section">
        <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: page.title }]} />
        <SectionHeader eyebrow={page.eyebrow} title={page.title} description={page.description} />

        <div className="content-grid">
          {page.blocks.map((item) => (
            <article className="content-card" key={item}>
              <h2>{item}</h2>
              <p>
                Contenido base en construccion para esta seccion. Se completara con alcance, actividades,
                entregables, beneficios y preguntas frecuentes en las siguientes fases.
              </p>
            </article>
          ))}
        </div>
      </div>

      <CallToAction
        title="Conversemos sobre el proceso que necesita mejorar."
        text="Una primera conversacion puede ayudar a identificar problemas, riesgos y oportunidades antes de iniciar un proyecto."
        primaryTo="/contacto"
        primaryLabel="Coordinar una reunion"
      />
    </SiteShell>
  );
}
