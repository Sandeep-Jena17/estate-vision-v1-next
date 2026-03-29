'use client';
import React, { useState } from 'react';
import { Property } from '@/types';
import { Badge } from '../common';
import { formatCurrency, getTimeAgo } from '@/utils/formatters';

/**
 * PropertyCard Component
 * Displays a single property in a grid/list view
 */

export interface PropertyCardProps {
  property: Property;
  onClick: (property: Property) => void;
  viewMode?: 'grid' | 'list';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onClick,
  viewMode = 'grid',
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShared(true);
    setTimeout(() => setIsShared(false), 1500);
  };

  // Grid view
  if (viewMode === 'grid') {
    return (
      <div className="prop-card" onClick={() => onClick(property)}>
        {/* Image Section */}
        <div className="prop-card-img">
          <img src={property.media.images[0]} alt={property.title} loading="lazy" />

          {/* Badges */}
          <div className="prop-card-badges">
            {property.premium && <Badge variant="premium">✦ Premium</Badge>}
            {property.badge === 'new' && <Badge variant="new">● New</Badge>}
            {property.badge === 'hot' && <Badge variant="hot">🔥 Hot</Badge>}
            {property.badge === 'verified' && <Badge variant="verified">✓ Verified</Badge>}
          </div>

          {/* Actions */}
          <div className="prop-card-actions">
            <button
              className={`prop-card-action ${isLiked ? 'liked' : ''}`}
              onClick={handleLikeClick}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              {isLiked ? '♥' : '♡'}
            </button>
            <button
              className="prop-card-action"
              onClick={handleShareClick}
              title="Share"
            >
              {isShared ? '✓' : '⤴'}
            </button>
          </div>
        </div>

        {/* Body Section */}
        <div className="prop-card-body">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div className="prop-card-price">
              {formatCurrency(property.price)}
              <span>onwards</span>
            </div>
            {property.media.matterportId && (
              <Badge
                variant="verified"
                style={{ fontSize: 10, flexShrink: 0 }}
              >
                3D Tour
              </Badge>
            )}
          </div>

          <div className="prop-card-title">{property.title}</div>
          <div className="prop-card-loc">
            📍 {property.location.locality}, {property.location.city}
          </div>

          <div className="prop-card-specs">
            <div className="prop-spec">
              🛏 <strong>{property.specs.beds}</strong> Beds
            </div>
            <div className="prop-spec">
              🚿 <strong>{property.specs.baths}</strong> Baths
            </div>
            <div className="prop-spec">
              📐 <strong>{property.specs.sqft.toLocaleString()}</strong> sqft
            </div>
            <div className="prop-spec">
              🚗 <strong>{property.specs.parking}</strong> Park
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="prop-card-footer">
          <div className="prop-card-agent">
            {property.agent?.id && (
              <>
                {/* Placeholder avatar - replace with actual avatar URL when available */}
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #b8860b, #d4a017)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {property.agent.name.charAt(0)}
                </div>
                <span className="prop-card-agent-name">{property.agent.name}</span>
              </>
            )}
          </div>
          <span className="prop-card-posted">
            {getTimeAgo(property.createdAt)}
          </span>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all var(--transition)',
      }}
      onClick={() => onClick(property)}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = 'none';
      }}
    >
      {/* Image */}
      <div style={{ width: 260, flexShrink: 0, position: 'relative' }}>
        <img
          src={property.media.images[0]}
          alt={property.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {property.premium && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <Badge variant="premium">✦ Premium</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px 20px 20px 0', flex: 1 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--slate)',
          }}
        >
          {formatCurrency(property.price)}
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--slate)',
            margin: '6px 0 4px',
          }}
        >
          {property.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
          📍 {property.location.address}
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, marginBottom: 14 }}>
          {property.description.slice(0, 120)}...
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            ['🛏', `${property.specs.beds} BHK`],
            ['📐', `${property.specs.sqft.toLocaleString()} sqft`],
            ['🏢', `${property.specs.floor}`],
            ['🚗', `${property.specs.parking} Car`],
          ].map(([icon, val]) => (
            <div
              key={val}
              style={{
                fontSize: 12,
                color: 'var(--muted)',
                display: 'flex',
                gap: 4,
                alignItems: 'center',
              }}
            >
              {icon}
              <strong style={{ color: 'var(--slate)' }}>{val}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 8,
          borderLeft: '1px solid var(--border)',
          minWidth: 150,
        }}
      >
        <button
          className="btn btn-gold btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick(property);
          }}
        >
          View Details
        </button>
        <button className="btn btn-outline btn-sm">Save ♡</button>
      </div>
    </div>
  );
};

PropertyCard.displayName = 'PropertyCard';
