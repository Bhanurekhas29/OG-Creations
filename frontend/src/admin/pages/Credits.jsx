import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useNotice } from '../components/Toast.jsx';

export default function Credits() {
  const [show, setShow] = useState(true);
  const [url, setUrl] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/credits').then((r) => {
      setShow(r.data.show_credits === '1');
      setUrl(r.data.credit_url || '');
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setFieldError('');
    setBusy(true);
    try {
      await api('admin/credits', { method: 'POST', body: { show_credits: show, credit_url: url } });
      setMsg('Credits saved.');
    } catch (err) {
      setError(err.message);
      setFieldError(err.errors?.credit_url || '');
    }
    setBusy(false);
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h3>Credits</h3>

      <label className="check">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
        <span>
          Show “Designed &amp; developed by{' '}
          <a href={url || '#'} target="_blank" rel="noopener noreferrer">Vetri IT Systems</a>” in the website footer
        </span>
      </label>

      <label className="field">
        <span>Credit link (opens when visitors click “Vetri IT Systems”)</span>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" required />
        {fieldError && <em className="field-error">{fieldError}</em>}
      </label>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
