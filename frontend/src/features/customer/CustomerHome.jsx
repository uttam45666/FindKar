import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Shield, Users, Star, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const CATEGORIES = [
  { id: 'plumber', label: 'Plumber', icon: '🔧', desc: 'Leakage, pipes, fittings' },
  { id: 'electrician', label: 'Electrician', icon: '⚡', desc: 'Wiring, switches, MCB' },
  { id: 'carpenter', label: 'Carpenter', icon: '🪚', desc: 'Furniture, doors, wood' },
  { id: 'ac_technician', label: 'AC Technician', icon: '❄️', desc: 'Service, gas, install' },
  { id: 'painter', label: 'Painter', icon: '🎨', desc: 'Interior, exterior, putty' },
  { id: 'maid', label: 'Maid', icon: '🧹', desc: 'Cleaning, housekeeping' },
  { id: 'cook', label: 'Cook', icon: '👨‍🍳', desc: 'Daily meals, catering' },
  { id: 'driver', label: 'Driver', icon: '🚗', desc: 'Local, outstation trips' },
];

const TRUST_FEATURES = [
  { icon: Shield, title: 'Aadhaar Verified', desc: 'Every provider identity verified before listing' },
  { icon: Users, title: 'Community Vouched', desc: 'Real people in your network vouch for them' },
  { icon: Star, title: 'Honest Reviews', desc: 'No star inflation — structured trust tags only' },
  { icon: Zap, title: 'Safety First', desc: 'OTP door check-in and SOS button on every job' },
];

const CustomerHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleCategoryClick = (cat) => {
    navigate(`/services?category=${cat}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/services?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-dark pt-16 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #E8580A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #C8960C 0%, transparent 40%)' }} />
        <div className="page-container relative">
          <div className="max-w-2xl">
            <p className="text-primary font-medium text-sm mb-3 tracking-wide uppercase">Findkar — Trusted Local Services</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Ask your neighbor.<br />
              <span className="text-primary">We already did.</span>
            </h1>
            <p className="text-white/60 text-lg mb-8">
              Connect with verified, community-trusted service providers in your area.
            </p>
            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text" placeholder="Search plumber, electrician..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-primary focus:bg-white/15 transition-all"
                />
              </div>
              <button type="submit" className="btn-primary px-6 whitespace-nowrap">Search</button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 page-container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">What do you need?</h2>
          <button onClick={() => navigate('/services')} className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => handleCategoryClick(cat.id)}
              className="card p-4 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 group cursor-pointer">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
              <div className="font-medium text-dark text-xs">{cat.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Trust features */}
      <section className="py-12 bg-dark">
        <div className="page-container">
          <h2 className="section-title text-white text-center mb-10">Why Findkar is different</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 page-container text-center">
        <h2 className="section-title mb-4">Ready to find help?</h2>
        <p className="text-muted mb-8">Browse all service categories and book in minutes.</p>
        <button onClick={() => navigate('/services')} className="btn-primary px-10 py-4 text-base">
          Browse Services →
        </button>
      </section>
    </div>
  );
};

export default CustomerHome;
