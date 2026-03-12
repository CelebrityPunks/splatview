export interface Property {
  id: string;
  title: string;
  address: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  splatUrl: string;
  thumbnailUrl: string;
  agent: {
    name: string;
    phone: string;
    email: string;
  };
  features: string[];
  createdAt: string;
}

// Demo properties — in production, these come from a database
export const demoProperties: Property[] = [
  {
    id: "modern-downtown-loft",
    title: "Modern Downtown Loft",
    address: "742 Urban Ave, Downtown District",
    price: "$485,000",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    description:
      "Stunning open-concept loft in the heart of downtown. Floor-to-ceiling windows flood the space with natural light. Exposed brick and modern finishes create the perfect blend of industrial charm and contemporary living.",
    splatUrl: "/splats/demo.ply",
    thumbnailUrl: "/thumbnails/loft.jpg",
    agent: {
      name: "Sarah Mitchell",
      phone: "(555) 123-4567",
      email: "sarah@splatview.com",
    },
    features: [
      "Open concept",
      "Floor-to-ceiling windows",
      "Exposed brick",
      "In-unit laundry",
      "Rooftop access",
      "1 parking spot",
    ],
    createdAt: "2026-03-10",
  },
  {
    id: "suburban-family-home",
    title: "Spacious Family Home",
    address: "1284 Maple Creek Dr, Oakwood Heights",
    price: "$725,000",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    description:
      "Beautiful family home on a quiet cul-de-sac. Recently renovated kitchen with granite countertops and stainless steel appliances. Large backyard perfect for entertaining.",
    splatUrl: "/splats/demo.ply",
    thumbnailUrl: "/thumbnails/house.jpg",
    agent: {
      name: "Michael Torres",
      phone: "(555) 987-6543",
      email: "michael@splatview.com",
    },
    features: [
      "Renovated kitchen",
      "Large backyard",
      "2-car garage",
      "Hardwood floors",
      "Central AC",
      "Smart home system",
    ],
    createdAt: "2026-03-08",
  },
  {
    id: "luxury-penthouse",
    title: "Luxury Penthouse Suite",
    address: "One Skyline Tower, Penthouse 3",
    price: "$1,250,000",
    bedrooms: 3,
    bathrooms: 3,
    sqft: 3200,
    description:
      "Breathtaking penthouse with panoramic city views. Private elevator access, chef's kitchen, and a wraparound terrace. The pinnacle of urban luxury living.",
    splatUrl: "/splats/demo.ply",
    thumbnailUrl: "/thumbnails/penthouse.jpg",
    agent: {
      name: "Victoria Chen",
      phone: "(555) 456-7890",
      email: "victoria@splatview.com",
    },
    features: [
      "Panoramic views",
      "Private elevator",
      "Chef's kitchen",
      "Wraparound terrace",
      "Wine cellar",
      "Concierge service",
    ],
    createdAt: "2026-03-05",
  },
];

export function getProperty(id: string): Property | undefined {
  return demoProperties.find((p) => p.id === id);
}

export function getAllProperties(): Property[] {
  return demoProperties;
}
