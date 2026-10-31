import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import { iconFor } from '../../shared/processIcons.js';
import { useNotice, useConfirm } from '../components/Toast.jsx';

const EMPTY = { id: null, title: '', description: '', icon: 'Star', is_active: true };

function HeaderForm() {
  const [form, setForm] = useState({ process_eyebrow: '', process_heading: '', process_intro: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/process-header').then((r) => setForm((f) => ({ ...f, ...r.data })));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      await api('admin/process-header', { method: 'POST', body: form });
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
          <input value={form.process_eyebrow} onChange={(e) => setForm({ ...form, process_eyebrow: e.target.value })} />
          {fieldErrors.process_eyebrow && <em className="field-error">{fieldErrors.process_eyebrow}</em>}
        </label>
        <label className="field">
          <span>Main heading</span>
          <input value={form.process_heading} onChange={(e) => setForm({ ...form, process_heading: e.target.value })} required />
          {fieldErrors.process_heading && <em className="field-error">{fieldErrors.process_heading}</em>}
        </label>
      </div>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save heading'}</button>
    </form>
  );
}

export default function Process() {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [icons, setIcons] = useState([]);
  const [form, setForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api('admin/process').then((r) => { setItems(r.data); setIcons(r.icons); }), []);
  useEffect(() => { load(); }, [load]);

  const open = (item) => {
    setMsg('');
    setError('');
    setFieldErrors({});
    setForm(item ? { ...item, is_active: !!item.is_active } : EMPTY);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      const editing = !!form.id;
      await api(editing ? `admin/process?id=${form.id}` : 'admin/process', { method: editing ? 'PUT' : 'POST', body: form });
      setForm(null);
      setMsg(editing ? 'Step updated.' : 'Step added.');
      load();
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  const remove = async (item) => {
    if (!await confirm(`Delete the “${item.title}” step?`)) return;
    setMsg('');
    setError('');
    try {
      await api(`admin/process?id=${item.id}`, { method: 'DELETE' });
      setMsg('Step deleted.');
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
      await api('admin/process-order', { method: 'POST', body: { ids: next.map((i) => i.id) } });
      setMsg('Order updated. Step numbers on the website follow this order.');
    } catch (ex) {
      setError(ex.message);
      load();
    }
  };

  const err = (k) => fieldErrors[k] && <em className="field-error">{fieldErrors[k]}</em>;
  const FormIcon = form ? iconFor(form.icon) : null;

  return (
    <div className="stack">
      {form ? (
        <form className="panel panel-wide" onSubmit={submit}>
          <h3>{form.id ? 'Edit step' : 'Add step'}</h3>
          <div className="grid-2">
            <label className="field">
              <span>Title</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
              {err('title')}
            </label>
            <label className="field">
              <span>Icon</span>
              <div className="icon-pick">
                <span className="icon-preview"><FormIcon size={20} /></span>
                <select className="select" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                  {icons.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              {err('icon')}
            </label>
          </div>
          <label className="field">
            <span>Short description</span>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {err('description')}
          </label>
          <label className="check">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <span>Visible on the website</span>
          </label>
          <div className="btn-row">
            <label className="field">
          <span>Intro text (under the heading)</span>
          <textarea rows={3} value={form.process_intro} onChange={(e) => setForm({ ...form, process_intro: e.target.value })} />
          {fieldErrors.process_intro && <em className="field-error">{fieldErrors.process_intro}</em>}
        </label>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="panel panel-wide">
          <div className="panel-head">
            <h3>Process steps</h3>
            <button className="btn btn-primary" onClick={() => open(null)}><Plus size={16} /> Add step</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Order</th><th>Icon</th><th>Title</th><th>Description</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {items.map((it, i) => {
                  const Icon = iconFor(it.icon);
                  return (
                    <tr key={it.id}>
                      <td>
                        <select className="order-select" value={i + 1} onChange={(e) => moveTo(i, Number(e.target.value))} aria-label={`Order for ${it.title}`}>
                          {items.map((_, n) => <option key={n} value={n + 1}>{n + 1}</option>)}
                        </select>
                      </td>
                      <td><span className="icon-preview"><Icon size={18} /></span></td>
                      <td><strong>{it.title}</strong></td>
                      <td className="cell-desc">{it.description}</td>
                      <td><span className={`badge ${it.is_active ? 'badge-ok' : 'badge-off'}`}>{it.is_active ? 'Visible' : 'Hidden'}</span></td>
                      <td className="actions">
                        <button className="icon-btn" onClick={() => open(it)} aria-label="Edit"><Pencil size={16} /></button>
                        <button className="icon-btn danger" onClick={() => remove(it)} aria-label="Delete"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <HeaderForm />
    </div>
  );
}
