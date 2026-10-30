import { useAuth } from '../auth/AuthContext.jsx';

/** Centered card with logo + website name, shared by login / forgot / reset. */
export default function AuthShell({ title, subtitle, children }) {
  const { branding } = useAuth();
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={branding.header_logo} alt={branding.site_name} />
          <span>{branding.site_name}</span>
        </div>
        <h1>{title}</h1>
        {subtitle && <p className="auth-sub">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
