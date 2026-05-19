import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Scissors, User, Sparkles, Palette, Zap, Heart, Star, Flower2, Crown } from 'lucide-react';

interface ServiceItem {
  name: string;
  price: string;
  note?: string;
}

interface ServiceCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  services: ServiceItem[];
}

const allCategories: ServiceCategory[] = [
  {
    id: 'mens',
    label: "Men's Services",
    icon: <User size={20} />,
    color: 'from-blue-500/20 to-blue-600/10',
    services: [
      { name: 'Hair Cut', price: '₹250' },
      { name: 'Advance Hair Cut', price: '₹400' },
      { name: 'Beard Trimming', price: '₹150' },
      { name: 'Beard Trimming (Styling)', price: '₹200' },
      { name: 'Shaving', price: '₹100' },
      { name: "Kid Hair Cut", price: '₹200', note: 'Below 5 years' },
      { name: 'Extra Hair Wash', price: '₹50' },
    ],
  },
  {
    id: 'womens',
    label: "Women's Services",
    icon: <Flower2 size={20} />,
    color: 'from-pink-500/20 to-pink-600/10',
    services: [
      { name: 'Hair Cut', price: '₹400' },
      { name: "Kids Hair Cut", price: '₹300', note: 'Below 5 years' },
      { name: 'Layer Hair Cut', price: '₹650' },
      { name: 'Hair Trimming', price: '₹300' },
      { name: 'Tong', price: '₹650' },
      { name: 'Hair Wash & Blow Dry (Normal)', price: '₹300' },
      { name: 'Hair Wash & Blow Dry (Loreal)', price: '₹400' },
      { name: 'Hair Wash & Blow Dry (Keratin)', price: '₹600' },
      { name: 'Hair Wash & Blow Dry (Moroccan)', price: '₹500' },
      { name: 'Hair Ironing', price: '₹650' },
    ],
  },
  {
    id: 'threading',
    label: 'Threading',
    icon: <Sparkles size={20} />,
    color: 'from-purple-500/20 to-purple-600/10',
    services: [
      { name: 'Threading (Normal)', price: '₹100' },
      { name: 'Side Lock Threading', price: '₹150' },
      { name: 'Full Face Threading', price: '₹350' },
    ],
  },
  {
    id: 'waxing',
    label: 'Waxing',
    icon: <Star size={20} />,
    color: 'from-orange-500/20 to-orange-600/10',
    services: [
      { name: 'Upper Lip / Chin', price: '₹100' },
      { name: 'Side Lock Wax', price: '₹250' },
      { name: 'Face Wax', price: '₹500' },
      { name: 'Leg Wax', price: '₹500' },
      { name: 'Stomach Wax', price: '₹500' },
      { name: 'Back Wax', price: '₹500' },
      { name: 'Hand Wax', price: '₹400' },
      { name: 'Under Arms', price: '₹100' },
      { name: 'Bikini Wax', price: '₹2000' },
      { name: 'Full Body Wax', price: '₹2000' },
      { name: 'Body Polishing', price: '₹2000' },
    ],
  },
  {
    id: 'facial',
    label: 'Facial & Skin Care',
    icon: <Heart size={20} />,
    color: 'from-rose-500/20 to-rose-600/10',
    services: [
      { name: 'D-Tan', price: '₹500' },
      { name: 'Cleanup (Charcoal)', price: '₹600' },
      { name: 'Cleanup (VLCC/Richfeel)', price: '₹800' },
      { name: 'Facial (Gold / Fruit / Lotus)', price: '₹800 – ₹1500' },
      { name: 'Facial (O3+)', price: '₹1500 – ₹3000' },
    ],
  },
  {
    id: 'colouring',
    label: 'Hair Colouring',
    icon: <Palette size={20} />,
    color: 'from-amber-500/20 to-amber-600/10',
    services: [
      { name: 'Men – Matrix / Loreal / Inoa', price: '₹700 – ₹1000' },
      { name: 'Women – Global Colouring', price: '₹3000 – ₹5000' },
      { name: 'Root Touchup', price: '₹800 – ₹1200' },
      { name: 'Highlights (per strip)', price: '₹250' },
    ],
  },
  {
    id: 'treatments',
    label: 'Hair Treatments',
    icon: <Zap size={20} />,
    color: 'from-emerald-500/20 to-emerald-600/10',
    services: [
      { name: 'Hair Smoothing / Straightening', price: '₹5000 onwards' },
      { name: 'Keratin Treatment', price: '₹4000 onwards' },
      { name: 'Botox Treatment', price: '₹6000 onwards' },
      { name: 'Hair Spa', price: '₹800 – ₹2000' },
      { name: 'Head Massage (Oil)', price: '₹400 – ₹500' },
    ],
  },
  {
    id: 'nails',
    label: 'Nails & Makeup',
    icon: <Crown size={20} />,
    color: 'from-violet-500/20 to-violet-600/10',
    services: [
      { name: 'Pedicure (Basic to Premium)', price: '₹500 – ₹1500' },
      { name: 'Manicure (Basic to Premium)', price: '₹500 – ₹1500' },
      { name: 'Nail Extension (Gel/Acrylic)', price: '₹1500 – ₹3000' },
      { name: 'Bridal Makeup', price: '₹5000 onwards' },
      { name: 'Normal Makeup', price: '₹1500 onwards' },
      { name: 'Saree Draping', price: '₹500' },
    ],
  },
  {
    id: 'mehandi',
    label: 'Mehandi & Tattoo',
    icon: <Scissors size={20} />,
    color: 'from-teal-500/20 to-teal-600/10',
    services: [
      { name: 'Mehandi (Normal to Bridal)', price: '₹500 – ₹3000' },
      { name: 'Permanent Tattoo', price: '₹300 per sq. inch' },
    ],
  },
];

