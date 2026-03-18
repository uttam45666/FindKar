import { useState } from 'react';
import { X, Calendar, MapPin, Phone, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';
import { ErrorAlert } from '../../components/UI.jsx';

const BookingModal = ({ provider, onClose, initialServiceType = '' }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    serviceType: initialServiceType || provider.services?.[0]?.serviceName || '',
    scheduledAt: '',
    address: '',
    city: provider.shopCity || '',
    state: provider.shopState || '',
    pincode: '',
    problemDescription: '',
    alternateContact: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/bookings', { ...form, providerId: provider._id });
      toast.success('Booking placed successfully!');
      onClose();
      navigate(`/bookings/${data.booking._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl shadow-card-hover w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-heading font-semibold text-dark">Book Service</h2>
            <p className="text-sm text-muted">{provider.shopName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-warm rounded-xl transition-colors">
            <X size={18} className="text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <ErrorAlert message={error} />}

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Service needed</label>
            <select className="input-field" value={form.serviceType} onChange={f('serviceType')} required>
              {provider.services?.map(s => (
                <option key={s._id} value={s.serviceName}>{s.serviceName} — ₹{s.price}{s.priceType !== 'fixed' ? '+' : ''}</option>
              ))}
              <option value="Other">Other / Describe below</option>
            </select>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 flex items-center gap-1.5">
              <Calendar size={13} /> Schedule
            </label>
            <input type="datetime-local" required className="input-field"
              min={new Date().toISOString().slice(0, 16)}
              value={form.scheduledAt} onChange={f('scheduledAt')} />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 flex items-center gap-1.5">
              <MapPin size={13} /> Service address
            </label>
            <input className="input-field mb-2" placeholder="House/flat, street, area" required value={form.address} onChange={f('address')} />
            <div className="grid grid-cols-3 gap-2">
              <input className="input-field" placeholder="City" required value={form.city} onChange={f('city')} />
              <input className="input-field" placeholder="State" required value={form.state} onChange={f('state')} />
              <input className="input-field" placeholder="Pincode" value={form.pincode} onChange={f('pincode')} />
            </div>
          </div>

          {/* Problem description */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 flex items-center gap-1.5">
              <FileText size={13} /> Describe the problem
            </label>
            <textarea className="input-field resize-none" rows={3} placeholder="What's the issue? Any specific requirements..."
              value={form.problemDescription} onChange={f('problemDescription')} />
          </div>

          {/* Alternate contact */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 flex items-center gap-1.5">
              <Phone size={13} /> Alternate contact (optional)
            </label>
            <input type="tel" className="input-field" placeholder="Family member / neighbor number for tracking"
              value={form.alternateContact} onChange={f('alternateContact')} />
            <p className="text-xs text-muted mt-1">This person will receive a tracking link when the provider is on the way.</p>
          </div>

          {/* Safety note */}
          <div className="bg-primary-light rounded-xl p-3">
            <p className="text-xs text-primary/80">
              🔐 <strong>Safety included:</strong> OTP door check-in + SOS button will be active during this booking.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Placing booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
