import useSiteSettings from './useSiteSettings.js';
import useReveal from './useReveal.js';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import Studio from './components/Studio.jsx';
import Services from './components/Services.jsx';
import Works from './components/Works.jsx';
import BehindTheScenes from './components/BehindTheScenes.jsx';
import Process from './components/Process.jsx';
import Upcoming from './components/Upcoming.jsx';
import Why from './components/Why.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import FloatingButtons from './components/FloatingButtons.jsx';

// Public landing page - sections are added one by one as designs arrive.
export default function Home() {
  const s = useSiteSettings();
  useReveal();
  if (!s) return null;

  return (
    <>
      <Navbar settings={s} />

      <Hero />
      <Marquee />
      <Studio />
      <Services />
      <Works />
      <BehindTheScenes />
      <Process />
      <Upcoming />
      <Why />
      <Contact />

      <Footer />
      <FloatingButtons />
    </>
  );
}
