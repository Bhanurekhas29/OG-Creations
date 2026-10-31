import { useEffect } from 'react';

// Things that fade/slide in when they scroll into view. Siblings are staggered.
const TARGETS = [
  '.studio-inner > *', '.services-head', '.svc-wrap', '.works-head', '.work', '.bts-head', '.bts-card',
  '.process-head', '.step', '.upc-head', '.upc-carousel', '.upc-controls', '.why-photo', '.why-text',
  '.why-list li', '.faq-head', '.faq-item', '.contact-info', '.contact-card', '.foot-inner > *', '.show-more',
].join(',');

/** Adds a scroll-reveal animation to landing page sections. Skipped for reduced-motion visitors. */
export default function useReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const root = document.documentElement;
    const seen = new WeakSet();

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    const scan = () => {
      document.querySelectorAll(TARGETS).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.matches(TARGETS)) : [el];
        el.style.setProperty('--rd', `${Math.min(sibs.indexOf(el), 8) * 90}ms`);
        el.setAttribute('data-reveal', '');
        io.observe(el);
      });
    };

    root.classList.add('reveal-on');
    scan();
    const mo = new MutationObserver(scan); // sections load their content after fetching
    mo.observe(document.body, { childList: true, subtree: true });
    // Safety: never leave content hidden.
    const safety = setTimeout(() => document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight) el.classList.add('in');
    }), 2500);

    return () => {
      clearTimeout(safety);
      mo.disconnect();
      io.disconnect();
      root.classList.remove('reveal-on');
      document.querySelectorAll('[data-reveal]').forEach((el) => el.removeAttribute('data-reveal'));
    };
  }, []);
}
