import { useEffect, useState } from 'react';
import { applyFavicon } from '../shared/favicon.js';

function setMeta(name, content) {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content || '';
}

/** Loads public site settings and applies the SEO meta tags to <head>. */
export default function useSiteSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/public/site')
      .then((r) => r.json())
      .then((r) => {
        const s = r.data;
        setSettings(s);
        document.title = s.meta_title || s.site_name;
        setMeta('description', s.meta_description);
        setMeta('keywords', s.meta_keywords);
        applyFavicon(s.favicon);
      })
      .catch(() => {});
  }, []);

  return settings;
}
