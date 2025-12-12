export enum ViewMode {
  HOME = 'HOME',
  GENERATE = 'GENERATE',
  LIBRARY = 'LIBRARY',
  COMPARE = 'COMPARE'
}

export enum HomeStyle {
  MODERN = 'Modern Minimalist',
  TRADITIONAL = 'Traditional Family',
  LUXURY = 'Luxury Villa',
  URBAN = 'Compact Urban',
  ECO = 'Eco-Friendly Sustainable'
}

export interface DesignConfig {
  style: HomeStyle;
  bedrooms: number;
  bathrooms: number;
  levels: number;
  lotSize: number; // in sq meters
  features: string[];
  customInstructions: string;
}

export interface GeneratedDesign {
  id: string;
  timestamp: number;
  config: DesignConfig;
  blueprintUrl?: string;
  exteriorUrl?: string;
  scores: number[]; // [Architectural, Lighting, Material, Composition, Realism]
  generationTime?: number;
}

export const HOME_STYLES = [
  {
    id: HomeStyle.MODERN,
    label: "Modern Minimalist",
    desc: "Clean lines, open spaces, floor-to-ceiling windows.",
    img: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: HomeStyle.TRADITIONAL,
    label: "Traditional Family",
    desc: "Classic architecture, warm materials, welcoming atmosphere.",
    img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: HomeStyle.LUXURY,
    label: "Luxury Villa",
    desc: "Grand entrance, premium materials, elegant design.",
    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: HomeStyle.URBAN,
    label: "Compact Urban",
    desc: "Space-efficient, modern urban design, vertical living.",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: HomeStyle.ECO,
    label: "Eco-Friendly Sustainable",
    desc: "Green roof, solar panels, natural materials, passive design.",
    img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=400&q=80"
  }
];

export const AVAILABLE_FEATURES = [
  "Swimming Pool", "Home Office", "Garage", "Basement", 
  "Rooftop Terrace", "Garden", "Solar Panels", "Smart Home System", 
  "Wine Cellar", "Home Gym", "Guest Suite", "Media Room"
];