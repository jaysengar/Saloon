import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube } from 'lucide-react';
import logoImg from '../logo/cropped_circle_image.png';
import { supabase, type SalonSettings } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

const defaultLinks = {
  Services: ['Haircut & Styling', 'Hair Coloring', 'Blow Dry', 'Bridal Package', 'Spa & Facial', 'Deep Conditioning'],
  Company: ['About Us', 'Our Team', 'Careers', 'Blog', 'Press'],
  Support: ['Book Appointment', 'FAQ', 'Privacy Policy', 'Terms of Service', 'Contact Us'],
};

export default function Footer() {
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    supabase.from('salon_settings').select('*').maybeSingle().then(({ data }) => {
      if (data) setSettings(data);
    });

    const channel = supabase
      .channel('footer-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'salon_settings' }, (payload) => {
        if (payload.new) setSettings(payload.new as SalonSettings);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const name = settings?.salon_name || 'Reborn Unisex';
  const tagline = settings?.tagline || 'Where Beauty Meets Elegance';

  return (
    <footer className="pt-16 pb-8 px-6 relative overflow-hidden" style={{ backgroundColor: isDark ? '#060606' : 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[#d4af37]/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <img
                src={logoImg}
                alt="Reborn Salon Logo"
                className="w-10 h-10 rounded-full object-cover shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              />
              <span className="flex flex-col leading-tight">
                <span className="text-lg font-bold tracking-widest text-[#d4af37]">{name}</span>
                <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>SALON</span>
              </span>
            </div>
            <p className="leading-relaxed text-sm mb-6 max-w-xs" style={{ color: 'var(--text-muted)' }}>{tagline}. Premium hair and beauty salon dedicated to enhancing your natural beauty with expert care and luxury treatments.</p>

            <div className="space-y-3">
              {settings?.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={15} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <span className="text-sm whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>{settings.address}</span>
                </div>
              )}
              {settings?.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={15} className="text-[#d4af37] flex-shrink-0" />
                  <a href={`tel:${settings.phone}`} className="text-sm hover:text-[#d4af37] transition-colors" style={{ color: 'var(--text-muted)' }}>{settings.phone}</a>
                </div>
              )}
              {settings?.email && (
                <div className="flex items-center gap-3">
                  <Mail size={15} className="text-[#d4af37] flex-shrink-0" />
                  <a href={`mailto:${settings.email}`} className="text-sm hover:text-[#d4af37] transition-colors" style={{ color: 'var(--text-muted)' }}>{settings.email}</a>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Clock size={15} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Mon–Sat: {settings?.hours_weekday || '9 AM – 8 PM'}<br />Sunday: {settings?.hours_sunday || '10 AM – 6 PM'}</span>
              </div>
            </div>
          </div>

          {Object.entries(defaultLinks).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="font-semibold text-sm tracking-widest uppercase mb-5" style={{ color: 'var(--text-primary)' }}>{heading}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-[#d4af37] transition-colors duration-200 flex items-center gap-1.5 group" style={{ color: 'var(--text-muted)' }}>
                      <span className="w-0 group-hover:w-3 h-px bg-[#d4af37] transition-all duration-300 inline-block" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <p className="text-sm text-center md:text-left" style={{ color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} {name} Salon. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {[
              { icon: Instagram, url: settings?.instagram, label: 'Instagram' },
              { icon: Facebook, url: settings?.facebook, label: 'Facebook' },
              { icon: Youtube, url: settings?.youtube, label: 'YouTube' },
            ].filter(({ url }) => url).map(({ icon: Icon, url, label }) => (
              <a key={label} href={url} aria-label={label}
                className="w-9 h-9 rounded-full border flex items-center justify-center hover:border-[#d4af37]/50 hover:text-[#d4af37] hover:shadow-[0_0_12px_rgba(212,175,55,0.2)] transition-all duration-300"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
