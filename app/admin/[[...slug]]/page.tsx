'use client';

/**
 * AdminDashboardPage — role: admin
 * Features: A1 Overview · A2 Listings · A3 Add/Edit Listing · A4 Leads · A5 Agents · A6 Settings
 * All data is mock — API call points are marked with // API POINT
 * CSS lives exclusively in src/styles/admin.css (no inline styles)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import '@/styles/admin.css';

/* ============================================================
   TYPES
============================================================ */

type LeadScore = 'hot' | 'warm' | 'cold' | 'converted';
type LeadStage = 'new' | 'contacted' | 'visit-scheduled' | 'negotiating' | 'closed' | 'lost';
type AgentStatus = 'active' | 'inactive' | 'pending';
type AgentPlan = 'starter' | 'growth' | 'agency';
type ListingStatus = 'active' | 'inactive' | 'sold' | 'pending';

interface AdminAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  agency: string;
  rera: string;
  plan: AgentPlan;
  status: AgentStatus;
  listings: number;
  leads: number;
  deals: number;
  lastActive: string;
  joined: string;
}

interface AdminListing {
  id: string;
  title: string;
  locality: string;
  price: string;
  priceRaw: number;
  type: 'Sale' | 'Rent';
  propertyType: 'Apartment' | 'Villa' | 'Plot' | 'Commercial';
  status: ListingStatus;
  premium: boolean;
  agentId: string;
  agent: string;
  views: number;
  leads: number;
  posted: string;
  image: string;
  bedrooms?: number;
  area?: number;
}

interface LeadNote {
  text: string;
  author: string;
  time: string;
}

interface AdminLead {
  id: string;
  buyerName: string;
  phone: string;
  email: string;
  budget: string;
  listing: string;
  listingId: string;
  agentId: string;
  agent: string;
  score: LeadScore;
  timeline: string;
  purpose: 'Personal' | 'Investment';
  source: string;
  stage: LeadStage;
  visitDate?: string;
  visitType?: 'Site' | 'Video';
  notes: LeadNote[];
  time: string;
}

interface ActivityItem {
  id: string;
  type: 'listing' | 'lead' | 'agent' | 'deal';
  text: string;
  time: string;
}

/* ============================================================
   MOCK DATA — replace with API calls in Lambda sprint
============================================================ */

const MOCK_AGENTS: AdminAgent[] = [
  { id: 'A001', name: 'Priya Sharma',   email: 'priya@sharmaRealty.com',  phone: '+91 98765 43210', agency: 'Sharma Realty', rera: 'ODRERA12345', plan: 'growth',  status: 'active',   listings: 12, leads: 48, deals: 5, lastActive: '2 hrs ago',   joined: '2025-01-10' },
  { id: 'A002', name: 'Arjun Nanda',    email: 'arjun@sharmaRealty.com',   phone: '+91 87654 32109', agency: 'Sharma Realty', rera: 'ODRERA23456', plan: 'growth',  status: 'active',   listings: 8,  leads: 31, deals: 3, lastActive: '5 hrs ago',   joined: '2025-02-15' },
  { id: 'A003', name: 'Kavita Mohanty', email: 'kavita@sharmaRealty.com',  phone: '+91 76543 21098', agency: 'Sharma Realty', rera: '',            plan: 'starter', status: 'inactive', listings: 4,  leads: 12, deals: 1, lastActive: '3 days ago',  joined: '2025-03-01' },
  { id: 'A004', name: 'Deepak Rath',    email: 'deepak@premiumhomes.com',  phone: '+91 65432 10987', agency: 'Premium Homes', rera: 'ODRERA34567', plan: 'agency',  status: 'active',   listings: 18, leads: 67, deals: 9, lastActive: '1 hr ago',    joined: '2024-11-20' },
  { id: 'A005', name: 'Sunita Panda',   email: 'sunita@premiumhomes.com',  phone: '+91 54321 09876', agency: 'Premium Homes', rera: '',            plan: 'starter', status: 'pending',  listings: 0,  leads: 0,  deals: 0, lastActive: 'Never',      joined: '2026-03-20' },
  { id: 'A006', name: 'Ravi Mishra',    email: 'ravi@odishahomes.com',     phone: '+91 43210 98765', agency: 'Odisha Homes',  rera: 'ODRERA45678', plan: 'growth',  status: 'active',   listings: 6,  leads: 19, deals: 2, lastActive: '1 day ago',   joined: '2025-05-12' },
];

