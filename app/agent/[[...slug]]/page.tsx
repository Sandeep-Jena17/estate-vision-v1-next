'use client';

/**
 * AgentDashboardPage — role: agent
 * Features: AG1 Overview · AG2 My Listings · AG3 AI Writer · AG4 My Leads · AG5 Profile
 * All data is mock — API call points marked with // API POINT
 * CSS lives exclusively in src/styles/admin.css (no inline styles)
 */

import { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import '@/styles/admin.css';

/* ============================================================
   TYPES
============================================================ */

type LeadScore   = 'hot' | 'warm' | 'cold' | 'converted';
type LeadStage   = 'new' | 'contacted' | 'visit-scheduled' | 'negotiating' | 'closed' | 'lost';
type ListingStatus = 'active' | 'inactive' | 'sold' | 'pending';

interface AgentListing {
  id: string;
  title: string;
  locality: string;
  price: string;
  priceRaw: number;
  type: 'Sale' | 'Rent';
  propertyType: 'Apartment' | 'Villa' | 'Plot' | 'Commercial';
  status: ListingStatus;
  premium: boolean;
  views: number;
  leads: number;
  posted: string;
  image: string;
  bedrooms?: number;
  area?: number;
}

interface AgentLead {
  id: string;
  buyerName: string;
  phone: string;
  email: string;
  budget: string;
  listing: string;
  listingId: string;
  score: LeadScore;
  stage: LeadStage;
  timeline: string;
  source: string;
  visitDate?: string;
  notes: { text: string; author: string; time: string }[];
  time: string;
}

interface ProfileFormData {
  name: string; email: string; phone: string; whatsapp: string;
  agencyName: string; rera: string; officeAddress: string; website: string;
  experience: string; bio: string;
  specialisations: string[]; languages: string[]; areasServed: string[];
  currentPw: string; newPw: string; confirmPw: string;
  notifEmail: boolean; notifSms: boolean;
}

/* ============================================================
   MOCK DATA — replace with API calls in Lambda sprint
   These are filtered to a single agent (agentId: 'A001')
============================================================ */

const MOCK_MY_LISTINGS: AgentListing[] = [
  { id: 'L001', title: 'Sunrise Heights 2BHK',   locality: 'Patia',            price: '₹62L',   priceRaw: 6200000,  type: 'Sale', propertyType: 'Apartment', status: 'active',   premium: true,  views: 142, leads: 4, posted: '2026-03-10', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', bedrooms: 2, area: 1100 },
  { id: 'L002', title: 'Green Valley 3BHK',      locality: 'Nayapalli',        price: '₹95L',   priceRaw: 9500000,  type: 'Sale', propertyType: 'Apartment', status: 'active',   premium: false, views: 87,  leads: 2, posted: '2026-03-15', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', bedrooms: 3, area: 1450 },
  { id: 'L003', title: 'Metro Studio Flat',      locality: 'Saheed Nagar',     price: '₹18K/mo',priceRaw: 18000,    type: 'Rent', propertyType: 'Apartment', status: 'inactive', premium: false, views: 31,  leads: 0, posted: '2026-03-01', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400', bedrooms: 1, area: 480 },
  { id: 'L004', title: 'Royal Villas 4BHK',      locality: 'Chandrasekharpur', price: '₹1.8Cr', priceRaw: 18000000, type: 'Sale', propertyType: 'Villa',     status: 'active',   premium: true,  views: 210, leads: 9, posted: '2026-02-20', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', bedrooms: 4, area: 3200 },
  { id: 'L005', title: 'Khandagiri Corner Plot', locality: 'Khandagiri',       price: '₹28L',   priceRaw: 2800000,  type: 'Sale', propertyType: 'Plot',      status: 'sold',     premium: false, views: 66,  leads: 3, posted: '2026-01-15', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400' },
];

const MOCK_MY_LEADS: AgentLead[] = [
  { id: 'LD001', buyerName: 'Rohit Panda',   phone: '+91 98765 11111', email: 'rohit@gmail.com',  budget: '₹60–70L',  listing: 'Sunrise Heights 2BHK', listingId: 'L001', score: 'hot',       stage: 'visit-scheduled', timeline: '1–3 months',  source: 'Website',      visitDate: '2026-03-28', notes: [{ text: 'Very interested. Asking about parking and society.', author: 'Me', time: 'Yesterday' }], time: '2 hrs ago' },
  { id: 'LD002', buyerName: 'Sneha Das',     phone: '+91 87654 22222', email: 'sneha@yahoo.com',  budget: '₹90L–1Cr', listing: 'Green Valley 3BHK',    listingId: 'L002', score: 'warm',      stage: 'contacted',       timeline: '3–6 months',  source: 'Referral',     notes: [], time: '1 day ago' },
  { id: 'LD003', buyerName: 'Amit Mohanty',  phone: '+91 76543 33333', email: 'amit@hotmail.com', budget: '₹15–20K',  listing: 'Metro Studio Flat',    listingId: 'L003', score: 'cold',      stage: 'new',             timeline: 'Flexible',    source: 'Website',      notes: [], time: '3 days ago' },
  { id: 'LD004', buyerName: 'Priti Sahoo',   phone: '+91 65432 44444', email: 'priti@gmail.com',  budget: '₹1.5–2Cr', listing: 'Royal Villas 4BHK',    listingId: 'L004', score: 'hot',       stage: 'negotiating',     timeline: 'Immediate',   source: '99acres',      notes: [{ text: 'Offered ₹1.75Cr, counter at ₹1.85Cr', author: 'Me', time: '2 days ago' }], time: '5 hrs ago' },
  { id: 'LD005', buyerName: 'Santosh Kumar', phone: '+91 54321 55555', email: 'sk@corp.com',      budget: '₹55–65L',  listing: 'Sunrise Heights 2BHK', listingId: 'L001', score: 'warm',      stage: 'contacted',       timeline: '1–3 months',  source: 'Indiaproperty',notes: [], time: '2 days ago' },
  { id: 'LD006', buyerName: 'Kiran Jena',    phone: '+91 43210 66666', email: 'kiran@gmail.com',  budget: '₹1.6–2Cr', listing: 'Royal Villas 4BHK',    listingId: 'L004', score: 'warm',      stage: 'visit-scheduled', timeline: '1–3 months',  source: 'Referral',     visitDate: '2026-03-30', notes: [], time: '4 hrs ago' },
  { id: 'LD007', buyerName: 'Meena Roy',     phone: '+91 32109 77777', email: 'meena@gmail.com',  budget: '₹25–30L',  listing: 'Khandagiri Corner Plot',listingId: 'L005', score: 'converted', stage: 'closed',          timeline: 'Done',        source: 'Website',      notes: [{ text: 'Deal closed at ₹28L. Registered.', author: 'Me', time: '2 weeks ago' }], time: '2 weeks ago' },
  { id: 'LD008', buyerName: 'Deepa Tripathy',phone: '+91 21098 88888', email: 'deepa@corp.com',   budget: '₹85–1Cr',  listing: 'Green Valley 3BHK',    listingId: 'L002', score: 'cold',      stage: 'new',             timeline: '6+ months',   source: 'Website',      notes: [], time: '5 days ago' },
];

const LOCALITIES = ['Patia','Nayapalli','Saheed Nagar','Chandrasekharpur','Khandagiri','Infocity','Unit 1','Unit 2','Unit 3','Unit 4','Unit 6','Unit 9','Baramunda','Tamando','Mancheswar','Rasulgarh','Bomikhal'];

const PIPELINE_STAGES: { key: LeadStage; label: string }[] = [
  { key: 'new',             label: 'New'       },
  { key: 'contacted',       label: 'Contacted' },
  { key: 'visit-scheduled', label: 'Visit'     },
  { key: 'negotiating',     label: 'Negotiate' },
  { key: 'closed',          label: 'Closed'    },
];

/* ============================================================
   HELPERS
============================================================ */

function scoreCls(s: LeadScore) { return `lead-score lead-score--${s}`; }

function statusCls(s: string): string { return `status-badge status-badge--${s}`; }

function getView(pathname: string): string {
  if (pathname.includes('/agent/listings/ai-writer')) return 'ai-writer';
  if (pathname.includes('/agent/listings/new'))       return 'listing-new';
  if (pathname.includes('/agent/listings'))           return 'listings';
  if (pathname.includes('/agent/leads'))              return 'leads';
  if (pathname.includes('/agent/profile'))            return 'profile';
  return 'overview';
}

/* ============================================================
   AG1 — AGENT OVERVIEW TAB
============================================================ */

function AgentOverviewTab({ listings, leads, navigate }: {
  listings: AgentListing[];
  leads: AgentLead[];
  navigate: (p: string) => void;
}) {
  const activeListings = listings.filter(l => l.status === 'active').length;
  const soldListings   = listings.filter(l => l.status === 'sold').length;
  const hotLeads       = leads.filter(l => l.score === 'hot').length;
  const visitsThisWeek = leads.filter(l => l.visitDate).length;
  const closedDeals    = leads.filter(l => l.stage === 'closed').length;

  const stats = [
    { icon: '🏠', label: 'My Listings',          value: activeListings, sub: `${listings.length} total · ${soldListings} sold` },
    { icon: '💬', label: 'My Leads',             value: leads.length,  sub: `${hotLeads} hot` },
    { icon: '📅', label: 'Visits This Week',     value: visitsThisWeek, sub: 'scheduled' },
    { icon: '🤝', label: 'Deals Closed',         value: closedDeals,   sub: 'all time' },
  ];

  // Pipeline stage counts
  const stageCounts = PIPELINE_STAGES.map(s => ({ ...s, count: leads.filter(l => l.stage === s.key).length }));

  return (
    <div>
      <div className="quick-actions">
        <button className="btn btn-gold btn-sm" onClick={() => navigate('/agent/listings/new')}>+ Post Property</button>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/agent/listings/ai-writer')}>✨ AI Writer</button>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/agent/leads')}>My Leads</button>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/agent/profile')}>My Profile</button>
      </div>

      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-val">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Lead pipeline strip */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <span className="panel-title">My Leads Pipeline</span>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/agent/leads')}>View All</button>
        </div>
        <div className="pipeline-strip">
          {stageCounts.map(s => (
            <div key={s.key} className="pipeline-box" onClick={() => navigate('/agent/leads')}>
              <div className="pipeline-box-count">{s.count}</div>
              <div className="pipeline-box-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="overview-grid">
        {/* Recent enquiries */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Recent Enquiries</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/agent/leads')}>All Leads</button>
          </div>
          <div className="activity-feed">
            {leads.slice(0, 5).map(l => (
              <div key={l.id} className="activity-item">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.score === 'hot' ? '#ef4444' : l.score === 'warm' ? '#f59e0b' : l.score === 'converted' ? '#22c55e' : '#9ca3af', flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{l.buyerName}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.listing} · {l.budget}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className={scoreCls(l.score)}>
                    {l.score === 'hot' && <span className="hot-pulse" />}
                    {l.score}
                  </span>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{l.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My listings quick view */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">My Listings</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/agent/listings')}>Manage</button>
          </div>
          <div className="activity-feed">
            {listings.slice(0, 4).map(l => (
              <div key={l.id} className="activity-item">
                <img src={l.image} alt={l.title} style={{ width: 44, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{l.locality} · 👁 {l.views} · 💬 {l.leads}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 13 }}>{l.price}</div>
                  <span className={statusCls(l.status)} style={{ fontSize: 10 }}>{l.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance tip */}
      <div className="inline-toast inline-toast--info">
        💡 Your Patia listings get <strong>3× more views</strong> than Khandagiri — consider adding more Patia properties.
        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>(mock insight — real analytics in Phase 3)</span>
      </div>
    </div>
  );
}

/* ============================================================
   AG2 — MY LISTINGS TAB (agent-filtered, no agent column)
============================================================ */

function MyListingsTab({ listings, navigate }: { listings: AgentListing[]; navigate: (p: string) => void; }) {
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [sortBy,   setSortBy]   = useState('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [page,     setPage]     = useState(1);
  const PER_PAGE = 10;

  const filtered = listings
    .filter(l => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.title.toLowerCase().includes(q) || l.locality.toLowerCase().includes(q);
      const matchFilter = filter === 'all' || l.status === filter || (filter === 'premium' && l.premium);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'price-high') return b.priceRaw - a.priceRaw;
      if (sortBy === 'price-low')  return a.priceRaw - b.priceRaw;
      if (sortBy === 'leads')      return b.leads - a.leads;
      if (sortBy === 'views')      return b.views - a.views;
      return b.id.localeCompare(a.id);
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div className="page-toolbar">
        <div className="page-title-row">
          <h2 className="page-title">My Listings ({filtered.length})</h2>
        </div>
        <div className="toolbar-right">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search title, locality…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-input" style={{ width: 'auto', padding: '9px 12px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-high">Price High–Low</option>
            <option value="price-low">Price Low–High</option>
            <option value="leads">Most Leads</option>
            <option value="views">Most Views</option>
          </select>
          <div className="view-toggle">
            <button className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>☰</button>
            <button className={`view-toggle-btn ${viewMode === 'grid'  ? 'active' : ''}`} onClick={() => setViewMode('grid')}>⊞</button>
          </div>
          <button className="btn btn-gold btn-sm" onClick={() => navigate('/agent/listings/new')}>+ Post Property</button>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/agent/listings/ai-writer')}>✨ AI Writer</button>
        </div>
      </div>

      <div className="filter-bar">
        {['all','active','inactive','sold','pending','premium'].map(f => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => { setFilter(f); setPage(1); }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {paginated.length === 0 ? (
        <div className="panel admin-empty">
          <span className="admin-empty-icon">🏠</span>
          <div className="admin-empty-title">No listings found</div>
          <div className="admin-empty-sub">Post your first property to get started.</div>
          <button className="btn btn-gold" onClick={() => navigate('/agent/listings/new')}>+ Post Property</button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Price</th>
                <th>Status</th>
                <th>Views</th>
                <th>Leads</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(l => (
                <tr key={l.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img className="listing-thumb-img" src={l.image} alt={l.title} />
                      <div>
                        <div className="td-primary">{l.title}</div>
                        <div className="td-sub">{l.locality} · {l.type}{l.bedrooms ? ` · ${l.bedrooms}BHK` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="td-price">{l.price}</td>
                  <td>
                    <span className={statusCls(l.status)}>{l.status}</span>
                    {l.premium && <span className="status-badge status-badge--premium" style={{ marginLeft: 4 }}>★ Premium</span>}
                  </td>
                  <td>👁 {l.views}</td>
                  <td>💬 {l.leads}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{l.posted}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-outline btn-sm">✏️ Edit</button>
                      <button className="btn btn-outline btn-sm">👁</button>
                      <button className="btn btn-sm" style={{ color: '#dc2626', border: '1px solid #dc2626', background: 'transparent' }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="listing-grid">
          {paginated.map(l => (
            <div key={l.id} className="listing-grid-card">
              <img className="listing-grid-img" src={l.image} alt={l.title} />
              <div className="listing-grid-body">
                <div className="listing-grid-title">{l.title}</div>
                <div className="listing-grid-meta">{l.locality} · {l.type}{l.bedrooms ? ` · ${l.bedrooms}BHK` : ''}</div>
                <div className="listing-grid-price">{l.price}</div>
                <div className="listing-grid-footer">
                  <span className={statusCls(l.status)}>{l.status}</span>
                  <button className="btn btn-outline btn-sm">✏️ Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} className={`pg-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
          ))}
          <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   AG3 — AI LISTING WRITER
============================================================ */

interface AIWriterForm {
  propertyType: string; bedrooms: string; area: string; price: string;
  locality: string; usps: string[]; targetBuyer: string; tone: string;
}

interface AIOutputs {
  description: string; instagram: string; whatsapp: string; facebook: string;
}

const MOCK_AI_OUTPUTS: AIOutputs = {
  description: `Experience elevated living in this exquisite ${''} — where modern architecture meets timeless elegance. Nestled in the heart of Patia, Bhubaneswar's most sought-after IT corridor, this premium residence offers seamless connectivity to the city's finest schools, hospitals, and commercial hubs.\n\nMeticulously designed with premium Italian flooring, modular kitchen, and panoramic balcony views, this home is perfect for discerning IT professionals seeking the ideal work-life balance. The gated community features world-class amenities including a rooftop infinity pool, state-of-the-art gymnasium, and 24×7 concierge services.\n\nDon't miss this rare opportunity to own a piece of Bhubaneswar's finest real estate.`,
  instagram: `✨ Dream Home Alert! 🏠\n\nStunning 3BHK in the heart of Patia, Bhubaneswar 📍\n💰 Starting at ₹85 Lakh\n🏊 Pool | 🏋️ Gym | 🔐 24/7 Security\n🌿 Vastu Compliant | Near Metro\n\nBook your FREE site visit today! 📞 DM us or call now\n\n#BhubaneswarRealEstate #PatiaApartments #3BHK #EstateVision #LuxuryLiving #NewLaunch #InvestInOdisha #BhubaneswarHomes #PropertyForSale #DreamHome`,
  whatsapp: `🏠 *Premium 3BHK in Patia — ₹85L*\n✅ Vastu | Pool | Gym | Near Metro\n📞 Limited units! Book your site visit today.\nCall: +91 98765 43210`,
  facebook: `🏡 Your Dream Home Awaits in Patia, Bhubaneswar!\n\nSpacious 3BHK apartments starting at just ₹85 Lakh — featuring world-class amenities, premium finishes, and unbeatable location near IT parks and schools.\n\n✅ Ready to Move  ✅ Bank Loan Available  ✅ RERA Certified\n\n👉 Click "Learn More" to schedule your FREE site visit today!\n\nLimited units available — don't miss out!`,
};

function AIWriterTab() {
  const [form, setForm] = useState<AIWriterForm>({
    propertyType: 'Apartment', bedrooms: '3', area: '1400', price: '85',
    locality: 'Patia', usps: [], targetBuyer: 'IT Professional', tone: 'Premium & Luxury',
  });
  const [uspInput,  setUspInput]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [outputs,   setOutputs]   = useState<AIOutputs | null>(null);
  const [activeTab, setActiveTab] = useState<keyof AIOutputs>('description');
  const [copied,    setCopied]    = useState<string | null>(null);

  const set = <K extends keyof AIWriterForm>(k: K, v: AIWriterForm[K]) => setForm(f => ({ ...f, [k]: v }));

  const addUsp = () => {
    const u = uspInput.trim();
    if (u && !form.usps.includes(u)) set('usps', [...form.usps, u]);
    setUspInput('');
  };

  const generate = () => {
    setLoading(true);
    setOutputs(null);
    // API POINT: callClaude(LISTING_WRITER_SYSTEM, { propertyType: form.propertyType, bedrooms: form.bedrooms, area: form.area, price: form.price, locality: form.locality, usps: form.usps, targetBuyer: form.targetBuyer, tone: form.tone })
    setTimeout(() => {
      setLoading(false);
      setOutputs(MOCK_AI_OUTPUTS);
      setActiveTab('description');
    }, 1500);
  };

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const outputTabs: { key: keyof AIOutputs; icon: string; label: string }[] = [
    { key: 'description', icon: '📝', label: 'Listing Description' },
    { key: 'instagram',   icon: '📸', label: 'Instagram'           },
    { key: 'whatsapp',    icon: '💬', label: 'WhatsApp'            },
    { key: 'facebook',    icon: '📘', label: 'Facebook Ad'         },
  ];

  return (
    <div>
      <div className="page-title-row" style={{ marginBottom: 20 }}>
        <h2 className="page-title">✨ AI Listing Writer</h2>
      </div>

      <div className="ai-writer-layout">
        {/* ── Left: Input form ── */}
        <div className="panel">
          <div className="ai-section-title">Property Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Property Type</label>
                <select className="form-input" value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
                  {['Apartment','Villa','Plot','Commercial'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">BHK / Bedrooms</label>
                <select className="form-input" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
                  {['1','2','3','4','5+'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Area (sqft)</label>
                <input className="form-input" type="number" value={form.area} onChange={e => set('area', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Price (₹ Lakh)</label>
                <input className="form-input" type="number" value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Locality</label>
              <select className="form-input" value={form.locality} onChange={e => set('locality', e.target.value)}>
                {LOCALITIES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Key USPs (add your highlights)</label>
              <div className="chip-input-wrap">
                {form.usps.map(u => (
                  <span key={u} className="chip-tag">{u}<button className="chip-tag-remove" onClick={() => set('usps', form.usps.filter(x => x !== u))}>×</button></span>
                ))}
                <input className="chip-bare-input" placeholder="e.g. Lake View, Corner Unit…" value={uspInput} onChange={e => setUspInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUsp(); } }} />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Target Buyer</label>
                <select className="form-input" value={form.targetBuyer} onChange={e => set('targetBuyer', e.target.value)}>
                  {['IT Professional','Family','Investor','First-time Buyer'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Tone</label>
                <select className="form-input" value={form.tone} onChange={e => set('tone', e.target.value)}>
                  {['Premium & Luxury','Affordable & Value','Investment-focused'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <button className="btn btn-gold btn-full" onClick={generate} disabled={loading}>
              {loading ? <><span className="ai-spinner" /> Generating…</> : '✨ Generate Content'}
            </button>
          </div>
        </div>

        {/* ── Right: Output ── */}
        <div className="panel">
          <div className="ai-section-title">Generated Content</div>

          {!outputs && !loading && (
            <div className="admin-empty" style={{ padding: '40px 20px' }}>
              <span className="admin-empty-icon">✨</span>
              <div className="admin-empty-title">Fill in the details</div>
              <div className="admin-empty-sub">Click "Generate Content" to create listing copy, Instagram captions, WhatsApp messages, and Facebook ads.</div>
            </div>
          )}

          {loading && (
            <div className="ai-loading">
              <div className="ai-loading-text"><span className="ai-spinner" /> Generating your listing content…</div>
              <div className="shimmer-line" style={{ width: '80%' }} />
              <div className="shimmer-line" style={{ width: '60%' }} />
              <div className="shimmer-line" style={{ width: '90%' }} />
              <div className="shimmer-line" style={{ width: '70%' }} />
            </div>
          )}

          {outputs && (
            <>
              <div className="ai-output-tabs">
                {outputTabs.map(t => (
                  <button key={t.key} className={`ai-tab-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <div className="ai-output-area">{outputs[activeTab]}</div>

              <div className="ai-action-bar">
                <button className={`copy-btn ${copied === activeTab ? 'copied' : ''}`} onClick={() => copyText(activeTab, outputs[activeTab])}>
                  {copied === activeTab ? '✅ Copied!' : '📋 Copy'}
                </button>
                <button className="copy-btn" onClick={generate}>🔄 Regenerate</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   AG3b — POST PROPERTY (new listing form — 3 steps)
============================================================ */

const AMENITY_LIST = [
  'Lift', 'Power Backup', 'Security', 'CCTV', 'Swimming Pool', 'Gym',
  'Club House', 'Children Play Area', 'Visitor Parking', 'Covered Parking',
  'Garden', 'Rainwater Harvesting', 'Intercom', 'Gas Pipeline', 'Fire Safety',
  'Vastu Compliant', 'Corner Property', 'Pet Friendly',
];

const FACING_LIST = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];

interface PostForm {
  /* Step 1 */
  listingType: 'Sale' | 'Rent';
  propertyType: 'Apartment' | 'Villa' | 'Plot' | 'Commercial';
  title: string;
  price: string;
  priceUnit: 'Lakh' | 'Crore' | '/mo';
  bedrooms: string;
  bathrooms: string;
  area: string;
  floor: string;
  totalFloors: string;
  /* Step 2 */
  locality: string;
  address: string;
  facing: string;
  furnishing: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
  availableFrom: string;
  amenities: string[];
  /* Step 3 */
  photoInput: string;
  photos: string[];
  description: string;
  premium: boolean;
}

const BLANK_FORM: PostForm = {
  listingType: 'Sale', propertyType: 'Apartment',
  title: '', price: '', priceUnit: 'Lakh',
  bedrooms: '2', bathrooms: '2', area: '', floor: '', totalFloors: '',
  locality: 'Patia', address: '', facing: 'East',
  furnishing: 'Unfurnished', availableFrom: '',
  amenities: [],
  photoInput: '', photos: [], description: '', premium: false,
};

const STEP_LABELS = ['Property Basics', 'Location & Details', 'Photos & Publish'];

function PostPropertyTab({ navigate }: { navigate: (p: string) => void }) {
  const [step,   setStep]   = useState(0);
  const [form,   setForm]   = useState<PostForm>(BLANK_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof PostForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof PostForm>(k: K, v: PostForm[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const toggleAmenity = (a: string) =>
    set('amenities', form.amenities.includes(a)
      ? form.amenities.filter(x => x !== a)
      : [...form.amenities, a]);

  const addPhoto = () => {
    const url = form.photoInput.trim();
    if (url && !form.photos.includes(url)) set('photos', [...form.photos, url]);
    set('photoInput', '');
  };

  /* ── per-step validation ── */
  const validateStep = (s: number): boolean => {
    const e: Partial<Record<keyof PostForm, string>> = {};
    if (s === 0) {
      if (!form.title.trim())      e.title = 'Property title is required.';
      if (!form.price.trim())      e.price = 'Price is required.';
      if (!form.area.trim())       e.area  = 'Built-up area is required.';
    }
    if (s === 1) {
      if (!form.address.trim())    e.address = 'Address / landmark is required.';
    }
    if (s === 2) {
      if (!form.description.trim()) e.description = 'A short description is required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep(s => s + 1); };
  const back = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = () => {
    if (!validateStep(2)) return;
    // API POINT: POST /agent/listings  { ...form }
    setSubmitted(true);
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 className="page-title" style={{ marginBottom: 8 }}>Property Posted!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 28 }}>
          <strong>{form.title}</strong> has been submitted for review and will go live within 24 hours.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-gold" onClick={() => navigate('/agent/listings')}>View My Listings</button>
          <button className="btn btn-outline" onClick={() => { setForm(BLANK_FORM); setStep(0); setSubmitted(false); }}>Post Another</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-toolbar">
        <div className="page-title-row">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/agent/listings')}>← Back</button>
          <h2 className="page-title">Post a Property</h2>
        </div>
      </div>

      {/* ── Step progress ── */}
      <div className="wizard-steps" style={{ marginBottom: 28 }}>
        {STEP_LABELS.map((label, i) => (
          <div key={i} className={`wizard-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
            <div className="wizard-step-num">{i < step ? '✓' : i + 1}</div>
            <div className="wizard-step-label">{label}</div>
            {i < STEP_LABELS.length - 1 && <div className="wizard-step-line" />}
          </div>
        ))}
      </div>

      <div className="panel">

        {/* ══════ STEP 1 — Property Basics ══════ */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Listing type toggle */}
            <div className="form-field">
              <label className="form-label">Listing Type</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['Sale', 'Rent'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`prop-type-card ${form.listingType === t ? 'active' : ''}`}
                    style={{ flex: 1 }}
                    onClick={() => set('listingType', t)}
                  >
                    <span style={{ fontSize: 20 }}>{t === 'Sale' ? '🏠' : '🔑'}</span>
                    <span>For {t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Property type */}
            <div className="form-field">
              <label className="form-label">Property Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                {(['Apartment', 'Villa', 'Plot', 'Commercial'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`prop-type-card ${form.propertyType === t ? 'active' : ''}`}
                    onClick={() => set('propertyType', t)}
                  >
                    <span style={{ fontSize: 20 }}>
                      {t === 'Apartment' ? '🏢' : t === 'Villa' ? '🏡' : t === 'Plot' ? '🟫' : '🏬'}
                    </span>
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="form-field">
              <label className="form-label">Property Title *</label>
              <input
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                placeholder="e.g. Sunrise Heights 3BHK, Patia"
                value={form.title}
                onChange={e => { set('title', e.target.value); setErrors(p => ({ ...p, title: '' })); }}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            {/* Price */}
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Price *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className={`form-input ${errors.price ? 'input-error' : ''}`}
                    type="number"
                    placeholder={form.listingType === 'Rent' ? '18000' : '85'}
                    value={form.price}
                    onChange={e => { set('price', e.target.value); setErrors(p => ({ ...p, price: '' })); }}
                    style={{ flex: 1 }}
                  />
                  <select
                    className="form-input"
                    style={{ width: 100 }}
                    value={form.priceUnit}
                    onChange={e => set('priceUnit', e.target.value as PostForm['priceUnit'])}
                  >
                    {form.listingType === 'Rent'
                      ? <option value="/mo">/month</option>
                      : <>
                          <option value="Lakh">Lakh ₹</option>
                          <option value="Crore">Crore ₹</option>
                        </>
                    }
                  </select>
                </div>
                {errors.price && <span className="field-error">{errors.price}</span>}
              </div>
              <div className="form-field">
                <label className="form-label">Built-up Area (sqft) *</label>
                <input
                  className={`form-input ${errors.area ? 'input-error' : ''}`}
                  type="number"
                  placeholder="1200"
                  value={form.area}
                  onChange={e => { set('area', e.target.value); setErrors(p => ({ ...p, area: '' })); }}
                />
                {errors.area && <span className="field-error">{errors.area}</span>}
              </div>
            </div>

            {/* BHK / Bathrooms / Floor */}
            {form.propertyType !== 'Plot' && (
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Bedrooms (BHK)</label>
                  <select className="form-input" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
                    {['1','2','3','4','5+'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Bathrooms</label>
                  <select className="form-input" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}>
                    {['1','2','3','4'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            )}

            {form.propertyType === 'Apartment' && (
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Floor No.</label>
                  <input className="form-input" type="number" placeholder="5" value={form.floor} onChange={e => set('floor', e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">Total Floors</label>
                  <input className="form-input" type="number" placeholder="12" value={form.totalFloors} onChange={e => set('totalFloors', e.target.value)} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════ STEP 2 — Location & Details ══════ */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Locality</label>
                <select className="form-input" value={form.locality} onChange={e => set('locality', e.target.value)}>
                  {LOCALITIES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Facing</label>
                <select className="form-input" value={form.facing} onChange={e => set('facing', e.target.value)}>
                  {FACING_LIST.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Address / Landmark *</label>
              <input
                className={`form-input ${errors.address ? 'input-error' : ''}`}
                placeholder="Plot 12, Sector A, near KIIT Square"
                value={form.address}
                onChange={e => { set('address', e.target.value); setErrors(p => ({ ...p, address: '' })); }}
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Furnishing Status</label>
                <select className="form-input" value={form.furnishing} onChange={e => set('furnishing', e.target.value as PostForm['furnishing'])}>
                  {['Unfurnished', 'Semi-Furnished', 'Fully Furnished'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Available From</label>
                <input className="form-input" type="date" value={form.availableFrom} onChange={e => set('availableFrom', e.target.value)} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Amenities</label>
              <div className="amenity-grid">
                {AMENITY_LIST.map(a => (
                  <label key={a} className={`amenity-item ${form.amenities.includes(a) ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      style={{ display: 'none' }}
                      checked={form.amenities.includes(a)}
                      onChange={() => toggleAmenity(a)}
                    />
                    {a}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════ STEP 3 — Photos & Publish ══════ */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Photo URLs */}
            <div className="form-field">
              <label className="form-label">Property Photos (paste image URL)</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  className="form-input"
                  placeholder="https://images.unsplash.com/…"
                  value={form.photoInput}
                  onChange={e => set('photoInput', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPhoto(); } }}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-outline btn-sm" onClick={addPhoto}>+ Add</button>
              </div>
              {form.photos.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {form.photos.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={url} alt="" style={{ width: 90, height: 65, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                      <button
                        type="button"
                        onClick={() => set('photos', form.photos.filter((_, j) => j !== i))}
                        style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, lineHeight: '20px', textAlign: 'center', padding: 0 }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
              {form.photos.length === 0 && (
                <div className="photo-drop-zone" style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>📷 No photos added yet — paste a URL above</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="form-field">
              <label className="form-label">Property Description *</label>
              <textarea
                className={`form-input form-textarea ${errors.description ? 'input-error' : ''}`}
                rows={5}
                placeholder="Describe the property — location highlights, key features, nearby landmarks…"
                value={form.description}
                onChange={e => { set('description', e.target.value); setErrors(p => ({ ...p, description: '' })); }}
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => navigate('/agent/listings/ai-writer')}
              >
                ✨ Use AI Writer to generate description
              </button>
            </div>

            {/* Premium toggle */}
            <div className="form-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div
                  className={`toggle-switch ${form.premium ? 'on' : ''}`}
                  onClick={() => set('premium', !form.premium)}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>★ Premium Listing</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Featured placement — 3× more visibility</div>
                </div>
              </label>
            </div>

            {/* Review summary */}
            <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '16px 20px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 10 }}>Review Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', fontSize: 13 }}>
                <div><span style={{ color: 'var(--muted)' }}>Type:</span> {form.listingType} · {form.propertyType}</div>
                <div><span style={{ color: 'var(--muted)' }}>Price:</span> {form.price ? `₹${form.price} ${form.priceUnit}` : '—'}</div>
                <div><span style={{ color: 'var(--muted)' }}>Title:</span> {form.title || '—'}</div>
                <div><span style={{ color: 'var(--muted)' }}>Area:</span> {form.area ? `${form.area} sqft` : '—'}</div>
                <div><span style={{ color: 'var(--muted)' }}>Locality:</span> {form.locality}</div>
                <div><span style={{ color: 'var(--muted)' }}>Photos:</span> {form.photos.length} added</div>
                {form.propertyType !== 'Plot' && <div><span style={{ color: 'var(--muted)' }}>BHK:</span> {form.bedrooms}</div>}
                <div><span style={{ color: 'var(--muted)' }}>Amenities:</span> {form.amenities.length} selected</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation buttons ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          {step > 0
            ? <button className="btn btn-outline" onClick={back}>← Back</button>
            : <button className="btn btn-outline" onClick={() => navigate('/agent/listings')}>Cancel</button>
          }
          {step < STEP_LABELS.length - 1
            ? <button className="btn btn-gold" onClick={next}>Next →</button>
            : <button className="btn btn-gold" onClick={handleSubmit}>🚀 Post Property</button>
          }
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   AG4 — MY LEADS TAB (agent-filtered)
============================================================ */

function MyLeadsTab({ leads }: { leads: AgentLead[] }) {
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('all');
  const [localLeads, setLocalLeads] = useState<AgentLead[]>(leads);
  const [active,     setActive]     = useState<AgentLead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = localLeads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.buyerName.toLowerCase().includes(q) || l.listing.toLowerCase().includes(q) || l.phone.includes(q);
    const matchFilter = filter === 'all' || l.score === filter || (filter === 'new-today' && l.time.includes('hr'));
    return matchSearch && matchFilter;
  });

  const openDrawer = (lead: AgentLead) => { setActive(lead); setDrawerOpen(true); };

  const handleStageChange = (id: string, stage: LeadStage) => {
    // API POINT: PATCH /leads/:id  { stage }
    setLocalLeads(ls => ls.map(l => l.id === id ? { ...l, stage } : l));
    setActive(a => a && a.id === id ? { ...a, stage } : a);
  };

  const stageIdx = PIPELINE_STAGES.findIndex(s => active && s.key === active.stage);

  return (
    <div>
      {/* Lead drawer */}
      {active && (
        <>
          <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
          <div className={`lead-drawer ${drawerOpen ? 'open' : ''}`}>
            <div className="drawer-header">
              <span className={scoreCls(active.score)}>
                {active.score === 'hot' && <span className="hot-pulse" />}
                {active.score}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{active.buyerName}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{active.source}</div>
              </div>
              <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <div className="drawer-section-title">Buyer Information</div>
                <div className="drawer-info-row"><span className="drawer-info-label">Name</span><span className="drawer-info-val">{active.buyerName}</span></div>
                <div className="drawer-info-row"><span className="drawer-info-label">Phone</span><span className="drawer-info-val"><a href={`tel:${active.phone}`} style={{ color: 'var(--gold)' }}>{active.phone}</a></span></div>
                <div className="drawer-info-row"><span className="drawer-info-label">Email</span><span className="drawer-info-val">{active.email}</span></div>
                <div className="drawer-info-row"><span className="drawer-info-label">Budget</span><span className="drawer-info-val">{active.budget}</span></div>
                <div className="drawer-info-row"><span className="drawer-info-label">Timeline</span><span className="drawer-info-val">{active.timeline}</span></div>
              </div>

              <div className="drawer-section">
                <div className="drawer-section-title">Property Interest</div>
                <div className="mini-prop-card">
                  <div className="mini-prop-img" style={{ background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏠</div>
                  <div>
                    <div className="mini-prop-title">{active.listing}</div>
                    <div className="mini-prop-price">{active.budget}</div>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <div className="drawer-section-title">Stage — click to update</div>
                <div className="lead-pipeline">
                  {PIPELINE_STAGES.map((s, i) => {
                    const isDone   = i < stageIdx;
                    const isActive = i === stageIdx;
                    const cls = isDone ? 'pipeline-stage done' : isActive ? 'pipeline-stage active' : 'pipeline-stage';
                    return (
                      <div key={s.key} className="pipeline-stage-wrap">
                        <div className={cls} onClick={() => handleStageChange(active.id, s.key)}>
                          <div className="pipeline-stage-dot">{isDone ? '✓' : i + 1}</div>
                          <div className="pipeline-stage-name">{s.label}</div>
                        </div>
                        {i < PIPELINE_STAGES.length - 1 && <div className={`pipeline-connector-line ${isDone ? 'done' : ''}`} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {active.visitDate && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Visit Details</div>
                  <div className="drawer-info-row"><span className="drawer-info-label">Date</span><span className="drawer-info-val">{active.visitDate}</span></div>
                </div>
              )}

              <div className="drawer-section">
                <div className="drawer-section-title">Notes</div>
                <div className="note-list">
                  {active.notes.map((n, i) => (
                    <div key={i} className="note-item">
                      <div className="note-item-text">{n.text}</div>
                      <div className="note-item-meta">{n.time}</div>
                    </div>
                  ))}
                </div>
                <div className="note-add-form">
                  <textarea className="form-input form-textarea" rows={2} placeholder="Add a note…" />
                  <button className="btn btn-gold btn-sm">Save Note</button>
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button className="btn btn-outline btn-sm">📅 Schedule Visit</button>
              <button className="btn btn-gold btn-sm" onClick={() => setDrawerOpen(false)}>Mark Closed ✓</button>
            </div>
          </div>
        </>
      )}

      <div className="page-toolbar">
        <div className="page-title-row">
          <h2 className="page-title">My Leads ({filtered.length})</h2>
        </div>
        <div className="toolbar-right">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search buyer, property…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="filter-bar">
        {[
          { key: 'all',       label: 'All'       },
          { key: 'hot',       label: '🔴 Hot'    },
          { key: 'warm',      label: '🟡 Warm'   },
          { key: 'cold',      label: '🟢 Cold'   },
          { key: 'converted', label: '✅ Closed' },
        ].map(f => (
          <button key={f.key} className={`filter-pill ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="panel admin-empty">
          <span className="admin-empty-icon">📭</span>
          <div className="admin-empty-title">No leads found</div>
          <div className="admin-empty-sub">Leads from your listings will appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(l => (
            <div key={l.id} className="panel" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => openDrawer(l)}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: l.score === 'hot' ? '#fef2f2' : l.score === 'warm' ? '#fefce8' : l.score === 'converted' ? '#dcfce7' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {l.score === 'hot' ? '🔥' : l.score === 'warm' ? '⚡' : l.score === 'converted' ? '🏆' : '🧊'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{l.buyerName}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>📱 {l.phone} · Budget: {l.budget} · {l.listing}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span className={scoreCls(l.score)}>
                  {l.score === 'hot' && <span className="hot-pulse" />}
                  {l.score}
                </span>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{l.time}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <a href={`tel:${l.phone}`} className="btn btn-gold btn-sm">📞 Call</a>
                <button className="btn btn-outline btn-sm" onClick={() => openDrawer(l)}>📋 Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   AG5 — MY PROFILE TAB
============================================================ */

function ProfileTab({ userName, userEmail, agencyName }: { userName: string; userEmail: string; agencyName: string }) {
  const [form, setForm] = useState<ProfileFormData>({
    name: userName, email: userEmail, phone: '', whatsapp: '',
    agencyName: agencyName, rera: '', officeAddress: '', website: '',
    experience: '2-5', bio: '',
    specialisations: ['Residential'], languages: ['Odia','English'], areasServed: ['Patia'],
    currentPw: '', newPw: '', confirmPw: '',
    notifEmail: true, notifSms: false,
  });
  const [saved,     setSaved]     = useState(false);
  const [pwSaved,   setPwSaved]   = useState(false);
  const [pwError,   setPwError]   = useState('');

  const set = useCallback(<K extends keyof ProfileFormData>(k: K, v: ProfileFormData[K]) => {
    setForm(f => ({ ...f, [k]: v }));
  }, []);

  const toggleChip = (key: 'specialisations' | 'languages' | 'areasServed', val: string) => {
    set(key, form[key].includes(val) ? form[key].filter((x: string) => x !== val) : [...form[key], val]);
  };

  const pwStrength = (pw: string): { level: 'weak' | 'medium' | 'strong'; bars: number } => {
    if (!pw) return { level: 'weak', bars: 0 };
    if (pw.length < 6) return { level: 'weak', bars: 1 };
    if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { level: 'medium', bars: 2 };
    return { level: 'strong', bars: 3 };
  };

  const { level: strengthLevel, bars: strengthBars } = pwStrength(form.newPw);

  const handleSave = () => {
    // API POINT: PUT /agent/profile  { name, phone, whatsapp, agencyName, rera, officeAddress, website, experience, bio, specialisations, languages, areasServed }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePwUpdate = () => {
    if (!form.currentPw)             { setPwError('Enter your current password'); return; }
    if (form.newPw !== form.confirmPw) { setPwError('New passwords do not match'); return; }
    if (form.newPw.length < 8)       { setPwError('Password must be at least 8 characters'); return; }
    // API POINT: Auth.changePassword() via Cognito
    setPwError('');
    setPwSaved(true);
    set('currentPw', ''); set('newPw', ''); set('confirmPw', '');
    setTimeout(() => setPwSaved(false), 2500);
  };

  const SPECS     = ['Residential','Commercial','Luxury','Plots','Rentals'];
  const LANGUAGES = ['English','Hindi','Odia','Telugu','Bengali'];
  const AREAS     = LOCALITIES.slice(0, 8);

  return (
    <div>
      <h2 className="page-title" style={{ marginBottom: 20 }}>My Profile</h2>
      <div className="profile-layout">
        {/* ── Left: Form ── */}
        <div>
          {saved && <div className="inline-toast inline-toast--success">✅ Profile updated successfully!</div>}

          {/* Profile photo */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="profile-photo-wrap">
              <div className="profile-avatar-circle">{form.name.charAt(0).toUpperCase()}</div>
              <div>
                <button className="profile-upload-btn">📸 Upload Photo</button>
                {/* API POINT: S3 presigned URL upload for profile photo */}
                <div className="profile-upload-sub">JPG or PNG · Max 2MB</div>
              </div>
            </div>

            {/* Personal info */}
            <div className="section-heading">Personal Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Full Name <span className="form-required">*</span></label>
                  <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">Email (contact admin to change)</label>
                  <input className="form-input" value={form.email} readOnly style={{ opacity: .7 }} />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Phone <span className="form-required">*</span></label>
                  <input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">WhatsApp (if different)</label>
                  <input className="form-input" placeholder="+91 98765 43210" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Agency info */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="section-heading">Agency Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Agency / Company <span className="form-required">*</span></label>
                  <input className="form-input" value={form.agencyName} onChange={e => set('agencyName', e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">RERA Registration ID</label>
                  <input className="form-input" placeholder="ODRERA12345" value={form.rera} onChange={e => set('rera', e.target.value)} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Office Address</label>
                <input className="form-input" placeholder="Office address in Bhubaneswar" value={form.officeAddress} onChange={e => set('officeAddress', e.target.value)} />
              </div>
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">City</label>
                  <input className="form-input" value="Bhubaneswar" readOnly style={{ opacity: .7 }} />
                </div>
                <div className="form-field">
                  <label className="form-label">Website</label>
                  <input className="form-input" placeholder="https://yoursite.com" value={form.website} onChange={e => set('website', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Professional details */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="section-heading">Professional Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-field">
                <label className="form-label">Years of Experience</label>
                <select className="form-input" value={form.experience} onChange={e => set('experience', e.target.value)}>
                  {['0-2','2-5','5-10','10+'].map(e => <option key={e}>{e} years</option>)}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Specialisation</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {SPECS.map(s => (
                    <button key={s} type="button" className={`filter-pill ${form.specialisations.includes(s) ? 'active' : ''}`} onClick={() => toggleChip('specialisations', s)}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Languages</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {LANGUAGES.map(l => (
                    <button key={l} type="button" className={`filter-pill ${form.languages.includes(l) ? 'active' : ''}`} onClick={() => toggleChip('languages', l)}>{l}</button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Areas Served</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {AREAS.map(a => (
                    <button key={a} type="button" className={`filter-pill ${form.areasServed.includes(a) ? 'active' : ''}`} onClick={() => toggleChip('areasServed', a)}>{a}</button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Short Bio</label>
                <textarea className="form-input form-textarea" rows={3} maxLength={200} placeholder="A brief professional introduction…" value={form.bio} onChange={e => set('bio', e.target.value)} />
                <div className="char-counter">{form.bio.length}/200</div>
              </div>
            </div>
          </div>

          <button className="btn btn-gold" onClick={handleSave}>Save Changes</button>
        </div>

        {/* ── Right: Stats + Password + Notifs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stats */}
          <div className="panel">
            <div className="section-heading">My Stats</div>
            <div className="profile-stat-row"><span className="profile-stat-key">Active Listings</span><span className="profile-stat-val">{MOCK_MY_LISTINGS.filter(l => l.status === 'active').length}</span></div>
            <div className="profile-stat-row"><span className="profile-stat-key">Sold Listings</span><span className="profile-stat-val">{MOCK_MY_LISTINGS.filter(l => l.status === 'sold').length}</span></div>
            <div className="profile-stat-row"><span className="profile-stat-key">Total Leads</span><span className="profile-stat-val">{MOCK_MY_LEADS.length}</span></div>
            <div className="profile-stat-row"><span className="profile-stat-key">Hot Leads</span><span className="profile-stat-val" style={{ color: '#dc2626' }}>{MOCK_MY_LEADS.filter(l => l.score === 'hot').length}</span></div>
            <div className="profile-stat-row"><span className="profile-stat-key">Deals Closed</span><span className="profile-stat-val" style={{ color: 'var(--gold)' }}>{MOCK_MY_LEADS.filter(l => l.stage === 'closed').length}</span></div>
            <div className="profile-stat-row"><span className="profile-stat-key">Response Rate</span><span className="profile-stat-val">94%</span></div>
            <div className="profile-stat-row"><span className="profile-stat-key">Member Since</span><span className="profile-stat-val">February 2025</span></div>
          </div>

          {/* Change password */}
          <div className="panel">
            <div className="section-heading">Change Password</div>
            {pwSaved  && <div className="inline-toast inline-toast--success">✅ Password updated!</div>}
            {pwError  && <div className="inline-toast inline-toast--error">{pwError}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-field">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" value={form.currentPw} onChange={e => set('currentPw', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" value={form.newPw} onChange={e => set('newPw', e.target.value)} />
                {form.newPw && (
                  <div>
                    <div className="strength-bars">
                      {[1,2,3].map(i => <div key={i} className={`strength-bar ${i <= strengthBars ? strengthLevel : ''}`} />)}
                    </div>
                    <span className={`strength-label ${strengthLevel}`}>{strengthLevel.charAt(0).toUpperCase() + strengthLevel.slice(1)} password</span>
                  </div>
                )}
              </div>
              <div className="form-field">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" value={form.confirmPw} onChange={e => set('confirmPw', e.target.value)} />
              </div>
              <button className="btn btn-outline" onClick={handlePwUpdate}>Update Password</button>
            </div>
          </div>

          {/* Notification preferences */}
          <div className="panel">
            <div className="section-heading">Notification Preferences</div>
            {[
              { key: 'notifEmail' as const, label: 'Email me when I get a new lead' },
              { key: 'notifSms'   as const, label: 'SMS for HOT leads only'         },
            ].map(n => (
              <div key={n.key} className="notif-row">
                <span className="notif-label">{n.label}</span>
                <div className="toggle-row" onClick={() => set(n.key, !form[n.key])}>
                  <div className={`toggle-track ${form[n.key] ? 'on' : ''}`}><div className="toggle-thumb" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN — AgentDashboardPage
============================================================ */

export default function AgentDashboardPage() {
  const { user, logout } = useAuth();
  const pathname         = usePathname();
  const router           = useRouter(); const navigate = (p: string) => router.push(p);
  const view             = getView(pathname ?? '/agent');

  const name       = user?.name       ?? 'Agent';
  const agencyName = user?.agencyName ?? 'Your Agency';
  const email      = user?.email      ?? '';

  const hotCount = MOCK_MY_LEADS.filter(l => l.score === 'hot').length;

  const NAV_TABS = [
    { path: '/agent',                  icon: '⊞',  label: 'Overview'   },
    { path: '/agent/listings',         icon: '🏠',  label: 'My Listings'},
    { path: '/agent/listings/ai-writer',icon: '✨', label: 'AI Writer'  },
    { path: '/agent/leads',            icon: '💬',  label: 'My Leads',  hot: hotCount },
    { path: '/agent/profile',          icon: '👤',  label: 'Profile'    },
  ];

  const isActive = (tabPath: string) =>
    tabPath === '/agent'
      ? view === 'overview'
      : (pathname ?? '').startsWith(tabPath);

  return (
    <div className="admin-page">
      {/* ── Dark header ── */}
      <div className="admin-header">
        <div className="container">
          <div className="admin-hero">
            <div className="admin-avatar">{name.charAt(0).toUpperCase()}</div>
            <div className="admin-info">
              <div className="admin-info-top">
                <h1 className="admin-name">{name}</h1>
                <span className="admin-role-badge admin-role-badge--agent">Agent</span>
              </div>
              <div className="admin-meta">{agencyName} · {email}</div>
            </div>
            <button className="admin-sign-out" onClick={logout}>Sign Out</button>
          </div>

          <nav className="admin-nav">
            {NAV_TABS.map(t => (
              <button key={t.path} className={`admin-nav-btn ${isActive(t.path) ? 'active' : ''}`} onClick={() => navigate(t.path)}>
                {t.icon} {t.label}
                {'hot' in t && (t.hot ?? 0) > 0 && <span className="admin-nav-hot">{t.hot}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="admin-body">
        {view === 'overview'    && <AgentOverviewTab listings={MOCK_MY_LISTINGS} leads={MOCK_MY_LEADS} navigate={navigate} />}
        {view === 'listings'    && <MyListingsTab    listings={MOCK_MY_LISTINGS} navigate={navigate} />}
        {view === 'listing-new' && <PostPropertyTab  navigate={navigate} />}
        {view === 'ai-writer'   && <AIWriterTab />}
        {view === 'leads'       && <MyLeadsTab       leads={MOCK_MY_LEADS} />}
        {view === 'profile'     && <ProfileTab       userName={name} userEmail={email} agencyName={agencyName} />}
      </div>
    </div>
  );
}
