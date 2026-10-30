import { useEffect, useState } from 'react';
import { ArrowRight, Mail, MapPin, Navigation, Phone } from 'lucide-react';

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const NAME_RE = /^[\p{L}\p{M} .'-]{2,80}$/u;

// Same rules as backend/api/public/contact.php
const validators = {
  name: (v) => (!v.trim() ? 'Please enter your full name.' : NAME_RE.test(v.trim()) ? '' : 'Use letters only (at least 2 characters).'),
  phone: (v) => (!v ? 'Please enter your mobile number.' : /^[6-9]\d{9}$/.test(v) ? '' : 'Enter a valid 10-digit mobile number.'),
  email: (v) => (!v.trim() ? 'Please enter your email address.' : EMAIL_RE.test(v.trim()) ? '' : 'Enter a valid email, e.g. you@example.com'),
  service: (v) => (v ? '' : 'Please choose a service.'),
  message: (v) => (v.trim().length < 10 ? 'Please tell us a little about your project (at least 10 characters).' : v.length > 1000 ? 'Please keep it under 1000 characters.' : ''),
};

// Characters a field will accept while typing.
const sanitize = {
  name: (v) => v.replace(/[^\p{L}\p{M} .'-]/gu, '').slice(0, 80),
  phone: (v) => v.replace(/\D/g, '').slice(0, 10),
};

const EMPTY = { name: '', phone: '', email: '', service: '', message: '' };

export default function Contact() {
  const [d, setD] = useState(null);
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState('');

  useEffect(() => {
    fetch('/api/public/contact')
      .then((r) => r.json())
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  if (!d) return <section id="contact" className="contact" />;

  const errors = Object.fromEntries(Object.keys(validators).map((k) => [k, validators[k](values[k])]));
  const valid = Object.values(errors).every((e) => !e);
  const showError = (k) => (touched[k] ? errors[k] : '') || serverErrors[k] || '';

  const change = (k) => (e) => {
    const v = sanitize[k] ? sanitize[k](e.target.value) : e.target.value;
    setValues((prev) => ({ ...prev, [k]: v }));
    setServerErrors((prev) => ({ ...prev, [k]: '' }));
  };
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true, service: true, message: true });
    if (!valid || sending) return;
    setSending(true);
    setFormError('');
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          message: values.message.trim(),
          website: e.target.website.value, // honeypot
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        setServerErrors(data.errors || {});
        setFormError(data.message || 'Something went wrong. Please try again.');
      } else {
        setDone(data.message);
        setValues(EMPTY);
        setTouched({});
      }
    } catch {
      setFormError('Could not send your enquiry. Please check your connection and try again.');
    }
    setSending(false);
  };

  const field = (k, label, control) => (
    <div className={`cf-field ${showError(k) ? 'invalid' : ''}`}>
      <label htmlFor={`cf-${k}`}>{label} <b>*</b></label>
      {control}
      {showError(k) && <p className="cf-error" role="alert">{showError(k)}</p>}
    </div>
  );

  return (
    <section id="contact" className="contact" style={d.image ? { backgroundImage: `url(${d.image})` } : undefined}>
      <div className="contact-inner">
        <div className="contact-info">
          {d.eyebrow && <p className="contact-eyebrow">{d.eyebrow}</p>}
          <h2>{d.heading}</h2>
          {d.subheading && <p className="contact-sub">{d.subheading}</p>}

          <ul className="contact-list">
            {d.phone && (
              <li>
                <Phone size={16} />
                <div><small>Phone</small><a href={`tel:${d.phone.replace(/[^\d+]/g, '')}`}>{d.phone}</a></div>
              </li>
            )}
            {d.email && (
              <li>
                <Mail size={16} />
                <div><small>Email</small><a href={`mailto:${d.email}`}>{d.email}</a></div>
              </li>
            )}
            {d.address && (
              <li>
                <MapPin size={16} />
                <div><small>Studio</small><span>{d.address}</span></div>
              </li>
            )}
          </ul>

          {d.map_embed && (
            <div className="contact-map">
              <iframe src={d.map_embed} title="Studio location map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              {d.directions_url && (
                <a href={d.directions_url} target="_blank" rel="noopener noreferrer" className="map-go" aria-label="Get directions">
                  <Navigation size={18} />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="contact-card">
          {done ? (
            <div className="cf-done" role="status">
              <h3>Thank you!</h3>
              <p>{done}</p>
              <button type="button" className="cf-btn" onClick={() => setDone('')}>Send another enquiry</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              {/* Honeypot: hidden from people, tempting for bots. */}
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="cf-hp" defaultValue="" />

              <div className="cf-grid">
                {field('name', 'Full Name',
                  <input id="cf-name" value={values.name} onChange={change('name')} onBlur={blur('name')} placeholder="Your name" autoComplete="name" maxLength={80} aria-invalid={!!showError('name')} />)}
                {field('phone', 'Phone Number',
                  <div className="cf-phone">
                    <span>+91</span>
                    <input id="cf-phone" value={values.phone} onChange={change('phone')} onBlur={blur('phone')} placeholder="10-digit mobile number" inputMode="numeric" autoComplete="tel-national" maxLength={10} aria-invalid={!!showError('phone')} />
                  </div>)}
                {field('email', 'Email Address',
                  <input id="cf-email" type="email" value={values.email} onChange={change('email')} onBlur={blur('email')} placeholder="you@example.com" autoComplete="email" maxLength={120} aria-invalid={!!showError('email')} />)}
                {field('service', 'Service Required',
                  <select id="cf-service" value={values.service} onChange={change('service')} onBlur={blur('service')} aria-invalid={!!showError('service')}>
                    <option value="" disabled>Select a service</option>
                    {d.services.map((s) => <option key={s} value={s}>{s}</option>)}
                    <option value="Other">Other</option>
                  </select>)}
              </div>

              {field('message', 'Project Details',
                <textarea id="cf-message" rows={4} value={values.message} onChange={change('message')} onBlur={blur('message')} placeholder="Tell us about your project" maxLength={1000} aria-invalid={!!showError('message')} />)}

              {formError && <p className="cf-error cf-form-error" role="alert">{formError}</p>}

              <div className="cf-actions">
                <button type="submit" className="cf-btn" disabled={!valid || sending}>
                  {sending ? 'Sending…' : <>Start a Project <ArrowRight size={14} /></>}
                </button>
                {!valid && <span className="cf-hint">Fill in all the fields to continue.</span>}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
