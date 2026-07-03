import { useState, useEffect } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Verificar contraseña
    if (password === 'Mohabon') {
      // Guardar token en localStorage
      localStorage.setItem('dashboardToken', 'authenticated');
      onLogin();
    } else {
      setError('❌ Contraseña incorrecta');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔒 Dashboard Protegido</h1>
          <p>Ingresa la contraseña para acceder</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? 'Verificando...' : 'Acceder'}
          </button>
        </form>

        <div className="login-footer">
          <p className="info">Credenciales CGJ563 S.A.</p>
        </div>
      </div>
    </div>
  );
}
