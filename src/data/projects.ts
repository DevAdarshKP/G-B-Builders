export interface PortfolioProject {
  id: string;
  number: string;
  title: string;
  category: string;
  image: string;
  aspectClass: string;
  widthClass: string;
  location: string;
  year: string;
  description: string;
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "harmony",
    number: "01",
    title: "A Home in Harmony",
    category: "RESIDENTIAL ARCHITECTURE",
    image: "/images/portfolio/project-01-harmony.jpg",
    aspectClass: "aspect-[16/10]",
    widthClass: "w-[85vw] sm:w-[55vw] lg:w-[42vw] max-w-[560px]",
    location: "Bespoke Coastline",
    year: "2025",
    description: "A contemporary tropical residence anchored by limestone masonry and cantilevered concrete planes overlooking calm water.",
  },
  {
    id: "quiet-living",
    number: "02",
    title: "The Art of Quiet Living",
    category: "INTERIOR DESIGN",
    image: "/images/portfolio/project-02-quiet-living.jpg",
    aspectClass: "aspect-[4/5]",
    widthClass: "w-[72vw] sm:w-[35vw] lg:w-[26vw] max-w-[340px]",
    location: "Highland Sanctuary",
    year: "2024",
    description: "Natural timber fluting, honed travertine surfaces, and low-profile linen appointments in a serene interior volume.",
  },
  {
    id: "kitchen-study",
    number: "03",
    title: "A Study in Material",
    category: "KITCHEN DESIGN",
    image: "/images/portfolio/project-03-kitchen-study.jpg",
    aspectClass: "aspect-[16/10]",
    widthClass: "w-[85vw] sm:w-[52vw] lg:w-[40vw] max-w-[540px]",
    location: "Urban Pavilion",
    year: "2025",
    description: "Monolithic quartzite waterfall island paired with seamless smoked oak cabinetry and concealed illumination.",
  },
  {
    id: "drawing-to-dwelling",
    number: "04",
    title: "From Drawing to Dwelling",
    category: "ARCHITECTURE & CONSTRUCTION",
    image: "/images/portfolio/project-04-drawing-dwelling.jpg",
    aspectClass: "aspect-[4/3]",
    widthClass: "w-[85vw] sm:w-[48vw] lg:w-[38vw] max-w-[500px]",
    location: "Valley Ridgeline",
    year: "2026",
    description: "Complete turnkey execution from raw hillside topography into a multi-tiered concrete and glass sanctuary.",
  },
];

export interface LegacyProject {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  excerpt: string;
  image: string;
  metrics: {
    area: string;
    duration: string;
    completion: string;
  };
}

export const PROJECTS_FOUNDATION: LegacyProject[] = PORTFOLIO_PROJECTS.map((p) => ({
  id: p.id,
  title: p.title,
  category: p.category,
  location: p.location,
  year: p.year,
  excerpt: p.description,
  image: p.image,
  metrics: {
    area: "420 m²",
    duration: "14 Mo",
    completion: "2025",
  },
}));
