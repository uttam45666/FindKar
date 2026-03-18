import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { OTPInput, ErrorAlert } from '../../components/UI.jsx';

const ROLES = [
  { value: 'customer', label: 'Customer', desc: 'Find services' },
  { value: 'provider', label: 'Provider', desc: 'Offer services' },
  { value: 'admin', label: 'Admin', desc: 'Manage platform' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('credentials'); // credentials | otp
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [mockOtp, setMockOtp] = useState('');
  const [phoneMasked, setPhoneMasked] = useState('');

  const handleCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { ...form, role });
      setUserId(data.userId);
      setPhoneMasked(data.phoneMasked || '');
      const otpRes = await api.post('/auth/send-otp', { userId: data.userId, role });
      if (otpRes.data.otp) { setMockOtp(otpRes.data.otp); }
      setStep('otp');
      toast.success('OTP sent to your registered phone');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setError('Enter 6-digit OTP'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { otp, role, userId });
      login(data.user, data.token, data.sessionId);
      const from = location.state?.from?.pathname;
      const dest = from || (data.user.role === 'admin' ? '/admin' : data.user.role === 'provider' ? '/provider' : '/');
      navigate(dest, { replace: true });
      toast.success(`Welcome back, ${data.user.fullName.split(' ')[0]}!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-warm flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-heading font-bold">F</span>
            </div>
            <span className="font-heading font-bold text-white text-2xl">Findkar</span>
          </div>
          <h1 className="font-heading text-4xl font-bold text-white leading-tight mb-4">
            Ask your neighbor.<br />
            <span className="text-primary">We already did.</span>
          </h1>
          <p className="text-white/60 text-lg">Trusted local services, verified by your community.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[['50M+', 'Service providers'], ['₹0', 'Spam calls'], ['Community', 'Verified trust'], ['Safe', 'Home visits']].map(([v, l]) => (
            <div key={l} className="bg-white/5 rounded-2xl p-4">
              <div className="font-heading text-2xl font-bold text-primary">{v}</div>
              <div className="text-white/50 text-sm mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-heading font-bold text-dark text-xl">Findkar</span>
          </div>

          {step === 'credentials' ? (
            <>
              <h2 className="font-heading text-3xl font-bold text-dark mb-2">Welcome back</h2>
              <p className="text-muted mb-8">Sign in to your account</p>

              {/* Role selector */}
              <div className="flex gap-2 mb-6">
                {ROLES.map(r => (
                  <button key={r.value} onClick={() => setRole(r.value)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all border ${role === r.value ? 'bg-primary text-white border-primary shadow-primary' : 'bg-white border-border text-muted hover:border-primary/50'}`}>
                    <div className="font-semibold">{r.label}</div>
                    <div className="opacity-70 text-[10px]">{r.desc}</div>
                  </button>
                ))}
              </div>

              {error && <ErrorAlert message={error} />}

              <form onSubmit={handleCredentials} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Email</label>
                  <input type="email" required className="input-field" placeholder="your@email.com"
                    value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} required className="input-field pr-10" placeholder="••••••••"
                      value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Signing in...' : 'Continue →'}
                </button>
              </form>

              <p className="text-center text-sm text-muted mt-6">
                Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep('credentials')} className="text-sm text-muted hover:text-dark mb-6 flex items-center gap-1">
                ← Back
              </button>
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-6">
                <Phone size={28} className="text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-dark text-center mb-2">Verify your phone</h2>
              <p className="text-muted text-center text-sm mb-2">Enter the 6-digit OTP sent to your registered number</p>
              {phoneMasked && <p className="text-muted text-center text-xs mb-3">Sent to {phoneMasked}</p>}

              {mockOtp && (
                <div className="bg-primary-light border border-primary/20 rounded-xl px-4 py-2.5 text-center mb-6">
                  <p className="text-xs text-muted mb-1">Demo OTP (shown for hackathon):</p>
                  <p className="font-mono font-bold text-primary text-xl tracking-widest">{mockOtp}</p>
                </div>
              )}

              {error && <ErrorAlert message={error} />}

              <form onSubmit={handleOTP} className="space-y-6 mt-4">
                <OTPInput value={otp} onChange={setOtp} length={6} />
                <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
