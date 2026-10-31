import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './admin.css';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SiteSettings from './pages/SiteSettings.jsx';
import Users from './pages/Users.jsx';
import Navbar from './pages/Navbar.jsx';
import Hero from './pages/Hero.jsx';
import Marquee from './pages/Marquee.jsx';
import Studio from './pages/Studio.jsx';
import Services from './pages/Services.jsx';
import Works from './pages/Works.jsx';
import Bts from './pages/Bts.jsx';
import Process from './pages/Process.jsx';
import Upcoming from './pages/Upcoming.jsx';
import Why from './pages/Why.jsx';
import Faq from './pages/Faq.jsx';
import Contact from './pages/Contact.jsx';
import Enquiries from './pages/Enquiries.jsx';
import Favicon from './pages/Favicon.jsx';
import Footer from './pages/Footer.jsx';
import Floating from './pages/Floating.jsx';
import Seo from './pages/Seo.jsx';
import Credits from './pages/Credits.jsx';
import EmailSettings from './pages/EmailSettings.jsx';

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div className="adm-loading">Loading…</div>;
  return user ? <AdminLayout /> : <Navigate to="/admin/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="adm-loading">Loading…</div>;
  return user ? <Navigate to="/admin" replace /> : children;
}

export default function AdminApp() {
  useEffect(() => { document.title = 'OG Creations | Admin Panel'; }, []);

  return (
    <AuthProvider>
      <ToastProvider>
      <Routes>
        <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route element={<Protected />}>
          <Route index element={<Dashboard />} />
          <Route path="site-settings" element={<SiteSettings />} />
          <Route path="users" element={<Users />} />
          <Route path="navbar" element={<Navbar />} />
          <Route path="hero" element={<Hero />} />
          <Route path="marquee" element={<Marquee />} />
          <Route path="studio" element={<Studio />} />
          <Route path="services" element={<Services />} />
          <Route path="works" element={<Works />} />
          <Route path="behind-the-scenes" element={<Bts />} />
          <Route path="process" element={<Process />} />
          <Route path="upcoming" element={<Upcoming />} />
          <Route path="why" element={<Why />} />
          <Route path="faq" element={<Faq />} />
          <Route path="contact" element={<Contact />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="favicon" element={<Favicon />} />
          <Route path="footer" element={<Footer />} />
          <Route path="floating" element={<Floating />} />
          <Route path="seo" element={<Seo />} />
          <Route path="credits" element={<Credits />} />
          <Route path="email-settings" element={<EmailSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
