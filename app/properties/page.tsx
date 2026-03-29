'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_PROPERTIES } from '@/services/mockData';
import '@/styles/pages/listings.css';

export default function PropertiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [beds, setBeds] = useState('');

  const filteredProperties = MOCK_PROPERTIES.filter((prop) => {
    const matchesSearch =
      prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !propertyType || prop.type === propertyType;
    const matchesPrice = !priceRange ||
      (priceRange === 'under50' && prop.price < 5000000) ||
      (priceRange === '50to100' && prop.price >= 5000000 && prop.price < 10000000) ||
      (priceRange === 'above100' && prop.price >= 10000000);
    const matchesBeds = !beds || prop.specs.beds === parseInt(beds);

    return matchesSearch && matchesType && matchesPrice && matchesBeds;
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--slate)', marginBottom: 8 }}>
            All Properties
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            Browse {filteredProperties.length} premium properties
          </p>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--slate)' }}>Filters</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            <div className="field">
              <label className="label">Search by location or title</label>
              <input type="text" className="input" placeholder="Enter city, locality, or property name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Property Type</label>
              <select className="select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                <option value="">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Commercial">Commercial</option>
                <option value="Penthouse">Penthouse</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Price Range</label>
              <select className="select" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                <option value="">All Prices</option>
                <option value="under50">Under ₹50L</option>
                <option value="50to100">₹50L - ₹1Cr</option>
                <option value="above100">Above ₹1Cr</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Bedrooms</label>
              <select className="select" value={beds} onChange={(e) => setBeds(e.target.value)}>
                <option value="">All Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredProperties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No Properties Found</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Try adjusting your filters to find available properties.</p>
            <button className="btn btn-gold" onClick={() => { setSearchTerm(''); setPropertyType(''); setPriceRange(''); setBeds(''); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid-3" style={{ marginBottom: 48 }}>
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => router.push(`/property/${property.id}`)}
                style={{ background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', transition: 'all var(--transition)', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <img src={property.media.images[0]} alt={property.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                <div style={{ padding: 20 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>
                    ₹{(property.price / 10000000).toFixed(1)} Cr
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--slate)', marginBottom: 8, lineHeight: 1.4 }}>{property.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>{property.location.locality}, {property.location.city}</p>
                  <div style={{ display: 'flex', gap: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>
                    <span>🛏️ {property.specs.beds}</span>
                    <span>🚿 {property.specs.baths}</span>
                    <span>📐 {property.specs.sqft}sqft</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
