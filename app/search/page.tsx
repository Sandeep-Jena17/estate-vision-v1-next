'use client';
import React, { useState, useMemo, Suspense } from 'react';
import { MOCK_PROPERTIES } from '@/services/mockData';

function SearchContent() {
  const [searchQ, setSearchQ] = useState('');
  const [locality, setLocality] = useState('All Locations');
  const [type, setType] = useState('All Types');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(30000000);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(true);

  const LOCALITIES = ['All Locations', 'Patia', 'Nayapalli', 'Saheed Nagar', 'Chandrasekharpur', 'Infocity'];
  const TYPES = ['All Types', 'Apartment', 'Villa', 'Penthouse', 'Plot'];
  const SORT_OPTS = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'newest', label: 'Newest First' },
  ];

  const results = useMemo(() => {
    let list = MOCK_PROPERTIES.filter((p) => {
      if (searchQ && !p.title.toLowerCase().includes(searchQ.toLowerCase()) && !p.location.locality.toLowerCase().includes(searchQ.toLowerCase())) return false;
      if (locality !== 'All Locations' && !p.location.locality.includes(locality)) return false;
      if (type !== 'All Types' && p.type !== type) return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
      return true;
    });

    if (sortBy === 'price_asc') list = list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') list = list.sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list;
  }, [searchQ, locality, type, minPrice, maxPrice, sortBy]);

  const priceStr = (v: number) => (v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : `₹${(v / 100000).toFixed(0)}L`);

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Search Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '14px 0', position: 'sticky', top: 68, zIndex: 500 }}>
        <div className="container" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 14px', height: 42 }}>
            <span style={{ color: 'var(--muted)' }}>🔍</span>
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search by name, locality..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: 'var(--slate)', width: '100%', fontFamily: 'var(--font-body)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TYPES.slice(1).map((t) => (
              <button
                key={t}
                onClick={() => setType(type === t ? 'All Types' : t)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: `1.5px solid ${type === t ? 'var(--slate)' : 'var(--border)'}`,
                  background: type === t ? 'var(--slate)' : 'white',
                  color: type === t ? 'white' : 'var(--muted)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all .2s',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 4, background: 'var(--cream)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
            {[['grid', '⊞'], ['list', '☰']].map(([v, icon]) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: viewMode === v ? 'var(--slate)' : 'transparent',
                  color: viewMode === v ? 'white' : 'var(--muted)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {icon}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ height: 40, padding: '0 12px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'white', fontSize: 13, color: 'var(--slate)', fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer' }}
          >
            {SORT_OPTS.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar Filters */}
        <aside style={{ width: filtersOpen ? 260 : 52, flexShrink: 0, transition: 'width .3s ease' }}>
          <div className="panel" style={{ position: 'sticky', top: 136 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 12px 0', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
              {filtersOpen && <span className="panel-title">Filters</span>}
              <button onClick={() => setFiltersOpen(!filtersOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18, marginLeft: 'auto' }}>
                {filtersOpen ? '◀' : '▶'}
              </button>
            </div>

            {filtersOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div className="filter-section">
                  <span className="filter-title">Location</span>
                  <div className="filter-options">
                    {LOCALITIES.map((loc) => (
                      <label key={loc} className="filter-checkbox">
                        <input type="radio" name="locality" value={loc} checked={locality === loc} onChange={() => setLocality(loc)} />
                        {loc}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <span className="filter-title">Property Type</span>
                  <div className="filter-options">
                    {TYPES.map((t) => (
                      <label key={t} className="filter-checkbox">
                        <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <span className="filter-title">Price Range</span>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, marginBottom: 10, fontWeight: 600, color: 'var(--slate)' }}>
                      {priceStr(minPrice)} - {priceStr(maxPrice)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input type="range" min={0} max={30000000} value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} style={{ width: '100%' }} />
                      <input type="range" min={0} max={30000000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Results */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 20, fontSize: 14, color: 'var(--muted)' }}>
            Found {results.length} properties
          </div>

          {viewMode === 'grid' && (
            results.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-title">No Properties Found</div>
                <div className="empty-message">Try adjusting your filters</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
                {results.map((p) => (
                  <div key={p.id} className="property-card">
                    <div className="property-card-image">
                      <img src={p.media?.images[0]} alt={p.title} />
                      {p.badge && <span className={`badge badge-${p.badge}`} style={{ position: 'absolute', top: 10, left: 10 }}>
                        {p.badge === 'new' && '● New'}
                        {p.badge === 'hot' && '🔥 Hot'}
                        {p.badge === 'verified' && '✓ Verified'}
                      </span>}
                    </div>
                    <div className="property-card-body">
                      <div className="property-card-price">{priceStr(p.price)}</div>
                      <div className="property-card-title">{p.title}</div>
                      <div className="property-card-meta">
                        {p.specs.beds && <span>🛏 {p.specs.beds} BHK</span>}
                        {p.specs.sqft && <span>📐 {p.specs.sqft} sqft</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {viewMode === 'list' && (
            results.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-title">No Properties Found</div>
                <div className="empty-message">Try adjusting your filters</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {results.map((p) => (
                  <div key={p.id} className="panel" style={{ display: 'flex', gap: 16, alignItems: 'center', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-lg)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
                    <img src={p.media?.images[0]} alt={p.title} style={{ width: 120, height: 90, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="property-card-price">{priceStr(p.price)}</div>
                      <div className="property-card-title" style={{ marginBottom: 4 }}>{p.title}</div>
                      <div className="property-card-meta">
                        <span>📍 {p.location.locality}</span>
                        {p.specs.beds && <span>🛏 {p.specs.beds} BHK</span>}
                        {p.specs.sqft && <span>📐 {p.specs.sqft} sqft</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchListingsPage() {
  return (
    <Suspense fallback={<div className="loading-screen"><div className="loading-spinner" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
