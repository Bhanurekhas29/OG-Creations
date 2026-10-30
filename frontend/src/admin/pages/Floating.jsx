import { useEffect, useState } from 'react';
import { PhoneCall } from 'lucide-react';
import { api } from '../api.js';
import { WhatsAppIcon } from '../../shared/WhatsAppIcon.jsx';
import { useNotice } from '../components/Toast.jsx';

const EMPTY = { float_call_enabled: true, float_call_number: '', float_wa_enabled: true, float_wa_number: '', float_wa_message: '' };

export default function Floating() {
  const [form, setForm] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/floating').then((r) =>
      setForm({
        ...r.data,
        float_call_enabled: r.data.float_call_enabled === '1',
        float_wa_enabled: r.data.float_wa_enabled === '1',
      })
    );
  }, []);

  const err = (k) => fieldErrors[k] && <em className="field-error">{fieldErrors[k]}</em>;

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      await api('admin/floating', { method: 'POST', body: form });
      setMsg('Floating buttons saved.');
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h3>Floating Buttons</h3>
      <p className="hint">The two round buttons that stay at the right edge of every page on the website, so visitors can call or message you in one tap.</p>

      <fieldset className="slot">
        <legend><PhoneCall size={14} /> Call button</legend>
        <label className="check">
          <input type="checkbox" checked={form.float_call_enabled} onChange={(e) => setForm({ ...form, float_call_enabled: e.target.checked })} />
          <span>Show the call button</span>
        </label>
        <label className="field">
          <span>Phone number to call</span>
          <input value={form.float_call_number} onChange={(e) => setForm({ ...form, float_call_number: e.target.value })} inputMode="tel" placeholder="9884277001" />
          {err('float_call_number')}
        </label>
      </fieldset>

      <fieldset className="slot">
        <legend><WhatsAppIcon size={14} /> WhatsApp button</legend>
        <label className="check">
          <input type="checkbox" checked={form.float_wa_enabled} onChange={(e) => setForm({ ...form, float_wa_enabled: e.target.checked })} />
          <span>Show the WhatsApp button (also used for the WhatsApp icon in the footer)</span>
        </label>
        <label className="field">
          <span>WhatsApp number with country code, no + or spaces</span>
          <input value={form.float_wa_number} onChange={(e) => setForm({ ...form, float_wa_number: e.target.value })} inputMode="numeric" placeholder="919884277001" />
          {err('float_wa_number')}
        </label>
        <label className="field">
          <span>Message that appears ready-typed when a visitor taps the button</span>
          <textarea rows={2} value={form.float_wa_message} onChange={(e) => setForm({ ...form, float_wa_message: e.target.value })} />
          {err('float_wa_message')}
        </label>
      </fieldset>

      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
