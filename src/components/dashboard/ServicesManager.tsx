import { useEffect, useState } from 'react';
import { supabase, type Service } from '../../lib/supabase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Plus, Pencil, Trash2, X, Upload, Sparkles, Eye, EyeOff } from 'lucide-react';

const emptyService: Omit<Service, 'id' | 'created_at' | 'updated_at'> = {
  name: '', description: '', price: '₹0', duration: '30 min', image: '', category: 'Hair', is_active: true, sort_order: 0,
};

const categories = ['Hair', 'Color', 'Styling', 'Treatment', 'Bridal', 'Spa', 'Grooming', 'Other'];

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  const fetchServices = async () => {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('sort_order');
    setServices(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel('services-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => { fetchServices(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSave = async () => {
    if (!editing || !editing.name) return;
    setSaving(true);

    if (editing.id) {
      await supabase.from('services').update({
        name: editing.name,
        description: editing.description,
        price: editing.price,
        duration: editing.duration,
        image: editing.image,
        category: editing.category,
        is_active: editing.is_active,
        sort_order: editing.sort_order,
        updated_at: new Date().toISOString(),
      }).eq('id', editing.id);
    } else {
      await supabase.from('services').insert({
        name: editing.name,
        description: editing.description,
        price: editing.price,
        duration: editing.duration,
        image: editing.image,
        category: editing.category,
        is_active: editing.is_active,
        sort_order: editing.sort_order ?? 0,
      });
    }

    setEditing(null);
    setSaving(false);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') {
        alert('Cannot delete this service because it is referenced by existing bookings. Please deactivate (Hide) it instead.');
      } else {
        alert('Failed to delete service: ' + error.message);
      }
    }
    fetchServices();
  };

  const toggleActive = async (service: Service) => {
    await supabase.from('services').update({ is_active: !service.is_active, updated_at: new Date().toISOString() }).eq('id', service.id);
    fetchServices();
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

  const filtered = filter === 'All' ? services : services.filter((s) => s.category === filter);
  const allCategories = ['All', ...new Set(services.map((s) => s.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Services</h2>
          <p className="text-gray-500 text-sm">{services.length} services, {services.filter(s => s.is_active).length} active</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyService })}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all text-sm"
        >
          <Plus size={16} /> Add Service
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

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <div
            key={service.id}
            className={`bg-[#111] border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg ${
              service.is_active ? 'border-white/5' : 'border-red-500/20 opacity-60'
            }`}
          >
            {/* Image */}
            <div className="relative h-36 overflow-hidden bg-[#1a1a1a]">
              {service.image ? (
                <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700">
                  <Sparkles size={32} />
                </div>
              )}
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 rounded-full text-[10px] text-[#d4af37] font-medium">
                {service.category}
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-[#d4af37] to-[#b8960c] rounded-full text-[10px] text-black font-bold">
                {service.price}
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-white font-semibold">{service.name}</h3>
              <p className="text-gray-500 text-xs mt-1 line-clamp-2">{service.description}</p>
              <p className="text-gray-600 text-xs mt-2">{service.duration}</p>
            </div>

            <div className="flex items-center border-t border-white/5 divide-x divide-white/5">
              <button
                onClick={() => toggleActive(service)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:text-[#d4af37] transition-colors"
              >
                {service.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                {service.is_active ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => setEditing({ ...service })}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:text-[#d4af37] transition-colors"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(service.id)}
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
          <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
          <p>No services found. Add your first service!</p>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">{editing.id ? 'Edit Service' : 'Add Service'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Service Image</label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-20 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-white/10">
                    {editing.image ? (
                      <img src={editing.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600"><Sparkles size={24} /></div>
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
                <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Service Name</label>
                <input
                  type="text"
                  value={editing.name ?? ''}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50"
                  placeholder="e.g. Precision Haircut"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Description</label>
                <textarea
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50 resize-none"
                  placeholder="Describe the service"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Price</label>
                  <input
                    type="text"
                    value={editing.price ?? ''}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50"
                    placeholder="₹299"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Duration</label>
                  <input
                    type="text"
                    value={editing.duration ?? ''}
                    onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50"
                    placeholder="30 min"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Category</label>
                  <select
                    value={editing.category ?? 'Hair'}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50 appearance-none"
                  >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                disabled={saving || !editing.name}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing.id ? 'Update' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
