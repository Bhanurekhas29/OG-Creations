import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Inbox } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { menu } from '../menu.js';

export default function Dashboard() {
  const { user } = useAuth();
  const groups = menu.filter((g) => g.label && g.items.length);
  const [unread, setUnread] = useState(null);

  useEffect(() => {
    api('admin/dashboard').then((r) => setUnread(r.data.stats.unread_enquiries)).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero-banner">
        <h1>Hello, {user.name} 👋</h1>
        <p>Manage every section of your landing page from here. Pick a menu on the left to start editing.</p>
      </section>

      <Link to="/admin/enquiries" className="stat-card">
        <span className="quick-icon"><Inbox size={22} /></span>
        <span>
          <small>Unread enquiries</small>
          <strong>{unread ?? '–'}</strong>
        </span>
        <ArrowRight size={16} className="quick-arrow" />
      </Link>

      {groups.map((g) => (
        <section key={g.label} className="quick-group">
          <h3>{g.label}</h3>
          <div className="quick-grid">
            {g.items.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="quick-card">
                <span className="quick-icon"><Icon size={20} /></span>
                <span className="quick-label">{label}</span>
                <ArrowRight size={16} className="quick-arrow" />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
