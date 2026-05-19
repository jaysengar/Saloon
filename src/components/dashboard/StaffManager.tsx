import { useEffect, useState } from 'react';
import { supabase, type Staff } from '../../lib/supabase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Plus, Pencil, Trash2, X, Upload, User, Eye, EyeOff } from 'lucide-react';

const emptyStaff: Omit<Staff, 'id' | 'created_at' | 'updated_at'> = {
  name: '', role: 'Stylist', image: '', bio: '', experience: '', is_active: true, sort_order: 0,
};

export default function StaffManager() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Staff> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    const { data } = await supabase.from('staff').select('*').order('sort_order');
    setStaff(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('staff-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => { fetchStaff(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSave = async () => {
    if (!editing || !editing.name) return;
    setSaving(true);

    if (editing.id) {
      await supabase.from('staff').update({
        name: editing.name,
        role: editing.role,
        image: editing.image,
        bio: editing.bio,
        experience: editing.experience,
        is_active: editing.is_active,
        sort_order: editing.sort_order,
        updated_at: new Date().toISOString(),
      }).eq('id', editing.id);
    } else {
      await supabase.from('staff').insert({
        name: editing.name,
        role: editing.role,
        image: editing.image,
        bio: editing.bio,
        experience: editing.experience,
        is_active: editing.is_active,
        sort_order: editing.sort_order ?? 0,
      });
    }

    setEditing(null);
    setSaving(false);
    fetchStaff();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this staff member?')) return;
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') {
        alert('Cannot delete this staff member because they are referenced by existing bookings. Please deactivate (Hide) them instead.');
      } else {
        alert('Failed to delete staff member: ' + error.message);
      }
    }
    fetchStaff();
  };

  const toggleActive = async (member: Staff) => {
    await supabase.from('staff').update({ is_active: !member.is_active, updated_at: new Date().toISOString() }).eq('id', member.id);
    fetchStaff();
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Staff Members</h2>
          <p className="text-gray-500 text-sm">{staff.length} members</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyStaff })}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all text-sm"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <div
            key={member.id}
            className={`bg-[#111] border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg ${
              member.is_active ? 'border-white/5' : 'border-red-500/20 opacity-60'
            }`}
          >
            <div className="flex items-start gap-4 p-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <User size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold truncate">{member.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    member.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-[#d4af37] text-sm">{member.role}</p>
                {member.experience && <p className="text-gray-500 text-xs mt-1">{member.experience}</p>}
              </div>
            </div>
            <div className="flex items-center border-t border-white/5 divide-x divide-white/5">
              <button
                onClick={() => toggleActive(member)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:text-[#d4af37] transition-colors"
              >
                {member.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                {member.is_active ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => setEditing({ ...member })}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:text-[#d4af37] transition-colors"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <User size={48} className="mx-auto mb-4 opacity-30" />
          <p>No staff members yet. Add your first team member!</p>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">{editing.id ? 'Edit Staff' : 'Add Staff'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-white/10">
                    {editing.image ? (
                      <img src={editing.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600"><User size={28} /></div>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Name</label>
                  <input
                    type="text"
                    value={editing.name ?? ''}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Role</label>
                  <input
                    type="text"
                    value={editing.role ?? ''}
                    onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50"
                    placeholder="e.g. Senior Stylist"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Experience</label>
                <input
                  type="text"
                  value={editing.experience ?? ''}
                  onChange={(e) => setEditing({ ...editing, experience: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50"
                  placeholder="e.g. 5 Years"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase">Bio</label>
                <textarea
                  value={editing.bio ?? ''}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50 resize-none"
                  placeholder="Short bio about the staff member"
                />
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
                {saving ? 'Saving...' : editing.id ? 'Update' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
