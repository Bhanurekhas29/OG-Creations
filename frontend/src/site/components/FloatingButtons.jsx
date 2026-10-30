import { useEffect, useState } from 'react';
import { PhoneCallIcon } from '../../shared/PhoneCallIcon.jsx';
import { WhatsAppIcon } from '../../shared/WhatsAppIcon.jsx';

export default function FloatingButtons() {
  const [d, setD] = useState(null);

  useEffect(() => {
    fetch('/api/public/floating')
      .then((r) => r.json())
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  if (!d || (!d.call && !d.whatsapp)) return null;

  return (
    <div className="float-btns">
      {d.call && (
        <a href={d.call} aria-label="Call us"><PhoneCallIcon size={24} /></a>
      )}
      {d.whatsapp && (
        <a href={d.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"><WhatsAppIcon size={26} /></a>
      )}
    </div>
  );
}
