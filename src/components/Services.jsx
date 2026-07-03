import React from 'react';

export default function Services() {
  const services = [
    {
      id: 1,
      title: 'Integración de Información',
      description: 'Análisis e integración de sistemas para centralizar información operativa y administrativa',
      image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      title: 'KPIs de Gestión',
      description: 'Definición de indicadores para toma de decisiones: cobertura, presentismo, productividad y costos',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Gestión Operativa de Recursos',
      description: 'Optimización de asignación de recursos, cobertura y comunicación operativa',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      title: 'Plataforma Móvil Corporativa',
      description: 'Aplicación para personal operativo: asignaciones, servicios disponibles y registro de eventos',
      image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      title: 'Integración Administrativa',
      description: 'Conexión de procesos operativos con liquidación y procesos administrativos',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop'
    }
  ];

  return (
    <section id="servicios" className="services">
      <div className="container">
        <h2>Nuestros Servicios</h2>
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <img src={service.image} alt={service.title} className="service-image" />
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