interface ServicesPageProps {
  onBookNow: (serviceName: string) => void;
}

export default function ServicesPage({ onBookNow }: ServicesPageProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeCategory, setActiveCategory] = useState('All');

  const displayedCategories =
    activeCategory === 'All'
      ? allCategories
      : allCategories.filter((c) => c.id === activeCategory);

  return (
    <div
      className="pt-28 pb-24 px-6 min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Decorative top line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#d4af37]/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.05)_0%,_transparent_60%)]" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-[#d4af37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
            Complete Price Menu
          </span>
          <h1
            className="text-4xl md:text-6xl font-black mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#b8960c]">
              Services
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="max-w-2xl mx-auto text-lg">
            Premium salon services at transparent prices. Click{' '}
            <span className="text-[#d4af37] font-medium">Book Now</span> on any service to jump
            straight to the booking form.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === 'All'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'border hover:border-[#d4af37]/40 hover:text-[#d4af37]'
            }`}
            style={
              activeCategory !== 'All'
                ? { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }
                : undefined
            }
          >
            All
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                  : 'border hover:border-[#d4af37]/40 hover:text-[#d4af37]'
              }`}
              style={
                activeCategory !== cat.id
                  ? { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }
                  : undefined
              }
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Service Category Sections */}
        <div className="space-y-10">
          {displayedCategories.map((category, catIdx) => (
            <div
              key={category.id}
              className="rounded-3xl overflow-hidden shadow-xl"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid rgba(212,175,55,0.1)',
              }}
            >
              {/* Category Header */}
              <div
                className={`bg-gradient-to-r ${category.color} px-8 py-5 flex items-center gap-3`}
                style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {category.label}
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {category.services.length} services available
                  </p>
                </div>
              </div>

              {/* Service Rows */}
              <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {category.services.map((service, svcIdx) => (
                  <div
                    key={svcIdx}
                    className="flex items-center justify-between px-8 py-4 gap-4 group hover:bg-[#d4af37]/[0.03] transition-colors duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <span
                        className="font-medium text-sm md:text-base"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {service.name}
                      </span>
                      {service.note && (
                        <span
                          className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20"
                        >
                          {service.note}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="font-bold text-[#d4af37] text-sm md:text-base whitespace-nowrap">
                        {service.price}
                      </span>
                      <button
                        onClick={() => onBookNow(service.name)}
                        className="px-4 py-1.5 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black text-xs font-bold rounded-full hover:shadow-[0_0_15px_rgba(212,175,55,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Prices may vary based on hair length and specific requirements. Call us for a custom quote.
          </p>
          <button
            onClick={() => onBookNow('')}
            className="px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-bold rounded-full hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-105 transition-all duration-300"
          >
            Book an Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
