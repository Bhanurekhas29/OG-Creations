import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const external = (url) => (/^https?:\/\//i.test(url) ? { target: '_blank', rel: 'noopener noreferrer' } : {});

/** "From *Concept* to Creation" -> italic "Concept". */
function renderHeading(text) {
  return text.split(/\*(.+?)\*/g).map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));
}

export default function Hero() {
  const [hero, setHero] = useState(null);

  useEffect(() => {
    fetch('/api/public/hero')
      .then((r) => r.json())
      .then((r) => setHero(r.data))
      .catch(() => {});
  }, []);

  if (!hero) return <section id="home" className="hero" />;

  return (
    <section id="home" className="hero">
      {hero.image && <img className="hero-bg" src={hero.image} alt="" />}
      <div className="hero-fade" />

      <div className="hero-inner">
        {hero.eyebrow && <p className="hero-eyebrow">{hero.eyebrow}</p>}
        <h1 className="hero-title">{renderHeading(hero.heading)}</h1>
        {hero.description && <p className="hero-desc">{hero.description}</p>}

        {(hero.button1 || hero.button2) && (
          <div className="hero-actions">
            {hero.button1 && (
              <a href={hero.button1.url} className="hero-btn hero-btn-solid" {...external(hero.button1.url)}>
                {hero.button1.label} <ArrowRight size={14} />
              </a>
            )}
            {hero.button2 && (
              <a href={hero.button2.url} className="hero-btn hero-btn-outline" {...external(hero.button2.url)}>
                {hero.button2.label}
              </a>
            )}
          </div>
        )}
      </div>

      {hero.tags.length > 0 && (
        <ul className="hero-tags">
          {hero.tags.map((t) => <li key={t}>{t}</li>)}
        </ul>
      )}
    </section>
  );
}
