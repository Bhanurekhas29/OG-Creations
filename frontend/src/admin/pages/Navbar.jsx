import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import { useNotice, useConfirm } from '../components/Toast.jsx';

const EMPTY_ITEM = { id: null, label: '', url: '', is_active: true };

function CtaForm() {
  const [form, setForm] = useState({ nav_cta_enabled: true, nav_cta_label: '', nav_cta_url: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/navbar-cta').then((r) =>
      setForm({ ...r.data, nav_cta_enabled: r.data.nav_cta_enabled === '1' })
    );
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      await api('admin/navbar-cta', { method: 'POST', body: form });
      setMsg('Button saved.');
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors || {});
    }
    setBusy(false);
  };

  return (
    <form className="panel panel-wide" onSubmit={submit}>
      <h3>Call-to-action button</h3>
      <label className="check">
        <input type="checkbox" checked={form.nav_cta_enabled} onChange={(e) => setForm({ ...form, nav_cta_enabled: e.target.checked })} />
        <span>Show the button at the right end of the navbar</span>
      </label>
      <div className="grid-2">
        <label className="field">
          <span>Button text</span>
          <input value={form.nav_cta_label} onChange={(e) => setForm({ ...form, nav_cta_label: e.target.value })} required />
          {fieldErrors.nav_cta_label && <em className="field-error">{fieldErrors.nav_cta_label}</em>}
        </label>
        <label className="field">
          <span>Button link</span>
          <input value={form.nav_cta_url} onChange={(e) => setForm({ ...form, nav_cta_url: e.target.value })} placeholder="#contact" required />
          {fieldErrors.nav_cta_url && <em className="field-error">{fieldErrors.nav_cta_url}</em>}
        </label>
      </div>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save button'}</button>
    </form>
  );
}

export default function Navbar() {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api('admin/navbar').then((r) => setItems(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const open = (item) => {
    setMsg('');
    setError('');
    setFieldErrors({});
    setForm(item ? { ...item, is_active: !!item.is_active } : EMPTY_ITEM);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      const editing = !!form.id;
      await api(editing ? `admin/navbar?id=${form.id}` : 'admin/navbar', { method: editing ? 'PUT' : 'POST', body: form });
      setForm(null);
      setMsg(editing ? 'Menu item updated.' : 'Menu item added.');
      load();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors || {});
    }
    setBusy(false);
  };

  const remove = async (item) => {
    if (!await confirm(`Delete “${item.label}” from the menu?`)) return;
    setMsg('');
    setError('');
    try {
      await api(`admin/navbar?id=${item.id}`, { method: 'DELETE' });
      setMsg('Menu item deleted.');
      load();
    } catch (err) {
      setError(err.message);
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
      await api('admin/navbar-order', { method: 'POST', body: { ids: next.map((i) => i.id) } });
      setMsg('Order updated.');
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  const err = (k) => fieldErrors[k] && <em className="field-error">{fieldErrors[k]}</em>;

  return (
    <div className="stack">
      {form ? (
        <form className="panel panel-wide" onSubmit={submit}>
          <h3>{form.id ? 'Edit menu item' : 'Add menu item'}</h3>
          <div className="grid-2">
            <label className="field">
              <span>Label</span>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required autoFocus />
              {err('label')}
            </label>
            <label className="field">
              <span>Link</span>
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="#about, /page or https://…" required />
              {err('url')}
            </label>
          </div>
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
            <h3>Menu items</h3>
            <button className="btn btn-primary" onClick={() => open(null)}><Plus size={16} /> Add item</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Order</th><th>Label</th><th>Link</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id}>
                    <td>
                      <select className="order-select" value={i + 1} onChange={(e) => moveTo(i, Number(e.target.value))} aria-label={`Order for ${it.label}`}>
                        {items.map((_, n) => <option key={n} value={n + 1}>{n + 1}</option>)}
                      </select>
                    </td>
                    <td>{it.label}</td>
                    <td><code>{it.url}</code></td>
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
      <CtaForm />
    </div>
  );
}
