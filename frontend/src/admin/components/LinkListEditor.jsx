import { Plus, Trash2 } from 'lucide-react';

/** Editable list of {label, url} rows with a numbered order dropdown. */
export default function LinkListEditor({ title, links, onChange, placeholderUrl = '#about' }) {
  const update = (i, patch) => onChange(links.map((l, n) => (n === i ? { ...l, ...patch } : l)));
  const remove = (i) => onChange(links.filter((_, n) => n !== i));
  const add = () => onChange([...links, { label: '', url: '' }]);
  const moveTo = (i, position) => {
    const next = [...links];
    const [item] = next.splice(i, 1);
    next.splice(position - 1, 0, item);
    onChange(next);
  };

  return (
    <div className="link-editor">
      <div className="link-editor-head">
        <strong>{title}</strong>
        <button type="button" className="btn btn-outline btn-sm" onClick={add}><Plus size={14} /> Add link</button>
      </div>
      {links.length === 0 && <p className="hint">No links yet.</p>}
      {links.map((l, i) => (
        <div className="link-row" key={i}>
          <select className="order-select" value={i + 1} onChange={(e) => moveTo(i, Number(e.target.value))} aria-label={`Order of link ${i + 1}`}>
            {links.map((_, n) => <option key={n} value={n + 1}>{n + 1}</option>)}
          </select>
          <input value={l.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" maxLength={40} aria-label="Link label" />
          <input value={l.url} onChange={(e) => update(i, { url: e.target.value })} placeholder={placeholderUrl} aria-label="Link address" />
          <button type="button" className="icon-btn danger" onClick={() => remove(i)} aria-label="Remove link"><Trash2 size={16} /></button>
        </div>
      ))}
    </div>
  );
}
