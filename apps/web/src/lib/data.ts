import type { ApiUsageSummary, PropertyPageModel } from "@/lib/types";

export const demoProperty: PropertyPageModel = {
  id: "prop-kirkland-waterline",
  slug: "kirkland-waterline-reserve",
  mlsNumber: "NWMLS-2419047",
  heroEyebrow: "NWMLS Flagship Listing",
  addressLine: "8416 Lakeview Point NE",
  cityLine: "Kirkland, WA 98033",
  price: 2685000,
  headline: "A map-rich Kirkland listing page built to close higher-trust inquiries.",
  subheadline:
    "SimplyRETS drives the listing. Google Maps and enrichment layers turn the page into a neighborhood intelligence asset.",
  description:
    "This V1 flagship page is designed to feel like a high-agency advisory surface, not a commodity IDX template. The listing facts stay clean and canonical. The neighborhood layer does the persuasion work.",
  bedrooms: 4,
  bathrooms: 3.5,
  sqft: 3720,
  lotSize: "0.31 acres",
  yearBuilt: 2018,
  propertyType: "Residential",
  status: "Active",
  pricePerSqft: 722,
  taxesAnnual: 19420,
  hoaMonthly: 180,
  coordinates: {
    lat: 47.6918,
    lng: -122.2059
  },
  media: [
    {
      id: "media-1",
      kind: "image",
      alt: "Street-facing view of the Kirkland home",
      url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80"
    },
    {
      id: "media-2",
      kind: "image",
      alt: "Editorial living room detail",
      url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: "media-3",
      kind: "image",
      alt: "Kitchen and dining area",
      url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80"
    }
  ],
  metrics: [
    {
      label: "Price",
      value: "$2.685M",
      detail: "Canonical MLS price"
    },
    {
      label: "Interior",
      value: "3,720 SF",
      detail: "$722 / SF"
    },
    {
      label: "Tax Profile",
      value: "$19.4K",
      detail: "Annual property taxes"
    },
    {
      label: "HOA",
      value: "$180",
      detail: "Monthly"
    }
  ],
  places: [
    {
      id: "school-1",
      category: "schools",
      name: "Lakeview Preparatory",
      distanceMiles: 0.7,
      rating: 4.8,
      address: "1127 Market St, Kirkland, WA"
    },
    {
      id: "park-1",
      category: "parks",
      name: "Marina Crescent Park",
      distanceMiles: 0.4,
      rating: 4.7,
      address: "889 Waverly Way, Kirkland, WA"
    },
    {
      id: "gym-1",
      category: "gyms",
      name: "Method Athletics Kirkland",
      distanceMiles: 1.1,
      rating: 4.9,
      address: "240 Central Way, Kirkland, WA"
    },
    {
      id: "hospital-1",
      category: "hospitals",
      name: "EvergreenHealth Medical Center",
      distanceMiles: 4.6,
      rating: 4.3,
      address: "12040 NE 128th St, Kirkland, WA"
    },
    {
      id: "grocery-1",
      category: "grocery",
      name: "Metropolitan Market",
      distanceMiles: 0.9,
      rating: 4.8,
      address: "10611 NE 68th St, Kirkland, WA"
    },
    {
      id: "dining-1",
      category: "dining",
      name: "Sparrow House",
      distanceMiles: 0.6,
      rating: 4.6,
      address: "15 Lake St, Kirkland, WA"
    }
  ],
  commutes: [
    {
      id: "commute-1",
      label: "Amazon Bellevue",
      destination: "425 108th Ave NE, Bellevue, WA",
      durationMinutes: 18,
      mode: "drive"
    },
    {
      id: "commute-2",
      label: "Microsoft Redmond",
      destination: "1 Microsoft Way, Redmond, WA",
      durationMinutes: 16,
      mode: "drive"
    },
    {
      id: "commute-3",
      label: "Downtown Seattle",
      destination: "1201 3rd Ave, Seattle, WA",
      durationMinutes: 34,
      mode: "transit"
    }
  ],
  linkHub: [
    {
      label: "Book Annual Wealth Review",
      href: "https://calendly.com/adityakasturi/annual-wealth-review",
      tone: "primary"
    },
    {
      label: "Request Full Listing Packet",
      href: "mailto:aditya@example.com?subject=Full%20listing%20packet",
      tone: "secondary"
    },
    {
      label: "Schedule a Private Tour",
      href: "mailto:aditya@example.com?subject=Private%20tour%20request",
      tone: "secondary"
    }
  ]
};

export const axessoUsageSummary: ApiUsageSummary = {
  monthlyLimit: 10000,
  monthlyReserved: 2000,
  usedThisMonth: 1180,
  remainingOperational: 6820,
  source: "axesso"
};

export function getPropertyBySlug(slug: string) {
  if (slug === demoProperty.slug) {
    return demoProperty;
  }

  return null;
}

