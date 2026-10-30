/** Points the browser tab icon at `url` (falls back to the default logo when empty). */
export function applyFavicon(url) {
  let link = document.head.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  const href = url || '/images/logo.svg';
  link.removeAttribute('type'); // let the browser sniff PNG / ICO / SVG
  link.href = href;
}
