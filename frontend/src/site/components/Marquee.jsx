import { useEffect, useState } from 'react';

export default function Marquee() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/public/marquee')
      .then((r) => r.json())
      .then((r) => setData(r.data))
      .catch(() => {});
  }, []);

  if (!data?.enabled) return null;

  // Repeat the words so one group is always wider than the screen, then render
  // the group twice: the track slides by exactly one group for a seamless loop.
  const repeats = Math.max(1, Math.ceil(12 / data.items.length));
  const group = Array.from({ length: repeats }, () => data.items).flat();

  return (
    <section className="marquee" aria-label={data.items.join(', ')}>
      <div className="marquee-track" style={{ animationDuration: `${data.speed}s` }}>
        {[0, 1].map((g) => (
          <ul key={g} className="marquee-group" aria-hidden="true">
            {group.map((word, i) => <li key={i}>{word}</li>)}
          </ul>
        ))}
      </div>
    </section>
  );
}
