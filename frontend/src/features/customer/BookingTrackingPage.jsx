import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Phone, MapPin, Clock, AlertTriangle, CheckCircle, ChevronLeft, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Spinner, StatusBadge, OTPInput } from '../../components/UI.jsx';
import { format } from 'date-fns';
import ReviewModal from '../reviews/ReviewModal.jsx';

const STEPS = ['pending', 'confirmed', 'departed', 'arrived', 'in_progress', 'completed'];

const BookingTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchBooking = useCallback(async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`);
      setBooking(data.booking);
    } catch { navigate('/bookings'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    fetchBooking();
    const iv = setInterval(fetchBooking, 15000);
    return () => clearInterval(iv);
  }, [fetchBooking]);

  const handleSOS = async () => {
    if (!window.confirm('🚨 This will alert admin and block the provider immediately. Confirm SOS?')) return;
    setSosLoading(true);
    try {
      await api.post(`/bookings/${id}/sos`, { location: 'Ahmedabad, Gujarat' });
      toast.error('🚨 SOS Alert sent! Admin has been notified.', { duration: 6000 });
      fetchBooking();
    } catch (err) {
      toast.error(err.response?.data?.message || 'SOS failed');
    } finally { setSosLoading(false); }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await api.delete(`/bookings/${id}/cancel`, { data: { cancelReason } });
      toast.success('Booking cancelled');
      fetchBooking();
      setShowCancelConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    } finally { setCancelLoading(false); }
  };

  if (loading) return <Spinner />;
  if (!booking) return null;

  const provider = booking.providerId;
  const stepIndex = STEPS.indexOf(booking.status);
  const isActive = ['pending', 'confirmed', 'departed', 'arrived', 'in_progress'].includes(booking.status);
  const showSOS = booking.status === 'arrived' || booking.status === 'in_progress';
  const canCancel = ['pending', 'confirmed'].includes(booking.status);

  return (
    <div className="min-h-screen py-8">
      <div className="page-container max-w-3xl">
        <button onClick={() => navigate('/bookings')} className="flex items-center gap-2 text-muted hover:text-dark text-sm mb-6">
          <ChevronLeft size={16} /> My Bookings
        </button>

        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-heading text-xl font-bold text-dark">{booking.serviceType}</h1>
              <p className="text-sm text-muted mt-1">Booking #{booking._id.slice(-6).toUpperCase()}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          {/* Progress stepper */}
          {booking.status !== 'cancelled' && (
            <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
              {STEPS.filter(s => s !== 'pending').map((step, i) => {
                const done = STEPS.indexOf(step) <= stepIndex;
                const active = STEPS.indexOf(step) === stepIndex;
                const labels = { confirmed: 'Confirmed', departed: 'On way', arrived: 'Arrived', in_progress: 'Working', completed: 'Done' };
                return (
                  <div key={step} className="flex items-center gap-1 flex-shrink-0">
                    <div className={`flex flex-col items-center gap-1`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-success border-success' : active ? 'border-primary bg-primary/10' : 'border-border'}`}>
                        {done ? <CheckCircle size={14} className="text-white" /> : <span className="text-xs font-mono">{i + 1}</span>}
                      </div>
                      <span className={`text-[10px] whitespace-nowrap ${done || active ? 'text-dark font-medium' : 'text-muted'}`}>{labels[step]}</span>
                    </div>
                    {i < 4 && <div className={`w-8 h-0.5 mb-4 flex-shrink-0 ${STEPS.indexOf(step) < stepIndex ? 'bg-success' : 'bg-border'}`} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Provider info */}
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-dark mb-4">Service Provider</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10">
                {provider?.profileImage
                  ? <img src={provider.profileImage} alt="" className="w-full h-full object-cover" />
                  : <span className="w-full h-full flex items-center justify-center text-primary font-bold">{provider?.shopName?.[0]}</span>
                }
              </div>
              <div>
                <p className="font-medium text-dark">{provider?.shopName}</p>
                <p className="text-xs text-muted capitalize">{provider?.primaryCategory?.replace('_', ' ')}</p>
                {provider?.isVerified && <span className="badge-verified mt-1"><Shield size={9} /> Verified</span>}
              </div>
            </div>
            {provider?.userId?.phone && (
              <a href={`tel:${provider.userId.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Phone size={13} /> {provider.userId.phone}
              </a>
            )}
          </div>

          {/* Booking details */}
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-dark mb-4">Booking Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-muted">
                <Clock size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-dark font-medium">Scheduled</div>
                  <div>{format(new Date(booking.scheduledAt), 'dd MMM yyyy, h:mm a')}</div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-muted">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-dark font-medium">Address</div>
                  <div>{booking.address}, {booking.city}</div>
                </div>
              </div>
              {booking.problemDescription && (
                <div className="pt-2 border-t border-border">
                  <p className="text-dark font-medium mb-1">Problem</p>
                  <p className="text-muted">{booking.problemDescription}</p>
                </div>
              )}
              {booking.jobAmount && (
                <div className="pt-2 border-t border-border flex justify-between">
                  <span className="text-dark font-medium">Job Amount</span>
                  <span className="font-mono font-bold text-dark">₹{booking.jobAmount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OTP section (when arrived) */}
        {booking.status === 'arrived' && !booking.otpVerified && (
          <div className="card p-6 mt-6 border-2 border-primary/30 bg-primary-light">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className="text-primary" />
              <h2 className="font-heading font-semibold text-primary">Door Check-In OTP</h2>
            </div>
            <p className="text-sm text-primary/70 mb-4">Share this OTP verbally with the provider at your door. Do NOT share it over phone or message.</p>
            <div className="text-center">
              <div className="font-mono font-bold text-4xl text-primary tracking-widest bg-white rounded-2xl inline-block px-8 py-4 shadow-sm">
                {booking.otp}
              </div>
              <p className="text-xs text-muted mt-2">Only share this when the provider is physically at your door</p>
            </div>
          </div>
        )}

        {/* SOS button */}
        {showSOS && !booking.sosTriggered && (
          <div className="card p-6 mt-6 border-2 border-danger/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-semibold text-dark flex items-center gap-2">
                  <AlertTriangle size={18} className="text-danger" /> Emergency SOS
                </h2>
                <p className="text-sm text-muted mt-1">Feeling unsafe? Tap SOS to alert admin and block the provider immediately.</p>
              </div>
              <button onClick={handleSOS} disabled={sosLoading} className="relative bg-danger hover:bg-red-700 text-white font-bold px-6 py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 text-sm flex-shrink-0 ml-4">
                <span className="absolute inset-0 rounded-2xl animate-pulse-ring bg-danger opacity-40" />
                {sosLoading ? 'Sending...' : '🆘 SOS'}
              </button>
            </div>
          </div>
        )}

        {booking.sosTriggered && (
          <div className="card p-4 mt-6 bg-red-50 border-2 border-danger/30">
            <p className="text-danger font-medium text-sm flex items-center gap-2">
              <AlertTriangle size={16} /> SOS alert has been sent. Admin has been notified and provider blocked.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {canCancel && (
            <button onClick={() => setShowCancelConfirm(true)} className="btn-danger">
              Cancel Booking
            </button>
          )}
          {booking.status === 'completed' && !booking.reviewed && (
            <button onClick={() => setShowReview(true)} className="btn-primary flex items-center gap-2">
              <Star size={15} /> Leave Review
            </button>
          )}
          {booking.status === 'completed' && booking.reviewed && (
            <span className="badge-verified py-2 px-4 rounded-xl">
              <CheckCircle size={14} /> Review submitted
            </span>
          )}
        </div>

        {/* Status history */}
        {booking.statusHistory?.length > 0 && (
          <div className="card p-5 mt-6">
            <h2 className="font-heading font-semibold text-dark mb-4">Timeline</h2>
            <div className="space-y-3">
              {[...booking.statusHistory].reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-dark capitalize">{h.status.replace('_', ' ')}</p>
                    <p className="text-xs text-muted">{format(new Date(h.timestamp), 'dd MMM, h:mm a')} — {h.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel confirm modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-dark/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="font-heading font-semibold text-dark mb-2">Cancel Booking?</h3>
            <p className="text-sm text-muted mb-4">Please provide a reason for cancellation.</p>
            <textarea className="input-field resize-none mb-4" rows={3} placeholder="Reason..."
              value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="btn-secondary flex-1">Keep Booking</button>
              <button onClick={handleCancel} disabled={cancelLoading} className="btn-danger flex-1">
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReview && (
        <ReviewModal bookingId={id} onClose={() => { setShowReview(false); fetchBooking(); }} />
      )}
    </div>
  );
};

export default BookingTrackingPage;
