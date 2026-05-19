import { useEffect, useState } from 'react';
import { supabase, type Booking, type Service, type Staff } from '../../lib/supabase';
import { Calendar, CheckCircle, XCircle, User, Phone, Mail, ChevronDown, MessageCircle } from 'lucide-react';

export default function BookingsManager() {
  const [bookings, setBookings] = useState<(Booking & { services?: Service | null; staff?: Staff | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, services(*), staff(*)')
      .order('created_at', { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => { fetchBookings(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    fetchBookings();
  };

  const generateWhatsAppLink = (booking: any, type: 'confirmation' | 'reminder') => {
    let phone = booking.customer_phone.replace(/\D/g, '');
    if (phone.length === 10) {
      phone = '91' + phone;
    }

    const serviceName = booking.services?.name ?? 'your service';

    let text = '';
    if (type === 'confirmation') {
      text = `Hi ${booking.customer_name},\n\nYour appointment for *${serviceName}* is confirmed for *${booking.booking_date}* at *${booking.booking_time}* at Reborn Unisex Salon.\n\nThank you!`;
    } else {
      text = `Hi ${booking.customer_name},\n\nThis is a gentle reminder for your appointment for *${serviceName}* tomorrow (*${booking.booking_date}*) at *${booking.booking_time}* at Reborn Unisex Salon.\n\nSee you soon!`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const filtered = statusFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Bookings</h2>
          <p className="text-gray-500 text-sm">{bookings.length} total bookings</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === s
              ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30'
              : 'text-gray-500 border border-white/5 hover:border-white/20 hover:text-gray-300'
              }`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filtered.map((booking) => (
          <div
            key={booking.id}
            className="bg-[#111] border border-white/5 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === booking.id ? null : booking.id)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              {/* Date & Time */}
              <div className="w-16 text-center flex-shrink-0">
                <div className="text-[#d4af37] text-xs font-medium">
                  {new Date(booking.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </div>
                <div className="text-white text-sm font-semibold">{booking.booking_time}</div>
              </div>

              {/* Customer Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium truncate">{booking.customer_name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[booking.status]}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {booking.services?.name ?? 'Service deleted'} {booking.staff ? `with ${booking.staff.name}` : ''}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'confirmed'); }}
                      className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      title="Confirm"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'cancelled'); }}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Cancel"
                    >
                      <XCircle size={16} />
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'completed'); }}
                    className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                    title="Mark Complete"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${expanded === booking.id ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Expanded Details */}
            {expanded === booking.id && (
              <div className="px-4 pb-4 border-t border-white/5 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <User size={14} className="text-[#d4af37]" />
                    {booking.customer_name}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone size={14} className="text-[#d4af37]" />
                    {booking.customer_phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail size={14} className="text-[#d4af37]" />
                    {booking.customer_email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={14} className="text-[#d4af37]" />
                    {booking.booking_date} at {booking.booking_time}
                  </div>
                  {booking.notes && (
                    <div className="sm:col-span-2 text-gray-400 text-xs bg-[#1a1a1a] rounded-lg p-3">
                      <span className="text-[#d4af37] font-medium">Notes:</span> {booking.notes}
                    </div>
                  )}
                  <div className="sm:col-span-2 text-gray-500 text-xs">
                    Booked: {new Date(booking.created_at).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Quick Status Change */}
                <div className="flex gap-2 mt-3">
                  {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(booking.id, s)}
                      disabled={booking.status === s}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${booking.status === s
                        ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30'
                        : 'text-gray-500 border border-white/5 hover:border-white/20'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* WhatsApp Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                  <a
                    href={generateWhatsAppLink(booking, 'confirmation')}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-all"
                  >
                    <MessageCircle size={14} /> Send Confirmation
                  </a>
                  <a
                    href={generateWhatsAppLink(booking, 'reminder')}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-all"
                  >
                    <MessageCircle size={14} /> Send Reminder
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <p>No bookings found for this filter.</p>
        </div>
      )}
    </div>
  );
}
