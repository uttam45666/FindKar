import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { OTPInput, ErrorAlert } from '../../components/UI.jsx';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [mockOtp, setMockOtp] = useState('');

  useEffect(() => {
    if (!form.username || form.username.length < 3) { setUsernameStatus(null); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/auth/check-username/${form.username}`);
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch { setUsernameStatus(null); }
    }, 600);
    return () => clearTimeout(t);
  }, [form.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError('');
    setLoading(true);
    try {
      const otpRes = await api.post('/auth/send-otp', { phone: form.phone, role });
      if (otpRes.data.otp) setMockOtp(otpRes.data.otp);
      setStep('otp');
      toast.success('OTP sent to your phone');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { ...form, role });
      login(data.user, data.token, data.sessionId);
      toast.success('Account created successfully!');
      navigate(data.user.role === 'provider' ? '/provider/setup' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-warm flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-heading font-bold text-dark text-xl">Findkar</span>
        </div>

        {step === 'form' ? (
          <div className="card p-8">
            <h2 className="font-heading text-2xl font-bold text-dark mb-1">Create account</h2>
            <p className="text-muted text-sm mb-6">Join India's trusted service network</p>

            {/* Role */}
            <div className="flex gap-2 mb-6">
              {[{ v: 'customer', l: 'Customer' }, { v: 'provider', l: 'Service Provider' }].map(r => (
                <button key={r.v} onClick={() => setRole(r.v)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${role === r.v ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted hover:border-primary/50'}`}>
                  {r.l}
                </button>
              ))}
            </div>

            {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Full Name</label>
                  <input required className="input-field" placeholder="Amit Shah" value={form.fullName} onChange={f('fullName')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Username</label>
                  <div className="relative">
                    <input required className="input-field pr-8" placeholder="amitshah" value={form.username} onChange={f('username')} minLength={3} />
                    {usernameStatus === 'available' && <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-success" />}
                    {usernameStatus === 'taken' && <X size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-danger" />}
                  </div>
                  {usernameStatus === 'taken' && <p className="text-xs text-danger mt-1">Username taken</p>}
                  {usernameStatus === 'available' && <p className="text-xs text-success mt-1">Available!</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Email</label>
                <input type="email" required className="input-field" placeholder="you@email.com" value={form.email} onChange={f('email')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Phone</label>
                <input type="tel" required className="input-field" placeholder="98765 43210" value={form.phone} onChange={f('phone')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required className="input-field pr-10" placeholder="Min 8 characters" value={form.password} onChange={f('password')} minLength={8} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading || usernameStatus === 'taken'} className="btn-primary w-full mt-2">
                {loading ? 'Sending OTP...' : 'Continue →'}
              </button>
            </form>

            <p className="text-center text-sm text-muted mt-4">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <button onClick={() => setStep('form')} className="text-sm text-muted hover:text-dark mb-6 flex items-center gap-1">← Back</button>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Phone size={28} className="text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-dark mb-2">Verify your phone</h2>
            <p className="text-muted text-sm mb-4">Enter the OTP sent to {form.phone}</p>

            {mockOtp && (
              <div className="bg-primary-light border border-primary/20 rounded-xl px-4 py-2.5 mb-6">
                <p className="text-xs text-muted mb-1">Demo OTP (hackathon mode):</p>
                <p className="font-mono font-bold text-primary text-xl tracking-widest">{mockOtp}</p>
              </div>
            )}

            {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
            <form onSubmit={handleOTP} className="space-y-6">
              <OTPInput value={otp} onChange={setOtp} length={6} />
              <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
                {loading ? 'Creating account...' : 'Verify & Create Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
