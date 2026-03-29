import { useEffect } from 'react';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: Record<string, any>;
}

/**
 * Hook to manage SEO meta tags and structured data
 * Updates document title, meta tags, and JSON-LD schema
 */
export const useSEO = (config: SEOConfig) => {
  useEffect(() => {
    // Update title
    document.title = `${config.title} | EstateVision`;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', config.description);

    // Update keywords if provided
    if (config.keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', config.keywords);
    }

    // Update Open Graph tags
    updateMetaTag('og:title', config.title);
    updateMetaTag('og:description', config.description);
    updateMetaTag('og:type', config.type || 'website');
    if (config.image) {
      updateMetaTag('og:image', config.image);
    }
    if (config.url) {
      updateMetaTag('og:url', config.url);
    }

    // Update Twitter tags
    updateMetaTag('twitter:title', config.title);
    updateMetaTag('twitter:description', config.description);
    if (config.image) {
      updateMetaTag('twitter:image', config.image);
    }

    // Update canonical URL
    if (config.url) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', config.url);
    }

    // Add structured data (JSON-LD)
    if (config.structuredData) {
      addStructuredData(config.structuredData);
    }

    return () => {
      // Cleanup: Remove structured data on unmount
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach((script) => {
        if ((script as HTMLScriptElement & { dataset: DOMStringMap }).dataset.seo === 'true') {
          script.remove();
        }
      });
    };
  }, [config]);
};

/**
 * Utility to update or create meta tags
 */
const updateMetaTag = (property: string, content: string) => {
  let meta = document.querySelector(
    `meta[property="${property}"], meta[name="${property}"]`
  );
  if (!meta) {
    meta = document.createElement('meta');
    if (property.startsWith('og:')) {
      meta.setAttribute('property', property);
    } else {
      meta.setAttribute('name', property);
    }
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

/**
 * Utility to add structured data (JSON-LD)
 */
const addStructuredData = (data: Record<string, any>) => {
  // Remove existing SEO structured data
  const existingScripts = document.querySelectorAll('script[data-seo="true"]');
  existingScripts.forEach((script) => script.remove());

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.seo = 'true';
  script.innerHTML = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Generate Organization schema for EstateVision
 */
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'EstateVision',
  url: 'https://estatevision.com',
  logo: 'https://estatevision.com/logo.png',
  description: 'Premium real estate platform connecting buyers, sellers, and agents',
  sameAs: [
    'https://www.facebook.com/estatevision',
    'https://www.twitter.com/estatevision',
    'https://www.linkedin.com/company/estatevision'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-XXX-XXX-XXXX',
    contactType: 'Customer Service'
  }
});

/**
 * Generate Property schema for individual listings
 */
export const getPropertySchema = (property: {
  id: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images?: string[];
  address?: string;
  type?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'RealEstateProperty',
  name: property.title,
  description: property.description,
  image: property.images?.[0] || 'https://estatevision.com/default-property.jpg',
  price: property.price.toString(),
  priceCurrency: 'USD',
  numberOfBedrooms: property.bedrooms,
  numberOfBathroms: property.bathrooms,
  floorSize: {
    '@type': 'QuantitativeValue',
    value: property.area,
    unitCode: 'SqFt'
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
    addressLocality: property.address || 'United States'
  },
  url: `https://estatevision.com/property/${property.id}`,
  offers: {
    '@type': 'Offer',
    price: property.price,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock'
  }
});

/**
 * Generate BreadcrumbList schema for navigation
 */
export const getBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

/**
 * Generate LocalBusiness schema
 */
export const getLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'EstateVision Real Estate',
  image: 'https://estatevision.com/logo.png',
  description:
    'Premier real estate platform offering comprehensive property listings and expert agent connections',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
    addressRegion: 'USA'
  },
  sameAs: [
    'https://www.facebook.com/estatevision',
    'https://www.twitter.com/estatevision'
  ],
  priceRange: '$'
});
