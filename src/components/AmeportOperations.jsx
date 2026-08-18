import { useState } from 'react';
import { callAmeportAPI, useAmeportAPI } from '../hooks/useAPI';

const UNIT_CODES = {
  turismo: 'AMEPORT_TURISMO',
  electrodomesticos: 'AMEPORT_ELECTRO',
  prestamos: 'AMEPORT_PRESTAMOS',
  'plazos-fijos': 'AMEPORT_PLAZOS_FIJOS'
};

export default function AmeportOperations({ moduleId, selectedUnit }) {
  const unitCode = UNIT_CODES[selectedUnit] || UNIT_CODES.turismo;
  const { data: catalogs, loading: catalogsLoading, error: catalogsError } = useAmeportAPI('catalogs');
  const { data: processes, loading: processesLoading, error: processesError } = useAmeportAPI('processes', `business_unit=${unitCode}`);
  const { data: issues, loading: issuesLoading, error: issuesError } = useAmeportAPI('issues');
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [message, setMessage] = useState('');

  if (moduleId === 'kpis') {
    return <KPIManager catalogs={catalogs} unitCode={unitCode} />;
  }

  if (moduleId === 'procesos') {
    return (
      <ProcessManager
        catalogs={catalogs}
        processes={processes}
        loading={catalogsLoading || processesLoading}
        error={catalogsError || processesError}
        selectedUnit={unitCode}
        showForm={showProcessForm}
        setShowForm={setShowProcessForm}
        message={message}
        setMessage={setMessage}
      />
    );
  }

  if (moduleId === 'problemas') {
    return (
      <IssueManager
        catalogs={catalogs}
        issues={issues}
        loading={catalogsLoading || issuesLoading}
        error={catalogsError || issuesError}
        showForm={showIssueForm}
        setShowForm={setShowIssueForm}
        message={message}
        setMessage={setMessage}
      />
    );
  }

  return <AmeportModuleNotice moduleId={moduleId} />;
}

function KPIManager({ catalogs, unitCode }) {
  const { data: kpis, loading, error } = useAmeportAPI('kpis', `business_unit=${unitCode}`);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const unit = catalogs?.business_units?.find((item) => item.code === unitCode);

  return <section className="ameport-manager">
    <div className="section-header"><div><p className="dashboard-eyebrow">AMEPORT · Indicadores</p><h2>KPIs de {unit?.name || 'la unidad'}</h2></div><button className="btn-primary" onClick={() => setShowForm(true)}>+ Crear KPI</button></div>
    <p className="manager-intro">Cada KPI debe tener objetivo, fórmula o fuente, frecuencia, responsable y clasificación de datos antes de utilizarse para decisiones.</p>
    {message && <p className="manager-message">{message}</p>}
    {loading && <p className="manager-muted">Cargando KPIs...</p>}
    {error && <p className="manager-error">{error}</p>}
    {!loading && !error && (!kpis || kpis.length === 0) && <p className="manager-empty">No hay KPIs cargados para esta unidad.</p>}
    <div className="manager-list">{kpis?.map((kpi) => <article className="manager-row" key={kpi.id}><div><strong>{kpi.code} · {kpi.nombre}</strong><span>{kpi.responsable} · {kpi.frecuencia} · {kpi.data_classification}</span></div><span className="data-badge">Sin valores</span></article>)}</div>
    {showForm && <KPIForm catalogs={catalogs} unitCode={unitCode} onClose={() => setShowForm(false)} onMessage={setMessage} />}
  </section>;
}

function KPIForm({ catalogs, unitCode, onClose, onMessage }) {
  const unit = catalogs?.business_units?.find((item) => item.code === unitCode);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', nombre: '', objetivo_gestion: '', formula: '', business_unit_id: unit?.id || '', area_id: '', measurement_unit: '', frecuencia: 'Mensual', source_reference: '', responsable: '', warning_limit: '', critical_limit: '', data_classification: 'Declarado' });
  const update = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); try { await callAmeportAPI('kpis', 'POST', null, { ...form, business_unit_id: Number(form.business_unit_id), area_id: Number(form.area_id || 0) }); onMessage('KPI creado correctamente.'); onClose(); window.location.reload(); } catch (error) { onMessage(error.message); } finally { setSaving(false); } };
  return <Modal title="Crear KPI AMEPORT" onClose={onClose}><form className="ameport-form" onSubmit={submit}><Field label="Código" value={form.code} onChange={(value) => update('code', value)} required /><Field label="Nombre" value={form.nombre} onChange={(value) => update('nombre', value)} required /><input type="hidden" value={form.business_unit_id} readOnly /><SelectField label="Área" value={form.area_id} onChange={(value) => update('area_id', value)} options={catalogs?.areas || []} valueKey="id" labelKey="name" /><Field label="Objetivo de gestión" value={form.objetivo_gestion} onChange={(value) => update('objetivo_gestion', value)} required /><Field label="Unidad de medida" value={form.measurement_unit} onChange={(value) => update('measurement_unit', value)} /><TextAreaField label="Fórmula o método de cálculo" value={form.formula} onChange={(value) => update('formula', value)} /><Field label="Fuente de datos" value={form.source_reference} onChange={(value) => update('source_reference', value)} /><Field label="Responsable" value={form.responsable} onChange={(value) => update('responsable', value)} required /><SelectField label="Frecuencia" value={form.frecuencia} onChange={(value) => update('frecuencia', value)} options={['Diaria', 'Semanal', 'Mensual', 'Trimestral', 'Anual'].map((name) => ({ id: name, name }))} valueKey="id" labelKey="name" required /><Field label="Límite de advertencia" value={form.warning_limit} onChange={(value) => update('warning_limit', value)} /><Field label="Límite crítico" value={form.critical_limit} onChange={(value) => update('critical_limit', value)} /><SelectField label="Clasificación del dato" value={form.data_classification} onChange={(value) => update('data_classification', value)} options={['Declarado', 'Verificado', 'Aprobado'].map((name) => ({ id: name, name }))} valueKey="id" labelKey="name" /><FormActions saving={saving} onClose={onClose} /></form></Modal>;
}

