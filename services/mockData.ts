/**
 * Mock property data for development and testing
 */

import { Property, PropertyType, PropertyStatus, FurnishedType, LandmarkType } from '@/types';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop_001',
    title: 'Prestige Lakeview Residences',
    description:
      'Stunning lake-facing 3BHK apartment with premium finishes, modular kitchen, and panoramic views. Located in the heart of Patia with excellent connectivity to IT corridor.',
    type: PropertyType.APARTMENT,
    status: PropertyStatus.READY_TO_MOVE,
    price: 8500000,
    pricePerSqft: 5312,
    maintenanceCharges: 5000,
    location: {
      address: 'Plot 123, Patia, Bhubaneswar',
      locality: 'Patia',
      city: 'Bhubaneswar',
      state: 'Odisha',
      pincode: '751024',
      lat: 20.3512,
      lng: 85.8187,
    },
    specs: {
      beds: 3, baths: 2, sqft: 1600, floor: '12', totalFloors: 18,
      parking: 1, furnished: FurnishedType.SEMI, facing: 'East', age: 2,
    },
    media: {
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900',
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=900',
      ],
      videoUrl: 'youtube_id_here',
      matterportId: 'matterport_id_here',
      floorPlanUrl: 'https://via.placeholder.com/800x600?text=Floor+Plan',
    },
    rera: 'OD12345678',
    possession: 'Immediate',
    amenities: [
      'Swimming Pool', 'Gym', '24/7 Security', 'Club House', 'Kids Play Area',
      'Power Backup', 'Lift', 'Visitor Parking', 'Landscaped Garden', 'Jogging Track',
    ],
    landmarks: [
      {
        name: 'Biju Patnaik Airport', type: LandmarkType.AIRPORT, icon: '✈️',
        lat: 20.2961, lng: 85.8245, distanceKm: 8.5, driveTimeMin: 18,
      },
      {
        name: 'AIIMS Bhubaneswar', type: LandmarkType.HOSPITAL, icon: '🏥',
        lat: 20.295, lng: 85.782, distanceKm: 3.1, driveTimeMin: 8, walkTimeMin: 38,
      },
    ],
    agentId: 'agent_001',
    agent: { id: 'agent_001', name: 'Priya Sharma', phone: '+91 98765 43210', email: 'priya.sharma@estatevision.com', rating: 4.9 },
    premium: true, featured: true, badge: 'new', views: 342, saves: 28,
    postedDate: '2024-03-09', createdAt: '2024-03-09T10:00:00Z', updatedAt: '2024-03-10T14:30:00Z',
  },
  {
    id: 'prop_002',
    title: 'Royal Villas — Gated Community',
    description:
      'Exclusive independent villa in premium gated community. Italian marble flooring, imported fittings, private garden, and rooftop terrace. Ultra-luxury living redefined.',
    type: PropertyType.VILLA,
    status: PropertyStatus.UNDER_CONSTRUCTION,
    price: 25000000,
    pricePerSqft: 7142,
    maintenanceCharges: 15000,
    location: {
      address: 'Nayapalli, Bhubaneswar', locality: 'Nayapalli', city: 'Bhubaneswar',
      state: 'Odisha', pincode: '751012', lat: 20.2848, lng: 85.8352,
    },
    specs: {
      beds: 4, baths: 4, sqft: 3500, floor: 'G+1', totalFloors: 2,
      parking: 2, furnished: FurnishedType.FULLY, facing: 'North', age: 0,
    },
    media: {
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=900',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900',
        'https://images.unsplash.com/photo-1600566752734-2a0cd30b8f56?w=900',
      ],
      videoUrl: 'youtube_id_here',
      matterportId: 'matterport_id_here',
    },
    rera: 'OD87654321',
    possession: 'Dec 2025',
    amenities: [
      'Private Pool', 'Home Theater', 'Smart Home', '4-Car Garage',
      'Servant Quarters', 'Solar Power', 'EV Charging', 'Gym Room', 'Jacuzzi',
    ],
    landmarks: [
      {
        name: 'KIMS Hospital', type: LandmarkType.HOSPITAL, icon: '🏥',
        lat: 20.29, lng: 85.82, distanceKm: 1.5, driveTimeMin: 4, walkTimeMin: 18,
      },
    ],
    agentId: 'agent_002',
    agent: { id: 'agent_002', name: 'Rohit Patel', phone: '+91 87654 32109', email: 'rohit.patel@estatevision.com', rating: 4.8 },
    premium: true, featured: true, badge: 'hot', views: 891, saves: 74,
    postedDate: '2024-03-03', createdAt: '2024-03-03T08:15:00Z', updatedAt: '2024-03-09T11:45:00Z',
  },
  {
    id: 'prop_003',
    title: 'Sunrise Heights — 2BHK',
    description:
      'Spacious 2BHK in prime IT corridor location. Well-ventilated east-facing unit with large balcony. Ideal for IT professionals working in nearby tech parks.',
    type: PropertyType.APARTMENT,
    status: PropertyStatus.READY_TO_MOVE,
    price: 4200000,
    pricePerSqft: 4200,
    location: {
      address: 'Chandrasekharpur, Bhubaneswar', locality: 'Chandrasekharpur',
      city: 'Bhubaneswar', state: 'Odisha', pincode: '751023', lat: 20.3284, lng: 85.8398,
    },
    specs: {
      beds: 2, baths: 2, sqft: 1000, floor: '6', totalFloors: 10,
      parking: 1, furnished: FurnishedType.UNFURNISHED, facing: 'East',
    },
    media: {
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900',
      ],
    },
    rera: 'OD11223344',
    possession: 'Immediate',
    amenities: ['Gym', 'Security', 'Lift', 'Power Backup', 'Water Tank', 'Covered Parking'],
    landmarks: [
      {
        name: 'Infocity IT Park', type: LandmarkType.OFFICE, icon: '💼',
        lat: 20.33, lng: 85.84, distanceKm: 1.5, driveTimeMin: 5, walkTimeMin: 18,
      },
    ],
    agentId: 'agent_003',
    agent: { id: 'agent_003', name: 'Ananya Mishra', phone: '+91 76543 21098', email: 'ananya.mishra@estatevision.com', rating: 4.7 },
    premium: false, featured: false, badge: 'verified', views: 156, saves: 12,
    postedDate: '2024-03-07', createdAt: '2024-03-07T14:20:00Z', updatedAt: '2024-03-10T09:00:00Z',
  },
];
