/** WhatsApp-style glyph: thick speech-bubble ring with a solid handset inside (lucide has none). */
export function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.6a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.7-1.2A9.4 9.4 0 1 0 12 2.6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M8.6 7.4c.3-.5.7-.5 1-.4l.7 1.3-.7 1.2c-.3.4.8 2 2.2 3.1 1.4 1.1 2.6 1.6 3 1.3l1.1-.9 1.4.8c0 .5-.3 1.2-1 1.7-.8.5-1.9.5-3.9-.4-2.3-1-4.3-3.1-5-5-.5-1.3 0-1.9.4-2.4z"
        fill="currentColor"
      />
    </svg>
  );
}
