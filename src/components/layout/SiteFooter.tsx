import Link from "next/link";
import { Container } from "@/components/ui/Container";

/**
 * Editorial architectural footer component with brand palette styling.
 */
export function SiteFooter() {
  const currentYear = 2026;

  return (
    <footer className="relative z-30 mt-auto bg-noir text-ivory">
      <Container className="py-14 md:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          {/* Brand & Studio Philosophy */}
          <div className="sm:col-span-2 space-y-4">
            <span className="font-sans text-2xl font-bold tracking-[0.16em] uppercase text-white">
              G&amp;B Builders
            </span>
            <p className="max-w-md text-sm text-ivory/70 leading-relaxed font-light">
              We design and build your house, from bare land. Crafting spatial harmony across bespoke architecture, refined interior environments, and turnkey construction.
            </p>
            <div className="pt-2 text-xs font-mono tracking-wider text-amber/90 uppercase">
              Bespoke Architecture &middot; Turnkey Delivery
            </div>
          </div>

          {/* Site Navigation */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-white/90">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm text-ivory/70 font-light">
              <li>
                <Link href="#transformation" className="transition-colors hover:text-white">
                  Transformation
                </Link>
              </li>
              <li>
                <Link href="#services" className="transition-colors hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#about" className="transition-colors hover:text-white">
                  About Studio
                </Link>
              </li>
              <li>
                <Link href="#portfolio" className="transition-colors hover:text-white">
                  Selected Works
                </Link>
              </li>
              <li>
                <Link href="#contact" className="transition-colors hover:text-white">
                  Start a Project
                </Link>
              </li>
            </ul>
          </div>

          {/* Practice Contact & Inquiries */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-white/90">
              Practice
            </h3>
            <div className="space-y-2 text-sm text-ivory/70 font-light leading-relaxed">
              <p className="text-xs font-mono uppercase tracking-wider text-white/50">
                Inquiries &amp; Consultations
              </p>
              <p>
                <a
                  href="mailto:contact@gb-builders.internal"
                  className="text-white hover:text-amber transition-colors underline-offset-4 hover:underline"
                >
                  contact@gb-builders.internal
                </a>
              </p>
              <p>
                <a
                  href="tel:+14155550192"
                  className="font-sans font-semibold text-white/90 hover:text-amber transition-colors inline-block"
                >
                  +1 415 555 0192
                </a>
              </p>
              <p className="text-xs text-white/50 pt-1">
                San Francisco &amp; Coastal Studio Locations
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row text-xs text-ivory/50 font-mono">
          <p>&copy; {currentYear} G&amp;B Builders. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="tracking-widest uppercase">Precision &middot; Craft &middot; Space</span>
            <Link
              href="#hero"
              className="text-white/60 hover:text-white transition-colors uppercase tracking-wider text-[11px]"
            >
              Back to top &uarr;
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
