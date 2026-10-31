import { MessageCircle, PanelBottom, Star, Award, ExternalLink, LayoutDashboard, Camera, CalendarClock, Gem, Inbox, Phone, Clapperboard, ListOrdered, Film, LayoutGrid, Menu, MoveHorizontal, Sparkles, Search, Settings, Users, Mail } from 'lucide-react';

// Add an entry here (and a route in AdminApp.jsx) every time a new section is built.
export const menu = [
  {
    label: null,
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/', label: 'View website', icon: ExternalLink, external: true },
    ],
  },
  {
    label: 'Authentication & Authorization',
    items: [
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/site-settings', label: 'Site Settings', icon: Settings },
      { to: '/admin/seo', label: 'SEO', icon: Search },
      { to: '/admin/email-settings', label: 'Email Settings', icon: Mail },
      { to: '/admin/credits', label: 'Credits', icon: Award },
      { to: '/admin/favicon', label: 'Favicon', icon: Star },
    ],
  },
  {
    // Landing page sections (Hero, Tools, ...) are added here as they are built.
    label: 'Site',
    items: [
      { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
      { to: '/admin/navbar', label: 'Menu/Navbar', icon: Menu },
      { to: '/admin/hero', label: 'Hero Section', icon: Sparkles },
      { to: '/admin/marquee', label: 'Scrolling Text Section', icon: MoveHorizontal },
      { to: '/admin/studio', label: 'Studio Section', icon: Clapperboard },
      { to: '/admin/services', label: 'Services Section', icon: LayoutGrid },
      { to: '/admin/works', label: 'Featured Projects Section', icon: Film },
      { to: '/admin/behind-the-scenes', label: 'Behind The Scenes Section', icon: Camera },
      { to: '/admin/process', label: 'Process Section', icon: ListOrdered },
      { to: '/admin/upcoming', label: 'Upcoming Projects Section', icon: CalendarClock },
      { to: '/admin/why', label: 'Why Choose Us Section', icon: Gem },
      { to: '/admin/contact', label: 'Contact Section', icon: Phone },
      { to: '/admin/footer', label: 'Footer Section', icon: PanelBottom },
      { to: '/admin/floating', label: 'Floating Buttons', icon: MessageCircle },
    ],
  },
];
