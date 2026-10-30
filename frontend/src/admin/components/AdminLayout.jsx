import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { menu } from '../menu.js';
import { useConfirm, useToast } from './Toast.jsx';

export default function AdminLayout() {
  const { user, logout, branding } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const current = menu.flatMap((g) => g.items).find((i) => i.to === pathname.replace(/\/$/, ''));

  const handleLogout = async () => {
    const yes = await confirm('Are you sure you want to log out of the admin panel?', { title: 'Log out', confirmLabel: 'Log out' });
    if (!yes) return;
    await logout();
    toast('success', 'You have been logged out.');
  };

  return (
    <div className="adm">
      <aside className={`adm-side ${open ? 'open' : ''}`}>
        <div className="adm-brand">
          <img src={branding.header_logo} alt="" />
          <div>
            <strong>{branding.site_name}</strong>
            <small>Admin Panel</small>
          </div>
        </div>
        <nav onClick={() => setOpen(false)}>
          {menu.map((group, i) => (
            <div key={i}>
              {group.label && group.items.length > 0 && <div className="adm-group">{group.label}</div>}
              {group.items.map(({ to, label, icon: Icon, end, external }) =>
                external ? (
                  <a key={to} href={to} target="_blank" rel="noopener noreferrer" className="adm-link">
                    <Icon size={18} />
                    {label}
                  </a>
                ) : (
                  <NavLink key={to} to={to} end={end} className="adm-link">
                    <Icon size={18} />
                    {label}
                  </NavLink>
                )
              )}
            </div>
          ))}
        </nav>
      </aside>
      {open && <div className="adm-backdrop" onClick={() => setOpen(false)} />}

      <div className="adm-main">
        <header className="adm-top">
          <button className="adm-burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h2>{current?.label || 'Dashboard'}</h2>
          <div className="adm-user">
            <div className="adm-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="adm-user-meta">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </div>
            <button className="btn btn-outline" onClick={handleLogout}>
              <LogOut size={16} /> Log out
            </button>
          </div>
        </header>
        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
