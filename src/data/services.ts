export interface EditorialService {
  id: string;
  index: string;
  discipline: string;
  heading: string;
  description: string;
  bullets: string[];
  linkText: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  imageOnRight: boolean;
}

/**
 * Editorial architectural services dataset.
 * Matches the reference video layout with deliverables bullet points.
 */
export const EDITORIAL_SERVICES: EditorialService[] = [
  {
    id: "interior-design",
    index: "01",
    discipline: "INTERIOR DESIGN",
    heading: "Interior Design",
    description:
      "From spatial planning to 3D visualization, we shape rooms around the way you actually live: light, proportion and materials held in quiet balance.",
    bullets: [
      "Concept & spatial planning",
      "3D architectural visualization",
      "Lighting & custom furniture layout",
    ],
    linkText: "Explore interior design",
    href: "#contact",
    imageSrc: "/images/services/interior-design.jpg",
    imageAlt: "Refined contemporary interior with natural oak timber, honed travertine, and warm natural daylight",
    imageOnRight: true,
  },
  {
    id: "architecture",
    index: "02",
    discipline: "ARCHITECTURE & RENOVATION",
    heading: "Turnkey Architecture",
    description:
      "From the first site study to the architectural details, we develop spaces that respond to their surroundings, their purpose and the people who inhabit them.",
    bullets: [
      "Site analysis & spatial feasibility",
      "Custom architectural blueprints",
      "Full engineering & municipal permits",
    ],
    linkText: "Explore architecture",
    href: "#contact",
    imageSrc: "/images/services/architecture.jpg",
    imageAlt: "Contemporary architectural villa featuring cantilevered concrete eaves, timber screens, and water reflection",
    imageOnRight: false,
  },
  {
    id: "construction",
    index: "03",
    discipline: "CONSTRUCTION & EXECUTION",
    heading: "Turnkey Construction",
    description:
      "A considered approach to construction, coordination and finishing that translates the architectural design into a carefully executed, enduring residence.",
    bullets: [
      "Site preparation & earthworks",
      "Structural concrete & artisan masonry",
      "Complete MEP & final handover",
    ],
    linkText: "Explore construction",
    href: "#contact",
    imageSrc: "/images/services/construction.jpg",
    imageAlt: "Master craftsmen executing precision timber louvers and structural glass on an architectural site",
    imageOnRight: true,
  },
  {
    id: "materials-detailing",
    index: "04",
    discipline: "SELECTION OF MATERIALS",
    heading: "Selection of Materials",
    description:
      "A curated tactile palette of natural stone, architectural timbers, and patinated metals brings coherence, sensory warmth and permanence to every room.",
    bullets: [
      "Material boards & tactile approvals",
      "Finishing, fixture & millwork sourcing",
      "Supplier & artisan trade coordination",
    ],
    linkText: "Explore detailing",
    href: "#contact",
    imageSrc: "/images/services/materials-detailing.jpg",
    imageAlt: "Tactile curation of architectural finishes including honed travertine, aged bronze, and smoked oak",
    imageOnRight: false,
  },
];
