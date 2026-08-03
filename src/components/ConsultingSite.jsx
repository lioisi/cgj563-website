import React, { useEffect, useMemo, useState } from 'react';
import './ConsultingSite.css';
import LogoSVG from './LogoSVG';
import heroImage from '../assets/hero.png';

const WHATSAPP_PHONE = '541136154077';
const navItems = {
  es: [
    { href: '#home', label: 'Inicio' },
    { href: '#que-hacemos', label: 'Capacidades' },
    { href: '#servicios', label: 'Servicios' },
    { href: '#sectores', label: 'Sectores' },
    { href: '#contacto', label: 'Contacto' }
  ],
  en: [
    { href: '#home', label: 'Home' },
    { href: '#que-hacemos', label: 'Capabilities' },
    { href: '#servicios', label: 'Services' },
    { href: '#sectores', label: 'Sectors' },
    { href: '#contacto', label: 'Contact' }
  ]
};

const content = {
  es: {
    whatsappMessage: 'Hola, quisiera recibir información sobre sus servicios de consultoría.',
    brandTag: 'Consultoría boutique en tecnología e integración empresarial',
    openMenu: 'Abrir menú',
    dashboard: 'Dashboard',
    heroEyebrow: 'Consultoría tecnológica senior para procesos críticos',
    heroTitle: 'Integración empresarial, automatización y tecnología para organizaciones que no pueden detenerse.',
    heroSubtitle:
      'Ayudamos a empresas de utilities, energía, banca, telecomunicaciones e industria a modernizar procesos críticos mediante Oracle, SAP HANA, GIS, datos, APIs e inteligencia artificial aplicada.',
    ctaPrimary: 'Solicitar diagnóstico',
    ctaSecondary: 'Ver servicios',
    heroSideTitle:
      'Consultoría boutique especializada en integración empresarial, modernización tecnológica, automatización de procesos, Oracle, SAP HANA, GIS, datos e inteligencia artificial aplicada al negocio.',
    heroSideText:
      'Enfoque ejecutivo para iniciativas de transformación digital con trazabilidad, arquitectura sólida y resultados medibles en entornos de alta criticidad.',
    aboutEyebrow: 'Capacidades',
    aboutTitle: 'Diseño, integración y optimización para operaciones que exigen continuidad',
    aboutText:
      'Diseñamos, integramos y optimizamos soluciones tecnológicas para procesos críticos de negocio. Combinamos experiencia en bases de datos, GIS corporativo, integración de sistemas, automatización y análisis de información para reducir fricción operativa, mejorar trazabilidad y facilitar la toma de decisiones.',
    problemsEyebrow: 'Problemas que resolvemos',
    problemsTitle: 'Intervenimos donde la operación se frena y la información no alcanza',
    servicesEyebrow: 'Servicios',
    servicesTitle: 'Capacidades centrales para integrar, escalar y modernizar',
    servicesSubtitle:
      'Consultoría tecnológica, integración empresarial, Oracle PL/SQL, SAP HANA, ArcGIS Enterprise, GIS corporativo, automatización de procesos y APIs REST.',
    sectorsEyebrow: 'Sectores donde trabajamos',
    sectorsTitle: 'Experiencia en organizaciones reguladas y de alta complejidad',
    whyEyebrow: 'Por qué CGJ 563',
    whyTitle: 'Experiencia senior orientada a decisiones concretas',
    whyText:
      'CGJ 563 S.A. combina experiencia técnica senior con comprensión real de procesos empresariales. No abordamos la tecnología como un fin en sí mismo, sino como una herramienta para resolver problemas concretos, reducir costos, ordenar operaciones y generar información confiable.',
    methodologyEyebrow: 'Metodología',
    methodologyTitle: 'Marco de trabajo claro, controlado y orientado a valor',
    useCasesEyebrow: 'Casos de uso',
    useCasesTitle: 'Aplicaciones reales en integración y modernización tecnológica',
    useCasesSubtitle: 'Proyectos representativos sin revelar clientes confidenciales.',
    contactEyebrow: 'Contacto',
    contactTitle: 'Conversemos sobre su diagnóstico inicial',
    contactSubtitle:
      'Si su organización necesita ordenar, integrar o modernizar procesos críticos, podemos comenzar con un diagnóstico inicial.',
    contactPanelText:
      'Consultora boutique en integración empresarial, modernización tecnológica e inteligencia artificial aplicada.',
    contactBullets: [
      'Servicios para utilities, energía, banca, telecomunicaciones, seguridad e industria.',
      'Capacidad técnica y funcional para proyectos Oracle, SAP HANA, SQL Server, GIS corporativo y APIs REST.',
      'Enfoque comercial, ejecutivo y orientado a resultados medibles.'
    ],
    footerLine1:
      'CGJ 563 S.A. | Consultoría en integración empresarial, Oracle, SAP HANA, GIS, SQL Server, APIs REST e inteligencia artificial aplicada.',
    footerLine2: 'Transformación digital para organizaciones que requieren continuidad operativa.',
    languageLabel: 'Idioma',
    fields: {
      name: 'Nombre',
      company: 'Empresa',
      email: 'Email',
      phone: 'Teléfono',
      message: 'Mensaje'
    },
    form: {
      submit: 'Solicitar diagnóstico',
      sending: 'Enviando...',
      success: 'Solicitud enviada. Nos comunicaremos a la brevedad.',
      error: 'No se pudo enviar la solicitud. Intente nuevamente.',
      subject: 'Solicitud de diagnóstico desde cgj563.com'
    },
    problems: [
      'Sistemas aislados que no se comunican entre sí.',
      'Procesos manuales repetitivos.',
      'Bases de datos lentas o difíciles de mantener.',
      'Falta de trazabilidad operativa.',
      'Integraciones frágiles entre sistemas críticos.',
      'Plataformas GIS subutilizadas.',
      'Migraciones tecnológicas sin arquitectura clara.',
      'Falta de indicadores para gestión.'
    ],
    services: [
      {
        title: 'Arquitectura e integración empresarial',
        description:
          'Diseño de arquitecturas de integración entre sistemas corporativos, bases de datos, APIs, GIS, ERP y plataformas operativas.'
      },
      {
        title: 'Oracle, SAP HANA, PL/SQL y bases de datos',
        description:
          'Desarrollo, optimización, mantenimiento y modernización de soluciones basadas en Oracle Database, SAP HANA, PL/SQL, SQL Server y procesos batch críticos.'
      },
      {
        title: 'GIS corporativo y ArcGIS Enterprise',
        description:
          'Consultoría para implementación, publicación, integración y optimización de plataformas geoespaciales corporativas, especialmente en entornos ArcGIS Enterprise.'
      },
      {
        title: 'Automatización de procesos',
        description:
          'Automatización de tareas operativas, validaciones, integraciones, reportes y flujos administrativos mediante Python, SQL, APIs y herramientas corporativas.'
      },
      {
        title: 'Modernización tecnológica',
        description:
          'Relevamiento, diagnóstico y evolución de aplicaciones heredadas hacia soluciones más mantenibles, escalables y alineadas al negocio.'
      },
      {
        title: 'Inteligencia artificial aplicada',
        description:
          'Identificación de oportunidades concretas para aplicar IA en procesos, documentación, análisis de datos, atención interna, automatización y soporte a la decisión.'
      }
    ],
    sectors: ['Utilities', 'Energía', 'Gas', 'Seguridad', 'Banca', 'Telecomunicaciones', 'Industria', 'Gobierno'],
    keyPoints: [
      'Más de 35 años de experiencia acumulada en sistemas corporativos.',
      'Conocimiento profundo de Oracle, SAP HANA, SQL Server, GIS, APIs y procesos críticos.',
      'Experiencia en empresas reguladas y de alta criticidad operativa.',
      'Capacidad para dialogar con áreas técnicas, operativas y directivas.',
      'Enfoque práctico, medible y orientado a resultados.'
    ],
    methodology: [
      'Diagnóstico inicial',
      'Relevamiento técnico y funcional',
      'Diseño de solución',
      'Implementación controlada',
      'Transferencia, documentación y mejora continua'
    ],
    useCases: [
      'Integración Oracle-GIS para activos georreferenciados.',
      'Automatización de procesos administrativos.',
      'Publicación de capas GIS corporativas.',
      'Optimización de consultas y procesos PL/SQL.',
      'Modernización de aplicaciones legacy.',
      'Implementación de APIs REST para integración empresarial.'
    ]
  },
  en: {
    whatsappMessage: 'Hello, I would like to receive information about your consulting services.',
    brandTag: 'Boutique consulting in technology and enterprise integration',
    openMenu: 'Open menu',
    dashboard: 'Dashboard',
    heroEyebrow: 'Senior technology consulting for critical processes',
    heroTitle: 'Enterprise integration, automation and technology for organizations that cannot stop.',
    heroSubtitle:
      'We help companies in utilities, energy, banking, telecommunications and industry modernize critical processes through Oracle, SAP HANA, GIS, data, APIs and applied artificial intelligence.',
    ctaPrimary: 'Request assessment',
    ctaSecondary: 'View services',
    heroSideTitle:
      'Boutique consulting specialized in enterprise integration, technology modernization, process automation, Oracle, SAP HANA, GIS, data and AI applied to business.',
    heroSideText:
      'Executive approach for digital transformation initiatives with traceability, solid architecture and measurable outcomes in highly critical environments.',
    aboutEyebrow: 'Capabilities',
    aboutTitle: 'Design, integration and optimization for operations that require continuity',
    aboutText:
      'We design, integrate and optimize technology solutions for critical business processes. We combine expertise in databases, corporate GIS, systems integration, automation and information analysis to reduce operational friction, improve traceability and support decision-making.',
    problemsEyebrow: 'Problems we solve',
    problemsTitle: 'We intervene where operations stall and information is not enough',
    servicesEyebrow: 'Services',
    servicesTitle: 'Core capabilities to integrate, scale and modernize',
    servicesSubtitle:
      'Technology consulting, enterprise integration, Oracle PL/SQL, SAP HANA, ArcGIS Enterprise, corporate GIS, process automation and REST APIs.',
    sectorsEyebrow: 'Industries we serve',
    sectorsTitle: 'Experience in regulated and high-complexity organizations',
    whyEyebrow: 'Why CGJ 563',
    whyTitle: 'Senior expertise focused on concrete decisions',
    whyText:
      'CGJ 563 S.A. combines senior technical expertise with real understanding of business processes. We do not treat technology as an end in itself, but as a tool to solve concrete problems, reduce costs, organize operations and generate reliable information.',
    methodologyEyebrow: 'Methodology',
    methodologyTitle: 'Clear, controlled framework focused on value',
    useCasesEyebrow: 'Use cases',
    useCasesTitle: 'Real applications in integration and technology modernization',
    useCasesSubtitle: 'Representative projects without disclosing confidential clients.',
    contactEyebrow: 'Contact',
    contactTitle: 'Let us discuss your initial assessment',
    contactSubtitle:
      'If your organization needs to organize, integrate or modernize critical processes, we can start with an initial assessment.',
    contactPanelText:
      'Boutique consulting firm focused on enterprise integration, technology modernization and applied artificial intelligence.',
    contactBullets: [
      'Services for utilities, energy, banking, telecommunications, security and industry.',
      'Technical and functional capabilities for Oracle, SAP HANA, SQL Server, corporate GIS and REST API projects.',
      'Commercial and executive approach focused on measurable outcomes.'
    ],
    footerLine1:
      'CGJ 563 S.A. | Consulting in enterprise integration, Oracle, SAP HANA, GIS, SQL Server, REST APIs and applied artificial intelligence.',
    footerLine2: 'Digital transformation for organizations that require operational continuity.',
    languageLabel: 'Language',
    fields: {
      name: 'Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      message: 'Message'
    },
    form: {
      submit: 'Request assessment',
      sending: 'Sending...',
      success: 'Request sent. We will contact you shortly.',
      error: 'Could not send the request. Please try again.',
      subject: 'Assessment request from cgj563.com'
    },
    problems: [
      'Isolated systems that do not communicate with each other.',
      'Repetitive manual processes.',
      'Slow or hard-to-maintain databases.',
      'Lack of operational traceability.',
      'Fragile integrations between critical systems.',
      'Underused GIS platforms.',
      'Technology migrations without clear architecture.',
      'Lack of indicators for management.'
    ],
    services: [
      {
        title: 'Enterprise architecture and integration',
        description:
          'Design of integration architectures across corporate systems, databases, APIs, GIS, ERP and operational platforms.'
      },
      {
        title: 'Oracle, SAP HANA, PL/SQL and databases',
        description:
          'Development, optimization, maintenance and modernization of solutions based on Oracle Database, SAP HANA, PL/SQL, SQL Server and critical batch processes.'
      },
      {
        title: 'Corporate GIS and ArcGIS Enterprise',
        description:
          'Consulting for implementation, publishing, integration and optimization of corporate geospatial platforms, especially in ArcGIS Enterprise environments.'
      },
      {
        title: 'Process automation',
        description:
          'Automation of operational tasks, validations, integrations, reporting and administrative workflows through Python, SQL, APIs and corporate tools.'
      },
      {
        title: 'Technology modernization',
        description:
          'Assessment, diagnostics and evolution of legacy applications toward more maintainable, scalable and business-aligned solutions.'
      },
      {
        title: 'Applied artificial intelligence',
        description:
          'Identification of concrete opportunities to apply AI in processes, documentation, data analysis, internal support, automation and decision support.'
      }
    ],
    sectors: ['Utilities', 'Energy', 'Gas', 'Security', 'Banking', 'Telecommunications', 'Industry', 'Government'],
    keyPoints: [
      'More than 35 years of cumulative experience in corporate systems.',
      'Deep knowledge of Oracle, SAP HANA, SQL Server, GIS, APIs and critical processes.',
      'Experience in regulated companies and highly critical operations.',
      'Ability to engage technical, operational and executive teams.',
      'Practical, measurable and results-oriented approach.'
    ],
    methodology: [
      'Initial assessment',
      'Technical and functional assessment',
      'Solution design',
      'Controlled implementation',
      'Transfer, documentation and continuous improvement'
    ],
    useCases: [
      'Oracle-GIS integration for georeferenced assets.',
      'Automation of administrative processes.',
      'Publishing of corporate GIS layers.',
      'Optimization of PL/SQL queries and processes.',
      'Modernization of legacy applications.',
      'Implementation of REST APIs for enterprise integration.'
    ]
  }
};

