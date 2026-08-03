import { useMemo, useState } from 'react';
import { useAPI, callAPI } from '../hooks/useAPI';
import './InternalApps.css';

const expenseCategories = ['Alimentos', 'Transporte', 'Hogar', 'Salud', 'Educación', 'Servicios', 'Ocio', 'General'];

export default function InternalApps() {
  const [activeSubTab, setActiveSubTab] = useState('users');

  return (
    <div className="internal-apps-container">
      <div className="internal-apps-header">
        <h2>Aplicaciones Internas</h2>
        <p>Administración de usuarios y apps operativas internas.</p>
      </div>

      <div className="internal-subtabs">
        <button
          className={`tab-button ${activeSubTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('users')}
        >
          Usuarios
        </button>
        <button
          className={`tab-button ${activeSubTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('expenses')}
        >
          Gastos Personales
        </button>
      </div>

      {activeSubTab === 'users' && <InternalUsersAdmin />}
      {activeSubTab === 'expenses' && <PersonalExpensesApp />}
    </div>
  );
}

function InternalUsersAdmin() {
  const { data: users, loading, error } = useAPI('internal_users');
  const [formData, setFormData] = useState({ nombre: '', email: '', rol: 'usuario' });
  const [saving, setSaving] = useState(false);

  const safeUsers = Array.isArray(users) ? users : [];

  const handleCreate = async () => {
    if (!formData.nombre || !formData.email) {
      alert('Completa nombre y email');
      return;
    }

    setSaving(true);
    try {
      await callAPI('internal_users', 'POST', null, formData);
      alert('Usuario creado');
      setFormData({ nombre: '', email: '', rol: 'usuario' });
      window.location.reload();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await callAPI('internal_users', 'PUT', user.id, { activo: Number(user.activo) ? 0 : 1 });
      window.location.reload();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Eliminar usuario ${user.nombre}?`)) return;

    try {
      await callAPI('internal_users', 'DELETE', user.id);
      window.location.reload();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="dashboard-loading">Cargando usuarios...</div>;
  if (error) return <div className="dashboard-error">Error: {error}</div>;

  return (
    <div className="internal-section-grid">
      <div className="internal-card">
        <h3>Alta de usuario interno</h3>
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Nombre y apellido"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="usuario@empresa.com"
          />
        </div>

        <div className="form-group">
          <label>Rol</label>
          <select
            value={formData.rol}
            onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
          >
            <option value="usuario">Usuario</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button className="btn-primary" disabled={saving} onClick={handleCreate}>
          {saving ? 'Guardando...' : 'Crear usuario'}
        </button>
      </div>

      <div className="internal-card">
        <h3>Usuarios registrados ({safeUsers.length})</h3>
        {safeUsers.length === 0 ? (
          <p className="empty-state">Todavía no hay usuarios internos.</p>
        ) : (
          <div className="internal-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {safeUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nombre}</td>
                    <td>{user.email}</td>
                    <td>{user.rol}</td>
                    <td>{Number(user.activo) ? 'Activo' : 'Inactivo'}</td>
                    <td className="row-actions">
                      <button className="btn-ghost" onClick={() => handleToggleActive(user)}>
                        {Number(user.activo) ? 'Desactivar' : 'Activar'}
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(user)}>
                        Eliminar
                      </button>
                    </td>
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

function PersonalExpensesApp() {
  const { data: users, loading: loadingUsers, error: usersError } = useAPI('internal_users');
  const { data: expenses, loading: loadingExpenses, error: expensesError } = useAPI('gastos_personales');

  const safeUsers = useMemo(() => (Array.isArray(users) ? users : []), [users]);
  const safeExpenses = useMemo(() => (Array.isArray(expenses) ? expenses : []), [expenses]);

  const [selectedUserId, setSelectedUserId] = useState('all');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    fecha: new Date().toISOString().slice(0, 10),
    concepto: '',
    categoria: 'General',
    monto: '',
    metodo_pago: 'Efectivo',
    notas: ''
  });

  const filteredExpenses = useMemo(() => {
    if (selectedUserId === 'all') return safeExpenses;
    return safeExpenses.filter((item) => Number(item.user_id) === Number(selectedUserId));
  }, [safeExpenses, selectedUserId]);

  const totalAmount = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + Number(item.monto || 0), 0),
    [filteredExpenses]
  );

  const handleCreate = async () => {
    if (!formData.user_id || !formData.fecha || !formData.concepto || !formData.monto) {
      alert('Completa usuario, fecha, concepto y monto');
      return;
    }

    setSaving(true);
    try {
      await callAPI('gastos_personales', 'POST', null, {
        ...formData,
        user_id: Number(formData.user_id),
        monto: Number(formData.monto)
      });
      alert('Gasto registrado');
      setFormData({
        user_id: formData.user_id,
        fecha: new Date().toISOString().slice(0, 10),
        concepto: '',
        categoria: 'General',
        monto: '',
        metodo_pago: 'Efectivo',
        notas: ''
      });
      window.location.reload();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('¿Eliminar gasto?')) return;

    try {
      await callAPI('gastos_personales', 'DELETE', expenseId);
      window.location.reload();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loadingUsers || loadingExpenses) return <div className="dashboard-loading">Cargando gastos...</div>;
  if (usersError) return <div className="dashboard-error">Error usuarios: {usersError}</div>;
  if (expensesError) return <div className="dashboard-error">Error gastos: {expensesError}</div>;

  return (
    <div className="internal-section-grid">
      <div className="internal-card">
        <h3>Nuevo gasto personal</h3>

        <div className="form-group">
          <label>Usuario</label>
          <select
            value={formData.user_id}
            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
          >
            <option value="">Seleccionar usuario</option>
            {safeUsers.filter((u) => Number(u.activo)).map((user) => (
              <option key={user.id} value={user.id}>{user.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Fecha</label>
          <input
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Concepto</label>
          <input
            type="text"
            value={formData.concepto}
            onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
            placeholder="Ej: Supermercado"
          />
        </div>

        <div className="form-group">
          <label>Categoría</label>
          <select
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
          >
            {expenseCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Monto</label>
          <input
            type="number"
            step="0.01"
            value={formData.monto}
            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Método de pago</label>
          <input
            type="text"
            value={formData.metodo_pago}
            onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
            placeholder="Efectivo, Débito, Crédito..."
          />
        </div>

        <div className="form-group">
          <label>Notas</label>
          <textarea
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            placeholder="Notas opcionales"
          />
        </div>

        <button className="btn-primary" disabled={saving} onClick={handleCreate}>
          {saving ? 'Guardando...' : 'Registrar gasto'}
        </button>
      </div>

      <div className="internal-card">
        <div className="expenses-topbar">
          <h3>Gastos registrados ({filteredExpenses.length})</h3>
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
            <option value="all">Todos los usuarios</option>
            {safeUsers.map((user) => (
              <option key={user.id} value={user.id}>{user.nombre}</option>
            ))}
          </select>
        </div>

        <div className="summary-box">
          Total visible: <strong>${totalAmount.toFixed(2)}</strong>
        </div>

        {filteredExpenses.length === 0 ? (
          <p className="empty-state">No hay gastos para mostrar.</p>
        ) : (
          <div className="internal-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Concepto</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((item) => (
                  <tr key={item.id}>
                    <td>{item.fecha}</td>
                    <td>{item.usuario_nombre}</td>
                    <td>{item.concepto}</td>
                    <td>{item.categoria}</td>
                    <td>${Number(item.monto).toFixed(2)}</td>
                    <td>
                      <button className="btn-danger" onClick={() => handleDelete(item.id)}>
                        Eliminar
                      </button>
                    </td>
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
