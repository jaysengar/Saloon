import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, Scissors } from 'lucide-react';
import { supabase, type Service, type Staff } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

interface FormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  notes: string;
}

export default function Booking() {
  const [form, setForm] = useState<FormData>({ name: '', phone: '', email: '', service: '', staff: '', date: '', time: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [dateBookings, setDateBookings] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).order('sort_order').then(({ data }) => setServices(data ?? []));
    supabase.from('staff').select('*').eq('is_active', true).order('sort_order').then(({ data }) => setStaff(data ?? []));

    const servicesChannel = supabase.channel('booking-services').on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
      supabase.from('services').select('*').eq('is_active', true).order('sort_order').then(({ data }) => setServices(data ?? []));
    }).subscribe();

    const staffChannel = supabase.channel('booking-staff').on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => {
      supabase.from('staff').select('*').eq('is_active', true).order('sort_order').then(({ data }) => setStaff(data ?? []));
    }).subscribe();

    return () => { supabase.removeChannel(servicesChannel); supabase.removeChannel(staffChannel); };
  }, []);

  useEffect(() => {
    if (!form.date) {
      setDateBookings([]);
      return;
    }

    const fetchBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('booking_time, staff_id')
        .eq('booking_date', form.date)
        .in('status', ['pending', 'confirmed']);
      setDateBookings(data ?? []);
    };

    fetchBookings();
  }, [form.date, submitted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await supabase.from('bookings').insert({
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email,
      service_id: form.service || null,
      staff_id: form.staff || null,
      booking_date: form.date,
      booking_time: form.time,
      notes: form.notes,
      status: 'pending',
    });

    setLoading(false);
    setSubmitted(true);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const ALL_TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

  // Calculate available time slots
  const availableTimeSlots = ALL_TIME_SLOTS.filter((time) => {
    // If no staff is available overall, no slots should be available
    if (staff.length === 0) return false;

    // How many bookings exist for this specific time slot
    const slotBookings = dateBookings.filter(b => b.booking_time === time);

    // If a specific staff member is selected, check if THEY are booked at this time
    if (form.staff) {
      const isStaffBooked = slotBookings.some(b => b.staff_id === form.staff);
      return !isStaffBooked; 
    }

    // If "Any available stylist", check if total bookings < total active staff
    const maxCapacity = staff.length;
    return slotBookings.length < maxCapacity;
  });

  const selectedService = services.find((s) => s.id === form.service);

  const inputStyle = {
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
  };

  return (
    <section id="booking" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }} ref={ref}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#d4af37]/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(212,175,55,0.04)_0%,_transparent_70%)]" />

      <div className="max-w-4xl mx-auto">
        <div className={`text-center mb-14 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <span className="text-[#d4af37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">Reserve Your Spot</span>
          <h2 className="text-4xl md:text-6xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>
            Book an <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#b8960c]">Appointment</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="max-w-xl mx-auto">Reserve your session with our expert stylists. We'll confirm within 2 hours.</p>
        </div>

        <div className={`transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {submitted ? (
            <div className="rounded-3xl p-12 text-center shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8960c] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(212,175,55,0.4)]">
                <CheckCircle size={36} className="text-black" />
              </div>
              <h3 className="text-3xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Booking Confirmed!</h3>
              <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>Thank you, <span className="text-[#d4af37] font-semibold">{form.name}</span>!</p>
              <p className="mb-2" style={{ color: 'var(--text-muted)' }}>
                Your {selectedService?.name ?? 'appointment'} is set for <span style={{ color: 'var(--text-primary)' }}>{form.date}</span> at <span style={{ color: 'var(--text-primary)' }}>{form.time}</span>.
              </p>
              <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>We'll send a confirmation to <span className="text-[#d4af37]">{form.email}</span></p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', service: '', staff: '', date: '', time: '', notes: '' }); }}
                className="px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-bold rounded-full hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-105 transition-all duration-300"
              >
                Book Another Appointment
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(212,175,55,0.1)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="block text-xs font-medium tracking-wide mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#d4af37] transition-colors" style={{ color: 'var(--text-muted)' }} />
                    <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all" style={{ ...inputStyle }} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-medium tracking-wide mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#d4af37] transition-colors" style={{ color: 'var(--text-muted)' }} />
                    <input type="tel" name="phone" required value={form.phone} onChange={handleChange} placeholder="+91 00000 00000"
                      className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all" style={{ ...inputStyle }} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-medium tracking-wide mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#d4af37] transition-colors" style={{ color: 'var(--text-muted)' }} />
                    <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all" style={{ ...inputStyle }} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-medium tracking-wide mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Service</label>
                  <div className="relative">
                    <Scissors size={16} className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#d4af37] transition-colors pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <select name="service" required value={form.service} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all appearance-none cursor-pointer" style={{ ...inputStyle }}>
                      <option value="">Choose a service</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} — {s.price}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-medium tracking-wide mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Preferred Stylist</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#d4af37] transition-colors pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <select name="staff" value={form.staff} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all appearance-none cursor-pointer" style={{ ...inputStyle }}>
                      <option value="">Any available stylist</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-medium tracking-wide mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#d4af37] transition-colors pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <input type="date" name="date" required min={minDate} value={form.date} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all" style={{ ...inputStyle, colorScheme: isDark ? 'dark' : 'light' }} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-medium tracking-wide mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Time Slot</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#d4af37] transition-colors pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <select name="time" required value={form.time} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all appearance-none cursor-pointer" style={{ ...inputStyle }}>
                      <option value="">Select time</option>
                      {availableTimeSlots.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      {form.date && availableTimeSlots.length === 0 && (
                        <option value="" disabled>Fully booked for this day</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium tracking-wide mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Special Requests (Optional)</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any allergies, preferences, or special requests..." rows={3}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all resize-none" style={{ ...inputStyle }} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-6 py-4 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-bold text-lg rounded-xl hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Booking your appointment...
                  </div>
                ) : 'Confirm Appointment'}
              </button>

              <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                We'll confirm your booking via email within 2 hours. Free cancellation up to 24 hours before.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
