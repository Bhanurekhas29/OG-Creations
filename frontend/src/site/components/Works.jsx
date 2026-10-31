import { useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';

/** Turns a pasted video link into something we can play in a pop-up. */
function parseVideo(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/i);
  if (yt) return { type: 'embed', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vm) return { type: 'embed', src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` };
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return { type: 'file', src: url };
  return { type: 'link', src: url };
}

function VideoModal({ video, title, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="vmodal" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <button className="vmodal-close" onClick={onClose} aria-label="Close video"><X size={26} /></button>
      <div className="vmodal-box" onClick={(e) => e.stopPropagation()}>
        {video.type === 'embed' ? (
          <iframe src={video.src} title={title} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
        ) : (
          <video src={video.src} controls autoPlay />
        )}
      </div>
    </div>
  );
}

const PAGE = 9;

export default function Works() {
  const [d, setD] = useState(null);
  const [filter, setFilter] = useState('All');
  const [playing, setPlaying] = useState(null);
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    fetch('/api/public/works')
      .then((r) => r.json())
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  if (!d) return <section id="works" className="works" />;
  if (!d.items.length) return null;

  const all = filter === 'All' ? d.items : d.items.filter((i) => i.category === filter);
  const items = all.slice(0, shown);

  const open = (it) => {
    const v = parseVideo(it.video_url);
    if (!v) return;
    if (v.type === 'link') window.open(v.src, '_blank', 'noopener,noreferrer');
    else setPlaying({ video: v, title: it.title });
  };

  return (
    <section id="works" className="works">
      <div className="works-inner">
        <header className="works-head">
          <div>
            {d.eyebrow && <p className="works-eyebrow">{d.eyebrow}</p>}
            <h2>{d.heading}</h2>
            <span className="works-rule" />
            {d.intro && <p className="sec-intro sec-intro-left">{d.intro}</p>}
          </div>
          {d.categories.length > 0 && (
            <nav className="works-tabs" aria-label="Filter projects">
              {['All', ...d.categories].map((c) => (
                <button key={c} className={c === filter ? 'active' : ''} onClick={() => { setFilter(c); setShown(PAGE); }}>{c}</button>
              ))}
            </nav>
          )}
        </header>

        <div className="works-grid">
          {items.map((it, i) => (
            <button
              key={it.title + i + filter}
              className={`work ${i === 0 ? 'work-big' : ''} ${it.video_url ? 'has-video' : ''}`}
              onClick={() => open(it)}
              aria-label={it.video_url ? `Play ${it.title}` : it.title}
            >
              {it.thumbnail && <img src={it.thumbnail} alt={[it.title, it.category].filter(Boolean).join(' - ')} loading="lazy" />}
              <span className="work-play" aria-hidden="true"><Play size={20} fill="currentColor" /></span>
              <span className="work-info">
                {it.category && <small>{it.category}</small>}
                <strong>{it.title}</strong>
                {it.description && <em>{it.description}</em>}
              </span>
            </button>
          ))}
          {!items.length && <p className="works-empty">No projects in this category yet.</p>}
        </div>
        {all.length > shown && (
          <div className="show-more">
            <button onClick={() => setShown(shown + PAGE)}>Show more ({all.length - shown} more)</button>
          </div>
        )}
      </div>
      {playing && <VideoModal video={playing.video} title={playing.title} onClose={() => setPlaying(null)} />}
    </section>
  );
}
