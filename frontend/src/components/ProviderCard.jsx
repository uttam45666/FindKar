import { Link } from 'react-router-dom';
import { Shield, MapPin, Star, Users, Briefcase } from 'lucide-react';

const CATEGORY_ICONS = {
  plumber: '🔧', electrician: '⚡', carpenter: '🪚',
  ac_technician: '❄️', painter: '🎨', maid: '🧹', cook: '👨‍🍳', driver: '🚗',
};

const ProviderCard = ({ provider }) => {
  const { tagStats, trustScore, completedJobs, neighborShares, isVerified, primaryCategory, shopCity } = provider;

  const topTag = tagStats?.totalReviews > 0
    ? Object.entries({ onTime: tagStats.onTime, wouldCallAgain: tagStats.wouldCallAgain, workDone: tagStats.workDone })
        .sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  const tagLabels = { onTime: 'On Time', wouldCallAgain: 'Call Again', workDone: 'Quality Work' };

  return (
    <Link to={`/provider/${provider._id}`} className="card block hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
      {/* Images */}
      <div className="relative h-36 bg-gradient-to-br from-primary/10 to-warm overflow-hidden">
        {provider.shopImages?.[0]
          ? <img src={provider.shopImages[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">{CATEGORY_ICONS[primaryCategory] || '🔧'}</div>
        }
        {isVerified && (
          <div className="absolute top-2 right-2 bg-success text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
            <Shield size={10} /> Verified
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-dark/70 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <MapPin size={10} /> {shopCity}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 border-2 border-white shadow-sm">
            {provider.profileImage
              ? <img src={provider.profileImage} alt="" className="w-full h-full object-cover" />
              : <span className="w-full h-full flex items-center justify-center text-primary font-bold">{provider.shopName?.[0]}</span>
            }
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-semibold text-dark text-sm truncate">{provider.shopName || provider.userId?.fullName}</h3>
            <p className="text-xs text-muted capitalize">{primaryCategory?.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Trust score bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">Trust Score</span>
            <span className="text-xs font-mono font-bold text-primary">{trustScore}%</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-gold rounded-full transition-all" style={{ width: `${trustScore}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted">
            <Briefcase size={11} /> <span className="font-mono">{completedJobs}</span> jobs
          </div>
          <div className="flex items-center gap-1 text-xs text-muted">
            <Users size={11} /> <span className="font-mono">{neighborShares}</span> shares
          </div>
          {topTag && (
            <div className="ml-auto bg-primary/8 text-primary text-xs px-2 py-0.5 rounded-full">
              ✓ {tagLabels[topTag]}
            </div>
          )}
        </div>

        {/* Price hint */}
        {provider.services?.[0] && (
          <div className="mt-2 text-xs text-muted">
            Starting ₹{provider.services[0].price}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProviderCard;
