import { useState, useEffect } from 'react';
import { Play, ZoomIn, X, ChevronLeft, ChevronRight, Pause } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AssetData {
  path: string;
  url: string;
  type: 'image' | 'video';
  filename: string;
}

import assetData from '../lib/assets-data.json';

const assets: AssetData[] = (assetData.assets as any[]).map(asset => ({
  path: asset.filename,
  url: asset.url,
  type: asset.type as 'image' | 'video',
  filename: asset.filename
}));

export default function Library() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeCategory, setActiveCategory] = useState<'All' | 'Images' | 'Videos'>('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = assets.filter(asset => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Images' && asset.type === 'image') return true;
    if (activeCategory === 'Videos' && asset.type === 'video') return true;
    return false;
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox((prev) => (prev !== null ? (prev + 1) % filtered.length : null));
      if (e.key === 'ArrowLeft') setLightbox((prev) => (prev !== null ? (prev - 1 + filtered.length) % filtered.length : null));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, filtered.length]);

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#d4af37]/50 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-[#d4af37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">Asset Library</span>
          <h1 className="text-4xl md:text-6xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>
            Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#b8960c]">Collection</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="max-w-xl mx-auto">
            A comprehensive collection of our salon's videos and photos, synchronized and ready to view.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 animate-fade-in-up delay-100">
          {['All', 'Images', 'Videos'].map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat as any); setLightbox(null); }}
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

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filtered.map((asset, index) => (
            <div 
              key={asset.path} 
              className="break-inside-avoid relative overflow-hidden rounded-2xl group cursor-pointer animate-fade-in-up shadow-lg"
              onClick={() => setLightbox(index)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {asset.type === 'image' ? (
                <img 
                  src={asset.url} 
                  alt={asset.filename} 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="relative">
                  <video 
                    src={asset.url} 
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#d4af37]/80 flex items-center justify-center text-black backdrop-blur-sm shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                      <Play size={20} className="ml-1" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: isDark
                  ? 'linear-gradient(to top, rgba(8,8,8,0.9) 0%, transparent 50%)'
                  : 'linear-gradient(to top, rgba(243,239,232,0.9) 0%, transparent 50%)',
              }}>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 backdrop-blur-md">
                    {asset.type.toUpperCase()}
                  </span>
                  <p className="mt-2 text-sm truncate font-medium" style={{ color: 'var(--text-primary)' }}>
                    {asset.filename}
                  </p>
                </div>
                
                {asset.type === 'image' && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full backdrop-blur-sm bg-black/40 flex items-center justify-center text-white/80">
                    <ZoomIn size={14} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p>No media found in this category.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div 
          className="fixed inset-0 z-[100] backdrop-blur-xl flex items-center justify-center p-4 transition-all duration-300" 
          style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(250,248,245,0.95)' }} 
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-6 right-6 transition-colors z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white" onClick={(e) => { e.stopPropagation(); setLightbox(null); }}>
            <X size={24} />
          </button>

          {filtered.length > 1 && (
            <>
              <button 
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 bg-white/10 hover:bg-[#d4af37] text-white hover:text-black"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + filtered.length) % filtered.length); }}
              >
                <ChevronLeft size={24} />
              </button>

              <button 
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 bg-white/10 hover:bg-[#d4af37] text-white hover:text-black"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % filtered.length); }}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div onClick={(e) => e.stopPropagation()} className="max-w-6xl w-full flex flex-col items-center max-h-screen p-4">
            <div className="relative w-full flex justify-center items-center overflow-hidden" style={{ maxHeight: '80vh' }}>
              {filtered[lightbox].type === 'image' ? (
                <img
                  key={lightbox}
                  src={filtered[lightbox].url}
                  alt={filtered[lightbox].filename}
                  className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl animate-fade-in"
                />
              ) : (
                <video
                  key={lightbox}
                  src={filtered[lightbox].url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[80vh] rounded-xl shadow-2xl animate-fade-in outline-none"
                />
              )}
            </div>
            <div className="text-center mt-6">
              <span className="font-semibold text-lg block mb-1" style={{ color: 'var(--text-primary)' }}>{filtered[lightbox].filename}</span>
              <span className="text-[#d4af37] text-sm bg-[#d4af37]/10 px-3 py-1 rounded-full">{filtered[lightbox].type.toUpperCase()}</span>
            </div>
            <div className="text-xs mt-4 font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {lightbox + 1} / {filtered.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
