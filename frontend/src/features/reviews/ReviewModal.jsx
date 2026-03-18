import { useState } from 'react';
import { X, CheckCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { ErrorAlert } from '../../components/UI.jsx';

const TAGS = [
  { key: 'onTime', label: 'Arrived on time' },
  { key: 'transparent', label: 'Pricing was transparent' },
  { key: 'noSurprises', label: 'No surprise charges' },
  { key: 'workDone', label: 'Work done properly' },
  { key: 'wouldCallAgain', label: 'Would call again' },
];

const ReviewModal = ({ bookingId, onClose }) => {
  const [tags, setTags] = useState({ onTime: false, transparent: false, noSurprises: false, workDone: false, wouldCallAgain: false });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/reviews', { bookingId, tags, rating, comment, complaint });
      toast.success('Review submitted! Thank you.');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl shadow-card-hover w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-heading font-semibold text-dark">How was the service?</h2>
          <button onClick={onClose} className="p-2 hover:bg-warm rounded-xl">
            <X size={18} className="text-muted" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <ErrorAlert message={error} />}
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Rate your experience</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} type="button" onClick={() => setRating(r)}
                  className={`px-3 py-2 rounded-lg transition-all font-semibold text-sm ${
                    r <= rating ? 'bg-yellow-400 text-white' : 'bg-border text-muted hover:bg-yellow-200'
                  }`}>
                  {r}⭐
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-dark mb-2">Select all that apply:</p>
            <div className="space-y-2">
              {TAGS.map(t => (
                <button type="button" key={t.key} onClick={() => setTags(p => ({ ...p, [t.key]: !p[t.key] }))}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-sm font-medium ${tags[t.key] ? 'border-success bg-green-50 text-success' : 'border-border hover:border-success/40 text-muted'}`}>
                  {t.label}
                  {tags[t.key] && <CheckCircle size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">What did you like? (optional)</label>
            <textarea className="input-field resize-none" rows={2} maxLength={500} placeholder="Share what went well..."
              value={comment} onChange={e => setComment(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Report an issue (optional)</label>
            <textarea className="input-field resize-none" rows={3} maxLength={1000} placeholder="If you faced any problems, please describe them here so the provider can address them..."
              value={complaint} onChange={e => setComplaint(e.target.value)} />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Skip</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
