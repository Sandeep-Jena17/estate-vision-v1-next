'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Footer Component
 * Application footer with links and information
 */

export const Footer: React.FC = () => {
  const router = useRouter();

  const sections = [
    {
      title: 'Properties',
      links: [
        { label: 'Buy', path: '/listings' },
        { label: 'Rent', path: '/listings' },
        { label: 'New Projects', path: '/projects' },
        { label: 'Commercial', path: '/properties' },
        { label: 'Plots', path: '/properties' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/' },
        { label: 'Careers', path: '/' },
        { label: 'Blog', path: '/' },
        { label: 'Press', path: '/' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Centre', path: '/' },
        { label: 'Terms', path: '/' },
        { label: 'Privacy', path: '/' },
        { label: 'Contact', path: '/' },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-grid">
          {/* Branding */}
          <div>
            <div className="footer-logo">EstateVision</div>
            <div
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,.5)',
                lineHeight: 1.8,
                maxWidth: 300,
              }}
            >
              India's most trusted real estate platform. Find, compare and book your dream property with AI-powered insights.
            </div>
          </div>

          {/* Link Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                {section.title}
              </div>
              {section.links.map((link) => (
                <button
                  key={link.label}
                  className="footer-link"
                  onClick={() => router.push(link.path)}
                >
                  {link.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div style={{ fontSize: 12 }}>
            © 2025 EstateVision. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div className="badge badge-rera" style={{ fontSize: 10 }}>
              RERA Compliant
            </div>
            <div className="badge badge-verified" style={{ fontSize: 10 }}>
              ✓ ISO Certified
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
