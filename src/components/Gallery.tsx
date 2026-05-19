import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X, Pause, Play } from 'lucide-react';
import { supabase, type GalleryPhoto } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [visible, setVisible] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [lightboxSlide, setLightboxSlide] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    supabase.from('gallery_photos').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      setPhotos(data ?? []);
    });

    const channel = supabase
      .channel('gallery-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_photos' }, () => {
        supabase.from('gallery_photos').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
          setPhotos(data ?? []);
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

  const categories = ['All', ...new Set(photos.map((p) => p.category))];
  const filtered = activeCategory === 'All' ? photos : photos.filter((p) => p.category === activeCategory);

  useEffect(() => {
    if (!autoSlide || filtered.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % filtered.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [autoSlide, filtered.length]);

  useEffect(() => {
    if (lightboxSlide && lightbox !== null) {
      timerRef.current = setInterval(() => {
        setLightbox((prev) => (prev !== null ? (prev + 1) % filtered.length : null));
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lightboxSlide, lightbox, filtered.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') { setLightbox(null); setLightboxSlide(false); }
      if (e.key === 'ArrowRight') { setLightboxSlide(false); setLightbox((prev) => (prev !== null ? (prev + 1) % filtered.length : null)); }
      if (e.key === 'ArrowLeft') { setLightboxSlide(false); setLightbox((prev) => (prev !== null ? (prev - 1 + filtered.length) % filtered.length : null)); }
      if (e.key === ' ') { e.preventDefault(); setLightboxSlide((s) => !s); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, filtered.length]);

  const prevSlide = () => {
    setAutoSlide(false);
    setSlideIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  };
  const nextSlide = () => {
    setAutoSlide(false);
    setSlideIndex((prev) => (prev + 1) % filtered.length);
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
  }, [filtered.length]);

  return (
    <section id="gallery" className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: isDark ? '#080808' : 'var(--bg-tertiary)' }} ref={ref}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#d4af37]/50 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <span className="text-[#d4af37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">Our Portfolio</span>
          <h2 className="text-4xl md:text-6xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>
            Beauty <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#b8960c]">Gallery</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="max-w-xl mx-auto">Every transformation tells a story. Browse our work and find your inspiration.</p>
        </div>

        <div className={`flex flex-wrap items-center justify-center gap-3 mb-10 transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSlideIndex(0); setAutoSlide(true); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                  : 'border hover:border-[#d4af37]/40 hover:text-[#d4af37]'
              }`}
              style={activeCategory !== cat ? { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length > 0 && (
          <div className={`relative transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="relative overflow-hidden rounded-2xl" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${slideIndex * 100}%)` }}
              >
                {filtered.map((photo, index) => (
                  <div key={photo.id} className="w-full flex-shrink-0">
                    <div
                      className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden cursor-pointer group"
                      onClick={() => { setLightbox(index); setLightboxSlide(false); }}
                    >
                      <img src={photo.image} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0" style={{
                        background: isDark
                          ? 'linear-gradient(to top, #080808, rgba(8,8,8,0.3), transparent)'
                          : 'linear-gradient(to top, var(--bg-tertiary), rgba(243,239,232,0.3), transparent)',
                      }} />
                      <div className="absolute inset-0" style={{
                        background: isDark
                          ? 'linear-gradient(to right, rgba(8,8,8,0.5), transparent, rgba(8,8,8,0.5))'
                          : 'linear-gradient(to right, rgba(243,239,232,0.5), transparent, rgba(243,239,232,0.5))',
                      }} />

                      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                            {photo.category}
                          </span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>{photo.caption || 'Untitled'}</h3>
                      </div>

                      <div className="absolute top-6 right-6 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center group-hover:text-[#d4af37] group-hover:bg-[#d4af37]/20 transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)', color: 'var(--text-muted)' }}>
                        <ZoomIn size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {autoSlide && filtered.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                  <div className="h-full bg-[#d4af37] animate-slideshow-progress" key={slideIndex} />
                </div>
              )}
            </div>

            {filtered.length > 1 && (
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
                  {filtered.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setSlideIndex(i); setAutoSlide(false); }}
                      className={`rounded-full transition-all duration-300 ${
                        i === slideIndex ? 'w-8 h-2 bg-[#d4af37]' : 'w-2 h-2 hover:bg-white/40'
                      }`}
                      style={i !== slideIndex ? { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' } : undefined}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <ZoomIn size={48} className="mx-auto mb-4 opacity-30" />
            <p>Gallery photos coming soon!</p>
          </div>
        )}
      </div>

      {lightbox !== null && filtered[lightbox] && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(250,248,245,0.95)' }} onClick={() => { setLightbox(null); setLightboxSlide(false); }}>
          <button className="absolute top-6 right-6 transition-colors z-10" style={{ color: 'var(--text-muted)' }} onClick={() => { setLightbox(null); setLightboxSlide(false); }}>
            <X size={32} />
          </button>

          <button className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10"
            style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
            onClick={(e) => { e.stopPropagation(); setLightboxSlide(false); setLightbox((lightbox - 1 + filtered.length) % filtered.length); }}>
            <ChevronLeft size={24} />
          </button>

          <button className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10"
            style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
            onClick={(e) => { e.stopPropagation(); setLightboxSlide(false); setLightbox((lightbox + 1) % filtered.length); }}>
            <ChevronRight size={24} />
          </button>

          <button
            className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full transition-all z-10 text-sm"
            style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: 'var(--text-secondary)' }}
            onClick={(e) => { e.stopPropagation(); setLightboxSlide(!lightboxSlide); }}
          >
            {lightboxSlide ? <Pause size={16} /> : <Play size={16} />}
            {lightboxSlide ? 'Pause' : 'Slideshow'}
          </button>

          <div onClick={(e) => e.stopPropagation()} className="max-w-5xl w-full flex flex-col items-center">
            <div className="relative w-full">
              <img
                key={lightbox}
                src={filtered[lightbox].image}
                alt={filtered[lightbox].caption}
                className="w-full aspect-[16/9] object-cover rounded-xl shadow-2xl animate-fade-in"
              />
              {lightboxSlide && (
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}>
                  <div className="h-full bg-[#d4af37] animate-slideshow-progress" />
                </div>
              )}
            </div>
            <div className="text-center mt-4">
              <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{filtered[lightbox].caption || 'Untitled'}</span>
              <span className="text-[#d4af37] ml-3 text-sm">— {filtered[lightbox].category}</span>
            </div>
            <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              {lightbox + 1} / {filtered.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
