import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Faq() {
  const [d, setD] = useState(null);

  useEffect(() => {
    fetch('/api/public/faq')
      .then((r) => r.json())
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  // FAQ structured data (schema.org) so search engines can show the questions in results.
  useEffect(() => {
    if (!d || !d.items.length) return undefined;
    const tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.id = 'faq-schema';
    tag.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: d.items.map((it) => ({
        '@type': 'Question',
        name: it.question,
        acceptedAnswer: { '@type': 'Answer', text: it.answer },
      })),
    });
    document.head.appendChild(tag);
    return () => tag.remove();
  }, [d]);

  if (!d) return <section id="faq" className="faq" />;
  if (!d.items.length) return null;

  return (
    <section id="faq" className="faq">
      <div className="faq-inner">
        <header className="faq-head">
          {d.eyebrow && <p className="faq-eyebrow">{d.eyebrow}</p>}
          <h2>{d.heading}</h2>
          <span className="faq-rule" />
          {d.intro && <p className="sec-intro">{d.intro}</p>}
        </header>

        <div className="faq-list">
          {d.items.map((it, i) => (
            <details key={it.question + i} className="faq-item" name="faq">
              <summary>
                <span>{it.question}</span>
                <ChevronDown size={20} />
              </summary>
              <p>{it.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
