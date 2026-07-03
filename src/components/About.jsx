import React from 'react';

export default function About() {
  return (
    <section id="nosotros" className="about">
      <div className="container">
        <div className="about-content">
          <h2>Sobre CGJ563 S.A.</h2>
          <p>
            CGJ563 S.A. especializa en diagnóstico estratégico y transformación operativa. 
            Ayudamos a organizaciones a obtener una visión integral de sus operaciones, 
            integrando sistemas e información para decisiones ágiles y eficientes.
          </p>
          <div className="about-features">
            <div className="feature">
              <h4>Análisis Integral</h4>
              <p>Relevamiento funcional y tecnológico completo de tus procesos</p>
            </div>
            <div className="feature">
              <h4>Roadmap Tecnológico</h4>
              <p>Propuesta de implementación priorizada según impacto y complejidad</p>
            </div>
            <div className="feature">
              <h4>Transformación Controlada</h4>
              <p>Evolución gradual hacia operaciones más integradas y eficientes</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
