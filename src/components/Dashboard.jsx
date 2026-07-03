import { useState } from 'react';
import { useAPI, callAPI } from '../hooks/useAPI';
import './Dashboard.css';

export default function Dashboard() {
  const { data: kpis, loading, error } = useAPI('kpis');
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showForm, setShowForm] = useState(false);

  if (loading) return <div className="dashboard-loading">Cargando KPIs...</div>;
  if (error) return <div className="dashboard-error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard de KPIs</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Agregar KPI
        </button>
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
    </div>
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
                </tr>
              </thead>
              <tbody>
                {detailed.registros.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.periodo_mes}/{reg.periodo_año}</td>
                    <td>{reg.valor_actual}</td>
                    <td>{reg.valor_meta}</td>
                    <td className={`estado-${reg.estado.toLowerCase()}`}>{reg.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
