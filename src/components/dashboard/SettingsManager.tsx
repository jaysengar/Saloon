import { useEffect, useState } from 'react';
import { supabase, type SalonSettings } from '../../lib/supabase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Save, Upload, Scissors } from 'lucide-react';

export default function SettingsManager() {
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('salon_settings').select('*').maybeSingle();
    if (data) {
      setSettings(data);
    } else {
      setSettings({
        id: '',
        salon_name: '',
        tagline: '',
        address: '',
        phone: '',
        email: '',
        hours_weekday: '',
        hours_sunday: '',
        instagram: '',
        facebook: '',
        youtube: '',
        hero_image: '',
        about_image: '',
        created_at: '',
        updated_at: '',
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSaved(false);

    const payload = {
      salon_name: settings.salon_name,
      tagline: settings.tagline,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      hours_weekday: settings.hours_weekday,
      hours_sunday: settings.hours_sunday,
      instagram: settings.instagram,
      facebook: settings.facebook,
      youtube: settings.youtube,
      hero_image: settings.hero_image,
      about_image: settings.about_image,
      updated_at: new Date().toISOString(),
    };

    if (settings.id) {
      await supabase.from('salon_settings').update(payload).eq('id', settings.id);
    } else {
      await supabase.from('salon_settings').insert(payload);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'hero_image' | 'about_image') => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    try {
      const publicUrl = await uploadToCloudinary(file);
      setSettings({ ...settings, [field]: publicUrl });
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]/50 transition-all";
  const labelClass = "block text-gray-400 text-xs font-medium tracking-wide mb-2 uppercase";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Salon Settings</h2>
          <p className="text-gray-500 text-sm">Customize your salon details</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all text-sm disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Brand */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#d4af37] mb-4 flex items-center gap-2">
            <Scissors size={14} className="rotate-45" /> Brand
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Salon Name</label>
              <input type="text" value={settings.salon_name} onChange={(e) => setSettings({ ...settings, salon_name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tagline</label>
              <input type="text" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#d4af37] mb-4">Images</h3>
          <div className="space-y-4">
            {/* Hero Image */}
            <div>
              <label className={labelClass}>Hero Background Image</label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-20 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-white/10">
                  {settings.hero_image ? (
                    <img src={settings.hero_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-white/20 rounded-lg text-gray-400 hover:border-[#d4af37]/40 hover:text-[#d4af37] transition-all cursor-pointer text-xs">
                    <Upload size={14} /> Upload
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero_image')} className="hidden" />
                  </label>
                  <input type="text" value={settings.hero_image} onChange={(e) => setSettings({ ...settings, hero_image: e.target.value })} placeholder="Or paste URL" className={`${inputClass} mt-2`} />
                </div>
              </div>
            </div>

            {/* About Image */}
            <div>
              <label className={labelClass}>About Section Image</label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-20 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-white/10">
                  {settings.about_image ? (
                    <img src={settings.about_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-white/20 rounded-lg text-gray-400 hover:border-[#d4af37]/40 hover:text-[#d4af37] transition-all cursor-pointer text-xs">
                    <Upload size={14} /> Upload
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'about_image')} className="hidden" />
                  </label>
                  <input type="text" value={settings.about_image} onChange={(e) => setSettings({ ...settings, about_image: e.target.value })} placeholder="Or paste URL" className={`${inputClass} mt-2`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#d4af37] mb-4">Contact & Hours</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone</label>
                <input type="text" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="text" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Weekday Hours</label>
                <input type="text" value={settings.hours_weekday} onChange={(e) => setSettings({ ...settings, hours_weekday: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Sunday Hours</label>
                <input type="text" value={settings.hours_sunday} onChange={(e) => setSettings({ ...settings, hours_sunday: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#d4af37] mb-4">Social Links</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Instagram URL</label>
              <input type="text" value={settings.instagram} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} className={inputClass} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className={labelClass}>Facebook URL</label>
              <input type="text" value={settings.facebook} onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} className={inputClass} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className={labelClass}>YouTube URL</label>
              <input type="text" value={settings.youtube} onChange={(e) => setSettings({ ...settings, youtube: e.target.value })} className={inputClass} placeholder="https://youtube.com/..." />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button (bottom) */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-bold rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
