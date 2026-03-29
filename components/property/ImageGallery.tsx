'use client';
import React, { useState } from 'react';

/**
 * ImageGallery Component
 * Displays property images with navigation and thumbnails
 */

export interface ImageGalleryProps {
  images: string[];
  title: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div>
      {/* Main Gallery */}
      <div
        className="gallery-main"
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          aspectRatio: '16/9',
        }}
      >
        <img
          src={images[activeIndex]}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Navigation Buttons */}
        <button
          className="gallery-btn gallery-btn-prev"
          onClick={handlePrevious}
          aria-label="Previous image"
        >
          ‹
        </button>
        <button
          className="gallery-btn gallery-btn-next"
          onClick={handleNext}
          aria-label="Next image"
        >
          ›
        </button>

        {/* Counter */}
        <div className="gallery-counter">
          {activeIndex + 1} / {images.length}
        </div>

        {/* View All Button */}
        <button className="gallery-view-all">⊞ All Photos</button>
      </div>

      {/* Thumbnails */}
      <div
        className="gallery-thumbs"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(4, images.length)}, 1fr)`,
          gap: 8,
          marginTop: 8,
        }}
      >
        {images.map((img, index) => (
          <div
            key={index}
            className={`gallery-thumb ${activeIndex === index ? 'active' : ''}`}
            onClick={() => handleThumbnailClick(index)}
            style={{
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              cursor: 'pointer',
              aspectRatio: '4/3',
              border: activeIndex === index ? '2px solid var(--gold)' : '2px solid transparent',
              transition: 'all var(--transition)',
            }}
          >
            <img src={img} alt={`Thumbnail ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

ImageGallery.displayName = 'ImageGallery';
