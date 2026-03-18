import { Loader2, SearchX, AlertCircle } from 'lucide-react';

export const Spinner = ({ size = 'md' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className={`${s} animate-spin text-primary`} />
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-white font-heading font-bold text-xl">F</span>
      </div>
      <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
    </div>
  </div>
);

export const EmptyState = ({ icon: Icon = SearchX, title = 'Nothing here', message = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-border rounded-2xl flex items-center justify-center mb-4">
      <Icon size={28} className="text-muted" />
    </div>
    <h3 className="font-heading font-semibold text-dark mb-1">{title}</h3>
    {message && <p className="text-sm text-muted max-w-xs">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorAlert = ({ message }) => (
  <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-danger rounded-xl px-4 py-3 text-sm">
    <AlertCircle size={16} className="flex-shrink-0" />
    {message}
  </div>
);

export const Pagination = ({ page, pages, onPage }) => {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPage(page - 1)} disabled={page === 1} className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-all">
        ← Prev
      </button>
      {Array.from({ length: Math.min(5, pages) }, (_, i) => {
        const p = page <= 3 ? i + 1 : page - 2 + i;
        if (p < 1 || p > pages) return null;
        return (
          <button key={p} onClick={() => onPage(p)} className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-primary text-white shadow-primary' : 'border border-border hover:border-primary hover:text-primary'}`}>
            {p}
          </button>
        );
      })}
      <button onClick={() => onPage(page + 1)} disabled={page === pages} className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-all">
        Next →
      </button>
    </div>
  );
};

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  departed: 'bg-purple-50 text-purple-700 border-purple-200',
  arrived: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  in_progress: 'bg-primary-light text-primary border-primary/20',
  completed: 'bg-green-50 text-success border-green-200',
  cancelled: 'bg-red-50 text-danger border-red-200',
};

const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', departed: 'On The Way',
  arrived: 'Arrived', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled',
};

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

export const TrustBar = ({ label, value, total }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-gold rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-dark w-8 text-right">{pct}%</span>
    </div>
  );
};

export const OTPInput = ({ value, onChange, length = 6 }) => {
  const inputs = Array.from({ length });
  const refs = inputs.map(() => ({ current: null }));

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const arr = value.split('');
    arr[i] = val.slice(-1);
    onChange(arr.join(''));
    if (val && i < length - 1) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs[i - 1].current?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {inputs.map((_, i) => (
        <input
          key={i}
          ref={el => { refs[i].current = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl font-mono font-bold border-2 border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
        />
      ))}
    </div>
  );
};
