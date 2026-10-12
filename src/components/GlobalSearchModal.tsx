import React, { useState, useEffect } from 'react';
import { X, Search, ShoppingBag, Users, Briefcase, Wrench, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (type: string, id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const { formatPrice } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    products: any[];
    users: any[];
    jobs: any[];
    services: any[];
    rooms: any[];
  }>({
    products: [],
    users: [],
    jobs: [],
    services: [],
    rooms: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], users: [], jobs: [], services: [], rooms: [] });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      api.search(query)
        .then((res) => {
          setResults({
            products: res.products || [],
            users: res.users || [],
            jobs: res.jobs || [],
            services: res.services || [],
            rooms: res.rooms || [],
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.products.length +
    results.users.length +
    results.jobs.length +
    results.services.length +
    results.rooms.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 pt-16 sm:pt-24">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            autoFocus
            placeholder="Search products, people, jobs, verified artisans, or chat rooms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none focus:outline-hidden text-slate-900 placeholder:text-slate-400"
          />
          {loading && <Loader2 className="w-4 h-4 text-[#008751] animate-spin" />}
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!query.trim() ? (
            <div className="py-12 text-center">
              <p className="text-xs text-slate-400">
                Type anything to search across Nigeria and worldwide diaspora communities.
              </p>
            </div>
          ) : totalResults === 0 && !loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching results found for "{query}". Try a different keyword.
            </div>
          ) : (
            <>
              {/* Products */}
              {results.products.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#008751]" />
                    <span>Marketplace Products</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {results.products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectResult('product', p.id);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{p.title}</div>
                          <div className="text-[11px] text-slate-500">
                            {p.category} · {p.state}
                          </div>
                        </div>
                        <div className="text-xs font-bold text-[#008751] tabular-nums">
                          {formatPrice(p.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    <Users className="w-3.5 h-3.5 text-[#008751]" />
                    <span>People & Businesses</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {results.users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSelectResult('user', u.id);
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                      >
                        <img src={u.avatar} alt={u.fullName} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{u.fullName}</div>
                          <div className="text-[11px] text-slate-500">
                            @{u.username} · {u.state}, {u.country}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Jobs */}
              {results.jobs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#008751]" />
                    <span>Jobs & Careers</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {results.jobs.map((j) => (
                      <button
                        key={j.id}
                        onClick={() => {
                          onSelectResult('job', j.id);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{j.title}</div>
                          <div className="text-[11px] text-slate-500">
                            {j.employerName} · {j.location} · {j.employmentType}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {results.services.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    <Wrench className="w-3.5 h-3.5 text-[#008751]" />
                    <span>Local Service Providers</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {results.services.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectResult('service', s.id);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{s.title}</div>
                          <div className="text-[11px] text-slate-500">
                            {s.providerName} · {s.serviceArea}
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-slate-700">
                          From {formatPrice(s.startingPrice)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Rooms */}
              {results.rooms.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#008751]" />
                    <span>Business Chat Rooms</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {results.rooms.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          onSelectResult('room', r.id);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{r.name}</div>
                          <div className="text-[11px] text-slate-500">{r.description}</div>
                        </div>
                        <span className="text-[10px] font-semibold text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-full">
                          {r.memberCount} members
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
