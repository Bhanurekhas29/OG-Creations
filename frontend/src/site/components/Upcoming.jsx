import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const AUTOPLAY_MS = 6000;

export default function Upcoming() {
  const [d, setD] = useState(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  useEffect(() => {
    fetch('/api/public/upcoming')
      .then((r) => r.json())
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  const count = d?.items.length || 0;
  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  // Auto-advance unless hovered/focused, or the visitor prefers reduced motion.
  useEffect(() => {
    if (count < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [count, paused]);

  if (!d) return <section id="upcoming" className="upc" />;
  if (!count) return null;

  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <section id="upcoming" className="upc">
      <div className="upc-inner">
        <header className="upc-head">
          <h2>{d.heading}<span /></h2>
          {d.subtitle && <p>{d.subtitle}</p>}
        </header>

        <div
          className="upc-carousel"
          aria-roledescription="carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={onTouchEnd}
        >
          <div className="upc-track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {d.items.map((it, i) => (
              <article key={it.title + i} className="upc-slide" aria-hidden={i !== index} aria-label={`${i + 1} of ${count}`}>
                <div className="upc-card">
                  <div className="upc-body">
                    <div className="upc-main">
                      <p className="upc-tag">Upcoming</p>
                      <h3>{it.title}</h3>
                      {it.tagline && <p className="upc-tagline">{it.tagline}</p>}
                    </div>

                    <dl className="upc-cast">
                      {it.lead_actor && <div><dt>Lead Actor</dt><dd>{it.lead_actor}</dd></div>}
                      {it.lead_actress && <div><dt>Lead Actress</dt><dd>{it.lead_actress}</dd></div>}
                      {it.cast.length > 0 && (
                        <div>
                          <dt>Co-Actress / Supporting Cast</dt>
                          <dd className="upc-names">{it.cast.map((n) => <span key={n}>{n}</span>)}</dd>
                        </div>
                      )}
                    </dl>

                    {(it.release_date || it.status) && (
                      <p className="upc-foot">
                        <CalendarDays size={14} />
                        {it.release_date && <span>{it.release_date}</span>}
                        {it.release_date && it.status && <i />}
                        {it.status && <span>{it.status}</span>}
                      </p>
                    )}
                  </div>
                  <div className="upc-photo">{it.image && <img src={it.image} alt={it.title} loading="lazy" />}</div>
                </div>
              </article>
            ))}
          </div>

        </div>

        {count > 1 && (
          <div className="upc-controls">
            <button className="upc-arrow" onClick={() => go(index - 1)} aria-label="Previous project"><ChevronLeft size={20} /></button>
            <div className="upc-dots">
              {d.items.map((it, i) => (
                <button key={i} className={i === index ? 'active' : ''} onClick={() => go(i)} aria-label={`Show ${it.title}`} />
              ))}
            </div>
            <button className="upc-arrow" onClick={() => go(index + 1)} aria-label="Next project"><ChevronRight size={20} /></button>
          </div>
        )}
      </div>
    </section>
  );
}
