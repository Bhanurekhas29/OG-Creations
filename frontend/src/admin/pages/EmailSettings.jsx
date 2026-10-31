import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useNotice } from '../components/Toast.jsx';

export default function EmailSettings() {
  const [form, setForm] = useState({
    mail_from_name: '', mail_from_email: '',
    smtp_host: '', smtp_port: '587', smtp_secure: 'tls', smtp_user: '', smtp_pass: '',
  });
  const [saved, setSaved] = useState({ smtp_pass_set: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [testing, setTesting] = useState(false);

  const load = (d) => {
    const { smtp_pass_set, ...rest } = d;
    setForm((f) => ({ ...f, ...rest, smtp_pass: '' }));
    setSaved({ smtp_pass_set });
  };

  useEffect(() => {
    api('admin/email-settings').then((r) => load(r.data));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const err = (k) => fieldErrors[k] && <em className="field-error">{fieldErrors[k]}</em>;

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      const r = await api('admin/email-settings', { method: 'POST', body: form });
      load(r.data);
      setMsg('Email settings saved.');
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  const sendTest = async () => {
    setMsg('');
    setError('');
    setFieldErrors({});
    setTesting(true);
    try {
      const r = await api('admin/email-test', { method: 'POST', body: { to: testTo } });
      setMsg(r.message);
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setTesting(false);
  };

  return (
    <>
      <form className="panel" onSubmit={submit}>
        <h3>Email Settings</h3>
        <p className="muted">The website sends email (contact-form notifications and password-reset links) through your SMTP mail account.</p>

        <label className="field">
          <span>From name</span>
          <input value={form.mail_from_name} onChange={set('mail_from_name')} maxLength={80} />
          {err('mail_from_name')}
        </label>
        <label className="field">
          <span>From email</span>
          <input type="email" value={form.mail_from_email} onChange={set('mail_from_email')} />
          <small>With Gmail this must be the same address as the username.</small>
          {err('mail_from_email')}
        </label>

        <>
            <button type="button" className="btn" style={{ marginBottom: '1rem' }}
              onClick={() => setForm({ ...form, smtp_host: 'smtp.gmail.com', smtp_port: '587', smtp_secure: 'tls', smtp_user: form.smtp_user || form.mail_from_email })}>
              Fill in Gmail settings
            </button>
            <label className="field">
              <span>SMTP host</span>
              <input value={form.smtp_host} onChange={set('smtp_host')} placeholder="smtp.gmail.com" />
              {err('smtp_host')}
            </label>
            <label className="field">
              <span>SMTP port</span>
              <input type="number" value={form.smtp_port} onChange={set('smtp_port')} />
              {err('smtp_port')}
            </label>
            <label className="field">
              <span>Security</span>
              <select value={form.smtp_secure} onChange={set('smtp_secure')}>
                <option value="tls">TLS / STARTTLS (port 587)</option>
                <option value="ssl">SSL (port 465)</option>
                <option value="none">None</option>
              </select>
              {err('smtp_secure')}
            </label>
            <label className="field">
              <span>SMTP username</span>
              <input value={form.smtp_user} onChange={set('smtp_user')} autoComplete="off" />
              {err('smtp_user')}
            </label>
            <label className="field">
              <span>Gmail App Password {saved.smtp_pass_set && <b>(already saved)</b>}</span>
              <input type="password" value={form.smtp_pass} onChange={set('smtp_pass')} autoComplete="new-password"
                placeholder={saved.smtp_pass_set ? 'Leave empty to keep the saved password' : ''} />
            </label>
          </>

        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>

      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <h3>Send a test email</h3>
        <p className="muted">Save your settings first, then send a test to check that they work.</p>
        <label className="field">
          <span>Send to</span>
          <input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" />
          {err('to')}
        </label>
        <button type="button" className="btn" onClick={sendTest} disabled={testing || !testTo}>
          {testing ? 'Sending…' : 'Send test email'}
        </button>
      </div>
    </>
  );
}
