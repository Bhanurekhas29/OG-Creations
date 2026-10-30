import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ImageField from '../components/ImageField.jsx';
import { useNotice } from '../components/Toast.jsx';

export default function SiteSettings() {
  const { loadBranding } = useAuth();
  const [form, setForm] = useState({ site_name: '', header_logo: '', footer_logo: '' });
  const [headerFile, setHeaderFile] = useState(null);
  const [footerFile, setFooterFile] = useState(null);
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/site-settings').then((r) => setForm((f) => ({ ...f, ...r.data })));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setBusy(true);
    const body = new FormData();
    body.append('site_name', form.site_name);
    if (headerFile) body.append('header_logo', headerFile);
    if (footerFile) body.append('footer_logo', footerFile);
    try {
      const r = await api('admin/site-settings', { method: 'POST', body });
      setForm((f) => ({ ...f, ...r.data }));
      setHeaderFile(null);
      setFooterFile(null);
      setMsg('Settings saved.');
      loadBranding();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h3>Site Settings</h3>

      <label className="field">
        <span>Website name</span>
        <input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} required />
      </label>
      <ImageField label="Header logo" current={form.header_logo} file={headerFile} onChange={setHeaderFile} />
      <ImageField label="Footer logo" current={form.footer_logo} file={footerFile} onChange={setFooterFile} />
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
