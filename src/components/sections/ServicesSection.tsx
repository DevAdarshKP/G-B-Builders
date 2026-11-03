"use client";

import { useRef, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { ServiceRow } from "@/components/sections/ServiceRow";
import { EDITORIAL_SERVICES } from "@/data/services";
import { registerGSAP, gsap, prefersReducedMotion } from "@/lib/animations";

/**
 * Editorial Services Section.
 * Implements alternating image/text compositions with generous negative space,
 * refined editorial typography, and coordinated scroll reveals.
 */
export function ServicesSection() {
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;

    registerGSAP();
    const intro = introRef.current;
    if (!intro) return;

    const ctx = gsap.context(() => {
      if (intro.children) {
        gsap.from(intro.children, {
          scrollTrigger: {
            trigger: intro,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
          y: 22,
          opacity: 0,
          stagger: 0.1,
          duration: 0.85,
          ease: "power3.out",
          clearProps: "all",
        });
      }
    }, intro);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      className="relative z-20 bg-bg-base py-20 sm:py-24 lg:py-28 border-b border-border"
      aria-label="Architectural Studio Services"
    >
      <Container>
        {/* Centered Introduction (Matches reference video Frame 00:04 & 00:05) */}
        <div
          ref={introRef}
          className="mx-auto max-w-2xl text-center space-y-4 pb-14 sm:pb-18 lg:pb-20"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber font-semibold">
              01 / 04
            </span>
            <span className="h-3 w-px bg-black/20" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted font-medium">
              WHAT WE DO
            </span>
          </div>

          <h2 className="font-sans text-4xl sm:text-5xl lg:text-5xl font-bold text-graphite tracking-tight leading-[1.08]">
            Our Services
          </h2>

          <p className="font-sans text-sm sm:text-base text-muted font-normal leading-relaxed max-w-xl mx-auto pt-1">
            Four disciplines, one point of responsibility &mdash; carried from the first sketch to the last coat of oil on the timber.
          </p>
        </div>

        {/* Alternating Editorial Service Rows */}
        <div className="space-y-20 sm:space-y-28 lg:space-y-32">
          {EDITORIAL_SERVICES.map((service, index) => (
            <ServiceRow
              key={service.id}
              service={service}
              priority={index === 0}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