function ProcessManager({ catalogs, processes, loading, error, selectedUnit, showForm, setShowForm, message, setMessage }) {
  const unit = catalogs?.business_units?.find((item) => item.code === selectedUnit);
  return (
    <section className="ameport-manager">
      <div className="section-header">
        <div><p className="dashboard-eyebrow">AMEPORT · Procesos</p><h2>Inventario AS-IS</h2></div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Registrar proceso</button>
      </div>
      <p className="manager-intro">Registrar primero cómo funciona hoy: responsable, alcance, evidencias, riesgos y controles. El rediseño no se habilita sin análisis de brecha.</p>
      {message && <p className="manager-message">{message}</p>}
      {loading && <p className="manager-muted">Cargando procesos...</p>}
      {error && <p className="manager-error">{error}</p>}
      {!loading && !error && (!processes || processes.length === 0) && <p className="manager-empty">No hay procesos registrados para {unit?.name || 'esta unidad'}.</p>}
      <div className="manager-list">
        {processes?.map((process) => <article className="manager-row" key={process.id}><div><strong>{process.code} · {process.name}</strong><span>{process.responsible_name || 'Sin responsable'} · {process.documentation_status}</span></div><span className={`data-badge ${process.data_classification.toLowerCase()}`}>{process.data_classification}</span></article>)}
      </div>
      {showForm && <ProcessForm catalogs={catalogs} onClose={() => setShowForm(false)} onMessage={setMessage} />}
    </section>
  );
}

function ProcessForm({ catalogs, onClose, onMessage }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', business_unit_id: '', area_id: '', responsible_name: '', purpose: '', scope: '', as_is_description: '', current_risks: '', current_controls: '', gap_analysis: '', validation_reference: '', data_classification: 'Declarado' });
  const update = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await callAmeportAPI('processes', 'POST', null, { ...form, business_unit_id: Number(form.business_unit_id), area_id: Number(form.area_id || 0) });
      onMessage('Proceso registrado correctamente.');
      onClose();
      window.location.reload();
    } catch (error) {
      onMessage(error.message);
    } finally { setSaving(false); }
  };
  return <Modal title="Registrar proceso AS-IS" onClose={onClose}><form className="ameport-form" onSubmit={submit}>
    <Field label="Código" value={form.code} onChange={(value) => update('code', value)} required />
    <Field label="Nombre" value={form.name} onChange={(value) => update('name', value)} required />
    <SelectField label="Unidad" value={form.business_unit_id} onChange={(value) => update('business_unit_id', value)} options={catalogs?.business_units || []} valueKey="id" labelKey="name" required />
    <SelectField label="Área responsable" value={form.area_id} onChange={(value) => update('area_id', value)} options={catalogs?.areas || []} valueKey="id" labelKey="name" />
    <Field label="Responsable del proceso" value={form.responsible_name} onChange={(value) => update('responsible_name', value)} required />
    <Field label="Propósito" value={form.purpose} onChange={(value) => update('purpose', value)} />
    <Field label="Alcance" value={form.scope} onChange={(value) => update('scope', value)} required />
    <TextAreaField label="Descripción AS-IS" value={form.as_is_description} onChange={(value) => update('as_is_description', value)} required />
    <TextAreaField label="Riesgos actuales" value={form.current_risks} onChange={(value) => update('current_risks', value)} required />
    <TextAreaField label="Controles actuales" value={form.current_controls} onChange={(value) => update('current_controls', value)} required />
    <TextAreaField label="Análisis de brecha" value={form.gap_analysis} onChange={(value) => update('gap_analysis', value)} />
    <Field label="Referencia de validación" value={form.validation_reference} onChange={(value) => update('validation_reference', value)} />
    <SelectField label="Clasificación del dato" value={form.data_classification} onChange={(value) => update('data_classification', value)} options={['Declarado', 'Verificado', 'Aprobado'].map((name) => ({ id: name, name }))} valueKey="id" labelKey="name" />
    <FormActions saving={saving} onClose={onClose} />
  </form></Modal>;
}

