import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useNotice } from '../components/Toast.jsx';

const METHODS = {
  php: 'PHP mail - the simplest. Works only on servers that have a mail service (not on Render\'s free plan).',
  smtp: 'SMTP - use any mail account (Gmail, your domain mail). Not available on Render\'s free plan, which blocks SMTP.',
  brevo: 'Brevo - free web service that sends the mail for you. Works everywhere, including Render\'s free plan.',
};

export default function EmailSettings() {
  const [form, setForm] = useState({
    mail_method: 'php', mail_from_name: '', mail_from_email: '',
    smtp_host: '', smtp_port: '587', smtp_secure: 'tls', smtp_user: '', smtp_pass: '', brevo_key: '',
  });
  const [saved, setSaved] = useState({ smtp_pass_set: false, brevo_key_set: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [testing, setTesting] = useState(false);

  const load = (d) => {
    const { smtp_pass_set, brevo_key_set, ...rest } = d;
    setForm((f) => ({ ...f, ...rest, smtp_pass: '', brevo_key: '' }));
    setSaved({ smtp_pass_set, brevo_key_set });
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
        <p className="muted">Choose how the website sends email: contact-form notifications and password-reset links.</p>

        <label className="field">
          <span>How should emails be sent?</span>
          <select value={form.mail_method} onChange={set('mail_method')}>
            <option value="php">PHP mail</option>
            <option value="smtp">SMTP (Gmail or any mail account)</option>
            <option value="brevo">Brevo (free, works on Render)</option>
          </select>
          <small>{METHODS[form.mail_method]}</small>
          {err('mail_method')}
        </label>

        <label className="field">
          <span>From name</span>
          <input value={form.mail_from_name} onChange={set('mail_from_name')} maxLength={80} />
          {err('mail_from_name')}
        </label>
        <label className="field">
          <span>From email</span>
          <input type="email" value={form.mail_from_email} onChange={set('mail_from_email')} />
          <small>With Gmail or Brevo this must be an address you own / have verified there.</small>
          {err('mail_from_email')}
        </label>

        {form.mail_method === 'smtp' && (
          <>
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
              <span>SMTP password {saved.smtp_pass_set && <b>(already saved)</b>}</span>
              <input type="password" value={form.smtp_pass} onChange={set('smtp_pass')} autoComplete="new-password"
                placeholder={saved.smtp_pass_set ? 'Leave empty to keep the saved password' : ''} />
              <small>For Gmail use host smtp.gmail.com, port 587, TLS, and a Google "App Password".</small>
            </label>
          </>
        )}

        {form.mail_method === 'brevo' && (
          <label className="field">
            <span>Brevo API key {saved.brevo_key_set && <b>(already saved)</b>}</span>
            <input type="password" value={form.brevo_key} onChange={set('brevo_key')} autoComplete="new-password"
              placeholder={saved.brevo_key_set ? 'Leave empty to keep the saved key' : ''} />
            <small>Create a free Brevo account, verify your sender email, then copy an API key (SMTP &amp; API → API Keys).</small>
            {err('brevo_key')}
          </label>
        )}

        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>

      <div className="panel">
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