const visualGallery = [
  {
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80',
    title: {
      es: 'Integración de sistemas empresariales',
      en: 'Enterprise systems integration'
    },
    description: {
      es: 'Arquitecturas conectadas para procesos críticos con trazabilidad de punta a punta.',
      en: 'Connected architectures for critical processes with end-to-end traceability.'
    }
  },
  {
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
    title: {
      es: 'Equipos orientados a resultados',
      en: 'Results-driven teams'
    },
    description: {
      es: 'Gobierno operativo y coordinación entre negocio, tecnología y dirección.',
      en: 'Operational governance and alignment between business, technology and leadership.'
    }
  },
  {
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
    title: {
      es: 'Analítica para decisiones ejecutivas',
      en: 'Analytics for executive decisions'
    },
    description: {
      es: 'Datos confiables, indicadores claros y foco en impacto de negocio.',
      en: 'Reliable data, clear indicators and focus on business impact.'
    }
  }
];

function Section({ id, eyebrow, title, subtitle, children }) {
  return (
    <section id={id} className="section-block">
      <div className="site-container">
        <div className="section-head">
          {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function CardGrid({ items, type = 'default' }) {
  return (
    <div className={`card-grid card-grid-${type}`}>
      {items.map((item) => {
        const title = typeof item === 'string' ? item : item.title;
        const description = typeof item === 'string' ? null : item.description;

        return (
          <article className="consulting-card" key={title}>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </article>
        );
      })}
    </div>
  );
}

function ContactForm({ language }) {
  const t = content[language];
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    mensaje: '',
    botcheck: ''
  });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  const canSubmit = useMemo(() => {
    return [formData.nombre, formData.empresa, formData.email, formData.telefono, formData.mensaje].every(
      (value) => value.trim().length > 0
    );
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSending(true);
    setFeedback('');

    try {
      const response = await fetch('/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: t.form.subject,
          name: formData.nombre,
          company: formData.empresa,
          email: formData.email,
          phone: formData.telefono,
          message: formData.mensaje,
          botcheck: formData.botcheck
        })
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        setFeedback(t.form.success);
        setFormData({ nombre: '', empresa: '', email: '', telefono: '', mensaje: '', botcheck: '' });
      } else {
        setFeedback(t.form.error);
      }
    } catch (error) {
      setFeedback(t.form.error);
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="diagnostic-form" onSubmit={handleSubmit}>
      <label>
        {t.fields.name}
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          disabled={sending}
          required
        />
      </label>

      <label>
        {t.fields.company}
        <input
          type="text"
          name="empresa"
          value={formData.empresa}
          onChange={handleChange}
          disabled={sending}
          required
        />
      </label>

      <label>
        {t.fields.email}
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={sending}
          required
        />
      </label>

      <label>
        {t.fields.phone}
        <input
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          disabled={sending}
          required
        />
      </label>

      <label className="full-width">
        {t.fields.message}
        <textarea
          name="mensaje"
          rows="5"
          value={formData.mensaje}
          onChange={handleChange}
          disabled={sending}
          required
        />
      </label>

      <input
        type="text"
        name="botcheck"
        value={formData.botcheck}
        onChange={handleChange}
        tabIndex={-1}
        autoComplete="off"
        style={{ display: 'none' }}
      />

      <button type="submit" className="btn-primary" disabled={sending || !canSubmit}>
        {sending ? t.form.sending : t.form.submit}
      </button>

      {feedback && <p className="form-feedback">{feedback}</p>}
    </form>
  );
}

export default function ConsultingSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('siteLanguage') || 'es');

  useEffect(() => {
    localStorage.setItem('siteLanguage', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = content[language];
  const whatsappLink = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(t.whatsappMessage)}`;

  return (
    <div className="consulting-site">
      <header className="topbar">
        <div className="site-container topbar-inner">
          <a href="#home" className="brand-block" onClick={() => setMenuOpen(false)}>
            <span className="brand-logo" aria-hidden="true">
              <LogoSVG />
            </span>
            <span className="brand-copy">
              <span className="brand-name">CGJ 563 S.A.</span>
              <span className="brand-tag">{t.brandTag}</span>
            </span>
          </a>

          <button
            type="button"
            className="menu-button"
            aria-label={t.openMenu}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`topnav ${menuOpen ? 'open' : ''}`}>
            {navItems[language].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a href="/dashboard" className="dashboard-access">{t.dashboard}</a>
            <label className="language-switcher" htmlFor="language-select">
              <span>{t.languageLabel}</span>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </label>
          </nav>
        </div>
      </header>

      <main>
        <section id="home" className="hero-section">
          <div className="site-container hero-grid">
            <div>
              <p className="hero-eyebrow">{t.heroEyebrow}</p>
              <h1>
                {t.heroTitle}
              </h1>
              <p className="hero-subtitle">{t.heroSubtitle}</p>
              <div className="hero-actions">
                <a href="#contacto" className="btn-primary">{t.ctaPrimary}</a>
                <a href="#servicios" className="btn-secondary">{t.ctaSecondary}</a>
              </div>
            </div>
            <aside className="hero-side">
              <h2>{t.heroSideTitle}</h2>
              <p>{t.heroSideText}</p>
              <img className="hero-side-image" src={heroImage} alt="Visual de integración tecnológica" />
            </aside>
          </div>
        </section>

        <section className="visual-gallery-section" aria-label="Highlights">
          <div className="site-container visual-gallery">
            {visualGallery.map((item) => (
              <article className="visual-tile" key={item.image}>
                <img src={item.image} alt={item.title[language]} loading="lazy" />
                <div className="visual-overlay">
                  <h3>{item.title[language]}</h3>
                  <p>{item.description[language]}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <Section
          id="que-hacemos"
          eyebrow={t.aboutEyebrow}
          title={t.aboutTitle}
        >
          <p className="single-paragraph">{t.aboutText}</p>
        </Section>

        <Section
          id="problemas"
          eyebrow={t.problemsEyebrow}
          title={t.problemsTitle}
        >
          <CardGrid items={t.problems} type="problems" />
        </Section>

        <Section
          id="servicios"
          eyebrow={t.servicesEyebrow}
          title={t.servicesTitle}
          subtitle={t.servicesSubtitle}
        >
          <CardGrid items={t.services} type="services" />
        </Section>

        <Section
          id="sectores"
          eyebrow={t.sectorsEyebrow}
          title={t.sectorsTitle}
        >
          <ul className="sector-list" aria-label="Sectores atendidos">
            {t.sectors.map((sector) => (
              <li key={sector}>{sector}</li>
            ))}
          </ul>
        </Section>

        <Section
          id="porque-cgj"
          eyebrow={t.whyEyebrow}
          title={t.whyTitle}
        >
          <p className="single-paragraph">{t.whyText}</p>
          <ul className="why-list">
            {t.keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </Section>

        <Section
          id="metodologia"
          eyebrow={t.methodologyEyebrow}
          title={t.methodologyTitle}
        >
          <ol className="methodology-steps">
            {t.methodology.map((step) => (
              <li key={step}>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          id="casos"
          eyebrow={t.useCasesEyebrow}
          title={t.useCasesTitle}
          subtitle={t.useCasesSubtitle}
        >
          <CardGrid items={t.useCases} type="use-cases" />
        </Section>

        <Section
          id="contacto"
          eyebrow={t.contactEyebrow}
          title={t.contactTitle}
          subtitle={t.contactSubtitle}
        >
          <div className="contact-layout">
            <div className="contact-info-panel">
              <h3>CGJ 563 S.A.</h3>
              <p>{t.contactPanelText}</p>
              <ul>
                {t.contactBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
            <ContactForm language={language} />
          </div>
        </Section>
      </main>

      <a
        href={whatsappLink}
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
      >
        <img className="whatsapp-float-icon" src="/whatsapp.png" alt="" aria-hidden="true" />
      </a>

      <footer className="site-footer">
        <div className="site-container footer-content">
          <p>{t.footerLine1}</p>
          <p>{t.footerLine2}</p>
        </div>
      </footer>
    </div>
  );
}
