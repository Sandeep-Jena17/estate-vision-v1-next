'use client';

import React, { useState } from 'react';
import '@/styles/dashboard.css';

const MOCK_USER = {
  name: 'Sandeep Kumar Jena',
  email: 'jenasandeep595@gmail.com',
  phone: '+91 89174 04918',
  avatar: 'https://i.pravatar.cc/100?img=11',
  location: 'Bhubaneswar, Odisha',
  plan: 'premium',
  verified: true,
  stats: { viewed: 48, saved: 12, inquiries: 7, tours: 3 },
};

const SAVED_PROPERTIES = [
  { id: 1, title: 'Prestige Lakeview Residences', priceLabel: '₹85 Lakh', location: 'Patia', beds: 3, sqft: 1600, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', status: 'Ready to Move' },
  { id: 2, title: 'Royal Villas', priceLabel: '₹2.5 Cr', location: 'Nayapalli', beds: 4, sqft: 3500, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400', status: 'Under Construction' },
];

const BOOKINGS = [
  { id: 'BK001', property: 'Prestige Lakeview Residences', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=80', type: 'Site Visit', date: '2025-03-20', time: '11:00 AM', agent: 'Priya Sharma', status: 'confirmed' },
  { id: 'BK002', property: 'Emerald Court Penthouse', image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=80', type: 'Video Call', date: '2025-03-25', time: '03:00 PM', agent: 'Arjun Nanda', status: 'pending' },
];

export default function UserDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(MOCK_USER.name);
  const [email, setEmail] = useState(MOCK_USER.email);
  const [phone, setPhone] = useState(MOCK_USER.phone);
  const [location, setLocation] = useState(MOCK_USER.location);
  const [saved, setSaved] = useState(SAVED_PROPERTIES);
  const user = MOCK_USER;

  const handleSaveProfile = () => {
    setEditMode(false);
    alert('Profile updated successfully!');
  };

  const removeSaved = (id: number) => {
    setSaved((s) => s.filter((p) => p.id !== id));
  };

  const tabs = [
    { id: 'overview', icon: '⊞', label: 'Overview' },
    { id: 'saved', icon: '♥', label: 'Saved', count: saved.length },
    { id: 'bookings', icon: '📅', label: 'Bookings', count: BOOKINGS.filter((b) => b.status !== 'pending').length },
    { id: 'history', icon: '🕐', label: 'History' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ];

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Profile Header Banner */}
      <div style={{ background: 'linear-gradient(135deg,var(--slate) 0%,#1a2035 100%)', padding: '40px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, paddingBottom: 24, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <img src={user.avatar} alt={user.name} className="avatar avatar-lg" style={{ borderColor: 'var(--gold)' }} />
              {user.verified && <div className="verified-badge">✓</div>}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'white' }}>{user.name}</h1>
                {user.plan === 'premium' && <span className="badge badge-premium">✦ Premium</span>}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,.6)' }}>
                <span>✉ {user.email}</span>
                <span>📱 {user.phone}</span>
                <span>📍 {user.location}</span>
              </div>
            </div>

            {/* Edit Button */}
            <button className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,.3)' }} onClick={() => setEditMode(!editMode)}>
              ✏ Edit Profile
            </button>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,.1)' }}>
            {[
              ['👁', user.stats.viewed, 'Properties Viewed'],
              ['♥', user.stats.saved, 'Saved'],
              ['💬', user.stats.inquiries, 'Inquiries Sent'],
              ['🏠', user.stats.tours, 'Tours Booked'],
            ].map(([icon, val, label]) => (
              <div key={label} style={{ flex: 1, padding: '16px 0', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,.07)' }}>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white' }}>
                  {icon} {val}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.1)' }}>
            <div style={{ display: 'flex', gap: 0 }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="tab-button"
                  style={{
                    padding: '14px 20px',
                    fontSize: 13,
                    color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,.5)',
                    borderBottom: activeTab === tab.id ? '2px solid var(--gold)' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  {tab.icon} {tab.label}
                  {tab.count && (
                    <span style={{ background: 'var(--gold)', color: 'var(--slate)', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Upcoming Bookings */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Upcoming Visits</span>
                <button onClick={() => setActiveTab('bookings')} style={{ fontSize: 12, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  View All →
                </button>
              </div>
              {BOOKINGS.filter((b) => b.status !== 'pending').map((b) => (
                <div key={b.id} className="booking-card" style={{ marginBottom: 12 }}>
                  <img src={b.image} alt={b.property} className="booking-card-image" />
                  <div className="booking-card-content">
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--slate)' }}>{b.property}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      {b.type} • {b.date} at {b.time}
                    </div>
                  </div>
                  <div className={`booking-status booking-status-${b.status}`}>{b.status}</div>
                </div>
              ))}
            </div>

            {/* Saved Properties */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Saved Properties</span>
                <button onClick={() => setActiveTab('saved')} style={{ fontSize: 12, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  View All ({saved.length}) →
                </button>
              </div>
              {saved.slice(0, 3).map((p) => (
                <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <img src={p.image} alt={p.title} style={{ width: 52, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--slate)' }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.beds} BHK • {p.sqft} sqft</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--gold)' }}>{p.priceLabel}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div className="slide-up">
            {saved.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">♡</div>
                <div className="empty-title">No Saved Properties</div>
                <div className="empty-message">Properties you save will appear here</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
                {saved.map((p) => (
                  <div key={p.id} className="property-card">
                    <div className="property-card-image">
                      <img src={p.image} alt={p.title} />
                    </div>
                    <div className="property-card-body">
                      <div className="property-card-price">{p.priceLabel}</div>
                      <div className="property-card-title">{p.title}</div>
                      <div className="property-card-meta">
                        <span>{p.beds} BHK</span>
                        <span>·</span>
                        <span>{p.sqft} sqft</span>
                      </div>
                      <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }} onClick={() => removeSaved(p.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="slide-up">
            {BOOKINGS.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <div className="empty-title">No Bookings</div>
                <div className="empty-message">Schedule property visits to see bookings here</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {BOOKINGS.map((b) => (
                  <div key={b.id} className="panel">
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <img src={b.image} alt={b.property} style={{ width: 120, height: 90, borderRadius: 8, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--slate)', marginBottom: 8 }}>{b.property}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                          {b.type} • {b.date} at {b.time}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--slate)' }}>Agent: {b.agent}</div>
                      </div>
                      <div className={`booking-status booking-status-${b.status}`}>{b.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="slide-up">
            <div className="panel" style={{ maxWidth: 600 }}>
              <h2 className="panel-title">Profile Settings</h2>

              {editMode ? (
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 4, display: 'block' }}>Full Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-body)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 4, display: 'block' }}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-body)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 4, display: 'block' }}>Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-body)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 4, display: 'block' }}>Location</label>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-body)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-gold" onClick={handleSaveProfile}>
                      Save Changes
                    </button>
                    <button className="btn btn-outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 20 }}>
                  <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>Full Name</div>
                    <div style={{ fontSize: 14, color: 'var(--slate)', fontWeight: 500 }}>{name}</div>
                  </div>
                  <div style={{ paddingTop: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>Email</div>
                    <div style={{ fontSize: 14, color: 'var(--slate)', fontWeight: 500 }}>{email}</div>
                  </div>
                  <div style={{ paddingTop: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>Phone</div>
                    <div style={{ fontSize: 14, color: 'var(--slate)', fontWeight: 500 }}>{phone}</div>
                  </div>
                  <div style={{ paddingTop: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>Location</div>
                    <div style={{ fontSize: 14, color: 'var(--slate)', fontWeight: 500 }}>{location}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
