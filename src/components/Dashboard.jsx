import { useState } from 'react';
import { useAPI, callAPI } from '../hooks/useAPI';
import ProblemasList from './ProblemasList';
import IntegracionesList from './IntegracionesList';
import MadurezDigital from './MadurezDigital';
import BacklogFuncional from './BacklogFuncional';
import Roadmap from './Roadmap';
import InternalApps from './InternalApps';
import AmeportOperations from './AmeportOperations';
import './Dashboard.css';

const BUSINESS_CONTEXTS = {
  koner: {
    label: 'Grupo Koner',
    description: 'Operación, servicios y gestión corporativa del Grupo Koner.'
  },
  ameport: {
    label: 'Mutual Ameport',
    description: 'Gestión mutual con foco en servicios al asociado y unidades de negocio.'
  }
};

const AMEPORT_UNITS = [
  {
    id: 'turismo',
    label: 'Turismo',
    description: 'Paquetes, viajes y servicios turísticos para asociados.'
  },
  {
    id: 'electrodomesticos',
    label: 'Financiación de artículos electrodomésticos',
    description: 'Venta y financiación de artículos para asociados.'
  },
  {
    id: 'prestamos',
    label: 'Préstamos',
    description: 'Créditos y seguimiento de préstamos para asociados.'
  },
  {
    id: 'plazos-fijos',
    label: 'Plazos fijos',
    description: 'Gestión de colocaciones y seguimiento financiero mutual.'
  }
];

const DASHBOARD_NAVIGATION = [
  { id: 'resumen', label: 'Resumen ejecutivo' },
  { id: 'kpis', label: 'KPIs' },
  { id: 'procesos', label: 'Procesos' },
  { id: 'problemas', label: 'Problemas operativos' },
  { id: 'apps', label: 'Aplicaciones' },
  { id: 'integraciones', label: 'Integraciones' },
  { id: 'madurez', label: 'Madurez digital' },
  { id: 'backlog', label: 'Backlog funcional' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'riesgos', label: 'Riesgos y controles' },
  { id: 'documentacion', label: 'Documentación y evidencias' },
  { id: 'administracion', label: 'Administración' }
];

const DASHBOARD_ROLES = [
  'Administrador',
  'Gerencia General',
  'Referente de área',
  'Sistemas',
  'Consulta / auditor'
];