const MOCK_LISTINGS: AdminListing[] = [
  { id: 'L001', title: 'Sunrise Heights 2BHK',    locality: 'Patia',             price: '₹62L',   priceRaw: 6200000,  type: 'Sale', propertyType: 'Apartment', status: 'active',   premium: true,  agentId: 'A001', agent: 'Priya Sharma',   views: 142, leads: 4,  posted: '2026-03-10', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', bedrooms: 2, area: 1100 },
  { id: 'L002', title: 'Green Valley 3BHK',       locality: 'Nayapalli',         price: '₹95L',   priceRaw: 9500000,  type: 'Sale', propertyType: 'Apartment', status: 'active',   premium: false, agentId: 'A002', agent: 'Arjun Nanda',    views: 87,  leads: 2,  posted: '2026-03-15', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', bedrooms: 3, area: 1450 },
  { id: 'L003', title: 'Metro Studio Flat',       locality: 'Saheed Nagar',      price: '₹18K/mo',priceRaw: 18000,    type: 'Rent', propertyType: 'Apartment', status: 'inactive', premium: false, agentId: 'A001', agent: 'Priya Sharma',   views: 31,  leads: 0,  posted: '2026-03-01', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400', bedrooms: 1, area: 480 },
  { id: 'L004', title: 'Royal Villas 4BHK',       locality: 'Chandrasekharpur',  price: '₹1.8Cr', priceRaw: 18000000, type: 'Sale', propertyType: 'Villa',     status: 'active',   premium: true,  agentId: 'A001', agent: 'Priya Sharma',   views: 210, leads: 9,  posted: '2026-02-20', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', bedrooms: 4, area: 3200 },
  { id: 'L005', title: 'Infocity Tech Enclave',   locality: 'Infocity',          price: '₹55L',   priceRaw: 5500000,  type: 'Sale', propertyType: 'Apartment', status: 'active',   premium: false, agentId: 'A002', agent: 'Arjun Nanda',    views: 63,  leads: 1,  posted: '2026-03-18', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400', bedrooms: 2, area: 980 },
  { id: 'L006', title: 'Khandagiri Heritage Plot',locality: 'Khandagiri',        price: '₹24L',   priceRaw: 2400000,  type: 'Sale', propertyType: 'Plot',      status: 'active',   premium: false, agentId: 'A003', agent: 'Kavita Mohanty', views: 44,  leads: 2,  posted: '2026-03-05', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400' },
  { id: 'L007', title: 'Baramunda 2BHK',          locality: 'Baramunda',         price: '₹38L',   priceRaw: 3800000,  type: 'Sale', propertyType: 'Apartment', status: 'pending',  premium: false, agentId: 'A004', agent: 'Deepak Rath',    views: 18,  leads: 0,  posted: '2026-03-22', image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400', bedrooms: 2, area: 850 },
  { id: 'L008', title: 'Unit-6 Premium Office',   locality: 'Unit 6',            price: '₹2.2Cr', priceRaw: 22000000, type: 'Sale', propertyType: 'Commercial',status: 'active',   premium: true,  agentId: 'A004', agent: 'Deepak Rath',    views: 98,  leads: 5,  posted: '2026-02-28', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' },
];

const MOCK_LEADS: AdminLead[] = [
  { id: 'LD001', buyerName: 'Rohit Panda',   phone: '+91 98765 11111', email: 'rohit@gmail.com',  budget: '₹60–70L',    listing: 'Sunrise Heights 2BHK', listingId: 'L001', agentId: 'A001', agent: 'Priya Sharma',   score: 'hot',       timeline: '1–3 months',  purpose: 'Personal',    source: 'Website',      stage: 'visit-scheduled', notes: [{ text: 'Very interested, asked about parking.', author: 'Priya', time: 'Yesterday' }], time: '2 hrs ago' },
  { id: 'LD002', buyerName: 'Sneha Das',     phone: '+91 87654 22222', email: 'sneha@yahoo.com',  budget: '₹90L–1Cr',   listing: 'Green Valley 3BHK',    listingId: 'L002', agentId: 'A002', agent: 'Arjun Nanda',    score: 'warm',      timeline: '3–6 months',  purpose: 'Investment',  source: 'Referral',     stage: 'contacted',       notes: [], time: '1 day ago' },
  { id: 'LD003', buyerName: 'Amit Mohanty',  phone: '+91 76543 33333', email: 'amit@hotmail.com', budget: '₹15–20K/mo', listing: 'Metro Studio Flat',    listingId: 'L003', agentId: 'A001', agent: 'Priya Sharma',   score: 'cold',      timeline: 'Flexible',    purpose: 'Personal',    source: 'Website',      stage: 'new',             notes: [], time: '3 days ago' },
  { id: 'LD004', buyerName: 'Priti Sahoo',   phone: '+91 65432 44444', email: 'priti@gmail.com',  budget: '₹1.5–2Cr',   listing: 'Royal Villas 4BHK',    listingId: 'L004', agentId: 'A001', agent: 'Priya Sharma',   score: 'hot',       timeline: 'Immediate',   purpose: 'Personal',    source: '99acres',      stage: 'negotiating',     notes: [{ text: 'Offered ₹1.75Cr, owner counter at ₹1.85Cr', author: 'Priya', time: '2 days ago' }], time: '5 hrs ago' },
  { id: 'LD005', buyerName: 'Santosh Kumar', phone: '+91 54321 55555', email: 'sk@corp.com',      budget: '₹50–60L',    listing: 'Infocity Tech Enclave', listingId: 'L005', agentId: 'A002', agent: 'Arjun Nanda',    score: 'warm',      timeline: '1–3 months',  purpose: 'Investment',  source: 'Indiaproperty',stage: 'contacted',       notes: [], time: '2 days ago' },
  { id: 'LD006', buyerName: 'Lata Behera',   phone: '+91 43210 66666', email: 'lata@gmail.com',   budget: '₹20–25L',    listing: 'Khandagiri Heritage Plot',listingId:'L006', agentId: 'A003', agent: 'Kavita Mohanty', score: 'cold',      timeline: '6+ months',   purpose: 'Investment',  source: 'WhatsApp',     stage: 'new',             notes: [], time: '4 days ago' },
  { id: 'LD007', buyerName: 'Vinod Jena',    phone: '+91 32109 77777', email: 'vj@firm.com',      budget: '₹2–2.5Cr',   listing: 'Unit-6 Premium Office', listingId: 'L008', agentId: 'A004', agent: 'Deepak Rath',    score: 'hot',       timeline: 'Immediate',   purpose: 'Investment',  source: 'Referral',     stage: 'negotiating',     visitDate: '2026-03-28', visitType: 'Site', notes: [{ text: 'Looking for corporate registry. Positive discussions.', author: 'Deepak', time: '1 day ago' }], time: '6 hrs ago' },
  { id: 'LD008', buyerName: 'Meena Roy',     phone: '+91 21098 88888', email: 'meena@gmail.com',  budget: '₹35–42L',    listing: 'Baramunda 2BHK',        listingId: 'L007', agentId: 'A004', agent: 'Deepak Rath',    score: 'converted', timeline: 'Done',        purpose: 'Personal',    source: 'Website',      stage: 'closed',          notes: [{ text: 'Deal closed at ₹38L. Token received.', author: 'Deepak', time: '3 days ago' }], time: '1 week ago' },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'AC1', type: 'lead',    text: '<strong>Rohit Panda</strong> submitted an enquiry for Sunrise Heights 2BHK', time: '2 hrs ago' },
  { id: 'AC2', type: 'listing', text: '<strong>Priya Sharma</strong> added a new listing: Royal Villas 4BHK', time: '5 hrs ago' },
  { id: 'AC3', type: 'deal',    text: '<strong>Deepak Rath</strong> closed a deal on Baramunda 2BHK — ₹38L', time: '1 day ago' },
  { id: 'AC4', type: 'agent',   text: '<strong>Sunita Panda</strong> accepted the agent invitation', time: '1 day ago' },
  { id: 'AC5', type: 'lead',    text: '<strong>Priti Sahoo</strong> submitted an enquiry for Royal Villas 4BHK', time: '2 days ago' },
  { id: 'AC6', type: 'listing', text: '<strong>Arjun Nanda</strong> updated Green Valley 3BHK listing', time: '2 days ago' },
  { id: 'AC7', type: 'lead',    text: '<strong>Vinod Jena</strong> scheduled a site visit for Unit-6 Premium Office', time: '3 days ago' },
  { id: 'AC8', type: 'deal',    text: '<strong>Priya Sharma</strong> received token for Royal Villas 4BHK', time: '4 days ago' },
];

const LOCALITIES = ['Patia','Nayapalli','Saheed Nagar','Chandrasekharpur','Khandagiri','Infocity','Unit 1','Unit 2','Unit 3','Unit 4','Unit 6','Unit 9','Baramunda','Tamando','Mancheswar','Rasulgarh','Bomikhal'];
const AMENITIES_LIST = ['Swimming Pool','Gymnasium','Club House','24/7 Security','Power Backup','Lift/Elevator','Car Parking','Garden','Play Area','Intercom','CCTV','Fire Safety','Jogging Track','Yoga Deck','Co-working Space'];
const HIGHLIGHTED_TAGS = ['Lake View','Corner Unit','Vastu Compliant','Park Facing','Near Metro','Gated Community','Smart Home','EV Charging'];

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

function scoreCls(s: LeadScore) {
  return `lead-score lead-score--${s}`;
}

function statusCls(s: string): string {
  return `status-badge status-badge--${s}`;
}

function formatPrice(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(0)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function getView(pathname: string): string {
  if (/\/admin\/listings\/[^/]+\/edit/.test(pathname)) return 'listing-edit';
  if (pathname.includes('/admin/listings/new'))  return 'listing-new';
  if (pathname.includes('/admin/listings'))      return 'listings';
  if (pathname.includes('/admin/leads'))         return 'leads';
  if (pathname.includes('/admin/agents'))        return 'agents';
  if (pathname.includes('/admin/settings'))      return 'settings';
  return 'overview';
}

/* ============================================================
   A1 — OVERVIEW TAB
============================================================ */

function OverviewTab({ navigate }: { navigate: (p: string) => void }) {
  const hotLeads  = MOCK_LEADS.filter(l => l.score === 'hot').length;
  const totalViews = MOCK_LISTINGS.reduce((s, l) => s + l.views, 0);
  const topAgent  = [...MOCK_AGENTS].sort((a, b) => b.leads - a.leads)[0];

  const stats = [
    { icon: '🏠', label: 'Total Listings',    value: MOCK_LISTINGS.length, change: '+12%', trend: 'up'   as const },
    { icon: '💬', label: 'Active Leads',      value: MOCK_LEADS.length,   change: '+8%',  trend: 'up'   as const },
    { icon: '👥', label: 'Registered Agents', value: MOCK_AGENTS.length,  change: '+2',   trend: 'up'   as const },
    { icon: '💰', label: 'Revenue This Month',value: '₹59,994',           change: '+24%', trend: 'up'   as const },
  ];

  return (
    <div>
      <div className="quick-actions">
        <button className="btn btn-gold btn-sm" onClick={() => navigate('/admin/listings/new')}>+ Add Listing</button>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/agents')}>+ Invite Agent</button>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/leads')}>View All Leads</button>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/settings')}>Platform Settings</button>
      </div>

      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-val">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-trend stat-trend--${s.trend}`}>{s.trend === 'up' ? '▲' : '▼'} {s.change}</div>
          </div>
        ))}
      </div>

      <div className="overview-grid">
        {/* Top agents */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Top Agents This Month</span>
          </div>
          {[...MOCK_AGENTS].sort((a, b) => b.leads - a.leads).slice(0, 5).map((a, i) => (
            <div key={a.id} className="activity-item">
              <div className={`rank-badge ${i === 0 ? 'rank-badge--gold' : 'rank-badge--other'}`}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{a.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.listings} listings · {a.leads} leads · {a.deals} deals</div>
              </div>
              <span className={statusCls(a.status)}>{a.status}</span>
            </div>
          ))}

          {topAgent && (
            <div className="inline-toast inline-toast--info" style={{ marginTop: 16, marginBottom: 0 }}>
              🏆 Top performer: <strong style={{ marginLeft: 4 }}>{topAgent.name}</strong> — {topAgent.leads} leads this month
            </div>
          )}
        </div>

        {/* Recent leads */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Recent Leads</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/leads')}>View All</button>
          </div>
          <div className="activity-feed">
            {MOCK_LEADS.slice(0, 5).map(l => (
              <div key={l.id} className="activity-item">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.score === 'hot' ? '#ef4444' : l.score === 'warm' ? '#f59e0b' : '#9ca3af', flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{l.buyerName}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.listing} · {l.agent}</div>
                </div>
                <span className={scoreCls(l.score)}>
                  {l.score === 'hot' && <span className="hot-pulse" />}
                  {l.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="panel" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-header">
            <span className="panel-title">Recent Activity</span>
          </div>
          <div className="activity-feed">
            {MOCK_ACTIVITY.map(a => (
              <div key={a.id} className="activity-item">
                <div className={`activity-dot activity-dot--${a.type}`} />
                <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                <div className="activity-time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   A2 — ALL LISTINGS TAB
============================================================ */

function AllListingsTab({ navigate }: { navigate: (p: string) => void }) {
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all');
  const [sortBy,    setSortBy]    = useState('newest');
  const [viewMode,  setViewMode]  = useState<'table' | 'grid'>('table');
  const [selected,  setSelected]  = useState<Set<string>>(new Set());
  const [page,      setPage]      = useState(1);
  const PER_PAGE = 10;

  const filtered = MOCK_LISTINGS
    .filter(l => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.title.toLowerCase().includes(q) || l.locality.toLowerCase().includes(q) || l.agent.toLowerCase().includes(q);
      const matchFilter = filter === 'all' || l.status === filter || (filter === 'premium' && l.premium);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'price-high') return b.priceRaw - a.priceRaw;
      if (sortBy === 'price-low')  return a.priceRaw - b.priceRaw;
      if (sortBy === 'leads')      return b.leads - a.leads;
      if (sortBy === 'views')      return b.views - a.views;
      return b.id.localeCompare(a.id); // newest
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(paginated.map(l => l.id)) : new Set());
  };

  return (
    <div>
      <div className="page-toolbar">
        <div className="page-title-row">
          <h2 className="page-title">All Listings ({filtered.length})</h2>
        </div>
        <div className="toolbar-right">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search title, locality, agent…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
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
          <button className="btn btn-gold btn-sm" onClick={() => navigate('/admin/listings/new')}>+ Add Listing</button>
        </div>
      </div>

      <div className="filter-bar">
        {['all','active','inactive','sold','pending','premium'].map(f => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => { setFilter(f); setPage(1); }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className={`bulk-bar ${selected.size > 0 ? 'visible' : ''}`}>
        <span className="bulk-count">{selected.size} selected</span>
        <button className="btn btn-outline btn-sm">Activate</button>
        <button className="btn btn-outline btn-sm">Deactivate</button>
        <button className="btn btn-outline btn-sm">Assign Agent</button>
        <button className="btn btn-sm" style={{ color: '#dc2626', borderColor: '#dc2626', background: 'transparent', border: '1px solid #dc2626' }}>Delete</button>
      </div>

      {paginated.length === 0 ? (
        <div className="panel admin-empty">
          <span className="admin-empty-icon">🏠</span>
          <div className="admin-empty-title">No listings found</div>
          <div className="admin-empty-sub">Try a different search or filter.</div>
          <button className="btn btn-gold" onClick={() => navigate('/admin/listings/new')}>+ Add First Listing</button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" className="row-cb" onChange={e => toggleAll(e.target.checked)} /></th>
                <th>Property</th>
                <th>Agent</th>
                <th>Price</th>
                <th>Status</th>
                <th>Views</th>
                <th>Leads</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(l => (
                <tr key={l.id}>
                  <td><input type="checkbox" className="row-cb" checked={selected.has(l.id)} onChange={() => toggleSelect(l.id)} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img className="listing-thumb-img" src={l.image} alt={l.title} />
                      <div>
                        <div className="td-primary">{l.title}</div>
                        <div className="td-sub">{l.locality} · {l.propertyType} {l.bedrooms ? `· ${l.bedrooms}BHK` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>{l.agent}</td>
                  <td className="td-price">{l.price}</td>
                  <td>
                    <span className={statusCls(l.status)}>{l.status}</span>
                    {l.premium && <span className="status-badge status-badge--premium" style={{ marginLeft: 4 }}>Premium</span>}
                  </td>
                  <td>👁 {l.views}</td>
                  <td>💬 {l.leads}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/admin/listings/${l.id}/edit`)}>✏️</button>
                      <button className="btn btn-outline btn-sm">👁</button>
                      <button className="btn btn-outline btn-sm">📋</button>
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
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/admin/listings/${l.id}/edit`)}>Edit</button>
                  </div>
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
   A3 — LISTING FORM WIZARD
============================================================ */

interface ListingFormData {
  title: string; propertyType: 'Apartment' | 'Villa' | 'Plot' | 'Commercial';
  listingStatus: ListingStatus; price: string; premium: boolean;
  bedrooms: number; bathrooms: number; area: string; floor: string;
  totalFloors: string; facing: string; furnishing: string; age: string;
  parking: number; possession: string;
  address: string; locality: string; pincode: string; rera: string; photos: string[];
  description: string; tags: string[]; amenities: string[]; agentId: string;
}

const DEFAULT_FORM: ListingFormData = {
  title: '', propertyType: 'Apartment', listingStatus: 'active', price: '', premium: false,
  bedrooms: 2, bathrooms: 2, area: '', floor: '', totalFloors: '', facing: '', furnishing: '', age: 'new', parking: 1, possession: '',
  address: '', locality: '', pincode: '', rera: '', photos: [],
  description: '', tags: [], amenities: [], agentId: '',
};

const LS_KEY = 'ev_listing_draft';

function ListingFormWizard({ editId, navigate }: { editId: string | null; navigate: (p: string) => void }) {
  const [step,      setStep]      = useState(1);
  const [form,      setForm]      = useState<ListingFormData>(() => {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_FORM;
  });
  const [errors,    setErrors]    = useState<Partial<Record<keyof ListingFormData, string>>>({});
  const [tagInput,  setTagInput]  = useState('');
  const [photoUrl,  setPhotoUrl]  = useState('');
  const [saved,     setSaved]     = useState(false);
  const [success,   setSuccess]   = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-save to localStorage every 30s
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      localStorage.setItem(LS_KEY, JSON.stringify(form));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 30000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [form]);

  // If edit mode, pre-fill from mock
  useEffect(() => {
    if (!editId) return;
    const listing = MOCK_LISTINGS.find(l => l.id === editId);
    if (!listing) return;
    setForm(f => ({ ...f, title: listing.title, locality: listing.locality, agentId: listing.agentId, premium: listing.premium, listingStatus: listing.status }));
  }, [editId]);

  const set = useCallback(<K extends keyof ListingFormData>(key: K, val: ListingFormData[K]) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }, []);

  const validateStep = (): boolean => {
    const e: Partial<Record<keyof ListingFormData, string>> = {};
    if (step === 1) {
      if (!form.title.trim())  e.title = 'Title is required';
      if (!form.price.trim())  e.price = 'Price is required';
    }
    if (step === 3) {
      if (!form.address.trim())   e.address  = 'Address is required';
      if (!form.locality)         e.locality = 'Select a locality';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, 4));
  };

  const handleSaveDraft = () => {
    localStorage.setItem(LS_KEY, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSubmit = () => {
    // API POINT: POST /listings  or  PUT /listings/:id
    localStorage.removeItem(LS_KEY);
    setSuccess(true);
    setTimeout(() => navigate('/admin/listings'), 1500);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const addPhoto = () => {
    const u = photoUrl.trim();
    if (u && form.photos.length < 10 && !form.photos.includes(u)) set('photos', [...form.photos, u]);
    setPhotoUrl('');
  };

  const toggleAmenity = (a: string) => {
    set('amenities', form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a]);
  };

  const numField = (key: 'bedrooms' | 'bathrooms' | 'parking') => (
    <div className="number-stepper">
      <button type="button" className="stepper-btn" onClick={() => set(key, Math.max(0, form[key] - 1))}>−</button>
      <div className="stepper-val">{form[key]}</div>
      <button type="button" className="stepper-btn" onClick={() => set(key, form[key] + 1)}>+</button>
    </div>
  );

  const priceLabel = () => {
    const n = parseFloat(form.price);
    if (!n) return null;
    return <div className="price-display">{formatPrice(n)}</div>;
  };

  const STEPS = ['Basic Info', 'Details', 'Location & Media', 'Description'];

  return (
    <div className="wizard-wrap">
      <div className="page-title-row" style={{ marginBottom: 24 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/listings')}>← Back</button>
        <h2 className="page-title">{editId ? `Edit Listing` : 'Add New Listing'}</h2>
      </div>

      {success && <div className="inline-toast inline-toast--success">✅ Listing saved successfully! Redirecting…</div>}

      {/* Step progress */}
      <div className="wizard-steps">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const cls = n === step ? 'wizard-step-item active' : n < step ? 'wizard-step-item done' : 'wizard-step-item';
          return (
            <React.Fragment key={label}>
              <div className={cls}>
                <div className="wizard-step-dot">{n < step ? '✓' : n}</div>
                <span className="wizard-step-label">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="wizard-connector" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Step 1: Basic Info ── */}
      {step === 1 && (
        <div className="wizard-panel">
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Basic Information</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-field">
                <label className="form-label">Property Title <span className="form-required">*</span></label>
                <input className={`form-input ${errors.title ? 'form-input--error' : ''}`} placeholder="e.g. Sunrise Heights 2BHK — Patia" maxLength={80} value={form.title} onChange={e => set('title', e.target.value)} />
                <div className="char-counter">{form.title.length}/80</div>
                {errors.title && <div className="form-error">{errors.title}</div>}
              </div>

              <div className="form-field">
                <label className="form-label">Property Type <span className="form-required">*</span></label>
                <div className="prop-type-grid">
                  {(['Apartment','Villa','Plot','Commercial'] as const).map(t => (
                    <div key={t} className={`prop-type-card ${form.propertyType === t ? 'selected' : ''}`} onClick={() => set('propertyType', t)}>
                      <span className="prop-type-icon">{t === 'Apartment' ? '🏢' : t === 'Villa' ? '🏡' : t === 'Plot' ? '🏗' : '🏪'}</span>
                      <span className="prop-type-label">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Listing Status</label>
                  <select className="form-input" value={form.listingStatus} onChange={e => set('listingStatus', e.target.value as ListingStatus)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Price (₹) <span className="form-required">*</span></label>
                  <input className="form-input" type="number" placeholder="e.g. 6200000" value={form.price} onChange={e => set('price', e.target.value)} />
                  {priceLabel()}
                  {errors.price && <div className="form-error">{errors.price}</div>}
                </div>
              </div>

              <div className="form-field">
                <div className="toggle-row" onClick={() => set('premium', !form.premium)}>
                  <div className={`toggle-track ${form.premium ? 'on' : ''}`}><div className="toggle-thumb" /></div>
                  <span className="toggle-label">Premium Listing — shown with gold badge on cards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Property Details ── */}
      {step === 2 && (
        <div className="wizard-panel">
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Property Details</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-grid-3">
                <div className="form-field">
                  <label className="form-label">Bedrooms <span className="form-required">*</span></label>
                  {numField('bedrooms')}
                </div>
                <div className="form-field">
                  <label className="form-label">Bathrooms <span className="form-required">*</span></label>
                  {numField('bathrooms')}
                </div>
                <div className="form-field">
                  <label className="form-label">Parking</label>
                  {numField('parking')}
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-field">
                  <label className="form-label">Carpet Area (sqft) <span className="form-required">*</span></label>
                  <input className="form-input" type="number" placeholder="1200" value={form.area} onChange={e => set('area', e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">Floor Number</label>
                  <input className="form-input" type="number" placeholder="3" value={form.floor} onChange={e => set('floor', e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">Total Floors</label>
                  <input className="form-input" type="number" placeholder="10" value={form.totalFloors} onChange={e => set('totalFloors', e.target.value)} />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-field">
                  <label className="form-label">Facing</label>
                  <select className="form-input" value={form.facing} onChange={e => set('facing', e.target.value)}>
                    <option value="">Select</option>
                    {['East','West','North','South'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Furnishing</label>
                  <select className="form-input" value={form.furnishing} onChange={e => set('furnishing', e.target.value)}>
                    <option value="">Select</option>
                    <option value="Fully">Fully Furnished</option>
                    <option value="Semi">Semi Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Age of Property</label>
                  <select className="form-input" value={form.age} onChange={e => set('age', e.target.value)}>
                    <option value="new">New / Under Construction</option>
                    <option value="0-2">0–2 Years</option>
                    <option value="3-5">3–5 Years</option>
                    <option value="5-10">5–10 Years</option>
                    <option value="10+">10+ Years</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Possession</label>
                  <select className="form-input" value={form.possession} onChange={e => set('possession', e.target.value)}>
                    <option value="">Select</option>
                    {['Immediate','3 months','6 months','1 year','2 years'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Location & Media ── */}
      {step === 3 && (
        <div className="wizard-panel">
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Location & Media</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-field">
                <label className="form-label">Full Address <span className="form-required">*</span></label>
                <textarea className="form-input form-textarea" rows={2} placeholder="Plot no., Street, Area…" value={form.address} onChange={e => set('address', e.target.value)} />
                {errors.address && <div className="form-error">{errors.address}</div>}
              </div>

              <div className="form-grid-3">
                <div className="form-field">
                  <label className="form-label">Locality <span className="form-required">*</span></label>
                  <select className="form-input" value={form.locality} onChange={e => set('locality', e.target.value)}>
                    <option value="">Select locality</option>
                    {LOCALITIES.map(l => <option key={l}>{l}</option>)}
                  </select>
                  {errors.locality && <div className="form-error">{errors.locality}</div>}
                </div>
                <div className="form-field">
                  <label className="form-label">City</label>
                  <input className="form-input" value="Bhubaneswar" readOnly style={{ opacity: .7 }} />
                </div>
                <div className="form-field">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" type="number" placeholder="751024" maxLength={6} value={form.pincode} onChange={e => set('pincode', e.target.value)} />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">RERA Number <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <input className="form-input" placeholder="e.g. ODRERA12345" value={form.rera} onChange={e => set('rera', e.target.value)} />
              </div>

              {/* Photo URLs (mock — real S3 upload later) */}
              <div className="form-field">
                <label className="form-label">Photos (max 10)</label>
                {/* API POINT: Replace URL input with S3 presigned URL upload */}
                <div className="photo-dropzone" onClick={() => document.getElementById('photo-url-input')?.focus()}>
                  <span className="photo-dropzone-icon">📸</span>
                  <div className="photo-dropzone-text">Add photo by URL</div>
                  <div className="photo-dropzone-sub">S3 upload will be connected in sprint 3 — paste image URL for now</div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input id="photo-url-input" className="form-input" placeholder="https://images.unsplash.com/…" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPhoto()} />
                  <button type="button" className="btn btn-outline btn-sm" onClick={addPhoto}>Add</button>
                </div>
                {form.photos.length > 0 && (
                  <div className="photo-grid">
                    {form.photos.map((url, i) => (
                      <div key={i} className="photo-item">
                        <img src={url} alt={`photo-${i}`} />
                        <button className="photo-remove" onClick={() => set('photos', form.photos.filter((_, j) => j !== i))}>×</button>
                        {i === 0 && <span className="photo-cover-badge">Cover</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Description & Amenities ── */}
      {step === 4 && (
        <div className="wizard-panel">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Description & Amenities</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label">Property Description</label>
                  <button
                    type="button"
                    className="ai-gen-btn"
                    onClick={() => {
                      // API POINT: callClaude(LISTING_WRITER_SYSTEM, { propertyType: form.propertyType, bedrooms: form.bedrooms, area: form.area, locality: form.locality, amenities: form.amenities })
                      set('description', `Discover this stunning ${form.bedrooms}BHK ${form.propertyType.toLowerCase()} in the heart of ${form.locality || 'Bhubaneswar'}. Spread across ${form.area || 'spacious'} sqft, this property offers modern living with premium finishes, abundant natural light, and excellent connectivity to IT corridors and top schools. Ideal for families seeking comfort and security in a gated community with world-class amenities. Book your site visit today!`);
                    }}
                  >
                    ✨ Generate with AI
                  </button>
                </div>
                <textarea className="form-input form-textarea" rows={5} maxLength={500} placeholder="Describe the property in detail…" value={form.description} onChange={e => set('description', e.target.value)} />
                <div className={`char-counter ${form.description.length > 450 ? 'warn' : ''} ${form.description.length >= 500 ? 'over' : ''}`}>{form.description.length}/500</div>
              </div>

              <div className="form-field">
                <label className="form-label">Highlights / Tags</label>
                <div style={{ marginBottom: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {HIGHLIGHTED_TAGS.map(t => (
                    <button key={t} type="button" className={`filter-pill ${form.tags.includes(t) ? 'active' : ''}`} onClick={() => set('tags', form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t])}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="chip-input-wrap">
                  {form.tags.map(t => (
                    <span key={t} className="chip-tag">{t}<button className="chip-tag-remove" onClick={() => set('tags', form.tags.filter(x => x !== t))}>×</button></span>
                  ))}
                  <input className="chip-bare-input" placeholder="Type tag + Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Amenities</label>
                <div className="amenity-grid">
                  {AMENITIES_LIST.map(a => (
                    <label key={a} className={`amenity-label ${form.amenities.includes(a) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                      {a}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Assign Agent</label>
                <select className="form-input" value={form.agentId} onChange={e => set('agentId', e.target.value)}>
                  <option value="">Select agent</option>
                  {MOCK_AGENTS.filter(a => a.status === 'active').map(a => <option key={a.id} value={a.id}>{a.name} — {a.agency}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wizard footer */}
      <div className="wizard-footer">
        <button type="button" className="btn btn-outline btn-sm" onClick={handleSaveDraft}>Save Draft</button>
        {saved && <span className="draft-saved">✓ Draft saved</span>}
        <div className="wizard-footer-right">
          {step > 1 && <button type="button" className="btn btn-outline" onClick={() => setStep(s => s - 1)}>← Back</button>}
          {step < 4
            ? <button type="button" className="btn btn-gold" onClick={handleNext}>Next →</button>
            : <button type="button" className="btn btn-gold" onClick={handleSubmit}>✅ Save Listing</button>
          }
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   A4 — ALL LEADS TAB
============================================================ */

function LeadDrawer({ lead, open, onClose, onStageChange }: {
  lead: AdminLead | null;
  open: boolean;
  onClose: () => void;
  onStageChange: (id: string, stage: LeadStage) => void;
}) {
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<LeadNote[]>(lead?.notes ?? []);

  useEffect(() => { setNotes(lead?.notes ?? []); }, [lead]);

  if (!lead) return null;

  const addNote = () => {
    if (!noteText.trim()) return;
    // API POINT: POST /leads/:id/notes
    const n: LeadNote = { text: noteText.trim(), author: 'Admin', time: 'Just now' };
    setNotes(ns => [...ns, n]);
    setNoteText('');
  };

  const stageIdx = PIPELINE_STAGES.findIndex(s => s.key === lead.stage);

  return (
    <>
      <div className={`drawer-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`lead-drawer ${open ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className={scoreCls(lead.score)}>
            {lead.score === 'hot' && <span className="hot-pulse" />}
            {lead.score}
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{lead.buyerName}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{lead.source}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-body">
          {/* Buyer info */}
          <div className="drawer-section">
            <div className="drawer-section-title">Buyer Information</div>
            <div className="drawer-info-row"><span className="drawer-info-label">Name</span><span className="drawer-info-val">{lead.buyerName}</span></div>
            <div className="drawer-info-row"><span className="drawer-info-label">Phone</span><span className="drawer-info-val"><a href={`tel:${lead.phone}`} style={{ color: 'var(--gold)' }}>{lead.phone}</a></span></div>
            <div className="drawer-info-row"><span className="drawer-info-label">Email</span><span className="drawer-info-val">{lead.email}</span></div>
            <div className="drawer-info-row"><span className="drawer-info-label">Source</span><span className="source-badge">{lead.source}</span></div>
          </div>

          {/* Property interest */}
          <div className="drawer-section">
            <div className="drawer-section-title">Property Interest</div>
            <div className="mini-prop-card">
              <div className="mini-prop-img" style={{ background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏠</div>
              <div>
                <div className="mini-prop-title">{lead.listing}</div>
                <div className="mini-prop-price">{lead.budget}</div>
              </div>
            </div>
            <div className="drawer-info-row" style={{ marginTop: 10 }}><span className="drawer-info-label">Timeline</span><span className="drawer-info-val">{lead.timeline}</span></div>
            <div className="drawer-info-row"><span className="drawer-info-label">Purpose</span><span className="drawer-info-val">{lead.purpose}</span></div>
            <div className="drawer-info-row"><span className="drawer-info-label">Assigned To</span><span className="drawer-info-val">{lead.agent}</span></div>
          </div>

          {/* Pipeline */}
          <div className="drawer-section">
            <div className="drawer-section-title">Lead Stage — click to update</div>
            <div className="lead-pipeline">
              {PIPELINE_STAGES.map((s, i) => {
                const isDone   = i < stageIdx;
                const isActive = i === stageIdx;
                const cls = isDone ? 'pipeline-stage done' : isActive ? 'pipeline-stage active' : 'pipeline-stage';
                return (
                  <div key={s.key} className="pipeline-stage-wrap">
                    <div className={cls} onClick={() => onStageChange(lead.id, s.key)}>
                      <div className="pipeline-stage-dot">{isDone ? '✓' : i + 1}</div>
                      <div className="pipeline-stage-name">{s.label}</div>
                    </div>
                    {i < PIPELINE_STAGES.length - 1 && <div className={`pipeline-connector-line ${isDone ? 'done' : ''}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visit details */}
          {lead.visitDate && (
            <div className="drawer-section">
              <div className="drawer-section-title">Visit Details</div>
              <div className="drawer-info-row"><span className="drawer-info-label">Date</span><span className="drawer-info-val">{lead.visitDate}</span></div>
              <div className="drawer-info-row"><span className="drawer-info-label">Type</span><span className="drawer-info-val">{lead.visitType} Visit</span></div>
            </div>
          )}

          {/* Notes */}
          <div className="drawer-section">
            <div className="drawer-section-title">Notes ({notes.length})</div>
            {notes.length > 0 && (
              <div className="note-list">
                {notes.map((n, i) => (
                  <div key={i} className="note-item">
                    <div className="note-item-text">{n.text}</div>
                    <div className="note-item-meta">{n.author} · {n.time}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="note-add-form">
              <textarea className="form-input form-textarea" rows={2} placeholder="Add a note…" value={noteText} onChange={e => setNoteText(e.target.value)} />
              <button className="btn btn-gold btn-sm" onClick={addNote}>Save Note</button>
            </div>
          </div>

          {/* Activity log */}
          <div className="drawer-section">
            <div className="drawer-section-title">Activity Log</div>
            <div className="activity-log">
              <div className="activity-log-item"><span className="activity-log-icon">📩</span><span>Lead received</span><span className="activity-log-time">{lead.time}</span></div>
              {lead.visitDate && <div className="activity-log-item"><span className="activity-log-icon">📅</span><span>Visit scheduled</span><span className="activity-log-time">Yesterday</span></div>}
              {notes.length > 0 && <div className="activity-log-item"><span className="activity-log-icon">📝</span><span>Note added by {notes[0].author}</span><span className="activity-log-time">{notes[0].time}</span></div>}
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          {/* API POINT: PATCH /leads/:id  { status: 'closed' | 'lost' } */}
          <button className="btn btn-gold btn-sm" onClick={onClose}>Mark Closed ✓</button>
          <button className="btn btn-outline btn-sm" style={{ color: '#dc2626', borderColor: '#dc2626' }} onClick={onClose}>Mark Lost ✗</button>
        </div>
      </div>
    </>
  );
}

function AllLeadsTab() {
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [leads,    setLeads]    = useState<AdminLead[]>(MOCK_LEADS);
  const [active,   setActive]   = useState<AdminLead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.buyerName.toLowerCase().includes(q) || l.listing.toLowerCase().includes(q) || l.phone.includes(q);
    const matchFilter = filter === 'all' || l.score === filter || (filter === 'new-today' && l.time.includes('hr'));
    return matchSearch && matchFilter;
  });

  const openDrawer = (lead: AdminLead) => { setActive(lead); setDrawerOpen(true); };

  const handleStageChange = (id: string, stage: LeadStage) => {
    // API POINT: PATCH /leads/:id  { stage }
    setLeads(ls => ls.map(l => l.id === id ? { ...l, stage } : l));
    setActive(a => a && a.id === id ? { ...a, stage } : a);
  };

  const exportCSV = () => {
    // API POINT: GET /leads?format=csv  — mock: show toast
    alert('Exported! (mock — CSV download will be implemented with real API)');
  };

  return (
    <div>
      <LeadDrawer lead={active} open={drawerOpen} onClose={() => setDrawerOpen(false)} onStageChange={handleStageChange} />

      <div className="page-toolbar">
        <div className="page-title-row">
          <h2 className="page-title">All Leads ({filtered.length})</h2>
        </div>
        <div className="toolbar-right">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search buyer, property, phone…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-outline btn-sm" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="filter-bar">
        {[
          { key: 'all',      label: 'All' },
          { key: 'hot',      label: '🔴 Hot' },
          { key: 'warm',     label: '🟡 Warm' },
          { key: 'cold',     label: '🟢 Cold' },
          { key: 'converted',label: '✅ Converted' },
          { key: 'new-today',label: 'New Today' },
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
          <div className="admin-empty-sub">Try a different filter.</div>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Phone</th>
                <th>Property</th>
                <th>Score</th>
                <th>Budget</th>
                <th>Source</th>
                <th>Agent</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} onClick={() => openDrawer(l)}>
                  <td className="td-primary">{l.buyerName}</td>
                  <td>{l.phone}</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.listing}</td>
                  <td>
                    <span className={scoreCls(l.score)}>
                      {l.score === 'hot' && <span className="hot-pulse" />}
                      {l.score}
                    </span>
                  </td>
                  <td>{l.budget}</td>
                  <td><span className="source-badge">{l.source}</span></td>
                  <td>{l.agent}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{l.time}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="td-actions">
                      <a href={`tel:${l.phone}`} className="btn btn-outline btn-sm">📞</a>
                      <button className="btn btn-outline btn-sm" onClick={() => openDrawer(l)}>📋</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   A5 — MANAGE AGENTS TAB
============================================================ */

function InviteAgentModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', agency: '', phone: '', rera: '', plan: 'growth' as AgentPlan });
  const [sent, setSent] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }));

  const handleSend = () => {
    // API POINT: Auth.adminCreateUser() via Cognito + SES invitation email
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal">
        <div className="modal-title">Invite New Agent</div>
        {sent && <div className="inline-toast inline-toast--success">✅ Invitation sent to {form.email}!</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-field"><label className="form-label">Full Name <span className="form-required">*</span></label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="form-field"><label className="form-label">Email <span className="form-required">*</span></label><input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div className="form-field"><label className="form-label">Agency / Company <span className="form-required">*</span></label><input className="form-input" value={form.agency} onChange={e => set('agency', e.target.value)} /></div>
          <div className="form-grid-2">
            <div className="form-field"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div className="form-field"><label className="form-label">RERA ID (optional)</label><input className="form-input" value={form.rera} onChange={e => set('rera', e.target.value)} /></div>
          </div>
          <div className="form-field">
            <label className="form-label">Plan</label>
            <select className="form-input" value={form.plan} onChange={e => set('plan', e.target.value as AgentPlan)}>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="agency">Agency</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSend}>Send Invitation</button>
        </div>
      </div>
    </div>
  );
}

function AgentsTab() {
  const [search,    setSearch]    = useState('');
  const [showInvite,setShowInvite] = useState(false);
  const [editAgent, setEditAgent] = useState<AdminAgent | null>(null);

  const filtered = MOCK_AGENTS.filter(a => {
    const q = search.toLowerCase();
    return !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.agency.toLowerCase().includes(q);
  });

  return (
    <div>
      {showInvite && <InviteAgentModal onClose={() => setShowInvite(false)} />}
      {editAgent   && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setEditAgent(null)}>
          <div className="admin-modal">
            <div className="modal-title">Edit Agent — {editAgent.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-field"><label className="form-label">Full Name</label><input className="form-input" defaultValue={editAgent.name} /></div>
              <div className="form-field"><label className="form-label">Email (read-only)</label><input className="form-input" value={editAgent.email} readOnly style={{ opacity: .7 }} /></div>
              <div className="form-field"><label className="form-label">Phone</label><input className="form-input" defaultValue={editAgent.phone} /></div>
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Status</label>
                  <select className="form-input" defaultValue={editAgent.status}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Plan</label>
                  <select className="form-input" defaultValue={editAgent.plan}>
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="agency">Agency</option>
                  </select>
                </div>
              </div>
              {/* API POINT: Auth.adminResetUserPassword() via Cognito */}
              <button className="btn btn-outline btn-sm">Reset Password (sends email)</button>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditAgent(null)}>Cancel</button>
              <button className="btn btn-gold" onClick={() => setEditAgent(null)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-toolbar">
        <div className="page-title-row">
          <h2 className="page-title">Agents ({filtered.length})</h2>
        </div>
        <div className="toolbar-right">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search agents…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-gold btn-sm" onClick={() => setShowInvite(true)}>+ Invite Agent</button>
        </div>
      </div>

      <div className="agents-grid">
        {filtered.map(a => (
          <div key={a.id} className="agent-card">
            <div className="agent-card-top">
              <div className="agent-initials">{a.name.charAt(0)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="agent-name">{a.name}</div>
                <div className="agent-agency">{a.agency}</div>
                <div className="agent-badges">
                  <span className={statusCls(a.status)}>{a.status}</span>
                  <span className={`plan-badge plan-badge--${a.plan}`}>{a.plan}</span>
                  {a.rera && <span className="source-badge">RERA ✓</span>}
                </div>
              </div>
            </div>
            <div className="agent-stats-row">
              <div className="agent-stat-item"><div className="agent-stat-val">{a.listings}</div><div className="agent-stat-label">Listings</div></div>
              <div className="agent-stat-item"><div className="agent-stat-val">{a.leads}</div><div className="agent-stat-label">Leads</div></div>
              <div className="agent-stat-item"><div className="agent-stat-val" style={{ color: 'var(--gold)' }}>{a.deals}</div><div className="agent-stat-label">Deals</div></div>
            </div>
            <div className="agent-last-active">Last active: {a.lastActive} · Joined {a.joined}</div>
            <div className="agent-card-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setEditAgent(a)}>✏️ Edit</button>
              <button className="btn btn-outline btn-sm" style={{ color: a.status === 'active' ? '#dc2626' : '#16a34a', borderColor: a.status === 'active' ? '#dc2626' : '#16a34a' }}>
                {a.status === 'active' ? '⛔ Suspend' : '✅ Activate'}
              </button>
              <button className="btn btn-outline btn-sm">👁 View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   A6 — SETTINGS TAB
============================================================ */

function SettingsTab() {
  const [tab,          setTab]          = useState('general');
  const [deleteInput,  setDeleteInput]  = useState('');
  const [notifs, setNotifs] = useState({ emailLead: true, emailSummary: false, smsHot: false, whatsapp: false });

  const settingsTabs = [
    { key: 'general',      icon: '⚙',  label: 'General'      },
    { key: 'branding',     icon: '🎨', label: 'Branding'      },
    { key: 'notifications',icon: '🔔', label: 'Notifications' },
    { key: 'billing',      icon: '💳', label: 'Billing'       },
    { key: 'danger',       icon: '⚠️', label: 'Danger Zone'  },
  ];

  return (
    <div>
      <h2 className="page-title" style={{ marginBottom: 20 }}>Platform Settings</h2>
      <div className="settings-layout">
        <div className="settings-sidebar">
          {settingsTabs.map(t => (
            <button key={t.key} className={`settings-nav-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div>
          {tab === 'general' && (
            <div className="panel">
              <div className="settings-section-title">General</div>
              {[
                ['Platform Name',   'EstateVision Bhubaneswar'],
                ['Contact Email',   'admin@estatevision.in'],
                ['Contact Phone',   '+91 98765 43210'],
                ['Default City',    'Bhubaneswar'],
                ['Currency',        '₹ INR (locked)'],
              ].map(([k, v]) => (
                <div key={k} className="settings-row">
                  <div><div className="settings-row-key">{k}</div><div className="settings-row-val">{v}</div></div>
                  <button className="btn btn-outline btn-sm">Edit</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'branding' && (
            <div className="panel">
              <div className="settings-section-title">Branding</div>
              {[
                ['Platform Logo', 'Not uploaded'],
                ['Primary Colour', '#b8860b (Gold)'],
                ['Favicon', 'Not uploaded'],
              ].map(([k, v]) => (
                <div key={k} className="settings-row">
                  <div><div className="settings-row-key">{k}</div><div className="settings-row-val">{v}</div></div>
                  {/* API POINT: S3 upload for logo/favicon */}
                  <button className="btn btn-outline btn-sm">Upload</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'notifications' && (
            <div className="panel">
              <div className="settings-section-title">Notifications</div>
              {[
                { key: 'emailLead'   as const, label: 'Email agent when new lead received',   sub: ''                              },
                { key: 'emailSummary'as const, label: 'Email admin daily summary',             sub: 'Sent at 9AM IST every day'    },
                { key: 'smsHot'      as const, label: 'SMS agent for HOT leads',               sub: 'Costs ₹0.30/SMS via MSG91'    },
                { key: 'whatsapp'    as const, label: 'WhatsApp notification (coming soon)',   sub: ''                              },
              ].map(n => (
                <div key={n.key} className="notif-row">
                  <div>
                    <div className="notif-label" style={{ opacity: n.key === 'whatsapp' ? .4 : 1 }}>{n.label}</div>
                    {n.sub && <div className="notif-label-sub">{n.sub}</div>}
                  </div>
                  <div className={`toggle-row`} onClick={() => n.key !== 'whatsapp' && setNotifs(ns => ({ ...ns, [n.key]: !ns[n.key] }))}>
                    <div className={`toggle-track ${notifs[n.key] ? 'on' : ''}`} style={{ opacity: n.key === 'whatsapp' ? .4 : 1 }}><div className="toggle-thumb" /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'billing' && (
            <div className="panel">
              <div className="settings-section-title">Billing</div>
              <div className="inline-toast inline-toast--info" style={{ marginBottom: 20 }}>
                <span>💳</span><span>Agency Plan — ₹9,999/month · Next billing: 1 April 2026 · Razorpay</span>
              </div>
              <div className="settings-section-title" style={{ fontSize: 13 }}>Invoice History</div>
              <table className="billing-table">
                <thead><tr><th>Date</th><th>Amount</th><th>Status</th><th>Invoice</th></tr></thead>
                <tbody>
                  {[['Mar 1, 2026','₹9,999','Paid'],['Feb 1, 2026','₹9,999','Paid'],['Jan 1, 2026','₹9,999','Paid']].map(([d,a,s]) => (
                    <tr key={d}><td>{d}</td><td style={{ fontWeight: 700 }}>{a}</td><td><span className="status-badge status-badge--active">{s}</span></td><td><button className="btn btn-outline btn-sm">Download</button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'danger' && (
            <div className="panel">
              <div className="settings-section-title">Danger Zone</div>
              <div className="danger-zone">
                <div className="danger-zone-title">⚠️ Irreversible Actions</div>
                <div className="danger-action">
                  <div><div className="danger-action-name">Export All Data</div><div className="danger-action-desc">Download all listings, leads, and agents as CSV</div></div>
                  {/* API POINT: GET /export?format=csv */}
                  <button className="btn btn-outline btn-sm" onClick={() => alert('Export started — mock')}>Export CSV</button>
                </div>
                <div className="danger-action">
                  <div><div className="danger-action-name">Clear All Listings</div><div className="danger-action-desc">Permanently delete all property listings</div></div>
                  <button className="btn btn-sm" style={{ color: '#dc2626', border: '1px solid #dc2626', background: 'transparent' }}
                    onClick={() => { if (window.confirm('This will delete ALL listings. Are you sure?')) alert('Cleared (mock)'); }}>
                    Clear Listings
                  </button>
                </div>
                <div className="danger-action">
                  <div>
                    <div className="danger-action-name">Delete Platform</div>
                    <div className="danger-action-desc">Permanently destroy all data. Type DELETE to confirm.</div>
                    <div className="danger-confirm-input">
                      <input className="form-input" style={{ width: 180 }} placeholder="Type DELETE" value={deleteInput} onChange={e => setDeleteInput(e.target.value)} />
                      <button className="btn btn-sm" disabled={deleteInput !== 'DELETE'}
                        style={{ background: deleteInput === 'DELETE' ? '#dc2626' : undefined, color: deleteInput === 'DELETE' ? 'white' : undefined, border: '1px solid #dc2626' }}
                        onClick={() => alert('Platform deletion queued (mock)')}>
                        Delete Platform
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN — AdminDashboardPage
============================================================ */

const NAV_TABS = [
  { path: '/admin',          icon: '⊞', label: 'Overview'     },
  { path: '/admin/listings', icon: '🏠', label: 'Listings'     },
  { path: '/admin/leads',    icon: '💬', label: 'Leads',   hot: MOCK_LEADS.filter(l => l.score === 'hot').length },
  { path: '/admin/agents',   icon: '👥', label: 'Agents'       },
  { path: '/admin/settings', icon: '⚙',  label: 'Settings'    },
];

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const pathname         = usePathname();
  const router           = useRouter(); const navigate = (p: string) => router.push(p);
  const view             = getView(pathname ?? '/admin');

  const name       = user?.name       ?? 'Admin';
  const agencyName = user?.agencyName ?? 'EstateVision';
  const email      = user?.email      ?? '';

  const isActive = (tabPath: string) =>
    tabPath === '/admin'
      ? view === 'overview'
      : (pathname ?? '').startsWith(tabPath);

  const editMatch = (pathname ?? '').match(/\/admin\/listings\/([^/]+)\/edit/);
  const editId    = editMatch?.[1] ?? null;

  return (
    <div className="admin-page">
      {/* ── Dark header ── */}
      <div className="admin-header">
        <div className="container">
          <div className="admin-hero">
            <div className="admin-avatar">{name.charAt(0).toUpperCase()}</div>
            <div className="admin-info">
              <div className="admin-info-top">
                <h1 className="admin-name">{agencyName}</h1>
                <span className="admin-role-badge admin-role-badge--admin">Admin</span>
              </div>
              <div className="admin-meta">Managed by {name} · {email}</div>
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
        {view === 'overview'      && <OverviewTab    navigate={navigate} />}
        {view === 'listings'      && <AllListingsTab navigate={navigate} />}
        {(view === 'listing-new' || view === 'listing-edit') && <ListingFormWizard editId={editId} navigate={navigate} />}
        {view === 'leads'         && <AllLeadsTab />}
        {view === 'agents'        && <AgentsTab />}
        {view === 'settings'      && <SettingsTab />}
      </div>
    </div>
  );
}
