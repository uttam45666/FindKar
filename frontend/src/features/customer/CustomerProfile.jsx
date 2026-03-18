import { useState, useEffect } from 'react';
import { User, Camera, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ErrorAlert, OTPInput } from '../../components/UI.jsx';

const CustomerProfile = () => {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ fullName: '', phone: '', address: { line: '', city: '', state: '', pincode: '' } });
  const [saving, setSaving] = useState(false);
  const [resetStep, setResetStep] = useState('request');
  const [resetOtp, setResetOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [mockOtp, setMockOtp] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName || '', phone: user.phone || '', address: user.address || { line: '', city: '', state: '', pincode: '' } });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/me', form);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleSendResetOtp = async () => {
    setResetLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/send-otp', { phone: user.phone, role: user.role });
      if (data.otp) setMockOtp(data.otp);
      setResetStep('otp');
      toast.success('OTP sent');
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setResetLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setResetLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/verify-for-reset', { email: user.email, phone: user.phone, otp: resetOtp, role: user.role });
      setResetToken(data.resetToken);
      setResetStep('newpass');
    } catch (err) { setError(err.response?.data?.message || 'Invalid OTP'); }
    finally { setResetLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) { setError('Passwords do not match'); return; }
    if (newPass.length < 8) { setError('Minimum 8 characters'); return; }
    setResetLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { resetToken, newPassword: newPass });
      toast.success('Password updated!');
      setResetStep('request'); setNewPass(''); setConfirmPass('');
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setResetLoading(false); }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="page-container max-w-2xl">
        <h1 className="section-title mb-6">My Profile</h1>

        {/* Avatar */}
        <div className="card p-6 mb-6 flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/10">
              {user?.profileImage
                ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                : <span className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl">{user?.fullName?.[0]}</span>
              }
            </div>
          </div>
          <div>
            <p className="font-heading font-semibold text-dark text-lg">{user?.fullName}</p>
            <p className="text-muted text-sm">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1 border border-border">
          {[{ v: 'profile', l: 'Profile', icon: User }, { v: 'password', l: 'Password', icon: Lock }].map(t => (
            <button key={t.v} onClick={() => setTab(t.v)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.v ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-dark'}`}>
              <t.icon size={14} /> {t.l}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="card p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Full Name</label>
                <input className="input-field" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Phone</label>
                <input className="input-field" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Address</label>
                <input className="input-field mb-2" placeholder="Street address" value={form.address?.line || ''} onChange={e => setForm(p => ({ ...p, address: { ...p.address, line: e.target.value } }))} />
                <div className="grid grid-cols-3 gap-2">
                  <input className="input-field" placeholder="City" value={form.address?.city || ''} onChange={e => setForm(p => ({ ...p, address: { ...p.address, city: e.target.value } }))} />
                  <input className="input-field" placeholder="State" value={form.address?.state || ''} onChange={e => setForm(p => ({ ...p, address: { ...p.address, state: e.target.value } }))} />
                  <input className="input-field" placeholder="Pincode" value={form.address?.pincode || ''} onChange={e => setForm(p => ({ ...p, address: { ...p.address, pincode: e.target.value } }))} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {tab === 'password' && (
          <div className="card p-6">
            {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
            {resetStep === 'request' && (
              <div className="text-center py-6">
                <Lock size={40} className="text-muted mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-dark mb-2">Change Password</h3>
                <p className="text-sm text-muted mb-6">We'll send an OTP to your registered phone to verify it's you.</p>
                <button onClick={handleSendResetOtp} disabled={resetLoading} className="btn-primary">
                  {resetLoading ? 'Sending...' : 'Send OTP to verify'}
                </button>
              </div>
            )}
            {resetStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <h3 className="font-heading font-semibold text-dark">Enter OTP</h3>
                {mockOtp && (
                  <div className="bg-primary-light border border-primary/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted mb-1">Demo OTP:</p>
                    <p className="font-mono font-bold text-primary text-xl">{mockOtp}</p>
                  </div>
                )}
                <OTPInput value={resetOtp} onChange={setResetOtp} length={6} />
                <button type="submit" disabled={resetLoading || resetOtp.length < 6} className="btn-primary w-full">
                  {resetLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}
            {resetStep === 'newpass' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <h3 className="font-heading font-semibold text-dark">Set New Password</h3>
                <input type="password" className="input-field" placeholder="New password (min 8)" value={newPass} onChange={e => setNewPass(e.target.value)} minLength={8} required />
                <input type="password" className="input-field" placeholder="Confirm new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
                <button type="submit" disabled={resetLoading} className="btn-primary w-full">
                  {resetLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
