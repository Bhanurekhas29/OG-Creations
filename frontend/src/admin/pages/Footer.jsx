import { useEffect, useState } from 'react';
import { api } from '../api.js';
import LinkListEditor from '../components/LinkListEditor.jsx';
import { useNotice } from '../components/Toast.jsx';

const EMPTY = {
  footer_tagline: '', footer_description: '', footer_copyright: '',
  social_instagram: '', social_facebook: '', social_youtube: '',
  footer_navigate: [], footer_services: [],
};

export default function Footer() {
  const [form, setForm] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/footer').then((r) => setForm({ ...EMPTY, ...r.data }));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const err = (k) => fieldErrors[k] && <em className="field-error">{fieldErrors[k]}</em>;

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      const r = await api('admin/footer', { method: 'POST', body: form });
      setForm({ ...EMPTY, ...r.data });
      setMsg('Footer saved.');
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  return (
    <form className="panel panel-wide" onSubmit={submit}>
      <h3>Footer Section</h3>
      <p className="hint">The footer logo and website name come from <strong>Site Settings</strong>. The phone, email and address in the Contact column come from the <strong>Contact Section</strong>. The WhatsApp icon uses the number set in <strong>Floating Buttons</strong>.</p>

      <label className="field">
        <span>Line under the website name</span>
        <input value={form.footer_tagline} onChange={set('footer_tagline')} />
        {err('footer_tagline')}
      </label>
      <label className="field">
        <span>Short description</span>
        <textarea rows={2} value={form.footer_description} onChange={set('footer_description')} />
        {err('footer_description')}
      </label>
      <label className="field">
        <span>Copyright text (shown after “© year website name.”)</span>
        <input value={form.footer_copyright} onChange={set('footer_copyright')} />
        {err('footer_copyright')}
      </label>

      <h3 className="sub-h">Social media links</h3>
      <p className="hint">Paste the full page link. Leave a field empty to hide that icon.</p>
      <label className="field">
        <span>Instagram</span>
        <input value={form.social_instagram} onChange={set('social_instagram')} placeholder="https://www.instagram.com/your-page" />
        {err('social_instagram')}
      </label>
      <label className="field">
        <span>Facebook</span>
        <input value={form.social_facebook} onChange={set('social_facebook')} placeholder="https://www.facebook.com/your-page" />
        {err('social_facebook')}
      </label>
      <label className="field">
        <span>YouTube</span>
        <input value={form.social_youtube} onChange={set('social_youtube')} placeholder="https://www.youtube.com/@your-channel" />
        {err('social_youtube')}
      </label>

      <h3 className="sub-h">Footer links</h3>
      <LinkListEditor title="“Navigate” column" links={form.footer_navigate} onChange={(l) => setForm({ ...form, footer_navigate: l })} />
      {err('footer_navigate')}
      <LinkListEditor title="“Services” column" links={form.footer_services} onChange={(l) => setForm({ ...form, footer_services: l })} placeholder="#services" />
      {err('footer_services')}
      <p className="hint">A link can be a section (#services), a page (/page) or a full address (https://…).</p>

      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
