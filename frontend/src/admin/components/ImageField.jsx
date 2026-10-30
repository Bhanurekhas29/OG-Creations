import { useEffect, useState } from 'react';

/** Image preview + file picker. `current` is the saved path, `file` the pending upload. */
export default function ImageField({ label, current, file, onChange }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="field">
      <span>{label} (PNG, JPG, WEBP or SVG, max 2 MB)</span>
      <div className="logo-row">
        <img src={preview || current} alt={`${label} preview`} />
        <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => onChange(e.target.files[0] || null)} />
      </div>
    </div>
  );
}
