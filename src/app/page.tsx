import { SiteHeader } from "@/components/layout/SiteHeader";
import { CinematicHero } from "@/components/sections/CinematicHero";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { AboutCompanySection } from "@/components/sections/AboutCompanySection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { PortfolioShowcase } from "@/components/sections/PortfolioShowcase";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-fg-base selection:bg-graphite selection:text-ivory">
      {/* Premium Floating Capsule Navbar */}
      <SiteHeader />

      <main className="flex-1">
        {/* Full-bleed Scroll-Driven Cinematic Construction Hero */}
        <CinematicHero />

        {/* Cinematic Before/After Architectural Reveal */}
        <BeforeAfterSection />

        {/* Editorial Architecture & Interior Design Services (#services) */}
        <ServicesSection />

        {/* Editorial About Company Section (#about & #studio) */}
        <AboutCompanySection />

        {/* Cinematic Side-Moving Architectural Portfolio & Final Living Experience (#portfolio & #contact) */}
        <PortfolioShowcase />
      </main>

      {/* Editorial Architectural Studio Footer */}
      <SiteFooter />
    </div>
  );
}
