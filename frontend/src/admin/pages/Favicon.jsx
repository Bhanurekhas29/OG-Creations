import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { applyFavicon } from '../../shared/favicon.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useNotice } from '../components/Toast.jsx';

export default function Favicon() {
  const { loadBranding } = useAuth();
  const [current, setCurrent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/favicon').then((r) => setCurrent(r.data.favicon));
  }, []);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const save = async (body, okMsg) => {
    setMsg('');
    setError('');
    setBusy(true);
    try {
      const r = await api('admin/favicon', { method: 'POST', body });
      setCurrent(r.data.favicon);
      setFile(null);
      applyFavicon(r.data.favicon);
      loadBranding();
      setMsg(okMsg);
    } catch (ex) {
      setError(ex.message);
    }
    setBusy(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!file) return setError('Choose an image first.');
    const body = new FormData();
    body.append('favicon', file);
    save(body, 'Favicon saved. You may need to refresh the tab to see it.');
  };

  const shown = preview || current;

  return (
    <form className="panel" onSubmit={submit}>
      <h3>Favicon</h3>
      <p className="hint">The favicon is the small icon shown in the browser tab, bookmarks and search results.</p>

      <div className="field">
        <span>Favicon image (PNG, ICO, SVG, JPG or WEBP, max 2 MB)</span>
        <div className="logo-row">
          {shown ? <img src={shown} alt="Favicon preview" /> : <span className="favicon-empty">None set</span>}
          <input type="file" accept="image/png,image/x-icon,image/vnd.microsoft.icon,.ico,image/svg+xml,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files[0] || null)} />
        </div>
      </div>
      <p className="hint">Use a square image, at least 64×64 pixels (512×512 is ideal). A simple, bold logo mark works best at such a small size.</p>

      <div className="btn-row">
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save favicon'}</button>
        {current && (
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => save({ remove: true }, 'Favicon removed. The default icon is used.')}>
            Remove favicon
          </button>
        )}
      </div>
    </form>
  );
}
