import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ImageField from '../components/ImageField.jsx';
import { useNotice } from '../components/Toast.jsx';

const EMPTY = {
  hero_eyebrow: '', hero_heading: '', hero_description: '',
  hero_btn1_label: '', hero_btn1_url: '', hero_btn2_label: '', hero_btn2_url: '',
  hero_tags: '', hero_bg_image: '',
};

export default function Hero() {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/hero').then((r) => setForm({ ...EMPTY, ...r.data }));
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
    Object.entries(form).forEach(([k, v]) => k !== 'hero_bg_image' && body.append(k, v));
    if (file) body.append('hero_bg_image', file);
    if (removeImage) body.append('remove_bg_image', '1');
    try {
      const r = await api('admin/hero', { method: 'POST', body });
      setForm({ ...EMPTY, ...r.data });
      setFile(null);
      setRemoveImage(false);
      setMsg('Hero section saved.');
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  return (
    <form className="panel panel-wide" onSubmit={submit}>
      <h3>Hero Section</h3>

      <label className="field">
        <span>Small heading above the title</span>
        <input value={form.hero_eyebrow} onChange={set('hero_eyebrow')} />
        {err('hero_eyebrow')}
      </label>
      <label className="field">
        <span>Main heading — wrap a word in *stars* to show it in italics, e.g. From *Concept* to Creation</span>
        <input value={form.hero_heading} onChange={set('hero_heading')} required />
        {err('hero_heading')}
      </label>
      <label className="field">
        <span>Description</span>
        <textarea rows={3} value={form.hero_description} onChange={set('hero_description')} />
        {err('hero_description')}
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Button 1 text</span>
          <input value={form.hero_btn1_label} onChange={set('hero_btn1_label')} />
          {err('hero_btn1_label')}
        </label>
        <label className="field">
          <span>Button 1 link</span>
          <input value={form.hero_btn1_url} onChange={set('hero_btn1_url')} placeholder="#contact" />
          {err('hero_btn1_url')}
        </label>
        <label className="field">
          <span>Button 2 text</span>
          <input value={form.hero_btn2_label} onChange={set('hero_btn2_label')} />
          {err('hero_btn2_label')}
        </label>
        <label className="field">
          <span>Button 2 link</span>
          <input value={form.hero_btn2_url} onChange={set('hero_btn2_url')} placeholder="#services" />
          {err('hero_btn2_url')}
        </label>
      </div>
      <p className="hint">Leave a button's text and link empty to hide that button.</p>

      <label className="field">
        <span>Bottom keywords — one per line (max 8)</span>
        <textarea rows={5} value={form.hero_tags} onChange={set('hero_tags')} />
        {err('hero_tags')}
      </label>

      <ImageField label="Background photo" current={removeImage ? '' : form.hero_bg_image} file={file} onChange={setFile} />
      <p className="hint">Use a wide landscape photo (about 1920×1000 or larger). The left side fades to cream so the text stays readable, so keep the subject on the right.</p>
      {form.hero_bg_image && !file && (
        <label className="check">
          <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} />
          <span>Remove the current background photo</span>
        </label>
      )}

      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
