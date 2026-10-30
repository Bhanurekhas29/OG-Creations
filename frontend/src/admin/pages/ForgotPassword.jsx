import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { api } from '../api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const r = await api('auth/forgot-password', { method: 'POST', body: { email } });
      setMsg(r.message);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <AuthShell title="Forgot password" subtitle="Enter your email and we'll send you a reset link.">
      {msg ? (
        <div className="alert alert-ok">{msg}</div>
      ) : (
        <form onSubmit={submit}>
          {error && <div className="alert alert-error">{error}</div>}
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
          </label>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <div className="auth-row center">
        <Link to="/admin/login">← Back to sign in</Link>
      </div>
    </AuthShell>
  );
}
