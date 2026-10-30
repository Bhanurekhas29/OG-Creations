import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { api } from '../api.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState(token ? '' : 'This reset link is invalid.');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      const r = await api('auth/reset-password', { method: 'POST', body: { token, password } });
      setMsg(r.message);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <AuthShell title="Set a new password" subtitle="Choose a password with at least 8 characters.">
      {msg ? (
        <div className="alert alert-ok">{msg}</div>
      ) : (
        <form onSubmit={submit}>
          {error && <div className="alert alert-error">{error}</div>}
          <label className="field">
            <span>New password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoFocus />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
          </label>
          <button className="btn btn-primary btn-block" disabled={busy || !token}>
            {busy ? 'Saving…' : 'Update password'}
          </button>
        </form>
      )}
      <div className="auth-row center">
        <Link to="/admin/login">← Back to sign in</Link>
      </div>
    </AuthShell>
  );
}
