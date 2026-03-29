'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import '@/styles/pages/property-details.css';
import { MOCK_PROPERTIES } from '@/services/mockData';
import { formatPrice } from '@/utils/formatters';

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [visitType, setVisitType] = useState<'site_visit' | 'video_call'>('site_visit');

  const property = MOCK_PROPERTIES.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="container" style={{ padding: '40px 24px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Property Not Found</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>The property you&apos;re looking for doesn&apos;t exist.</p>
        <button className="btn btn-gold btn-lg" onClick={() => router.push('/listings')}>← Back to Listings</button>
      </div>
    );
  }

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % property.media.images.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + property.media.images.length) % property.media.images.length);

  const price = formatPrice(property.price);
  const pricePerSqft = `₹${Math.round(property.price / property.specs.sqft).toLocaleString('en-IN')}`;

  return (
    <div className="details-page">
      <div className="container details-container">

        <button className="btn btn-outline btn-sm" onClick={() => router.push('/listings')} style={{ marginBottom: 24 }}>
          ← Back to Listings
        </button>

        <div className="details-layout">

          {/* ── MAIN CONTENT ── */}
          <div>
            {/* Image Gallery */}
            <div className="gallery-main" style={{ position: 'relative', marginBottom: 16 }}>
              <img src={property.media.images[activeImageIndex]} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <button className="gallery-btn gallery-btn-prev" onClick={prevImage}>‹</button>
              <button className="gallery-btn gallery-btn-next" onClick={nextImage}>›</button>
              <div className="gallery-counter">{activeImageIndex + 1}/{property.media.images.length}</div>
            </div>

            {/* Thumbnails */}
            <div className="gallery-thumbs">
              {property.media.images.map((img, idx) => (
                <div key={idx} className={`gallery-thumb ${idx === activeImageIndex ? 'active' : ''}`} onClick={() => setActiveImageIndex(idx)}>
                  <img src={img} alt={`View ${idx + 1}`} />
                </div>
              ))}
            </div>

            {/* Title & Address */}
            <div style={{ marginTop: 32 }}>
              <h1 className="details-title">{property.title}</h1>
              <p className="details-address">{property.location.address}</p>

              <div className="details-specs-panel">
                <div className="details-specs-grid">
                  <div>
                    <div className="details-spec-label">Price</div>
                    <div className="details-spec-value gold">{price}</div>
                    <div className="details-spec-sub">{pricePerSqft} / sqft</div>
                  </div>
                  <div>
                    <div className="details-spec-label">Bedrooms</div>
                    <div className="details-spec-value">{property.specs.beds}</div>
                  </div>
                  <div>
                    <div className="details-spec-label">Bathrooms</div>
                    <div className="details-spec-value">{property.specs.baths}</div>
                  </div>
                  <div>
                    <div className="details-spec-label">Area</div>
                    <div className="details-spec-value">{property.specs.sqft}</div>
                    <div className="details-spec-sub">sqft</div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div style={{ marginBottom: 40 }}>
                <h2 className="details-section-title">About This Property</h2>
                <div className="details-2col">
                  <div><div className="details-info-label">Type</div><div className="details-info-value">{property.type}</div></div>
                  <div><div className="details-info-label">Status</div><div className="details-info-value">{property.status}</div></div>
                  <div><div className="details-info-label">Furnishing</div><div className="details-info-value">{property.specs.furnished}</div></div>
                  <div><div className="details-info-label">Floor</div><div className="details-info-value">{property.specs.floor}</div></div>
                </div>
              </div>

              {/* Nearby Landmarks */}
              <div>
                <h2 className="details-section-title">Nearby Landmarks</h2>
                <div className="details-2col">
                  {property.landmarks.map((landmark, idx) => (
                    <div key={idx} className="details-landmark">
                      <div className="details-landmark-icon">📍</div>
                      <div>
                        <div className="details-landmark-name">{landmark.name}</div>
                        <div className="details-landmark-dist">{landmark.distanceKm} km away</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Agent Info */}
            {property.agent && (
              <div className="details-agent">
                <h2 className="details-section-title">Agent Information</h2>
                <div className="details-agent-inner">
                  <div className="details-agent-avatar">👤</div>
                  <div>
                    <div className="details-agent-name">{property.agent.name}</div>
                    <div className="details-agent-phone">📞 {property.agent.phone}</div>
                    <div className="details-agent-rating">⭐ {property.agent.rating}/5.0</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── BOOKING SIDEBAR ── */}
          <div>
            <div className="booking-panel">
              <div className="booking-header">
                <div className="booking-price">{price}<span> / {pricePerSqft} sqft</span></div>
              </div>
              <div className="booking-body">
                <div style={{ marginBottom: 20 }}>
                  <label className="details-spec-label" style={{ display: 'block', marginBottom: 12 }}>Visit Type</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className={`booking-option ${visitType === 'site_visit' ? 'selected' : ''}`} onClick={() => setVisitType('site_visit')}>
                      <div className="opt-icon">🏠</div>
                      <div className="opt-title">Site Visit</div>
                      <div className="opt-sub">In person</div>
                    </button>
                    <button className={`booking-option ${visitType === 'video_call' ? 'selected' : ''}`} onClick={() => setVisitType('video_call')}>
                      <div className="opt-icon">📹</div>
                      <div className="opt-title">Video Call</div>
                      <div className="opt-sub">Online tour</div>
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label className="label">Date</label>
                  <input type="date" className="input" style={{ marginTop: 6 }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label className="label">Name</label>
                  <input type="text" className="input" placeholder="Your name" style={{ marginTop: 6 }} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" className="input" placeholder="10-digit number" style={{ marginTop: 6 }} />
                </div>
              </div>
              <div className="booking-footer">
                <button className="btn btn-gold btn-full" style={{ marginBottom: 8 }}>Book a Visit</button>
                <button className="btn btn-outline btn-full">Chat with Agent</button>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                <div className="booking-trust"><span>🔒</span><span style={{ fontSize: 12 }}>100% Safe &amp; Verified</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
