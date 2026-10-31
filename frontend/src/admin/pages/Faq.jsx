import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import { useNotice, useConfirm } from '../components/Toast.jsx';

const EMPTY = { id: null, question: '', answer: '', is_active: true };

function HeaderForm() {
  const [form, setForm] = useState({ faq_eyebrow: '', faq_heading: '', faq_intro: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('admin/faq-header').then((r) => setForm((f) => ({ ...f, ...r.data })));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      const r = await api('admin/faq-header', { method: 'POST', body: form });
      setForm((f) => ({ ...f, ...r.data }));
      setMsg('Heading saved.');
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  const err = (k) => fieldErrors[k] && <em className="field-error">{fieldErrors[k]}</em>;

  return (
    <form className="panel panel-wide" onSubmit={submit}>
      <h3>Heading</h3>
      <div className="grid-2">
        <label className="field">
          <span>Small heading</span>
          <input value={form.faq_eyebrow} onChange={(e) => setForm({ ...form, faq_eyebrow: e.target.value })} />
          {err('faq_eyebrow')}
        </label>
        <label className="field">
          <span>Main heading</span>
          <input value={form.faq_heading} onChange={(e) => setForm({ ...form, faq_heading: e.target.value })} required />
          {err('faq_heading')}
        </label>
      </div>
      <label className="field">
        <span>Intro text (under the heading)</span>
        <textarea rows={3} value={form.faq_intro} onChange={(e) => setForm({ ...form, faq_intro: e.target.value })} />
        {err('faq_intro')}
      </label>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function Faq() {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api('admin/faq').then((r) => setItems(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const open = (item) => {
    setMsg('');
    setError('');
    setFieldErrors({});
    setForm(item ? { ...item, is_active: !!item.is_active } : EMPTY);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      const editing = !!form.id;
      await api(editing ? `admin/faq?id=${form.id}` : 'admin/faq', { method: editing ? 'PUT' : 'POST', body: form });
      setForm(null);
      setMsg(editing ? 'Question updated.' : 'Question added.');
      load();
    } catch (ex) {
      setError(ex.message);
      setFieldErrors(ex.errors || {});
    }
    setBusy(false);
  };

  const remove = async (item) => {
    if (!await confirm(`Delete “${item.question}”?`)) return;
    setMsg('');
    setError('');
    try {
      await api(`admin/faq?id=${item.id}`, { method: 'DELETE' });
      setMsg('Question deleted.');
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
      await api('admin/faq-order', { method: 'POST', body: { ids: next.map((i) => i.id) } });
      setMsg('Order updated. The questions on the website follow this order.');
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
          <h3>{form.id ? 'Edit question' : 'Add question'}</h3>
          <label className="field">
            <span>Question</span>
            <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required autoFocus />
            {err('question')}
          </label>
          <label className="field">
            <span>Answer</span>
            <textarea rows={5} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
            {err('answer')}
          </label>
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
            <h3>Questions</h3>
            <button className="btn btn-primary" onClick={() => open(null)}><Plus size={16} /> Add question</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Order</th><th>Question</th><th>Answer</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id}>
                    <td>
                      <select className="order-select" value={i + 1} onChange={(e) => moveTo(i, Number(e.target.value))} aria-label={`Order for ${it.question}`}>
                        {items.map((_, n) => <option key={n} value={n + 1}>{n + 1}</option>)}
                      </select>
                    </td>
                    <td><strong>{it.question}</strong></td>
                    <td className="cell-desc">{it.answer}</td>
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
