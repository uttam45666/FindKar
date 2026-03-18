import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../../api/axios.js';
import ProviderCard from '../../components/ProviderCard.jsx';
import { Spinner, EmptyState, Pagination } from '../../components/UI.jsx';

const CATEGORIES = [
  { id: '', label: 'All Services' },
  { id: 'plumber', label: '🔧 Plumber' },
  { id: 'electrician', label: '⚡ Electrician' },
  { id: 'carpenter', label: '🪚 Carpenter' },
  { id: 'ac_technician', label: '❄️ AC Technician' },
  { id: 'painter', label: '🎨 Painter' },
  { id: 'maid', label: '🧹 Maid' },
  { id: 'cook', label: '👨‍🍳 Cook' },
  { id: 'driver', label: '🚗 Driver' },
];

const ServiceListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [cityInput, setCityInput] = useState(city);

  const fetchProviders = async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 12 });
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      if (city) params.set('city', city);
      const { data } = await api.get(`/providers?${params}`);
      setProviders(data.providers || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(pg);
    } catch { setProviders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProviders(1); }, [category, search, city]);

  const applySearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (searchInput) p.set('search', searchInput); else p.delete('search');
    if (cityInput) p.set('city', cityInput); else p.delete('city');
    setSearchParams(p);
  };

  const setCategory = (cat) => {
    const p = new URLSearchParams(searchParams);
    if (cat) p.set('category', cat); else p.delete('category');
    setSearchParams(p);
  };

  const clearFilter = (key) => {
    const p = new URLSearchParams(searchParams);
    p.delete(key);
    setSearchParams(p);
    if (key === 'search') setSearchInput('');
    if (key === 'city') setCityInput('');
  };

  const activeFilters = [
    category && { key: 'category', label: CATEGORIES.find(c => c.id === category)?.label },
    search && { key: 'search', label: `"${search}"` },
    city && { key: 'city', label: city },
  ].filter(Boolean);

  return (
    <div className="min-h-screen py-8">
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title mb-1">Find Services</h1>
          <p className="text-muted text-sm">{total > 0 ? `${total} verified providers found` : 'Browse trusted local providers'}</p>
        </div>

        {/* Search bar */}
        <form onSubmit={applySearch} className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text" placeholder="Search by name or service..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <input
            type="text" placeholder="City..."
            value={cityInput} onChange={e => setCityInput(e.target.value)}
            className="input-field w-36"
          />
          <button type="submit" className="btn-primary px-5">Search</button>
        </form>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                category === cat.id
                  ? 'bg-primary text-white border-primary shadow-primary'
                  : 'bg-white border-border text-muted hover:border-primary/50 hover:text-dark'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs text-muted flex items-center gap-1"><SlidersHorizontal size={12} /> Active filters:</span>
            {activeFilters.map(f => (
              <span key={f.key} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                {f.label}
                <button onClick={() => clearFilter(f.key)} className="hover:text-primary-dark ml-0.5"><X size={11} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <Spinner />
        ) : providers.length === 0 ? (
          <EmptyState
            title="No providers found"
            message="Try changing your filters or search in a different area."
            action={<button onClick={() => { setSearchParams({}); setSearchInput(''); setCityInput(''); }} className="btn-secondary">Clear filters</button>}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {providers.map(p => <ProviderCard key={p._id} provider={p} />)}
            </div>
            <Pagination page={page} pages={pages} onPage={fetchProviders} />
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceListingPage;
