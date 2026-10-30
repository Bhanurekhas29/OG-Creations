import { useEffect, useState } from 'react';
import { Crosshair } from 'lucide-react';

export default function BehindTheScenes() {
  const [d, setD] = useState(null);

  useEffect(() => {
    fetch('/api/public/bts')
      .then((r) => r.json())
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  if (!d) return <section id="behind-the-scenes" className="bts" />;

  // photos[]: 0 top-left, 1 bottom-left, 2 centre, 3 top-right, 4 bottom-right
  const slot = (i, cls) => {
    const p = d.photos[i];
    return (
      <figure className={`bts-fig ${cls}`}>
        <div className="bts-img">
          {p.image && <img src={p.image} alt={p.caption} loading="lazy" />}
          {i === 2 && p.caption && (
            <figcaption className="bts-overlay">
              <strong>{p.caption}</strong>
              {p.subtitle && <span>{p.subtitle}</span>}
            </figcaption>
          )}
        </div>
        {i !== 2 && p.caption && <figcaption className="bts-caption">{p.caption}</figcaption>}
      </figure>
    );
  };

  return (
    <section id="behind-the-scenes" className="bts">
      <div className="bts-card">
        <header className="bts-head">
          <span className="bts-mark"><Crosshair size={16} /><i /></span>
          <h2>
            {d.heading_bold && <b>{d.heading_bold}</b>}
            {d.heading_light && <> <span>{d.heading_light}</span></>}
          </h2>
        </header>

        <div className="bts-grid">
          {slot(0, 'bts-tl')}
          {slot(1, 'bts-bl')}
          {slot(2, 'bts-c')}
          {slot(3, 'bts-tr')}
          {slot(4, 'bts-br')}
        </div>
      </div>
    </section>
  );
}
