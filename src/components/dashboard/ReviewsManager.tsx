import { useEffect, useState } from 'react';
import { supabase, type Review } from '../../lib/supabase';
import { Star, Eye, EyeOff, Trash2, MessageSquare } from 'lucide-react';

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'hidden'>('all');

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    setReviews(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel('reviews-dash-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => { fetchReviews(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleActive = async (review: Review) => {
    await supabase.from('reviews').update({ is_active: !review.is_active, updated_at: new Date().toISOString() }).eq('id', review.id);
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    fetchReviews();
  };

  const filtered = filter === 'all' ? reviews : filter === 'active' ? reviews.filter((r) => r.is_active) : reviews.filter((r) => !r.is_active);
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Reviews</h2>
          <p className="text-gray-500 text-sm">{reviews.length} total, {avgRating} avg rating</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#111] border border-white/5 rounded-xl p-4">
          <div className="text-2xl font-black text-[#d4af37]">{reviews.length}</div>
          <div className="text-gray-500 text-xs">Total Reviews</div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-xl p-4">
          <div className="text-2xl font-black text-[#d4af37]">{avgRating}</div>
          <div className="text-gray-500 text-xs">Average Rating</div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-xl p-4">
          <div className="text-2xl font-black text-green-400">{reviews.filter(r => r.is_active).length}</div>
          <div className="text-gray-500 text-xs">Active</div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-xl p-4">
          <div className="text-2xl font-black text-red-400">{reviews.filter(r => !r.is_active).length}</div>
          <div className="text-gray-500 text-xs">Hidden</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'hidden'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30'
                : 'text-gray-500 border border-white/5 hover:border-white/20 hover:text-gray-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.map((review) => (
          <div
            key={review.id}
            className={`bg-[#111] border rounded-xl p-5 transition-all duration-300 ${
              review.is_active ? 'border-white/5' : 'border-red-500/20 opacity-60'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                {review.photo ? (
                  <img src={review.photo} alt={review.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#d4af37] bg-[#1a1a1a]">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white font-semibold">{review.name}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={12} className={i <= review.rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'} />
                    ))}
                  </div>
                  {!review.is_active && (
                    <span className="text-red-400 text-xs font-medium">Hidden</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-2">{review.comment}</p>
                <p className="text-gray-600 text-xs">
                  {new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(review)}
                  className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all"
                  title={review.is_active ? 'Hide review' : 'Show review'}
                >
                  {review.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                  title="Delete review"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
          <p>No reviews found.</p>
        </div>
      )}
    </div>
  );
}
