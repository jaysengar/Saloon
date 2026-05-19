import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StaffManager from './StaffManager';
import ServicesManager from './ServicesManager';
import GalleryManager from './GalleryManager';
import BookingsManager from './BookingsManager';
import ReviewsManager from './ReviewsManager';
import SettingsManager from './SettingsManager';
import { Users, Sparkles, Image, Calendar, Star, Settings, LogOut, ArrowLeft, Menu, X } from 'lucide-react';
import logoImg from '../../logo/cropped_circle_image.png';

const tabs = [
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState('staff');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'staff': return <StaffManager />;
      case 'services': return <ServicesManager />;
      case 'gallery': return <GalleryManager />;
      case 'bookings': return <BookingsManager />;
      case 'reviews': return <ReviewsManager />;
      case 'settings': return <SettingsManager />;
      default: return <StaffManager />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#111] border-r border-white/5 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="Reborn Salon Logo"
              className="w-9 h-9 rounded-full object-cover shadow-[0_0_12px_rgba(212,175,55,0.3)]"
            />
            <div>
              <div className="text-sm font-bold text-white tracking-wider">
                <span className="text-[#d4af37]">Reborn Unisex</span> SALON
              </div>
              <div className="text-[10px] text-gray-500 tracking-widest uppercase">Dashboard</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="text-xs text-gray-500 mb-2 truncate px-2">{user?.email}</div>
          <div className="flex items-center gap-2">
            <a
              href="#home"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-xs"
            >
              <ArrowLeft size={14} />
              Website
            </a>
            <button
              onClick={signOut}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all text-xs"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-screen">
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold text-white capitalize">{activeTab} Management</h1>
          <div className="text-xs text-gray-500">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
