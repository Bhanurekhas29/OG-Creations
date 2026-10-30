import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import ImageField from '../components/ImageField.jsx';
import { useNotice, useConfirm } from '../components/Toast.jsx';

const EMPTY = {
  id: null, title: '', tagline: '', lead_actor: '', lead_actress: '', supporting_cast: '',
  release_date: '', status_label: '', image: '', is_active: true,
};

function HeaderForm() {
  const [form, setForm] = useState({ upcoming_heading: '', upcoming_subtitle: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/upcoming-header').then((r) => setForm(r.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      await api('admin/upcoming-header', { method: 'POST', body: form });
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
          <span>Main heading</span>
          <input value={form.upcoming_heading} onChange={(e) => setForm({ ...form, upcoming_heading: e.target.value })} required />
          {fieldErrors.upcoming_heading && <em className="field-error">{fieldErrors.upcoming_heading}</em>}
        </label>
        <label className="field">
          <span>Line under the heading (use · between phrases)</span>
          <input value={form.upcoming_subtitle} onChange={(e) => setForm({ ...form, upcoming_subtitle: e.target.value })} />
          {fieldErrors.upcoming_subtitle && <em className="field-error">{fieldErrors.upcoming_subtitle}</em>}
        </label>
      </div>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save heading'}</button>
    </form>
  );
}

export default function Upcoming() {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api('admin/upcoming').then((r) => setItems(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const open = (item) => {
    setMsg('');
    setError('');
    setFieldErrors({});
    setFile(null);
    setForm(item ? { ...item, is_active: !!item.is_active } : EMPTY);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setBusy(true);
    const body = new FormData();
    ['title', 'tagline', 'lead_actor', 'lead_actress', 'supporting_cast', 'release_date', 'status_label'].forEach((k) => body.append(k, form[k]));
    body.append('is_active', form.is_active ? '1' : '0');
    if (file) body.append('image', file);
    try {
      const editing = !!form.id;
      await api(editing ? `admin/upcoming?id=${form.id}` : 'admin/upcoming', { method: 'POST', body });
      setForm(null);
      setMsg(editing ? 'Project updated.' : 'Project added.');
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
      await api(`admin/upcoming?id=${item.id}`, { method: 'DELETE' });
      setMsg('Project deleted.');
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
      await api('admin/upcoming-order', { method: 'POST', body: { ids: next.map((i) => i.id) } });
      setMsg('Order updated. This is the order of the slides on the website.');
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
          <h3>{form.id ? 'Edit upcoming project' : 'Add upcoming project'}</h3>

          <label className="field">
            <span>Project title</span>
            <input value={form.title} onChange={set('title')} required autoFocus />
            {err('title')}
          </label>
          <label className="field">
            <span>Tagline (press Enter for a new line)</span>
            <textarea rows={2} value={form.tagline} onChange={set('tagline')} />
            {err('tagline')}
          </label>
          <div className="grid-2">
            <label className="field">
              <span>Lead actor</span>
              <input value={form.lead_actor} onChange={set('lead_actor')} />
              {err('lead_actor')}
            </label>
            <label className="field">
              <span>Lead actress</span>
              <input value={form.lead_actress} onChange={set('lead_actress')} />
              {err('lead_actress')}
            </label>
          </div>
          <label className="field">
            <span>Co-actress / supporting cast — one name per line (max 8)</span>
            <textarea rows={4} value={form.supporting_cast} onChange={set('supporting_cast')} />
            {err('supporting_cast')}
          </label>
          <div className="grid-2">
            <label className="field">
              <span>Release date (any text, e.g. Dec 2025)</span>
              <input value={form.release_date} onChange={set('release_date')} />
              {err('release_date')}
            </label>
            <label className="field">
              <span>Status (e.g. In Cinemas, Streaming Soon)</span>
              <input value={form.status_label} onChange={set('status_label')} />
              {err('status_label')}
            </label>
          </div>
          <p className="hint">Leave any field empty to hide it on the website.</p>

          <ImageField label="Project photo" current={form.image} file={file} onChange={setFile} />
          <p className="hint">Use a wide landscape photo (about 3:2, e.g. 1500×1000). It fills the right half of the card.</p>

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
            <h3>Upcoming projects (carousel slides)</h3>
            <button className="btn btn-primary" onClick={() => open(null)}><Plus size={16} /> Add project</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Order</th><th>Photo</th><th>Title</th><th>Release</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id}>
                    <td>
                      <select className="order-select" value={i + 1} onChange={(e) => moveTo(i, Number(e.target.value))} aria-label={`Order for ${it.title}`}>
                        {items.map((_, n) => <option key={n} value={n + 1}>{n + 1}</option>)}
                      </select>
                    </td>
                    <td>{it.image ? <img className="thumb thumb-wide" src={it.image} alt="" /> : <span className="thumb thumb-wide thumb-empty" />}</td>
                    <td><strong>{it.title}</strong></td>
                    <td>{[it.release_date, it.status_label].filter(Boolean).join(' · ') || '—'}</td>
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
