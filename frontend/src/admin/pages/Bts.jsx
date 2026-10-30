import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ImageField from '../components/ImageField.jsx';
import { useNotice } from '../components/Toast.jsx';

// Slot numbers match the website layout: 1 top-left, 2 bottom-left, 3 centre, 4 top-right, 5 bottom-right.
const SLOTS = [
  [3, 'Centre photo (large, tall)'],
  [1, 'Top-left photo'],
  [2, 'Bottom-left photo'],
  [4, 'Top-right photo'],
  [5, 'Bottom-right photo'],
];

const EMPTY = { bts_heading_bold: '', bts_heading_light: '', bts_3_subtitle: '' };
SLOTS.forEach(([n]) => { EMPTY[`bts_${n}_image`] = ''; EMPTY[`bts_${n}_caption`] = ''; });

export default function Bts() {
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/bts').then((r) => setForm({ ...EMPTY, ...r.data }));
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
    Object.entries(form).forEach(([k, v]) => !k.endsWith('_image') && body.append(k, v));
    Object.entries(files).forEach(([k, f]) => f && body.append(k, f));
    try {
      const r = await api('admin/bts', { method: 'POST', body });
      setForm({ ...EMPTY, ...r.data });
      setFiles({});
      setMsg('Behind the Scenes section saved.');
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  return (
    <form className="panel panel-wide" onSubmit={submit}>
      <h3>Behind The Scenes Section</h3>

      <div className="grid-2">
        <label className="field">
          <span>Heading — bold maroon word(s)</span>
          <input value={form.bts_heading_bold} onChange={set('bts_heading_bold')} />
          {err('bts_heading_bold')}
        </label>
        <label className="field">
          <span>Heading — light black word(s)</span>
          <input value={form.bts_heading_light} onChange={set('bts_heading_light')} />
          {err('bts_heading_light')}
        </label>
      </div>

      {SLOTS.map(([n, label]) => (
        <fieldset key={n} className="slot">
          <legend>{label}</legend>
          <ImageField
            label="Photo"
            current={form[`bts_${n}_image`]}
            file={files[`bts_${n}_image`] || null}
            onChange={(f) => setFiles({ ...files, [`bts_${n}_image`]: f })}
          />
          <label className="field">
            <span>{n === 3 ? 'Title shown over the photo' : 'Caption under the photo'}</span>
            <input value={form[`bts_${n}_caption`]} onChange={set(`bts_${n}_caption`)} />
            {err(`bts_${n}_caption`)}
          </label>
          {n === 3 && (
            <label className="field">
              <span>Small line under the title</span>
              <input value={form.bts_3_subtitle} onChange={set('bts_3_subtitle')} />
              {err('bts_3_subtitle')}
            </label>
          )}
        </fieldset>
      ))}

      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