function IssueManager({ catalogs, issues, loading, error, showForm, setShowForm, message, setMessage }) {
  return <section className="ameport-manager"><div className="section-header"><div><p className="dashboard-eyebrow">AMEPORT · Problemas</p><h2>Problemas operativos</h2></div><button className="btn-primary" onClick={() => setShowForm(true)}>+ Registrar problema</button></div><p className="manager-intro">Registrar impacto, urgencia, responsable, acción y decisión requerida. La prioridad sugerida debe ser confirmada por un responsable autorizado.</p>{message && <p className="manager-message">{message}</p>}{loading && <p className="manager-muted">Cargando problemas...</p>}{error && <p className="manager-error">{error}</p>}<div className="manager-list">{issues?.map((issue) => <article className="manager-row" key={issue.id}><div><strong>{issue.code} · {issue.title}</strong><span>{issue.business_unit_name} · {issue.priority} · {issue.status}</span></div><span className={`data-badge ${issue.data_classification.toLowerCase()}`}>{issue.data_classification}</span></article>)}</div>{showForm && <IssueForm catalogs={catalogs} onClose={() => setShowForm(false)} onMessage={setMessage} />}</section>;
}

function IssueForm({ catalogs, onClose, onMessage }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', title: '', description: '', business_unit_id: '', reported_by: '', responsible_name: '', priority: 'Media' });
  const update = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); try { await callAmeportAPI('issues', 'POST', null, { ...form, business_unit_id: Number(form.business_unit_id) }); onMessage('Problema registrado correctamente.'); onClose(); window.location.reload(); } catch (error) { onMessage(error.message); } finally { setSaving(false); } };
  return <Modal title="Registrar problema operativo" onClose={onClose}><form className="ameport-form" onSubmit={submit}><Field label="Código" value={form.code} onChange={(value) => update('code', value)} required /><Field label="Título" value={form.title} onChange={(value) => update('title', value)} required /><SelectField label="Unidad" value={form.business_unit_id} onChange={(value) => update('business_unit_id', value)} options={catalogs?.business_units || []} valueKey="id" labelKey="name" required /><Field label="Reportado por" value={form.reported_by} onChange={(value) => update('reported_by', value)} required /><Field label="Responsable" value={form.responsible_name} onChange={(value) => update('responsible_name', value)} required /><SelectField label="Prioridad" value={form.priority} onChange={(value) => update('priority', value)} options={['Baja', 'Media', 'Alta', 'Crítica'].map((name) => ({ id: name, name }))} valueKey="id" labelKey="name" /><TextAreaField label="Descripción" value={form.description} onChange={(value) => update('description', value)} /><FormActions saving={saving} onClose={onClose} /></form></Modal>;
}

function AmeportModuleNotice({ moduleId }) {
  const labels = { apps: 'Aplicaciones', integraciones: 'Integraciones', madurez: 'Madurez digital', backlog: 'Backlog funcional', roadmap: 'Roadmap', riesgos: 'Riesgos y controles', documentacion: 'Documentación y evidencias', administracion: 'Administración' };
  return <section className="module-empty-state"><p className="dashboard-eyebrow">AMEPORT</p><h2>{labels[moduleId] || 'Módulo'}</h2><p>El circuito de carga de procesos y problemas ya está disponible. Este módulo se conecta en la siguiente iteración con la misma clasificación de datos y auditoría.</p><span className="data-status">Próxima iteración</span></section>;
}

function Field({ label, value, onChange, required = false }) { return <label><span>{label}{required ? ' *' : ''}</span><input value={value} onChange={(event) => onChange(event.target.value)} required={required} /></label>; }
function TextAreaField({ label, value, onChange, required = false }) { return <label className="full-field"><span>{label}{required ? ' *' : ''}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} required={required} rows="3" /></label>; }
function SelectField({ label, value, onChange, options, valueKey, labelKey, required = false }) { return <label><span>{label}{required ? ' *' : ''}</span><select value={value} onChange={(event) => onChange(event.target.value)} required={required}><option value="">Seleccionar</option>{options.map((option) => <option key={option[valueKey]} value={option[valueKey]}>{option[labelKey]}</option>)}</select></label>; }
function FormActions({ saving, onClose }) { return <div className="form-actions full-field"><button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button><button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></div>; }
function Modal({ title, children, onClose }) { return <div className="modal-overlay" onClick={onClose}><div className="modal-content ameport-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>✕</button><h2>{title}</h2>{children}</div></div>; }
