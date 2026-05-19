import { useEffect, useRef, useState, useCallback } from 'react';
import { Scissors, Sparkles, Wind, Droplets, Crown, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, type Service } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

const iconMap: Record<string, typeof Scissors> = {
  Hair: Scissors, Color: Sparkles, Styling: Wind, Treatment: Droplets, Bridal: Crown, Spa: Star,
  Grooming: Scissors, Other: Star,
};

const colorMap: Record<string, string> = {
  Hair: '#d4af37', Color: '#e87c3e', Styling: '#4ecdc4', Treatment: '#45b7d1',
  Bridal: '#ff6b9d', Spa: '#a8e6cf', Grooming: '#d4af37', Other: '#d4af37',
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [visible, setVisible] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      setServices(data ?? []);
    });

    const channel = supabase
      .channel('services-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        supabase.from('services').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
          setServices(data ?? []);
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoSlide || services.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % services.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [autoSlide, services.length]);

  const prevSlide = () => {
    setAutoSlide(false);
    setSlideIndex((prev) => (prev - 1 + services.length) % services.length);
  };
  const nextSlide = () => {
    setAutoSlide(false);
    setSlideIndex((prev) => (prev + 1) % services.length);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  }, [services.length]);

  return (
    <section id="services" className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#d4af37]/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#d4af37]/3 blur-3xl" />

      <div className="max-w-7xl mx-auto" ref={ref}>
        <div className={`text-center mb-16 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <span className="text-[#d4af37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">What We Offer</span>
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#b8960c]">Services</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: 'var(--text-secondary)' }}>
            From classic cuts to luxurious treatments, we offer a full range of beauty services using only the finest products and techniques.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#d4af37]" />
            <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>
        </div>

        {services.length > 0 && (
          <div className={`relative transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="relative overflow-hidden rounded-2xl" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${slideIndex * 100}%)` }}
              >
                {services.map((service) => {
                  const Icon = iconMap[service.category] || Star;
                  const color = colorMap[service.category] || '#d4af37';
                  return (
                    <div key={service.id} className="w-full flex-shrink-0">
                      <div className="relative overflow-hidden" style={{ minHeight: 'clamp(320px, 60vw, 520px)' }}>
                        {service.image ? (
                          <img src={service.image} alt={service.name} className="w-full h-full object-cover object-center absolute inset-0" style={{ transform: 'scale(0.9)', transformOrigin: 'center center' }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <Icon size={60} style={{ color: `${color}40` }} />
                          </div>
                        )}
                        <div className="absolute inset-0" style={{
                          background: isDark
                            ? 'linear-gradient(to top, var(--bg-primary), rgba(10,10,10,0.4), transparent)'
                            : 'linear-gradient(to top, var(--bg-primary), rgba(250,248,245,0.4), transparent)',
                        }} />
                        <div className="absolute inset-0" style={{
                          background: isDark
                            ? 'linear-gradient(to right, rgba(10,10,10,0.6), transparent, rgba(10,10,10,0.6))'
                            : 'linear-gradient(to right, rgba(250,248,245,0.6), transparent, rgba(250,248,245,0.6))',
                        }} />

                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                              <Icon size={22} style={{ color }} />
                            </div>
                            <span className="px-4 py-1.5 rounded-full text-sm font-bold text-black" style={{ background: color }}>
                              {service.price}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)', color }}>
                              {service.category}
                            </span>
                            {service.duration && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)', color: 'var(--text-muted)' }}>
                                {service.duration}
                              </span>
                            )}
                          </div>
                          <h3 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>{service.name}</h3>
                          <p className="text-sm md:text-base max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{service.description}</p>
                          <a href="#booking" className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-semibold rounded-full text-sm hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:scale-105 transition-all duration-300">
                            Book This Service <span>→</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {autoSlide && services.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                  <div className="h-full bg-[#d4af37] animate-slideshow-progress" key={slideIndex} />
                </div>
              )}
            </div>

            {services.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-sm hover:bg-[#d4af37]/30 flex items-center justify-center transition-all duration-300"
                  style={{ background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)', color: 'var(--text-primary)' }}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-sm hover:bg-[#d4af37]/30 flex items-center justify-center transition-all duration-300"
                  style={{ background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)', color: 'var(--text-primary)' }}
                >
                  <ChevronRight size={24} />
                </button>

                <div className="flex items-center justify-center gap-2 mt-6">
                  {services.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setSlideIndex(i); setAutoSlide(false); }}
                      className={`rounded-full transition-all duration-300 ${
                        i === slideIndex ? 'w-8 h-2 bg-[#d4af37]' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {services.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
            <p>Services coming soon. Check back later!</p>
          </div>
        )}
      </div>
    </section>
  );
}
