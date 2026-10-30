import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ImageField from '../components/ImageField.jsx';
import { useNotice } from '../components/Toast.jsx';

const EMPTY = {
  contact_eyebrow: '', contact_heading: '', contact_subheading: '', contact_phone: '', contact_email: '',
  contact_address: '', contact_map_embed: '', contact_directions_url: '', contact_bg_image: '',
  contact_notify_email: '', contact_success_message: '',
};

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/contact').then((r) => setForm({ ...EMPTY, ...r.data }));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const err = (k) => fieldErrors[k] && <em className="field-error">{fieldErrors[k]}</em>;

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setFieldErrors({});
    setBusy(true);
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => k !== 'contact_bg_image' && body.append(k, v));
    if (file) body.append('contact_bg_image', file);
    if (removeImage) body.append('remove_bg_image', '1');
    try {
      const r = await api('admin/contact', { method: 'POST', body });
      setForm({ ...EMPTY, ...r.data });
      setFile(null);
      setRemoveImage(false);
      setMsg('Contact section saved.');
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  return (
    <form className="panel panel-wide" onSubmit={submit}>
      <h3>Contact Section</h3>

      <label className="field">
        <span>Small heading</span>
        <input value={form.contact_eyebrow} onChange={set('contact_eyebrow')} />
        {err('contact_eyebrow')}
      </label>
      <div className="grid-2">
        <label className="field">
          <span>Main heading</span>
          <input value={form.contact_heading} onChange={set('contact_heading')} required />
          {err('contact_heading')}
        </label>
        <label className="field">
          <span>Italic line under the heading</span>
          <input value={form.contact_subheading} onChange={set('contact_subheading')} />
          {err('contact_subheading')}
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Phone number shown on the website</span>
          <input value={form.contact_phone} onChange={set('contact_phone')} inputMode="tel" />
          {err('contact_phone')}
        </label>
        <label className="field">
          <span>Email shown on the website</span>
          <input type="email" value={form.contact_email} onChange={set('contact_email')} />
          {err('contact_email')}
        </label>
      </div>
      <label className="field">
        <span>Studio address</span>
        <textarea rows={2} value={form.contact_address} onChange={set('contact_address')} />
        {err('contact_address')}
      </label>

      <label className="field">
        <span>Google Maps embed link (Google Maps → Share → Embed a map → copy the src link)</span>
        <input value={form.contact_map_embed} onChange={set('contact_map_embed')} placeholder="https://www.google.com/maps/embed?pb=…" />
        {err('contact_map_embed')}
      </label>
      <label className="field">
        <span>“Get directions” link (the button on the map)</span>
        <input value={form.contact_directions_url} onChange={set('contact_directions_url')} placeholder="https://www.google.com/maps/dir/…" />
        {err('contact_directions_url')}
      </label>

      <ImageField label="Background photo" current={removeImage ? '' : form.contact_bg_image} file={file} onChange={setFile} />
      <p className="hint">A wide, soft photo (about 1920×900) works best; the form card sits on top of it.</p>
      {form.contact_bg_image && !file && (
        <label className="check">
          <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} />
          <span>Remove the current background photo</span>
        </label>
      )}

      <h3 className="sub-h">Enquiry form</h3>
      <label className="field">
        <span>Send new enquiries to this email address</span>
        <input type="email" value={form.contact_notify_email} onChange={set('contact_notify_email')} required />
        {err('contact_notify_email')}
      </label>
      <label className="field">
        <span>Message shown to the visitor after they submit</span>
        <textarea rows={2} value={form.contact_success_message} onChange={set('contact_success_message')} />
        {err('contact_success_message')}
      </label>
      <p className="hint">Every enquiry is also saved under <strong>Site → Enquiries</strong>, so nothing is lost if an email doesn't arrive.</p>

      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