export default function Dashboard() {
  const { data: kpis, loading, error } = useAPI('kpis');
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  const [selectedBusiness, setSelectedBusiness] = useState('ameport');
  const [selectedAmeportUnit, setSelectedAmeportUnit] = useState('turismo');
  const [selectedRole, setSelectedRole] = useState('Gerencia General');
  const [selectedPeriod, setSelectedPeriod] = useState('Últimos 12 meses');
  const [selectedArea, setSelectedArea] = useState('Todas las áreas');
  const [selectedStatus, setSelectedStatus] = useState('Todos los estados');

  const business = BUSINESS_CONTEXTS[selectedBusiness];

  const handleBusinessChange = (event) => {
    const nextBusiness = event.target.value;
    setSelectedBusiness(nextBusiness);
    setSelectedKPI(null);
    setShowForm(false);
    setActiveTab('kpis');
  };

  if (loading) return <div className="dashboard-loading">Cargando KPIs...</div>;
  if (error) return <div className="dashboard-error">Error: {error}</div>;

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar" aria-label="Navegación del dashboard">
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark">A</span>
          <div>
            <strong>AMEPORT</strong>
            <span>Gestión Operativa</span>
          </div>
        </div>
        <nav className="dashboard-navigation">
          {DASHBOARD_NAVIGATION.map((item) => (
            <button
              className={activeTab === item.id ? 'active' : ''}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">Gestión operativa y transformación</p>
            <h1>{selectedBusiness === 'ameport' ? 'AMEPORT' : 'Grupo Koner'}</h1>
          </div>
          <div className="dashboard-header-controls">
            <label className="business-selector">
              <span>Negocio</span>
              <select value={selectedBusiness} onChange={handleBusinessChange}>
                <option value="ameport">Mutual Ameport</option>
                <option value="koner">Grupo Koner</option>
              </select>
            </label>
            <label className="business-selector">
              <span>Rol de demostración</span>
              <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
                {DASHBOARD_ROLES.map((role) => <option key={role}>{role}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="dashboard-filters" aria-label="Filtros del dashboard">
          <label><span>Período</span><select value={selectedPeriod} onChange={(event) => setSelectedPeriod(event.target.value)}><option>Últimos 12 meses</option><option>Este año</option><option>Último trimestre</option></select></label>
          <label><span>Área</span><select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}><option>Todas las áreas</option><option>Gerencia General</option><option>Finanzas y Contabilidad</option><option>Sistemas y Aplicaciones</option></select></label>
          <label><span>Estado</span><select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}><option>Todos los estados</option><option>Dentro de meta</option><option>Con desvío</option><option>Sin datos</option></select></label>
          <span className="last-update">Última actualización: pendiente de validar</span>
        </div>

        <div className="data-quality-warning">
          <strong>Calidad y origen de datos</strong>
          <span>Las métricas y conclusiones dependen de datos reales, completos y actualizados. Verifique si cada registro es de demostración, declarado, verificado o aprobado antes de tomar decisiones.</span>
        </div>

      <div className="business-context" aria-live="polite">
        <div>
          <strong>{business.label}</strong>
          <p>{business.description}</p>
        </div>
        {selectedBusiness === 'ameport' && (
          <label className="unit-selector">
            <span>Unidad de negocio</span>
            <select value={selectedAmeportUnit} onChange={(event) => setSelectedAmeportUnit(event.target.value)}>
              {AMEPORT_UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.label}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {selectedBusiness === 'koner' && <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'kpis' ? 'active' : ''}`}
          onClick={() => setActiveTab('kpis')}
        >
          KPIs
        </button>
        <button 
          className={`tab-button ${activeTab === 'problemas' ? 'active' : ''}`}
          onClick={() => setActiveTab('problemas')}
        >
          Problemas
        </button>
        <button 
          className={`tab-button ${activeTab === 'integraciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('integraciones')}
        >
          Integraciones
        </button>
        <button 
          className={`tab-button ${activeTab === 'madurez' ? 'active' : ''}`}
          onClick={() => setActiveTab('madurez')}
        >
          Madurez Digital
        </button>
        <button 
          className={`tab-button ${activeTab === 'backlog' ? 'active' : ''}`}
          onClick={() => setActiveTab('backlog')}
        >
          Backlog
        </button>
        <button 
          className={`tab-button ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('roadmap')}
        >
          Roadmap
        </button>
        <button
          className={`tab-button ${activeTab === 'apps' ? 'active' : ''}`}
          onClick={() => setActiveTab('apps')}
        >
          Apps internas
        </button>
      </div>}

      <div className="tab-content">
        {activeTab === 'resumen' ? (
          <ExecutiveSummary kpis={kpis} business={business} selectedPeriod={selectedPeriod} selectedRole={selectedRole} />
        ) : selectedBusiness === 'ameport' ? (
          <AmeportModuleView moduleId={activeTab} selectedUnit={selectedAmeportUnit} />
        ) : activeTab === 'kpis' && (
          <>
            <div className="section-header">
              <h2>KPIs - Indicadores Clave</h2>
              <div className="section-actions">
                <a
                  className="btn-secondary"
                  href="/GUIA_KPIS_1_PAGINA.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver guía rápida KPIs
                </a>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  + Agregar KPI
                </button>
              </div>
            </div>
            
            {showForm && (
              <KPIForm onClose={() => setShowForm(false)} />
            )}

            {selectedKPI && (
              <KPIDetail kpi={selectedKPI} onClose={() => setSelectedKPI(null)} />
            )}

            <div className="kpi-grid">
              {kpis && kpis.map(kpi => (
                <KPICard
                  key={kpi.id}
                  kpi={kpi}
                  onClick={() => setSelectedKPI(kpi)}
                />
              ))}
            </div>
          </>
        )}

        {selectedBusiness === 'koner' && (
          <>
            {activeTab === 'problemas' && <ProblemasList />}
            {activeTab === 'integraciones' && <IntegracionesList />}
            {activeTab === 'madurez' && <MadurezDigital />}
            {activeTab === 'backlog' && <BacklogFuncional />}
            {activeTab === 'roadmap' && <Roadmap />}
            {activeTab === 'apps' && <InternalApps />}
          </>
        )}
        </div>
      </main>
    </div>
  );
}

function ExecutiveSummary({ kpis, business, selectedPeriod, selectedRole }) {
  const totalKpis = Array.isArray(kpis) ? kpis.length : 0;
  const cards = [
    ['KPIs registrados', totalKpis, 'Con fuente y responsable pendientes de validar'],
    ['KPIs dentro de meta', 'N/D', 'Requiere valores históricos cargados'],
    ['Problemas críticos abiertos', 'N/D', 'Módulo pendiente de relevamiento AMEPORT'],
    ['Iniciativas en curso', 'N/D', 'Sin roadmap AMEPORT cargado'],
    ['Procesos sin documentar', 'N/D', 'Debe completarse el inventario AS-IS'],
    ['Madurez digital', 'N/D', 'Evaluación preliminar pendiente']
  ];

  return (
    <section className="executive-summary">
      <div className="section-header">
        <div>
          <p className="dashboard-eyebrow">Resumen ejecutivo</p>
          <h2>{business.label}</h2>
          <p className="summary-context">Período: {selectedPeriod} · Rol: {selectedRole}</p>
        </div>
        <span className="data-status">MVP en relevamiento</span>
      </div>
      <div className="summary-card-grid">
        {cards.map(([label, value, note]) => (
          <article className="summary-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>
      <div className="summary-panels">
        <article className="summary-panel">
          <h3>Tendencia mensual</h3>
          <p>Se mostrará cuando existan valores KPI con período, responsable y fecha de carga.</p>
          <div className="empty-chart">Sin datos históricos validados</div>
        </article>
        <article className="summary-panel">
          <h3>Decisiones que requieren atención</h3>
          <ul className="attention-list">
            <li>Completar inventario de procesos AS-IS.</li>
            <li>Asignar responsables por unidad y área.</li>
            <li>Definir fuentes y frecuencia de los KPIs.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

function AmeportOverview({ selectedUnit }) {
  const unit = AMEPORT_UNITS.find((item) => item.id === selectedUnit) || AMEPORT_UNITS[0];

  return (
    <section className="business-overview">
      <div className="section-header">
        <div>
          <p className="dashboard-eyebrow">Mutual Ameport</p>
          <h2>{unit.label}</h2>
        </div>
        <span className="data-status">Sin datos cargados</span>
      </div>
      <p className="business-overview-description">{unit.description}</p>
      <div className="business-unit-grid">
        {AMEPORT_UNITS.map((item) => (
          <article className={`business-unit-card ${item.id === selectedUnit ? 'active' : ''}`} key={item.id}>
            <h3>{item.label}</h3>
            <p>{item.description}</p>
            <span>Preparar indicadores y objetivos</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function AmeportModuleView({ moduleId, selectedUnit }) {
  const module = DASHBOARD_NAVIGATION.find((item) => item.id === moduleId);
  const unit = AMEPORT_UNITS.find((item) => item.id === selectedUnit) || AMEPORT_UNITS[0];

  if (moduleId === 'kpis' || moduleId === 'procesos' || moduleId === 'problemas') {
    return <AmeportOperations moduleId={moduleId} selectedUnit={selectedUnit} />;
  }

  const scope = moduleId === 'procesos'
    ? 'Inventario AS-IS, responsables, evidencias, riesgos, controles y análisis de brecha.'
    : moduleId === 'problemas'
      ? 'Registro, prioridad, acciones, vencimientos y decisiones requeridas.'
      : moduleId === 'riesgos'
        ? 'Riesgos operativos, tecnológicos, legales/regulatorios, financieros y de calidad.'
        : moduleId === 'documentacion'
          ? 'Referencias documentales, versiones, revisiones, propietarios y evidencias.'
          : 'Relaciones con procesos, responsables, unidad de negocio y estado de validación.';

  return (
    <section className="module-empty-state">
      <p className="dashboard-eyebrow">{module?.label || 'Módulo AMEPORT'}</p>
      <h2>{module?.label || 'Módulo AMEPORT'}</h2>
      <p>Unidad seleccionada: <strong>{unit.label}</strong></p>
      <div className="module-rule">
        <strong>Alcance definido</strong>
        <span>{scope}</span>
      </div>
      <span className="data-status">Módulo en implementación</span>
      <p className="module-empty-note">No se muestran datos ficticios en esta pantalla. El siguiente paso es ejecutar la migración AMEPORT y conectar el endpoint REST correspondiente.</p>
    </section>
  );
}

// Tarjeta de KPI
function KPICard({ kpi, onClick }) {
  return (
    <div className="kpi-card" onClick={onClick}>
      <h3>{kpi.nombre}</h3>
      <p className="kpi-objetivo">{kpi.objetivo_gestion}</p>
      <div className="kpi-meta">
        <span className="badge">{kpi.frecuencia}</span>
      </div>
      <p className="kpi-formula">Fórmula: {kpi.formula}</p>
    </div>
  );
}

// Detalle de KPI con histórico
function KPIDetail({ kpi, onClose }) {
  const { data: detailed } = useAPI('kpis', kpi.id);
  const [formData, setFormData] = useState({ valor_actual: '', valor_meta: '' });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleAddRecord = async () => {
    if (!formData.valor_actual || !formData.valor_meta) {
      alert('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const today = new Date();
      await callAPI('kpi_registros', 'POST', null, {
        kpi_id: kpi.id,
        valor_actual: parseFloat(formData.valor_actual),
        valor_meta: parseFloat(formData.valor_meta),
        periodo_mes: today.getMonth() + 1,
        periodo_año: today.getFullYear(),
        estado: parseFloat(formData.valor_actual) >= parseFloat(formData.valor_meta) ? 'On track' : 'En riesgo',
        registrado_por: 'Usuario'
      });

      alert('✅ Registro agregado');
      setFormData({ valor_actual: '', valor_meta: '' });
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar KPI "${kpi.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeleting(true);
    try {
      await callAPI('kpis', 'DELETE', kpi.id);
      alert('✅ KPI eliminado');
      window.location.reload();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('¿Eliminar este registro?')) {
      return;
    }

    try {
      await callAPI('kpi_registros', 'DELETE', recordId);
      alert('✅ Registro eliminado');
      // Recargar registros
      window.location.reload();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>{kpi.nombre}</h2>
        <p className="modal-objetivo">{kpi.objetivo_gestion}</p>

        <div className="modal-info">
          <p><strong>Fórmula:</strong> {kpi.formula}</p>
          <p><strong>Frecuencia:</strong> {kpi.frecuencia}</p>
        </div>

        <div className="form-group">
          <h3>Registrar Valor</h3>
          <input
            type="number"
            placeholder="Valor actual"
            step="0.01"
            value={formData.valor_actual}
            onChange={e => setFormData({ ...formData, valor_actual: e.target.value })}
          />
          <input
            type="number"
            placeholder="Valor meta"
            step="0.01"
            value={formData.valor_meta}
            onChange={e => setFormData({ ...formData, valor_meta: e.target.value })}
          />
          <button onClick={handleAddRecord} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Registro'}
          </button>
        </div>

        {detailed && detailed.registros && detailed.registros.length > 0 && (
          <div className="registros-historico">
            <h3>Histórico (últimos 12 meses)</h3>
            <table>
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Actual</th>
                  <th>Meta</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {detailed.registros.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.periodo_mes}/{reg.periodo_año}</td>
                    <td>{reg.valor_actual}</td>
                    <td>{reg.valor_meta}</td>
                    <td className={`estado-${reg.estado.toLowerCase()}`}>{reg.estado}</td>
                    <td>
                      <button
                        className="btn-delete-registro"
                        onClick={() => handleDeleteRecord(reg.id)}
                        title="Eliminar registro"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-actions">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-delete"
          >
            {deleting ? '⏳ Eliminando...' : '🗑️ Eliminar KPI'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Formulario para crear KPI
function KPIForm({ onClose }) {
  const [formData, setFormData] = useState({
    nombre: '',
    objetivo_gestion: '',
    formula: '',
    frecuencia: 'Mensual'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.objetivo_gestion) {
      alert('Completa los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      await callAPI('kpis', 'POST', null, formData);
      alert('✅ KPI creado exitosamente');
      onClose();
      window.location.reload(); // Refresh para ver nuevo KPI
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>Crear Nuevo KPI</h2>

        <div className="form-group">
          <label>Nombre *</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Nombre del KPI"
          />
        </div>

        <div className="form-group">
          <label>Objetivo de Gestión *</label>
          <input
            type="text"
            value={formData.objetivo_gestion}
            onChange={e => setFormData({ ...formData, objetivo_gestion: e.target.value })}
            placeholder="Qué se busca medir"
          />
        </div>

        <div className="form-group">
          <label>Fórmula</label>
          <input
            type="text"
            value={formData.formula}
            onChange={e => setFormData({ ...formData, formula: e.target.value })}
            placeholder="Fórmula de cálculo"
          />
        </div>

        <div className="form-group">
          <label>Frecuencia</label>
          <select
            value={formData.frecuencia}
            onChange={e => setFormData({ ...formData, frecuencia: e.target.value })}
          >
            <option>Diaria</option>
            <option>Semanal</option>
            <option>Mensual</option>
            <option>Trimestral</option>
            <option>Anual</option>
          </select>
        </div>

        <button onClick={handleSubmit} disabled={loading} className="btn-primary">
          {loading ? 'Creando...' : 'Crear KPI'}
        </button>
      </div>
    </div>
  );
}
