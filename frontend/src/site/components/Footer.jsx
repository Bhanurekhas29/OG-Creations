import { useEffect, useState } from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { WhatsAppIcon } from '../../shared/WhatsAppIcon.jsx';

const external = (url) => (/^https?:\/\//i.test(url) ? { target: '_blank', rel: 'noopener noreferrer' } : {});

export default function Footer() {
  const [d, setD] = useState(null);

  useEffect(() => {
    fetch('/api/public/footer')
      .then((r) => r.json())
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  if (!d) return <footer className="foot" />;

  const socials = [
    ['Instagram', d.social.instagram, <Instagram size={18} />],
    ['WhatsApp', d.social.whatsapp, <WhatsAppIcon size={18} />],
    ['Facebook', d.social.facebook, <Facebook size={18} />],
    ['YouTube', d.social.youtube, <Youtube size={18} />],
  ].filter(([, url]) => url);

  const column = (title, links) =>
    links.length > 0 && (
      <nav className="foot-col" aria-label={title}>
        <h4>{title}</h4>
        <ul>
          {links.map((l) => (
            <li key={l.label + l.url}><a href={l.url} {...external(l.url)}>{l.label}</a></li>
          ))}
        </ul>
      </nav>
    );

  const { phone, email, address } = d.contact;

  return (
    <footer className="foot">
      <div className="foot-inner">
        <div className="foot-brand">
          <div className="foot-logo">
            {d.logo && <img src={d.logo} alt={d.site_name} />}
            <div>
              <strong>{d.site_name}</strong>
              {d.tagline && <small>{d.tagline}</small>}
            </div>
          </div>
          {d.description && <p className="foot-desc">{d.description}</p>}
          {socials.length > 0 && (
            <>
              <p className="foot-follow">Follow Us,</p>
              <div className="foot-social">
                {socials.map(([name, url, icon]) => (
                  <a key={name} href={url} aria-label={name} {...external(url)}>{icon}</a>
                ))}
              </div>
            </>
          )}
        </div>

        {column('Navigate', d.navigate)}
        {column('Services', d.services)}

        {(phone || email || address) && (
          <div className="foot-col foot-contact">
            <h4>Contact</h4>
            <ul>
              {phone && <li><a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a></li>}
              {email && <li><a href={`mailto:${email}`}>{email}</a></li>}
              {address && <li className="foot-address">{address}</li>}
            </ul>
          </div>
        )}
      </div>

      <div className="foot-bar">
        <p>
          © {new Date().getFullYear()} {d.site_name}. {d.copyright}
        </p>
        {d.credits.show && d.credits.url && (
          <p>
            Designed &amp; developed by{' '}
            <a href={d.credits.url} target="_blank" rel="noopener noreferrer">Vetri IT Systems</a>
          </p>
        )}
      </div>
    </footer>
  );
}
