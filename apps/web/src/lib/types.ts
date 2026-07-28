export type NearbyPlaceCategory =
  | "schools"
  | "parks"
  | "gyms"
  | "hospitals"
  | "grocery"
  | "dining";

export type NearbyPlace = {
  id: string;
  name: string;
  category: NearbyPlaceCategory;
  distanceMiles: number;
  rating?: number;
  address: string;
};

export type Commute = {
  id: string;
  label: string;
  destination: string;
  durationMinutes: number;
  mode: "drive" | "transit";
};

export type PropertyMetric = {
  label: string;
  value: string;
  detail?: string;
};

export type PropertyMedia = {
  id: string;
  kind: "image";
  alt: string;
  url: string;
};

export type PropertyPageModel = {
  id: string;
  slug: string;
  mlsNumber: string;
  heroEyebrow: string;
  addressLine: string;
  cityLine: string;
  price: number;
  headline: string;
  subheadline: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: string;
  yearBuilt: number;
  propertyType: string;
  status: "Active" | "Pending";
  pricePerSqft: number;
  taxesAnnual?: number;
  hoaMonthly?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  media: PropertyMedia[];
  metrics: PropertyMetric[];
  places: NearbyPlace[];
  commutes: Commute[];
  linkHub: Array<{
    label: string;
    href: string;
    tone: "primary" | "secondary";
  }>;
};

export type ApiUsageSummary = {
  monthlyLimit: number;
  monthlyReserved: number;
  usedThisMonth: number;
  remainingOperational: number;
  source: "axesso";
};

