import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, MapPin, Phone, Globe, Share2, Users, Briefcase, ChevronLeft, Star, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Spinner, TrustBar } from '../../components/UI.jsx';
import { formatDistanceToNow } from 'date-fns';
import BookingModal from './BookingModal.jsx';

const TAG_LABELS = {
  onTime: 'Arrived on time',
  transparent: 'Pricing transparent',
  noSurprises: 'No surprise charges',
  workDone: 'Work done properly',
  wouldCallAgain: 'Would call again',
};

const ProviderProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuth } = useAuth();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [vouching, setVouching] = useState(false);
  const [userProvider, setUserProvider] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/providers/${id}`);
        setProvider(data.provider);
        setReviews(data.reviews || []);
        // If user is a provider, fetch their profile too
        if (user?.role === 'provider') {
          try {
            const provRes = await api.get('/providers/me/profile');
            setUserProvider(provRes.data.provider);
          } catch {}
        }
      } catch { navigate('/services'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleShare = async () => {
    setSharing(true);
    try {
      await api.post(`/providers/${id}/share`);
      setProvider(p => ({ ...p, neighborShares: p.neighborShares + 1 }));
      const text = `I found a great ${provider.primaryCategory} on Findkar! Check out ${provider.shopName}: ${window.location.href}`;
      if (navigator.share) {
        await navigator.share({ title: provider.shopName, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Link copied to clipboard!');
      }
    } catch {}
    finally { setSharing(false); }
  };

  const handleVouch = async () => {
    if (!userProvider?.isVerified) {
      toast.error('You must be a verified provider to vouch');
      return;
    }
    const alreadyVouched = provider.vouchedBy?.some(v => v._id === userProvider._id);
    if (alreadyVouched) {
      toast.error('You have already vouched for this provider');
      return;
    }
    setVouching(true);
    try {
      const { data } = await api.post(`/providers/${id}/vouch`);
      setProvider(data.provider);
      toast.success('Thank you for vouching!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to vouch');
    } finally {
      setVouching(false);
    }
  };

  if (loading) return <Spinner />;
  if (!provider) return null;

  const { tagStats, trustScore, completedJobs, neighborShares, isVerified, services, shopImages, vouchedBy } = provider;
  const allImages = [provider.profileImage, ...(shopImages || [])].filter(Boolean);

  return (
    <div className="min-h-screen py-8">
      <div className="page-container max-w-5xl">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-dark text-sm mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {allImages.length > 0 && (
              <div className="card overflow-hidden">
                <div className="h-64 bg-warm overflow-hidden">
                  <img src={allImages[activeImg]} alt="" className="w-full h-full object-cover" />
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {allImages.map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImg === i ? 'border-primary' : 'border-transparent'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Provider info */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 flex-shrink-0">
                    {provider.profileImage
                      ? <img src={provider.profileImage} alt="" className="w-full h-full object-cover" />
                      : <span className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl">{provider.shopName?.[0]}</span>
                    }
                  </div>
                  <div>
                    <h1 className="font-heading text-2xl font-bold text-dark">{provider.shopName}</h1>
                    <p className="text-muted text-sm capitalize">{provider.primaryCategory?.replace('_', ' ')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {isVerified && <span className="badge-verified"><Shield size={10} /> Verified</span>}
                      <span className="text-xs text-muted flex items-center gap-1"><MapPin size={10} /> {provider.shopCity}</span>
                    </div>
                  </div>
                </div>
              </div>
              {provider.bio && <p className="text-sm text-dark/70 mb-4 leading-relaxed">{provider.bio}</p>}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="font-mono font-bold text-xl text-primary">{completedJobs}</div>
                  <div className="text-xs text-muted">Jobs done</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-bold text-xl text-primary">{neighborShares}</div>
                  <div className="text-xs text-muted">Neighbor shares</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-bold text-xl text-primary">{trustScore}%</div>
                  <div className="text-xs text-muted">Trust score</div>
                </div>
              </div>
            </div>

            {/* Trust score breakdown */}
            <div className="card p-6">
              <h2 className="font-heading font-semibold text-dark mb-4">Community Trust Score</h2>
              {tagStats?.totalReviews > 0 ? (
                <div className="space-y-3">
                  {Object.entries(TAG_LABELS).map(([key, label]) => (
                    <TrustBar key={key} label={label} value={tagStats[key] || 0} total={tagStats.totalReviews} />
                  ))}
                  <p className="text-xs text-muted mt-3">Based on {tagStats.totalReviews} verified reviews</p>
                </div>
              ) : (
                <p className="text-sm text-muted">No reviews yet — be the first to book!</p>
              )}
            </div>

            {/* Services */}
            {services?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-heading font-semibold text-dark mb-4">Services & Pricing</h2>
                <div className="space-y-3">
                  {services.map(svc => (
                    <div key={svc._id} className="flex items-start justify-between p-3 rounded-xl bg-warm border border-border">
                      <div>
                        <p className="font-medium text-dark text-sm">{svc.serviceName}</p>
                        {svc.description && <p className="text-xs text-muted mt-0.5">{svc.description}</p>}
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className="font-mono font-semibold text-dark">₹{svc.price}</span>
                        {svc.priceType !== 'fixed' && <span className="text-xs text-muted ml-1">onwards</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="card p-6">
                <h2 className="font-heading font-semibold text-dark mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r._id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {r.customerId?.fullName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark">{r.customerId?.fullName}</p>
                          <p className="text-xs text-muted">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {Object.entries(r.tags || {}).filter(([, v]) => v).map(([k]) => (
                          <span key={k} className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle size={9} /> {TAG_LABELS[k]}
                          </span>
                        ))}
                      </div>
                      {r.comment && <p className="text-sm text-dark/70">"{r.comment}"</p>}
                      {r.providerReply && (
                        <div className="mt-2 ml-4 pl-3 border-l-2 border-primary/30">
                          <p className="text-xs text-muted flex items-center gap-1 mb-0.5"><MessageCircle size={10} /> Provider replied:</p>
                          <p className="text-sm text-dark/70">{r.providerReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vouching */}
            {vouchedBy?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-heading font-semibold text-dark mb-4 flex items-center gap-2">
                  <Users size={16} /> Vouched by {vouchedBy.length} providers
                </h2>
                <div className="flex flex-wrap gap-2">
                  {vouchedBy.map(v => (
                    <div key={v._id} className="flex items-center gap-2 bg-warm border border-border px-3 py-1.5 rounded-full">
                      <Shield size={12} className="text-success" />
                      <span className="text-xs font-medium text-dark">{v.shopName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Booking card */}
            <div className="card p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-mono font-bold text-dark">
                    {services?.[0] ? `₹${services[0].price}` : 'Contact'}
                  </div>
                  <div className="text-xs text-muted">starting price</div>
                </div>
                {isVerified && <span className="badge-verified"><Shield size={10} /> Verified</span>}
              </div>

              {isAuth && user?.role === 'customer' ? (
                <button onClick={() => setShowBooking(true)} className="btn-primary w-full mb-3">
                  Book Now
                </button>
              ) : !isAuth ? (
                <button onClick={() => navigate('/login')} className="btn-primary w-full mb-3">
                  Login to Book
                </button>
              ) : null}

              <button onClick={handleShare} disabled={sharing} className="btn-secondary w-full flex items-center justify-center gap-2">
                <Share2 size={14} />
                Share ({neighborShares} shares)
              </button>

              {userProvider?.isVerified && user?.role === 'provider' && id !== userProvider._id.toString() && (
                <button onClick={handleVouch} disabled={vouching || provider?.vouchedBy?.some(v => v._id === userProvider._id)} className="btn-secondary w-full flex items-center justify-center gap-2 mt-2">
                  <Shield size={14} />
                  {vouching ? 'Vouching...' : provider?.vouchedBy?.some(v => v._id === userProvider._id) ? 'Already vouched' : 'Vouch for provider'}
                </button>
              )}

              {/* Contact info */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {provider.shopPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Phone size={13} /> {provider.shopPhone}
                  </div>
                )}
                {provider.shopCity && (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <MapPin size={13} /> {provider.shopCity}, {provider.shopState}
                  </div>
                )}
                {provider.shopWebsite && (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Globe size={13} />
                    <a href={provider.shopWebsite} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
                      {provider.shopWebsite}
                    </a>
                  </div>
                )}
              </div>

              {/* Safety note */}
              <div className="mt-4 bg-primary-light rounded-xl p-3">
                <p className="text-xs text-primary font-medium mb-1 flex items-center gap-1">
                  <Shield size={11} /> Safety guaranteed
                </p>
                <p className="text-xs text-primary/70">OTP door check-in + SOS button on every booking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal provider={provider} onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
};

export default ProviderProfilePage;
