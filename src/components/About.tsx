import { useEffect, useRef, useState } from 'react';
import { Award, Clock, Users, Heart } from 'lucide-react';
import { supabase, type Staff, type SalonSettings } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

const stats = [
  { icon: Users, value: '500+', label: 'Happy Clients', color: '#d4af37' },
  { icon: Award, value: '5+', label: 'Years of Excellence', color: '#e87c3e' },
  { icon: Clock, value: '50+', label: 'Services Offered', color: '#4ecdc4' },
  { icon: Heart, value: '98%', label: 'Satisfaction Rate', color: '#ff6b9d' },
];

function CountUp({ target, visible }: { target: string; visible: boolean }) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!visible) return;
    const num = parseInt(target);
    if (isNaN(num)) { setDisplay(target); return; }
    const suffix = target.replace(num.toString(), '');
    let start = 0;
    const duration = 1500;
    const step = duration / num;
    const timer = setInterval(() => {
      start += Math.ceil(num / 50);
      if (start >= num) { setDisplay(target); clearInterval(timer); }
      else { setDisplay(start + suffix); }
    }, step);
    return () => clearInterval(timer);
  }, [visible, target]);

  return <span>{display}</span>;
}

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    supabase.from('staff').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      setStaff(data ?? []);
    });
    supabase.from('salon_settings').select('*').maybeSingle().then(({ data }) => {
      if (data) setSettings(data);
    });

    const staffChannel = supabase
      .channel('about-staff')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => {
        supabase.from('staff').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
          setStaff(data ?? []);
        });
      })
      .subscribe();

    const settingsChannel = supabase
      .channel('about-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'salon_settings' }, (payload) => {
        if (payload.new) setSettings(payload.new as SalonSettings);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(staffChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  const aboutImage = settings?.about_image || 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <section id="about" className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }} ref={ref}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#d4af37]/50 to-transparent" />
      <div className="absolute right-0 top-1/4 w-96 h-96 rounded-full bg-[#d4af37]/3 blur-3xl pointer-events-none" />
      <div className="absolute left-0 bottom-1/4 w-96 h-96 rounded-full bg-[#e87c3e]/3 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className={`relative transition-all duration-1000 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'}`}>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src={aboutImage} alt="Reborn Unisex Salon" className="w-full object-cover" style={{ height: 'clamp(280px, 50vw, 500px)' }} />
                <div className="absolute inset-0" style={{
                  background: isDark ? 'linear-gradient(to top, rgba(10,10,10,0.4), transparent)' : 'linear-gradient(to top, rgba(250,248,245,0.4), transparent)',
                }} />
              </div>

              <div className="absolute -bottom-8 -right-8 rounded-2xl p-5 shadow-2xl w-52" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8960c] flex items-center justify-center">
                    <Award size={18} className="text-black" />
                  </div>
                  <div>
                    <div className="text-[#d4af37] font-bold text-lg leading-none">10+</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Years of Trust</div>
                  </div>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Serving clients with love & expertise</div>
              </div>

              <div className="absolute -top-6 -left-6 rounded-xl p-4 shadow-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="text-2xl font-black text-[#d4af37]">4.9</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Average Rating</div>
              </div>

              <div className="absolute -inset-2 rounded-3xl border border-[#d4af37]/10 pointer-events-none" />
            </div>
          </div>

          <div className={`transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`}>
            <span className="text-[#d4af37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">Our Story</span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
              More Than Just a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#b8960c]">Salon</span>
            </h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Reborn Unisex Salon was born from a passion for artistry and a commitment to making every client feel truly beautiful. Founded over a decade ago, we've grown into a beloved destination where style meets soul.
            </p>
            <p className="leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
              Our team of expert stylists continuously trains on the latest techniques, ensuring you receive nothing but the best. We use only premium, cruelty-free products that nourish and protect while delivering stunning results.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {['Premium Products Only', 'Expert Certified Stylists', 'Hygienic Environment', 'Personalized Service'].map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feat}</span>
                </div>
              ))}
            </div>

            <a href="#booking" className="inline-flex items-center gap-3 px-7 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-bold rounded-full hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-105 transition-all duration-300">
              Experience the Difference <span>→</span>
            </a>
          </div>
        </div>

        {staff.length > 0 && (
          <div className={`mt-20 transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <h3 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text-primary)' }}>Meet Our <span className="text-[#d4af37]">Team</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {staff.map((member) => (
                <div key={member.id} className="rounded-2xl overflow-hidden group hover:border-[#d4af37]/20 transition-all duration-300 hover:shadow-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div className="h-48 overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}><Users size={32} /></div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</h4>
                    <p className="text-[#d4af37] text-sm">{member.role}</p>
                    {member.experience && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{member.experience}</p>}
                    {member.bio && <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{member.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 transition-all duration-1000 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {stats.map((stat) => (
            <div key={stat.label} className="relative p-6 rounded-2xl text-center hover:border-[#d4af37]/20 transition-all duration-300 group overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at center, ${stat.color}08, transparent)` }} />
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="text-3xl font-black mb-1" style={{ color: stat.color }}>
                <CountUp target={stat.value} visible={visible} />
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
