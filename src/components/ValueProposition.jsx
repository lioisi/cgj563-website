import React from 'react';

export default function ValueProposition() {
  return (
    <section className="value-proposition">
      <div className="container">
        <div className="value-content">
          <h2>Hacemos eficientes los recursos existentes</h2>
          <p className="value-subtitle">
            A través de optimización, integración e innovación, transformamos tus procesos actuales 
            en operaciones ágiles y rentables.
          </p>
          
          <div className="value-pillars">
            <div className="pillar">
              <h4>Optimización</h4>
              <p>Identificamos cuellos de botella y mejoramos la utilización de tus recursos actuales</p>
            </div>
            <div className="pillar">
              <h4>Integración</h4>
              <p>Conectamos sistemas y procesos para reducir duplicidades y aumentar eficiencia</p>
            </div>
            <div className="pillar">
              <h4>Innovación</h4>
              <p>Incorporamos tecnología y metodologías para evolucionar sin grandes inversiones</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
