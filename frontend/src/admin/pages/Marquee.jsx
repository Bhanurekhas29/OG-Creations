import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useNotice } from '../components/Toast.jsx';

export default function Marquee() {
  const [form, setForm] = useState({ marquee_enabled: true, marquee_items: '', marquee_speed: 30 });
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/marquee').then((r) =>
      setForm({ ...r.data, marquee_enabled: r.data.marquee_enabled === '1', marquee_speed: Number(r.data.marquee_speed) })
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
      await api('admin/marquee', { method: 'POST', body: form });
      setMsg('Scrolling text section saved.');
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h3>Scrolling Text Section</h3>

      <label className="check">
        <input type="checkbox" checked={form.marquee_enabled} onChange={(e) => setForm({ ...form, marquee_enabled: e.target.checked })} />
        <span>Show the scrolling text strip on the website</span>
      </label>

      <label className="field">
        <span>Words — one per line, in the order they scroll (max 20)</span>
        <textarea rows={8} value={form.marquee_items} onChange={(e) => setForm({ ...form, marquee_items: e.target.value })} />
        {err('marquee_items')}
      </label>

      <label className="field">
        <span>Scroll speed — seconds for one full loop (lower is faster)</span>
        <input type="number" min={10} max={120} value={form.marquee_speed} onChange={(e) => setForm({ ...form, marquee_speed: e.target.value })} />
        {err('marquee_speed')}
      </label>

      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
