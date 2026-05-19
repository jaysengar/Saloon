import { Home, Scissors, Image, Calendar, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface MobileBottomNavProps {
  activeSection: string;
  onServicesClick: () => void;
  onLibraryClick?: () => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home', href: '#home' },
  { id: 'services-page', icon: Scissors, label: 'Services', href: '#services-page' },
  { id: 'gallery', icon: Image, label: 'Gallery', href: '#gallery' },
  { id: 'booking', icon: Calendar, label: 'Book', href: '#booking', highlight: true },
  { id: 'about', icon: User, label: 'About', href: '#about' },
];

export default function MobileBottomNav({ activeSection, onServicesClick, onLibraryClick }: MobileBottomNavProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = (item: typeof navItems[0]) => {
    if (item.id === 'services-page') {
      onServicesClick();
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        backgroundColor: isDark ? 'rgba(10,10,10,0.97)' : 'rgba(250,248,245,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: `1px solid ${isDark ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.2)'}`,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: isDark
          ? '0 -4px 30px rgba(0,0,0,0.5)'
          : '0 -4px 30px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id ||
            (item.id === 'home' && activeSection === '') ||
            (item.id === 'services-page' && activeSection === 'services');

          if (item.highlight) {
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => handleClick(item)}
                className="flex flex-col items-center gap-0.5 relative -mt-6"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all duration-300 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37, #b8960c)',
                    border: '2px solid rgba(212,175,55,0.4)',
                  }}
                >
                  <Icon size={22} className="text-black" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-semibold tracking-wide text-[#d4af37]">
                  {item.label}
                </span>
              </a>
            );
          }

          return (
            <a
              key={item.id}
              href={item.href}
              onClick={() => handleClick(item)}
              className="flex flex-col items-center gap-1 min-w-[50px] py-1 transition-all duration-200 active:scale-90 relative"
            >
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#d4af37]"
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ color: isActive ? '#d4af37' : isDark ? '#6b7280' : '#9ca3af' }}
              />
              <span
                className="text-[10px] font-medium tracking-wide transition-all duration-200"
                style={{ color: isActive ? '#d4af37' : isDark ? '#6b7280' : '#9ca3af' }}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
