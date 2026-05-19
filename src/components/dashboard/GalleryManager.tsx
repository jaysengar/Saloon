import { useEffect, useState } from 'react';
import { supabase, type GalleryPhoto } from '../../lib/supabase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Plus, Pencil, Trash2, X, Upload, Image, Eye, EyeOff } from 'lucide-react';

const emptyPhoto: Omit<GalleryPhoto, 'id' | 'created_at' | 'updated_at'> = {
  image: '', caption: '', category: 'Salon', is_active: true, sort_order: 0,
};

const categories = ['Salon', 'Haircut', 'Color', 'Styling', 'Treatment', 'Bridal', 'Spa', 'Grooming', 'Other'];

export default function GalleryManager() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<GalleryPhoto> | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  const fetchPhotos = async () => {
    setLoading(true);
    const { data } = await supabase.from('gallery_photos').select('*').order('sort_order');
    setPhotos(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPhotos(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel('gallery-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_photos' }, () => { fetchPhotos(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSave = async () => {
    if (!editing || !editing.image) return;
    setSaving(true);

    if (editing.id) {
      await supabase.from('gallery_photos').update({
        image: editing.image,
        caption: editing.caption,
        category: editing.category,
        is_active: editing.is_active,
        sort_order: editing.sort_order,
        updated_at: new Date().toISOString(),
      }).eq('id', editing.id);
    } else {
      await supabase.from('gallery_photos').insert({
        image: editing.image,
        caption: editing.caption,
        category: editing.category,
        is_active: editing.is_active,
        sort_order: editing.sort_order ?? 0,
      });
    }

    setEditing(null);
    setSaving(false);
    fetchPhotos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this photo?')) return;
    await supabase.from('gallery_photos').delete().eq('id', id);
    fetchPhotos();
  };

  const toggleActive = async (photo: GalleryPhoto) => {
    await supabase.from('gallery_photos').update({ is_active: !photo.is_active, updated_at: new Date().toISOString() }).eq('id', photo.id);
    fetchPhotos();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    try {
      const publicUrl = await uploadToCloudinary(file);
      setEditing({ ...editing, image: publicUrl });
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    }
  };

  const filtered = filter === 'All' ? photos : photos.filter((p) => p.category === filter);
  const allCategories = ['All', ...new Set(photos.map((p) => p.category))];

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
          <h2 className="text-2xl font-bold text-white">Beauty Gallery</h2>
          <p className="text-gray-500 text-sm">{photos.length} photos, {photos.filter(p => p.is_active).length} active</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyPhoto })}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all text-sm"
        >
          <Plus size={16} /> Add Photo
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === cat
                ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30'
                : 'text-gray-500 border border-white/5 hover:border-white/20 hover:text-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((photo) => (
          <div
            key={photo.id}
            className={`bg-[#111] border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg group ${
              photo.is_active ? 'border-white/5' : 'border-red-500/20 opacity-60'
            }`}
          >
            <div className="relative h-40 overflow-hidden">
              <img src={photo.image} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 rounded-full text-[10px] text-[#d4af37] font-medium">
                {photo.category}
              </div>
              {!photo.is_active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-red-400 text-xs font-medium">Hidden</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-white text-sm font-medium truncate">{photo.caption || 'Untitled'}</p>
              <p className="text-gray-600 text-xs">Order: {photo.sort_order}</p>
            </div>
            <div className="flex items-center border-t border-white/5 divide-x divide-white/5">
              <button
                onClick={() => toggleActive(photo)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:text-[#d4af37] transition-colors"
              >
                {photo.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                {photo.is_active ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => setEditing({ ...photo })}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:text-[#d4af37] transition-colors"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(photo.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Image size={48} className="mx-auto mb-4 opacity-30" />
          <p>No gallery photos yet. Add your first photo!</p>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">{editing.id ? 'Edit Photo' : 'Add Photo'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Photo</label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-24 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-white/10">
                    {editing.image ? (
                      <img src={editing.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600"><Image size={28} /></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:border-[#d4af37]/40 hover:text-[#d4af37] transition-all cursor-pointer text-sm">
                      <Upload size={14} /> Upload Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={editing.image ?? ''}
                      onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                      placeholder="Or paste image URL"
                      className="w-full mt-2 bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Caption</label>
                <input
                  type="text"
                  value={editing.caption ?? ''}
                  onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50"
                  placeholder="e.g. Elegant Bridal Styling"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Category</label>
                  <select
                    value={editing.category ?? 'Salon'}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50 appearance-none"
                  >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Sort Order</label>
                  <input
                    type="number"
                    value={editing.sort_order ?? 0}
                    onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Status</label>
                  <select
                    value={editing.is_active ? 'true' : 'false'}
                    onChange={(e) => setEditing({ ...editing, is_active: e.target.value === 'true' })}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50 appearance-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/5 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editing.image}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing.id ? 'Update' : 'Add Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
