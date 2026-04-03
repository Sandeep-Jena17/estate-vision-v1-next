'use client';
import React, { useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_PROPERTIES } from '@/services/mockData';
import { Property } from '@/types';
import { formatPrice } from '@/utils/formatters';

const ITEMS_PER_PAGE = 6;

const FILTERS = ['All Properties', 'Ready to Move', 'Under Construction', 'Premium'] as const;

function ListingsContent() {
  const router = useRouter();
  const [viewMode, setViewMode]               = useState<'grid' | 'list'>('grid');
  const [likedProperties, setLikedProperties] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter]       = useState<string>('All Properties');
  const [currentPage, setCurrentPage]         = useState(1);

  const toggleLike = (propId: string) => {
    const next = new Set(likedProperties);
    next.has(propId) ? next.delete(propId) : next.add(propId);
    setLikedProperties(next);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const filteredProperties = useMemo(() => {
    switch (activeFilter) {
      case 'Ready to Move':
        return MOCK_PROPERTIES.filter((p) => p.status === 'Ready to Move');
      case 'Under Construction':
        return MOCK_PROPERTIES.filter((p) => p.status === 'Under Construction');
      case 'Premium':
        return MOCK_PROPERTIES.filter((p) => p.premium);
      default:
        return MOCK_PROPERTIES;
    }
  }, [activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / ITEMS_PER_PAGE));

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="listings-page">
      <div className="container listings-container">

        {/* ── PAGE HEADER ──────────────────────────── */}
        <div className="listings-header">
          <div>
            <h1 className="listings-title t-display">Available Properties</h1>
            <p className="t-sm t-muted mt-4">
              {filteredProperties.length} properties found
            </p>
          </div>

          {/* View toggle */}
          <div className="view-toggle">
            {(['grid', 'list'] as const).map(mode => (
              <button
                key={mode}
                className={`view-btn ${viewMode === mode ? 'active' : ''}`}
                onClick={() => setViewMode(mode)}
              >
                {mode === 'grid' ? '⊞ Grid' : '☰ List'}
              </button>
            ))}
          </div>
        </div>

        {/* ── FILTER CHIPS ─────────────────────────── */}
        <div className="filter-chips mb-24">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
              onClick={() => handleFilterChange(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── PROPERTIES ───────────────────────────── */}
        {paginatedProperties.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid-3' : 'listings-list'}>
            {paginatedProperties.map(property => (
              <PropertyCardView
                key={property.id}
                property={property}
                viewMode={viewMode}
                isLiked={likedProperties.has(property.id)}
                onLike={() => toggleLike(property.id)}
                onViewDetails={() => router.push(`/property/${property.id}`)}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🏠</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No properties found</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Try a different filter</p>
          </div>
        )}

        {/* ── PAGINATION ───────────────────────────── */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
            >
              ← Prev
            </button>

            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-btn ${page === currentPage ? 'active' : ''}`}
                  onClick={() => goToPage(page)}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              className="btn btn-outline btn-sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

interface PropertyCardViewProps {
  property:      Property;
  viewMode:      'grid' | 'list';
  isLiked:       boolean;
  onLike:        () => void;
  onViewDetails: () => void;
}

function PropertyCardView({
  property, viewMode, isLiked, onLike, onViewDetails
}: PropertyCardViewProps) {
  const price = formatPrice(property.price);

  if (viewMode === 'list') {
    return (
      <div className="prop-list-card" onClick={onViewDetails}>
        <div className="prop-list-img">
          <img src={property.media.images[0]} alt={property.title} loading="lazy" />
        </div>
        <div className="prop-list-body">
          <div className="prop-card-price">{price}</div>
          <h3 className="prop-card-title">{property.title}</h3>
          <p className="prop-card-loc">📍 {property.location.address}</p>
          <div className="prop-card-specs">
            <span className="prop-spec">🛏️ <strong>{property.specs.beds}</strong> Beds</span>
            <span className="prop-spec">🚿 <strong>{property.specs.baths}</strong> Baths</span>
            <span className="prop-spec">📐 <strong>{property.specs.sqft}</strong> sqft</span>
          </div>
        </div>
        <div className="prop-list-actions">
          <button
            className="like-btn"
            onClick={e => { e.stopPropagation(); onLike(); }}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            {isLiked ? '❤️' : '🤍'}
          </button>
          <button
            className="btn btn-gold btn-sm"
            onClick={e => { e.stopPropagation(); onViewDetails(); }}
          >
            View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="prop-card" onClick={onViewDetails}>
      <div className="prop-card-img">
        <img src={property.media.images[0]} alt={property.title} loading="lazy" />
        <button
          className="like-btn like-btn-overlay"
          onClick={e => { e.stopPropagation(); onLike(); }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
        {property.premium && (
          <span className="badge badge-premium prop-card-badge">✦ Premium</span>
        )}
      </div>
      <div className="prop-card-body">
        <div className="prop-card-price">{price}</div>
        <h3 className="prop-card-title">{property.title}</h3>
        <p className="prop-card-loc">📍 {property.location.locality}</p>
        <div className="prop-card-specs">
          <span className="prop-spec">🛏️ <strong>{property.specs.beds}</strong></span>
          <span className="prop-spec">🚿 <strong>{property.specs.baths}</strong></span>
          <span className="prop-spec">📐 <strong>{property.specs.sqft}</strong></span>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="loading-screen"><div className="loading-spinner" /></div>}>
      <ListingsContent />
    </Suspense>
  );
}
