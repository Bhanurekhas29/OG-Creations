import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ImageField from '../components/ImageField.jsx';
import { useNotice } from '../components/Toast.jsx';

const EMPTY = {
  studio_eyebrow: '', studio_heading: '', studio_heading_accent: '', studio_text1: '', studio_text2: '',
  studio_btn_label: '', studio_btn_url: '', studio_image1: '', studio_image2: '', studio_image3: '',
};
const IMAGES = [
  ['studio_image1', 'Large photo (top left)'],
  ['studio_image2', 'Tall photo (top right)'],
  ['studio_image3', 'Wide photo (bottom, overlapping)'],
];

export default function Studio() {
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/studio').then((r) => setForm({ ...EMPTY, ...r.data }));
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
    Object.entries(form).forEach(([k, v]) => !k.startsWith('studio_image') && body.append(k, v));
    Object.entries(files).forEach(([k, f]) => f && body.append(k, f));
    try {
      const r = await api('admin/studio', { method: 'POST', body });
      setForm({ ...EMPTY, ...r.data });
      setFiles({});
      setMsg('Studio section saved.');
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  return (
    <form className="panel panel-wide" onSubmit={submit}>
      <h3>Studio Section</h3>

      <label className="field">
        <span>Small heading above the title</span>
        <input value={form.studio_eyebrow} onChange={set('studio_eyebrow')} />
        {err('studio_eyebrow')}
      </label>
      <div className="grid-2">
        <label className="field">
          <span>Heading (black text)</span>
          <input value={form.studio_heading} onChange={set('studio_heading')} required />
          {err('studio_heading')}
        </label>
        <label className="field">
          <span>Heading highlight (maroon text, shown on the next line)</span>
          <input value={form.studio_heading_accent} onChange={set('studio_heading_accent')} />
          {err('studio_heading_accent')}
        </label>
      </div>
      <label className="field">
        <span>Paragraph 1</span>
        <textarea rows={3} value={form.studio_text1} onChange={set('studio_text1')} />
        {err('studio_text1')}
      </label>
      <label className="field">
        <span>Paragraph 2</span>
        <textarea rows={3} value={form.studio_text2} onChange={set('studio_text2')} />
        {err('studio_text2')}
      </label>
      <div className="grid-2">
        <label className="field">
          <span>Button text</span>
          <input value={form.studio_btn_label} onChange={set('studio_btn_label')} />
          {err('studio_btn_label')}
        </label>
        <label className="field">
          <span>Button link</span>
          <input value={form.studio_btn_url} onChange={set('studio_btn_url')} placeholder="#services" />
          {err('studio_btn_url')}
        </label>
      </div>
      <p className="hint">Leave the button text and link empty to hide the button.</p>

      {IMAGES.map(([key, label]) => (
        <ImageField
          key={key}
          label={label}
          current={form[key]}
          file={files[key] || null}
          onChange={(f) => setFiles({ ...files, [key]: f })}
        />
      ))}

      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
