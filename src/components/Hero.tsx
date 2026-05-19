import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Sparkles, Star } from 'lucide-react';
import { supabase, type SalonSettings } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

const floatingParticles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 5,
  duration: Math.random() * 4 + 4,
}));

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    supabase.from('salon_settings').select('*').maybeSingle().then(({ data }) => {
      if (data) setSettings(data);
    });

    const channel = supabase
      .channel('hero-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'salon_settings' }, (payload) => {
        if (payload.new) setSettings(payload.new as SalonSettings);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const heroImage = settings?.hero_image || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1920';
  const salonName = settings?.salon_name || 'Reborn Unisex';
  const tagline = settings?.tagline || 'Where Beauty Meets Elegance';

  return (
    <section id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 transition-transform duration-100 ease-out"
        style={{ transform: `perspective(1000px) rotateX(${mousePos.y * 0.05}deg) rotateY(${mousePos.x * 0.05}deg)` }}
      >
        <img src={heroImage} alt="Reborn Unisex Salon" className="w-full h-full object-cover scale-110" />
        <div className="absolute inset-0" style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(10,10,10,0.7), rgba(10,10,10,0.5), #0a0a0a)'
            : 'linear-gradient(to bottom, rgba(250,248,245,0.7), rgba(250,248,245,0.5), #faf8f5)',
        }} />
        <div className="absolute inset-0" style={{
          background: isDark
            ? 'linear-gradient(to right, rgba(10,10,10,0.6), transparent, rgba(10,10,10,0.4))'
            : 'linear-gradient(to right, rgba(250,248,245,0.6), transparent, rgba(250,248,245,0.4))',
        }} />
      </div>

      {floatingParticles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#d4af37] opacity-20 animate-float"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
        />
      ))}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full border border-[#d4af37]/10 animate-spin-slow" style={{ transform: 'perspective(800px) rotateX(75deg)' }} />
        <div className="absolute w-[450px] h-[450px] rounded-full border border-[#d4af37]/8 animate-spin-reverse" style={{ transform: 'perspective(800px) rotateX(75deg)' }} />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 mb-6 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Sparkles size={14} className="text-[#d4af37]" />
          <span className="text-[#d4af37] text-sm font-medium tracking-widest uppercase">Premium Hair & Beauty</span>
          <Sparkles size={14} className="text-[#d4af37]" />
        </div>

        <h1 className={`font-black mb-4 leading-none tracking-tight transition-all duration-1000 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ color: 'var(--text-primary)', textShadow: '0 0 30px rgba(212, 175, 55, 0.2)' }}>
          <span className="text-4xl sm:text-5xl md:text-8xl">{salonName}</span>
          <br />
          <span className="text-2xl sm:text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f5e169] to-[#b8960c]">UNISEX SALON</span>
        </h1>

        <p className={`text-base sm:text-xl md:text-2xl font-light tracking-widest mb-3 transition-all duration-1000 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ color: 'var(--text-secondary)' }}>
          {tagline}
        </p>

        <div className={`flex items-center justify-center gap-1 mb-8 transition-all duration-1000 delay-400 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-[#d4af37] fill-[#d4af37]" />)}
          <span className="text-sm ml-2" style={{ color: 'var(--text-muted)' }}>Trusted by 500+ clients</span>
        </div>

        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <a href="#booking" className="group px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-bold rounded-full text-lg hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <span className="relative z-10">Book Appointment</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5e169] to-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>
          <a href="#services-page" className="px-8 py-4 border border-[#d4af37]/50 text-[#d4af37] font-semibold rounded-full text-lg hover:bg-[#d4af37]/10 hover:border-[#d4af37] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300">
            Explore Services
          </a>
          <a href="/reborn-salon.apk" download className="px-8 py-4 border border-white/20 text-white font-semibold rounded-full text-lg hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex items-center gap-2">
            Download App
          </a>
        </div>
      </div>

      <a href="#services" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#d4af37]/60 hover:text-[#d4af37] transition-colors animate-bounce">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={20} />
      </a>

      <div className="absolute top-24 left-8 w-16 h-16 border-t-2 border-l-2 border-[#d4af37]/30" />
      <div className="absolute top-24 right-8 w-16 h-16 border-t-2 border-r-2 border-[#d4af37]/30" />
      <div className="absolute bottom-16 left-8 w-16 h-16 border-b-2 border-l-2 border-[#d4af37]/30" />
      <div className="absolute bottom-16 right-8 w-16 h-16 border-b-2 border-r-2 border-[#d4af37]/30" />
    </section>
  );
}
