import { useEffect, useState } from 'react';

export default function Why() {
  const [d, setD] = useState(null);

  useEffect(() => {
    fetch('/api/public/why')
      .then((r) => r.json())
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  if (!d) return <section id="why-choose-us" className="why" />;
  if (!d.items.length && !d.image) return null;

  return (
    <section id="why-choose-us" className="why">
      <div className="why-inner">
        <div className="why-photo">{d.image && <img src={d.image} alt="" loading="lazy" />}</div>

        <div className="why-text">
          {d.eyebrow && <p className="why-eyebrow">{d.eyebrow}</p>}
          <h2>{d.heading}</h2>
          <span className="why-rule" />

          <ol className="why-list">
            {d.items.map((it, i) => (
              <li key={it.title + i}>
                <span className="why-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{it.title}</h3>
                  {it.description && <p>{it.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
