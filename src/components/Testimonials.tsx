import { useEffect, useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Camera, X, Send, Upload } from 'lucide-react';
import { supabase, type Review } from '../lib/supabase';
import { uploadToCloudinary } from '../lib/cloudinary';
import { useTheme } from '../contexts/ThemeContext';

function StarRating({ value, onChange, interactive = false }: { value: number; onChange?: (v: number) => void; interactive?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-150`}
        >
          <Star
            size={interactive ? 24 : 16}
            className={i <= value ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'}
          />
        </button>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    supabase.from('reviews').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      setReviews(data ?? []);
    });

    const channel = supabase
      .channel('reviews-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        supabase.from('reviews').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
          setReviews(data ?? []);
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoPlay || reviews.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay, reviews.length]);

  const prev = () => {
    setAutoPlay(false);
    setCurrent((c) => (c - 1 + reviews.length) % reviews.length);
  };
  const next = () => {
    setAutoPlay(false);
    setCurrent((c) => (c + 1) % reviews.length);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const publicUrl = await uploadToCloudinary(file);
      setFormPhoto(publicUrl);
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) return;
    setSubmitting(true);

    await supabase.from('reviews').insert({
      name: formName.trim(),
      rating: formRating,
      comment: formComment.trim(),
      photo: formPhoto,
      is_active: true,
      sort_order: reviews.length,
    });

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setSubmitted(false);
      setFormName('');
      setFormRating(5);
      setFormComment('');
      setFormPhoto('');
    }, 2000);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <section id="testimonials" className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: isDark ? '#080808' : 'var(--bg-tertiary)' }} ref={ref}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#d4af37]/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.04)_0%,_transparent_70%)]" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <span className="text-[#d4af37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">Client Love</span>
          <h2 className="text-4xl md:text-6xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>
            What They <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#b8960c]">Say</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-[#d4af37] fill-[#d4af37]" />)}
            </div>
            <span className="text-[#d4af37] font-bold text-lg">{avgRating}</span>
            <span style={{ color: 'var(--text-muted)' }} className="text-sm">({reviews.length} reviews)</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-semibold rounded-full text-sm hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:scale-105 transition-all duration-300"
          >
            <Send size={14} /> Write a Review
          </button>
        </div>

        {/* Main Testimonial */}
        {reviews.length > 0 && (
          <div className={`relative transition-all duration-1000 delay-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative rounded-3xl p-8 md:p-12 text-center shadow-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(212,175,55,0.1)' }}>
              <div className="absolute top-8 left-8 text-[#d4af37]/20">
                <Quote size={48} />
              </div>
              <div className="absolute bottom-8 right-8 text-[#d4af37]/20 rotate-180">
                <Quote size={48} />
              </div>

              {/* Avatar */}
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#d4af37]/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                  {reviews[current].photo ? (
                    <img src={reviews[current].photo} alt={reviews[current].name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#d4af37]" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      {reviews[current].name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#d4af37] flex items-center justify-center">
                  <span className="text-black text-xs font-bold">✓</span>
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center justify-center gap-1 mb-4">
                <StarRating value={reviews[current].rating} />
              </div>

              {/* Text */}
              <p className="text-lg md:text-xl leading-relaxed mb-6 max-w-2xl mx-auto italic" style={{ color: 'var(--text-secondary)' }}>
                "{reviews[current].comment}"
              </p>

              {/* Name */}
              <div>
                <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{reviews[current].name}</div>
                <div className="text-[#d4af37] text-sm">
                  {new Date(reviews[current].created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>

            {/* Navigation */}
            {reviews.length > 1 && (
              <div className="flex items-center justify-center gap-6 mt-8">
                <button
                  onClick={prev}
                  className="w-12 h-12 rounded-full border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-all duration-300"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-2">
                  {reviews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setCurrent(i); setAutoPlay(false); }}
                      className={`rounded-full transition-all duration-300 ${
                        i === current ? 'w-8 h-2 bg-[#d4af37]' : 'w-2 h-2 hover:bg-white/40'
                      }`}
                      style={i !== current ? { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' } : undefined}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  className="w-12 h-12 rounded-full border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-all duration-300"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* Bottom mini avatars */}
            {reviews.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                {reviews.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => { setCurrent(i); setAutoPlay(false); }}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                      i === current ? 'border-[#d4af37] scale-110' : 'opacity-50 hover:opacity-80'
                    }`}
                    style={i !== current ? { borderColor: 'var(--border-color)' } : undefined}
                  >
                    {r.photo ? (
                      <img src={r.photo} alt={r.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#d4af37]" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {reviews.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <Star size={48} className="mx-auto mb-4 opacity-30" />
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4" style={{ backgroundColor: 'var(--overlay)' }} onClick={() => setShowForm(false)}>
          <div className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Share Your Experience</h3>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }} className="hover:text-[#d4af37] transition-colors">
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8960c] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                  <Star size={28} className="text-black fill-black" />
                </div>
                <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Thank You!</h4>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Your review has been submitted and will appear soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Photo Upload */}
                <div>
                  <label className="block text-xs font-medium tracking-wide mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Your Photo (Optional)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0" style={{ border: '2px solid var(--border-color)' }}>
                      {formPhoto ? (
                        <img src={formPhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                          <Camera size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed rounded-xl cursor-pointer text-sm transition-all hover:border-[#d4af37]/40 hover:text-[#d4af37]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                        <Upload size={14} /> Upload Photo
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                      <input
                        type="text"
                        value={formPhoto}
                        onChange={(e) => setFormPhoto(e.target.value)}
                        placeholder="Or paste photo URL"
                        className="w-full mt-2 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50 transition-all"
                        style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium tracking-wide mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Your Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all"
                    style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-medium tracking-wide mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Rating</label>
                  <StarRating value={formRating} onChange={setFormRating} interactive />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-medium tracking-wide mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Your Review</label>
                  <textarea
                    required
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all resize-none"
                    style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm transition-all"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formName.trim() || !formComment.trim()}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
