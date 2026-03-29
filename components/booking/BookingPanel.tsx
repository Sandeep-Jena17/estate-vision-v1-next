'use client';
import React, { useState } from 'react';
import { Property, BookingType } from '@/types';
import { Badge, Button } from '../common';
import { formatCurrency } from '@/utils/formatters';

/**
 * BookingPanel Component
 * Sticky panel for booking a property visit
 */

export interface BookingPanelProps {
  property: Property;
  onBook: () => void;
}

const BOOKING_OPTIONS: { id: BookingType; icon: string; title: string; subtitle: string }[] = [
  {
    id: 'site_visit' as BookingType,
    icon: '🏠',
    title: 'Site Visit',
    subtitle: 'In-person tour',
  },
  {
    id: 'video_call' as BookingType,
    icon: '📹',
    title: 'Video Call',
    subtitle: 'Virtual walkthrough',
  },
];

export const BookingPanel: React.FC<BookingPanelProps> = ({ property, onBook }) => {
  const [visitType, setVisitType] = useState<BookingType>('site_visit' as BookingType);

  return (
    <div className="booking-panel">
      {/* Header */}
      <div className="booking-header">
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,.6)',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Starting Price
        </div>
        <div className="booking-price">
          {formatCurrency(property.price)}
          <span>onwards</span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,.5)',
            marginTop: 4,
          }}
        >
          ₹{property.pricePerSqft.toLocaleString()}/sq ft · {property.specs.sqft} sq ft
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <Badge variant="rera">RERA: {property.rera}</Badge>
          {property.status === 'Ready to Move' && (
            <Badge variant="new">Ready to Move</Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="booking-body">
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--muted)',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Schedule a Visit
        </div>

        {/* Visit Type Selection */}
        <div className="booking-date-grid">
          {BOOKING_OPTIONS.map((option) => (
            <div
              key={option.id}
              className={`booking-option ${visitType === option.id ? 'selected' : ''}`}
              onClick={() => setVisitType(option.id)}
              style={{
                padding: 14,
                border: `1.5px solid ${visitType === option.id ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                textAlign: 'center',
                background: visitType === option.id ? 'var(--gold-lt)' : 'white',
              }}
            >
              <div className="opt-icon" style={{ fontSize: 20, marginBottom: 4 }}>
                {option.icon}
              </div>
              <div className="opt-title">{option.title}</div>
              <div className="opt-sub">{option.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Form Fields */}
        <input
          className="input"
          style={{ marginBottom: 10 }}
          placeholder="Select Date"
          type="date"
          min={new Date().toISOString().split('T')[0]}
        />
        <input
          className="input"
          style={{ marginBottom: 10 }}
          placeholder="Your Name"
          type="text"
        />
        <input
          className="input"
          style={{ marginBottom: 16 }}
          placeholder="Phone Number"
          type="tel"
        />

        {/* Booking Button */}
        <Button variant="gold" size="lg" fullWidth onClick={onBook}>
          Book a Visit
        </Button>
        <Button variant="outline" size="md" fullWidth style={{ marginTop: 8 }}>
          💬 Chat with Agent
        </Button>
      </div>

      {/* Footer */}
      <div className="booking-footer">
        <div className="booking-trust">
          <span>🔒</span> 100% Safe — Your data is secure
        </div>
        <div className="booking-trust" style={{ marginTop: 4 }}>
          <span>⭐</span> Agent Rating: {property.agent?.rating || 4.8}/5.0
        </div>
      </div>
    </div>
  );
};

BookingPanel.displayName = 'BookingPanel';
