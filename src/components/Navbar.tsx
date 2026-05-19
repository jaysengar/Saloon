import { useState } from 'react';
import { Menu, X, Shield, Sun, Moon } from 'lucide-react';
import logoImg from '../logo/cropped_circle_image.png';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  scrollY: number;
  activeSection: string;
  onDashboardClick?: () => void;
}

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services-page' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Library', href: '#library' },
  { label: 'About', href: '#about' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Book Now', href: '#booking' },
];

export default function Navbar({ scrollY, activeSection, onDashboardClick }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const scrolled = scrollY > 60;
  const isDark = theme === 'dark';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'backdrop-blur-md shadow-lg'
        : 'bg-transparent'
        }`}
      style={scrolled ? {
        backgroundColor: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(250,248,245,0.95)',
        boxShadow: isDark ? '0 2px 30px rgba(212,175,55,0.08)' : '0 2px 30px rgba(0,0,0,0.06)',
      } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2 group">
          <img
            src={logoImg}
            alt="Reborn Salon Logo"
            className="w-10 h-10 rounded-full object-cover shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all duration-300"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-widest text-[#d4af37]">REBORN</span>
            <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--text-secondary)' }}>SALON</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.slice(0, -1).map((link) => {
            const sectionId = link.href.replace('#', '');
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-all duration-300 relative group ${isActive ? 'text-[#d4af37]' : 'hover:text-[#d4af37]'
                  }`}
                style={{ color: isActive ? '#d4af37' : 'var(--text-secondary)' }}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-[#d4af37] transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                />
              </a>
            );
          })}
          <a
            href="#booking"
            className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black text-sm font-semibold rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:scale-105 transition-all duration-300"
          >
            Book Now
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {onDashboardClick && (
            <button
              onClick={onDashboardClick}
              className="p-2 rounded-full border transition-all duration-300"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
              }}
              title="Owner Dashboard"
            >
              <Shield size={16} />
            </button>
          )}
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            style={{ color: 'var(--text-primary)' }}
            className="hover:text-[#d4af37] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden transition-all duration-400 ${menuOpen ? 'max-h-[75vh] overflow-y-auto opacity-100' : 'max-h-0 overflow-hidden opacity-0'
          }`}
        style={{
          backgroundColor: isDark ? 'rgba(10,10,10,0.98)' : 'rgba(250,248,245,0.98)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(212,175,55,0.1)',
        }}
      >
        <nav className="flex flex-col px-6 py-4 gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#d4af37] transition-colors py-2"
              style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          {onDashboardClick && (
            <button
              onClick={() => { setMenuOpen(false); onDashboardClick(); }}
              className="flex items-center gap-2 hover:text-[#d4af37] transition-colors py-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Shield size={16} /> Owner Dashboard
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
