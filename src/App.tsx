import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Gallery from './components/Gallery';
import Library from './components/Library';
import ServicesPage from './components/ServicesPage';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Booking from './components/Booking';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';

import LoginPage from './components/dashboard/LoginPage';
import DashboardLayout from './components/dashboard/DashboardLayout';

function AppContent() {
  const { user, loading } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [route, setRoute] = useState<'site' | 'dashboard' | 'library' | 'services'>('site');
  const [prefilledService, setPrefilledService] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#dashboard' || hash === '#login') {
        setRoute('dashboard');
      } else if (hash === '#library') {
        setRoute('library');
        window.scrollTo(0, 0);
      } else if (hash === '#services-page') {
        setRoute('services');
        window.scrollTo(0, 0);
      } else {
        setRoute((prevRoute) => {
          if (prevRoute !== 'site') {
            if (hash) {
              setTimeout(() => {
                const el = document.getElementById(hash.replace('#', ''));
                if (el) el.scrollIntoView();
              }, 100);
            }
            return 'site';
          }
          return prevRoute;
        });
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleBookNow = (serviceName: string) => {
    setPrefilledService(serviceName);
    window.location.hash = '#booking';
    setRoute('site');
    setTimeout(() => {
      const el = document.getElementById('booking');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleServicesClick = () => {
    setRoute('services');
    window.location.hash = '#services-page';
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const sections = ['home', 'services', 'gallery', 'about', 'testimonials', 'booking'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [route]);

  if (route === 'dashboard') {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
        </div>
      );
    }
    if (!user) {
      return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <LoginPage />
          <div className="text-center pb-8">
            <button onClick={() => setRoute('site')} className="text-sm hover:text-[#d4af37] transition-colors" style={{ color: 'var(--text-muted)' }}>
              Back to website
            </button>
          </div>
        </div>
      );
    }
    return <DashboardLayout />;
  }

  if (route === 'library') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Navbar scrollY={scrollY} activeSection="library" onDashboardClick={() => setRoute('dashboard')} />
        <div className="flex-grow pb-20 md:pb-0">
          <Library />
        </div>
        <Footer />
        <MobileBottomNav
          activeSection="library"
          onServicesClick={handleServicesClick}
        />

      </div>
    );
  }

  if (route === 'services') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Navbar scrollY={scrollY} activeSection="services-page" onDashboardClick={() => setRoute('dashboard')} />
        <div className="flex-grow pb-20 md:pb-0">
          <ServicesPage onBookNow={handleBookNow} />
        </div>
        <Footer />
        <MobileBottomNav
          activeSection="services-page"
          onServicesClick={handleServicesClick}
        />

      </div>
    );
  }

  return (
    <div className="overflow-x-hidden" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar scrollY={scrollY} activeSection={activeSection} onDashboardClick={() => setRoute('dashboard')} />
      <Hero />
      <Services />
      <Gallery />
      <About />
      <Testimonials />
      {/* Extra padding for mobile bottom nav */}
      <div className="pb-20 md:pb-0">
        <Booking />
      </div>
      <Footer />
      <MobileBottomNav
        activeSection={activeSection}
        onServicesClick={handleServicesClick}
      />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
