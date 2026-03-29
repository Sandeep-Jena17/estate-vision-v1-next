'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_PROPERTIES } from '@/services/mockData';

export default function HomePage() {
  const router = useRouter();

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        background: 'linear-gradient(160deg, var(--slate) 0%, #0f1420 60%, #1a2035 100%)',
        color: 'white'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 5vw, 64px)',
          fontWeight: 700,
          marginBottom: 24
        }}>
          🏠 EstateVision
        </h1>
        <p style={{
          fontSize: 18,
          color: 'rgba(255,255,255,.7)',
          maxWidth: 600,
          marginBottom: 32,
          lineHeight: 1.7
        }}>
          Premium Real Estate Platform with production-ready React components and modern design
        </p>
        <button
          className="btn btn-gold btn-lg"
          onClick={() => router.push('/listings')}
          style={{ marginBottom: 40 }}
        >
          Explore {MOCK_PROPERTIES.length} Properties →
        </button>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '60px 24px',
        background: 'white',
        borderTop: '1px solid var(--border)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 48,
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 36,
                fontWeight: 700,
                color: 'var(--gold)',
                marginBottom: 8
              }}>
                {MOCK_PROPERTIES.length}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>
                Premium Properties
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 36,
                fontWeight: 700,
                color: 'var(--gold)',
                marginBottom: 8
              }}>
                24/7
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>
                Customer Support
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 36,
                fontWeight: 700,
                color: 'var(--gold)',
                marginBottom: 8
              }}>
                100%
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>
                Verified Properties
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section style={{
        padding: '60px 24px',
        background: 'var(--cream)'
      }}>
        <div className="container">
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 40,
            textAlign: 'center'
          }}>
            Featured Properties
          </h2>

          <div className="grid-3">
            {MOCK_PROPERTIES.slice(0, 3).map((property) => (
              <div
                key={property.id}
                onClick={() => router.push(`/property/${property.id}`)}
                style={{
                  cursor: 'pointer',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <img
                  src={property.media.images[0]}
                  alt={property.title}
                  style={{
                    width: '100%',
                    height: 240,
                    objectFit: 'cover',
                  }}
                />
                <div style={{ padding: '20px' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--gold)',
                    marginBottom: 8
                  }}>
                    ₹{(property.price / 10000000).toFixed(1)} Cr
                  </div>
                  <h3 style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--slate)',
                    marginBottom: 8
                  }}>
                    {property.title}
                  </h3>
                  <p style={{
                    fontSize: 13,
                    color: 'var(--muted)',
                  }}>
                    {property.location.locality}, {property.location.city}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: 16,
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid var(--border)',
                    fontSize: 12,
                    color: 'var(--muted)'
                  }}>
                    <span>🛏️ {property.specs.beds} Beds</span>
                    <span>🚿 {property.specs.baths} Baths</span>
                    <span>📐 {property.specs.sqft} sqft</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => router.push('/listings')}
            >
              View All Properties
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
