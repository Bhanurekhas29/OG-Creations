import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import ImageField from '../components/ImageField.jsx';
import { useNotice, useConfirm } from '../components/Toast.jsx';

const EMPTY = { id: null, title: '', category: '', description: '', video_url: '', thumbnail: '', is_active: true };

function HeaderForm({ onSaved }) {
  const [form, setForm] = useState({ works_eyebrow: '', works_heading: '', works_categories: '', works_intro: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/works-header').then((r) => setForm((f) => ({ ...f, ...r.data })));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      const r = await api('admin/works-header', { method: 'POST', body: form });
      setForm((f) => ({ ...f, ...r.data }));
      setMsg('Heading and categories saved.');
      onSaved(r.data.works_categories.split('\n').filter(Boolean));
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  const err = (k) => fieldErrors[k] && <em className="field-error">{fieldErrors[k]}</em>;

  return (
    <form className="panel panel-wide" onSubmit={submit}>
      <h3>Section heading &amp; categories</h3>
      <div className="grid-2">
        <label className="field">
          <span>Small heading</span>
          <input value={form.works_eyebrow} onChange={(e) => setForm({ ...form, works_eyebrow: e.target.value })} />
          {err('works_eyebrow')}
        </label>
        <label className="field">
          <span>Main heading</span>
          <input value={form.works_heading} onChange={(e) => setForm({ ...form, works_heading: e.target.value })} required />
          {err('works_heading')}
        </label>
      </div>
      <label className="field">
          <span>Intro text (under the heading)</span>
          <textarea rows={3} value={form.works_intro} onChange={(e) => setForm({ ...form, works_intro: e.target.value })} />
          {fieldErrors.works_intro && <em className="field-error">{fieldErrors.works_intro}</em>}
        </label>
      <label className="field">
        <span>Filter categories — one per line (shown as tabs after “All”)</span>
        <textarea rows={5} value={form.works_categories} onChange={(e) => setForm({ ...form, works_categories: e.target.value })} />
        {err('works_categories')}
      </label>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function Works() {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoInfo, setVideoInfo] = useState({ enabled: false, max_mb: 30 });
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api('admin/works').then((r) => setItems(r.data)), []);
  useEffect(() => {
    load();
    api('admin/video-upload-info').then((r) => setVideoInfo(r.data)).catch(() => {});
    api('admin/works-header').then((r) => setCategories(r.data.works_categories.split('\n').filter(Boolean)));
  }, [load]);

  const open = (item) => {
    setMsg('');
    setError('');
    setFieldErrors({});
    setFile(null);
    setVideoFile(null);
    setForm(item ? { ...item, is_active: !!item.is_active } : { ...EMPTY, category: categories[0] || '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setBusy(true);
    const body = new FormData();
    body.append('title', form.title);
    body.append('category', form.category);
    body.append('description', form.description || '');
    body.append('video_url', form.video_url);
    body.append('is_active', form.is_active ? '1' : '0');
    if (file) body.append('thumbnail', file);
    if (videoFile) body.append('video_file', videoFile);
    try {
      const editing = !!form.id;
      await api(editing ? `admin/works?id=${form.id}` : 'admin/works', { method: 'POST', body });
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
      await api(`admin/works?id=${item.id}`, { method: 'DELETE' });
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
      await api('admin/works-order', { method: 'POST', body: { ids: next.map((i) => i.id) } });
      setMsg('Order updated. The first project is shown large on the website.');
    } catch (ex) {
      setError(ex.message);
      load();
    }
  };

  const err = (k) => fieldErrors[k] && <em className="field-error">{fieldErrors[k]}</em>;
  // Keep a project's saved category selectable even if it was removed from the list.
  const options = form && form.category && !categories.includes(form.category) ? [...categories, form.category] : categories;

  return (
    <div className="stack">
      {form ? (
        <form className="panel panel-wide" onSubmit={submit}>
          <h3>{form.id ? 'Edit project' : 'Add project'}</h3>
          <div className="grid-2">
            <label className="field">
              <span>Project title</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
              {err('title')}
            </label>
            <label className="field">
              <span>Category</span>
              <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">— None —</option>
                {options.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {err('category')}
            </label>
          </div>
          <label className="field">
            <span>Short description (shown on the project card)</span>
            <textarea rows={2} maxLength={255} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {err('description')}
          </label>
          <label className="field">
            <span>Video link (YouTube, Vimeo or a direct .mp4 link)</span>
            <input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" />
            {err('video_url')}
          </label>
          {videoInfo.enabled && (
            <label className="field">
              <span>Or upload a video file (MP4 or WebM, max {videoInfo.max_mb} MB)</span>
              <input
                type="file"
                accept="video/mp4,video/webm"
                onChange={(e) => {
                  const f = e.target.files[0] || null;
                  if (f && f.size > videoInfo.max_mb * 1024 * 1024) {
                    setError(`That video is ${(f.size / 1048576).toFixed(1)} MB. The limit is ${videoInfo.max_mb} MB.`);
                    e.target.value = '';
                    setVideoFile(null);
                    return;
                  }
                  setError('');
                  setVideoFile(f);
                }}
              />
              {form.video_url.startsWith('/media/') && !videoFile && <small>An uploaded video is saved for this project. Choose a new file to replace it, or paste a link above to switch to a link.</small>}
              {err('video_file')}
            </label>
          )}
          <ImageField label="Thumbnail image" current={form.thumbnail} file={file} onChange={setFile} />
          <p className="hint">Use a wide landscape image (16:9, e.g. 1600×900). Visitors click the thumbnail to watch the video.</p>
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
            <h3>Featured projects</h3>
            <button className="btn btn-primary" onClick={() => open(null)}><Plus size={16} /> Add project</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Order</th><th>Thumbnail</th><th>Title</th><th>Category</th><th>Video</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id}>
                    <td>
                      <select className="order-select" value={i + 1} onChange={(e) => moveTo(i, Number(e.target.value))} aria-label={`Order for ${it.title}`}>
                        {items.map((_, n) => <option key={n} value={n + 1}>{n + 1}</option>)}
                      </select>
                    </td>
                    <td>{it.thumbnail ? <img className="thumb thumb-wide" src={it.thumbnail} alt="" /> : <span className="thumb thumb-wide thumb-empty" />}</td>
                    <td><strong>{it.title}</strong></td>
                    <td>{it.category || '—'}</td>
                    <td><span className={`badge ${it.video_url ? 'badge-ok' : 'badge-off'}`}>{it.video_url ? 'Added' : 'None'}</span></td>
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
      <HeaderForm onSaved={setCategories} />
    </div>
  );
}
