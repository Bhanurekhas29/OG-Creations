import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import '../site.css';

export default function Navbar({ settings }) {
  const [nav, setNav] = useState({ items: [], cta: null });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('/api/public/navbar')
      .then((r) => r.json())
      .then((r) => setNav(r.data))
      .catch(() => {});
  }, []);

  const external = (url) => (/^https?:\/\//i.test(url) ? { target: '_blank', rel: 'noopener noreferrer' } : {});

  return (
    <header className="nav">
      <div className="nav-inner">
        <a href="#home" className="nav-brand">
          <img src={settings.header_logo} alt={settings.site_name} />
          <span className="nav-name">
            <b>{settings.site_name}</b>
            {nav.tagline && <small>{nav.tagline}</small>}
          </span>
        </a>

        <nav className={`nav-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          {nav.items.map((it) => (
            <a key={it.label + it.url} href={it.url} {...external(it.url)}>{it.label}</a>
          ))}
          {nav.cta && (
            <a href={nav.cta.url} className="nav-cta nav-cta-mobile" {...external(nav.cta.url)}>
              {nav.cta.label} <ArrowRight size={14} />
            </a>
          )}
        </nav>

        {nav.cta && (
          <a href={nav.cta.url} className="nav-cta nav-cta-desktop" {...external(nav.cta.url)}>
            {nav.cta.label} <ArrowRight size={14} />
          </a>
        )}
        <button className="nav-burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
