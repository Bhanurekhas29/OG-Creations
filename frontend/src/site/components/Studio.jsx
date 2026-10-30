import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Studio() {
  const [d, setD] = useState(null);

  useEffect(() => {
    fetch('/api/public/studio')
      .then((r) => r.json())
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  if (!d) return <section id="about" className="studio" />;

  return (
    <section id="about" className="studio">
      <div className="studio-inner">
        <div className="studio-text">
          {d.eyebrow && <p className="studio-eyebrow">{d.eyebrow}</p>}
          <h2 className="studio-title">
            {d.heading}
            {d.heading_accent && <> <span>{d.heading_accent}</span></>}
          </h2>
          {d.paragraphs.map((p, i) => <p key={i} className="studio-para">{p}</p>)}
          {d.button && (
            <>
              <span className="studio-rule" />
              <a
                href={d.button.url}
                className="studio-btn"
                {...(/^https?:\/\//i.test(d.button.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {d.button.label} <ArrowRight size={14} />
              </a>
            </>
          )}
        </div>

        <div className="studio-collage">
          {d.images.map((src, i) => (
            <div key={i} className={`studio-img studio-img-${i + 1}`}>
              {src && <img src={src} alt="" loading="lazy" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
