import { useEffect, useState } from 'react';

const PAGE = 9;

export default function Services() {
  const [d, setD] = useState(null);
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    fetch('/api/public/services')
      .then((r) => r.json())
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  if (!d) return <section id="services" className="services" />;
  if (!d.items.length) return null;

  return (
    <section id="services" className="services">
      <div className="services-inner">
        <header className="services-head">
          {d.eyebrow && <p className="services-eyebrow">{d.eyebrow}</p>}
          <h2>{d.heading}</h2>
          <span className="services-rule" />
        </header>

        <div className="services-grid">
          {d.items.slice(0, shown).map((it, i) => (
            <article key={it.title + i} className="svc-wrap">
              <div className="svc-card">
                {it.image && <img src={it.image} alt={it.title} loading="lazy" />}
                <span className="svc-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="svc-panel">
                  <h3>{it.title}</h3>
                  {it.description && <p>{it.description}</p>}
                  <span className="svc-line" />
                </div>
              </div>
            </article>
          ))}
        </div>
        {d.items.length > shown && (
          <div className="show-more">
            <button onClick={() => setShown(shown + PAGE)}>Show more ({d.items.length - shown} more)</button>
          </div>
        )}
      </div>
    </section>
  );
}
