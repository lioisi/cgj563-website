import { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const adminToken = password.trim();

    if (adminToken.length < 12) {
      setError('Token invalido. Verifica las credenciales de acceso.');
      setLoading(false);
      return;
    }

    try {
      localStorage.setItem('dashboardToken', adminToken);
      onLogin();
    } catch {
      setError('No se pudo iniciar sesion. Intenta nuevamente.');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔒 Dashboard Protegido</h1>
          <p>Ingresa tu token de acceso para operar el dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Token</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu token"
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
