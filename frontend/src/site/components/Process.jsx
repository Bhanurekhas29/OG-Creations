import { useEffect, useState } from 'react';
import { iconFor } from '../../shared/processIcons.js';

export default function Process() {
  const [d, setD] = useState(null);

  useEffect(() => {
    fetch('/api/public/process')
      .then((r) => r.json())
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  if (!d) return <section id="process" className="process" />;
  if (!d.items.length) return null;

  return (
    <section id="process" className="process">
      <div className="process-inner">
        <header className="process-head">
          {d.eyebrow && <p className="process-eyebrow">{d.eyebrow}</p>}
          <h2>{d.heading}</h2>
          <span className="process-rule" />
        </header>

        <ol className="process-steps" style={{ '--n': Math.min(d.items.length, 5) }}>
          {d.items.map((it, i) => {
            const Icon = iconFor(it.icon);
            return (
              <li key={it.title + i} className="step">
                <span className="step-icon"><Icon size={22} strokeWidth={1.6} /></span>
                <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{it.title}</h3>
                {it.description && <p>{it.description}</p>}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
