import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import ImageField from '../components/ImageField.jsx';
import { useNotice, useConfirm } from '../components/Toast.jsx';

const EMPTY = { id: null, title: '', description: '', image: '', is_active: true };

function HeaderForm() {
  const [form, setForm] = useState({ services_eyebrow: '', services_heading: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/services-header').then((r) => setForm(r.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      await api('admin/services-header', { method: 'POST', body: form });
      setMsg('Heading saved.');
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  return (
    <form className="panel panel-wide" onSubmit={submit}>
      <h3>Section heading</h3>
      <div className="grid-2">
        <label className="field">
          <span>Small heading</span>
          <input value={form.services_eyebrow} onChange={(e) => setForm({ ...form, services_eyebrow: e.target.value })} />
          {fieldErrors.services_eyebrow && <em className="field-error">{fieldErrors.services_eyebrow}</em>}
        </label>
        <label className="field">
          <span>Main heading</span>
          <input value={form.services_heading} onChange={(e) => setForm({ ...form, services_heading: e.target.value })} required />
          {fieldErrors.services_heading && <em className="field-error">{fieldErrors.services_heading}</em>}
        </label>
      </div>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save heading'}</button>
    </form>
  );
}

export default function Services() {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api('admin/services').then((r) => setItems(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const open = (item) => {
    setMsg('');
    setError('');
    setFieldErrors({});
    setFile(null);
    setForm(item ? { ...item, is_active: !!item.is_active } : EMPTY);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setBusy(true);
    const body = new FormData();
    body.append('title', form.title);
    body.append('description', form.description);
    body.append('is_active', form.is_active ? '1' : '0');
    if (file) body.append('image', file);
    try {
      const editing = !!form.id;
      await api(editing ? `admin/services?id=${form.id}` : 'admin/services', { method: 'POST', body });
      setForm(null);
      setMsg(editing ? 'Service updated.' : 'Service added.');
      load();
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  const remove = async (item) => {
    if (!await confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setMsg('');
    setError('');
    try {
      await api(`admin/services?id=${item.id}`, { method: 'DELETE' });
      setMsg('Service deleted.');
      load();
    } catch (ex) {
      setError(ex.message);
    }
  };

  // Moves the item at `index` to 1-based position `position`, shifting the others.
  const moveTo = async (index, position) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(position - 1, 0, item);
    setItems(next);
    setMsg('');
    setError('');
    try {
      await api('admin/services-order', { method: 'POST', body: { ids: next.map((i) => i.id) } });
      setMsg('Order updated.');
    } catch (ex) {
      setError(ex.message);
      load();
    }
  };

  const err = (k) => fieldErrors[k] && <em className="field-error">{fieldErrors[k]}</em>;

  return (
    <div className="stack">
      {form ? (
        <form className="panel panel-wide" onSubmit={submit}>
          <h3>{form.id ? 'Edit service' : 'Add service'}</h3>
          <label className="field">
            <span>Title</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
            {err('title')}
          </label>
          <label className="field">
            <span>Short description</span>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {err('description')}
          </label>
          <ImageField label="Card photo" current={form.image} file={file} onChange={setFile} />
          <p className="hint">Use a portrait photo (about 4:5, e.g. 800×1000). The title and description sit over the bottom of the photo.</p>
          <label className="check">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <span>Visible on the website</span>
          </label>
          <div className="btn-row">
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="panel panel-wide">
          <div className="panel-head">
            <h3>Services</h3>
            <button className="btn btn-primary" onClick={() => open(null)}><Plus size={16} /> Add service</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Order</th><th>Photo</th><th>Title</th><th>Description</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id}>
                    <td>
                      <select className="order-select" value={i + 1} onChange={(e) => moveTo(i, Number(e.target.value))} aria-label={`Order for ${it.title}`}>
                        {items.map((_, n) => <option key={n} value={n + 1}>{n + 1}</option>)}
                      </select>
                    </td>
                    <td>{it.image ? <img className="thumb" src={it.image} alt="" /> : <span className="thumb thumb-empty" />}</td>
                    <td><strong>{it.title}</strong></td>
                    <td className="cell-desc">{it.description}</td>
                    <td><span className={`badge ${it.is_active ? 'badge-ok' : 'badge-off'}`}>{it.is_active ? 'Visible' : 'Hidden'}</span></td>
                    <td className="actions">
                      <button className="icon-btn" onClick={() => open(it)} aria-label="Edit"><Pencil size={16} /></button>
                      <button className="icon-btn danger" onClick={() => remove(it)} aria-label="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <HeaderForm />
    </div>
  );
}
