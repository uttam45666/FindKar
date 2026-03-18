import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Save, TrendingUp, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { Spinner, ErrorAlert } from '../../components/UI.jsx';
import AvatarSelector from '../../components/AvatarSelector.jsx';

const CATEGORIES = ['plumber', 'electrician', 'carpenter', 'ac_technician', 'painter', 'maid', 'cook', 'driver'];
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const ProviderSetupPage = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('basic');
  const [form, setForm] = useState({
    shopName: '', shopPhone: '', shopAddress: '', shopCity: '', shopState: '',
    bio: '', primaryCategory: 'plumber', coverageRadius: 5, experience: 0, profileImage: '',
    workingHours: DAYS.reduce((acc, d) => ({ ...acc, [d]: { open: '09:00', close: '18:00', isOff: d === 'sunday' } }), {}),
  });

  useEffect(() => {
    api.get('/providers/me/profile').then(({ data }) => {
      if (data.provider) {
        setProvider(data.provider);
        setForm(p => ({ ...p, ...data.provider, workingHours: data.provider.workingHours || p.workingHours }));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/providers/me/setup', form);
      toast.success('Profile saved!');
      navigate('/provider');
    } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen py-8">
      <div className="page-container max-w-2xl">
        <h1 className="section-title mb-6">Shop Profile Setup</h1>

        <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1 border border-border">
          {[{ v: 'basic', l: 'Basic Info' }, { v: 'hours', l: 'Working Hours' }].map(t => (
            <button key={t.v} onClick={() => setTab(t.v)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.v ? 'bg-primary text-white' : 'text-muted hover:text-dark'}`}>{t.l}</button>
          ))}
        </div>

        {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

        {tab === 'basic' && (
          <form onSubmit={handleSave} className="card p-6 space-y-4">
            <AvatarSelector
              type="profile"
              currentImage={form.profileImage}
              onSelect={(img) => setForm(p => ({ ...p, profileImage: img }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Shop Name *</label>
                <input className="input-field" required value={form.shopName} onChange={f('shopName')} placeholder="Ramesh Plumbing Works" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Shop Phone</label>
                <input className="input-field" value={form.shopPhone} onChange={f('shopPhone')} placeholder="9876543210" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Primary Category *</label>
              <select className="input-field" required value={form.primaryCategory} onChange={f('primaryCategory')}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Bio</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Tell customers about your experience..."
                value={form.bio} onChange={f('bio')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Shop Address</label>
              <input className="input-field mb-2" placeholder="Street address" value={form.shopAddress} onChange={f('shopAddress')} />
              <div className="grid grid-cols-2 gap-2">
                <input className="input-field" placeholder="City *" required value={form.shopCity} onChange={f('shopCity')} />
                <input className="input-field" placeholder="State" value={form.shopState} onChange={f('shopState')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Experience (years)</label>
                <input type="number" min="0" className="input-field" value={form.experience} onChange={f('experience')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Coverage Radius (km)</label>
                <input type="number" min="1" max="50" className="input-field" value={form.coverageRadius} onChange={f('coverageRadius')} />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}

        {tab === 'hours' && (
          <div className="card p-6">
            <h2 className="font-heading font-semibold text-dark mb-4">Working Hours</h2>
            <div className="space-y-3">
              {DAYS.map(d => (
                <div key={d} className="flex items-center gap-4">
                  <span className="capitalize text-sm text-dark w-24 flex-shrink-0">{d}</span>
                  <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                    <input type="checkbox" checked={!form.workingHours[d]?.isOff}
                      onChange={e => setForm(p => ({ ...p, workingHours: { ...p.workingHours, [d]: { ...p.workingHours[d], isOff: !e.target.checked } } }))} />
                    Open
                  </label>
                  {!form.workingHours[d]?.isOff && (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" className="input-field py-2 text-sm" value={form.workingHours[d]?.open || '09:00'}
                        onChange={e => setForm(p => ({ ...p, workingHours: { ...p.workingHours, [d]: { ...p.workingHours[d], open: e.target.value } } }))} />
                      <span className="text-muted text-sm">to</span>
                      <input type="time" className="input-field py-2 text-sm" value={form.workingHours[d]?.close || '18:00'}
                        onChange={e => setForm(p => ({ ...p, workingHours: { ...p.workingHours, [d]: { ...p.workingHours[d], close: e.target.value } } }))} />
                    </div>
                  )}
                  {form.workingHours[d]?.isOff && <span className="text-sm text-muted">Day off</span>}
                </div>
              ))}
            </div>
            <button onClick={() => api.put('/providers/me/working-hours', { workingHours: form.workingHours }).then(() => toast.success('Hours saved!')).catch(() => toast.error('Failed'))} className="btn-primary mt-6 flex items-center gap-2">
              <Save size={14} /> Save Hours
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProviderServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ serviceName: '', description: '', price: '', priceType: 'starting', priceMax: '', image: '' });

  useEffect(() => {
    api.get('/providers/me/profile').then(({ data }) => setServices(data.provider?.services || [])).finally(() => setLoading(false));
  }, []);

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    try {
      let res;
      if (editId) {
        res = await api.put(`/providers/me/services/${editId}`, form);
      } else {
        res = await api.post('/providers/me/services', form);
      }
      setServices(res.data.services);
      setShowForm(false); setEditId(null);
      setForm({ serviceName: '', description: '', price: '', priceType: 'starting', priceMax: '', image: '' });
      toast.success(editId ? 'Service updated!' : 'Service added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (svcId) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      const { data } = await api.delete(`/providers/me/services/${svcId}`);
      setServices(data.services);
      toast.success('Service deleted');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen py-8">
      <div className="page-container max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title">My Services</h1>
          <button onClick={() => { setShowForm(true); setEditId(null); }} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
            <Plus size={14} /> Add Service
          </button>
        </div>

        {showForm && (
          <div className="card p-5 mb-6 border-2 border-primary/30">
            <h3 className="font-heading font-semibold text-dark mb-4">{editId ? 'Edit Service' : 'New Service'}</h3>
            <div className="space-y-3">
              <AvatarSelector
                type="service"
                currentImage={form.image}
                onSelect={(img) => setForm(p => ({ ...p, image: img }))}
              />
              <input className="input-field" placeholder="Service name *" value={form.serviceName} onChange={f('serviceName')} required />
              <input className="input-field" placeholder="Description" value={form.description} onChange={f('description')} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Price (₹)</label>
                  <input type="number" className="input-field" placeholder="500" value={form.price} onChange={f('price')} required />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Price Type</label>
                  <select className="input-field" value={form.priceType} onChange={f('priceType')}>
                    <option value="fixed">Fixed</option>
                    <option value="starting">Starting from</option>
                    <option value="range">Range</option>
                  </select>
                </div>
              </div>
              {form.priceType === 'range' && (
                <input type="number" className="input-field" placeholder="Max price (₹)" value={form.priceMax} onChange={f('priceMax')} />
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1">Save</button>
            </div>
          </div>
        )}

        {services.length === 0 ? (
          <div className="card p-10 text-center text-muted text-sm">No services added yet. Add your first service!</div>
        ) : (
          <div className="space-y-3">
            {services.map(s => (
              <div key={s._id} className="card p-4 flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-dark">{s.serviceName}</p>
                  {s.description && <p className="text-xs text-muted mt-0.5">{s.description}</p>}
                  <p className="text-sm font-mono font-semibold text-primary mt-1">
                    ₹{s.price}{s.priceType !== 'fixed' ? '+' : ''}{s.priceType === 'range' && s.priceMax ? ` – ₹${s.priceMax}` : ''}
                    <span className="text-xs text-muted font-sans ml-1 capitalize">({s.priceType})</span>
                  </p>
                </div>
                <div className="flex gap-2 ml-3">
                  <button onClick={() => { setForm(s); setEditId(s._id); setShowForm(true); }} className="p-2 hover:bg-warm rounded-lg transition-colors">
                    <Edit2 size={14} className="text-muted" />
                  </button>
                  <button onClick={() => handleDelete(s._id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} className="text-danger" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ProviderEarningsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/providers/me/profile'),
      api.get('/bookings/provider?status=completed&limit=50'),
    ]).then(([provRes, bookRes]) => {
      setData({ provider: provRes.data.provider, bookings: bookRes.data.bookings || [] });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const { provider, bookings } = data;
  const total = bookings.reduce((s, b) => s + (b.jobAmount || 0), 0);
  const fees = bookings.reduce((s, b) => s + (b.platformFee || 0), 0);
  const net = total - fees;

  return (
    <div className="min-h-screen py-8">
      <div className="page-container max-w-2xl">
        <h1 className="section-title mb-6">Earnings</h1>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: `₹${total.toLocaleString()}`, color: 'text-dark' },
            { label: 'Platform Fees (5%)', value: `₹${fees.toFixed(0)}`, color: 'text-danger' },
            { label: 'Net Earnings', value: `₹${net.toFixed(0)}`, color: 'text-success' },
          ].map(s => (
            <div key={s.label} className="card p-5 text-center">
              <div className={`font-mono font-bold text-2xl ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-dark mb-4">Completed Jobs</h2>
          {bookings.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">No completed jobs yet</p>
          ) : (
            <div className="space-y-2">
              {bookings.map(b => (
                <div key={b._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-warm transition-colors">
                  <div>
                    <p className="text-sm font-medium text-dark">{b.serviceType}</p>
                    <p className="text-xs text-muted">{b.customerId?.fullName} · {b.completedAt ? new Date(b.completedAt).toLocaleDateString() : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-dark">₹{b.jobAmount}</p>
                    <p className="text-xs text-danger">-₹{(b.platformFee || 0).toFixed(0)} fee</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
