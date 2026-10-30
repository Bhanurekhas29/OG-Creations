import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useNotice } from '../components/Toast.jsx';

const LIMITS = { meta_title: 120, meta_description: 320, meta_keywords: 500 };

export default function Seo() {
  const [form, setForm] = useState({ meta_title: '', meta_description: '', meta_keywords: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/seo').then((r) => setForm((f) => ({ ...f, ...r.data })));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      const r = await api('admin/seo', { method: 'POST', body: form });
      setForm((f) => ({ ...f, ...r.data }));
      setMsg('SEO settings saved.');
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors || {});
    }
    setBusy(false);
  };

  const counter = (k) => (
    <small className="counter">{form[k].length}/{LIMITS[k]}</small>
  );

  return (
    <form className="panel" onSubmit={submit}>
      <h3>SEO</h3>

      <label className="field">
        <span>Meta title {counter('meta_title')}</span>
        <input value={form.meta_title} onChange={set('meta_title')} maxLength={LIMITS.meta_title} />
        {fieldErrors.meta_title && <em className="field-error">{fieldErrors.meta_title}</em>}
      </label>
      <label className="field">
        <span>Meta description {counter('meta_description')}</span>
        <textarea rows={4} value={form.meta_description} onChange={set('meta_description')} maxLength={LIMITS.meta_description} />
        {fieldErrors.meta_description && <em className="field-error">{fieldErrors.meta_description}</em>}
      </label>
      <label className="field">
        <span>Meta keywords (comma separated) {counter('meta_keywords')}</span>
        <textarea rows={3} value={form.meta_keywords} onChange={set('meta_keywords')} maxLength={LIMITS.meta_keywords} />
        {fieldErrors.meta_keywords && <em className="field-error">{fieldErrors.meta_keywords}</em>}
      </label>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
