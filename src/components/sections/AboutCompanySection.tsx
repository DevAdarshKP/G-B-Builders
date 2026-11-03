"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { registerGSAP, gsap, prefersReducedMotion } from "@/lib/animations";

interface MetricItem {
  number: string;
  title: string;
  description: string;
}

const STATS_DATA: MetricItem[] = [
  {
    number: "45+",
    title: "Design Projects",
    description:
      "Owners of large residences and private villas trust us with spaces that are built to perform for generations.",
  },
  {
    number: "18+",
    title: "Employees",
    description:
      "Designers, architects and project leads — always ready to answer your questions and carry the detail.",
  },
  {
    number: "18+",
    title: "Communities",
    description:
      "A collective dedication to architectural integrity, spatial honesty, and meticulous build execution.",
  },
];

/**
 * Editorial About Company Section.
 * Recreates the split asymmetrical image collage with directional clip-path reveals,
 * coordinated heading entrance, and staggered statistics with a subtle numeric count-up roll
 * matching the luxury architectural studio reference.
 */
export function AboutCompanySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const topImagesRef = useRef<HTMLDivElement>(null);
  const bottomImageRef = useRef<HTMLDivElement>(null);
  const headerContentRef = useRef<HTMLDivElement>(null);
  const statsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;

    registerGSAP();
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Heading & statement reveal
      if (headerContentRef.current?.children) {
        gsap.from(headerContentRef.current.children, {
          scrollTrigger: {
            trigger: section,
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

      // 2. Top Image Pair Reveal (coordinated stagger)
      if (topImagesRef.current) {
        const topCards = topImagesRef.current.querySelectorAll(".about-image-card");
        topCards.forEach((card, index) => {
          const innerReveal = card.querySelector(".image-reveal-inner");
          const img = card.querySelector(".image-scale-target");

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: topImagesRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
            delay: index * 0.12,
          });

          tl.from(card, {
            y: 24,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
            clearProps: "transform,opacity",
          });

          if (innerReveal) {
            tl.fromTo(
              innerReveal,
              { clipPath: "inset(18% 0% 0% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.0,
                ease: "power3.out",
                clearProps: "clipPath",
              },
              "<"
            );
          }

          if (img) {
            tl.fromTo(
              img,
              { scale: 1.06 },
              {
                scale: 1,
                duration: 1.1,
                ease: "power3.out",
                clearProps: "transform",
              },
              "<"
            );
          }
        });
      }

      // 3. Bottom Image Reveal (triggers when the bottom row approaches viewport)
      if (bottomImageRef.current) {
        const bottomCard = bottomImageRef.current;
        const innerReveal = bottomCard.querySelector(".image-reveal-inner");
        const img = bottomCard.querySelector(".image-scale-target");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: bottomCard,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });

        tl.from(bottomCard, {
          y: 24,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          clearProps: "transform,opacity",
        });

        if (innerReveal) {
          tl.fromTo(
            innerReveal,
            { clipPath: "inset(18% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.05,
              ease: "power3.out",
              clearProps: "clipPath",
            },
            "<"
          );
        }

        if (img) {
          tl.fromTo(
            img,
            { scale: 1.05 },
            {
              scale: 1,
              duration: 1.15,
              ease: "power3.out",
              clearProps: "transform",
            },
            "<"
          );
        }
      }

      // 4. Staggered Statistics Entrance + Numeric Count-Up Roll
      if (statsListRef.current) {
        const rows = statsListRef.current.querySelectorAll(".stat-row");
        rows.forEach((row) => {
          const numberEl = row.querySelector<HTMLSpanElement>(".stat-number");
          const originalText = numberEl?.getAttribute("data-value") || numberEl?.textContent || "";
          const match = originalText.match(/^(\d+)(.*)$/);
          const targetVal = match ? parseInt(match[1], 10) : 0;
          const suffix = match ? match[2] : "";

          // Entrance animation for row
          gsap.from(row, {
            scrollTrigger: {
              trigger: row,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            y: 22,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
            clearProps: "all",
          });

          // Numeric count-up roll matching the reference video
          if (numberEl && targetVal > 0) {
            const counter = { val: 0 };
            gsap.to(counter, {
              val: targetVal,
              duration: 1.3,
              ease: "power2.out",
              scrollTrigger: {
                trigger: row,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
              onUpdate: () => {
                numberEl.textContent = `${Math.round(counter.val)}${suffix}`;
              },
              onComplete: () => {
                numberEl.textContent = originalText;
              },
            });
          }
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative bg-bg-base py-20 sm:py-24 lg:py-28 border-b border-border overflow-hidden"
      aria-label="About G&B Builders"
    >
      <div id="studio" className="sr-only" aria-hidden="true" />
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-start">
          {/* Left Column: Asymmetrical Staggered Image Collage */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4 sm:space-y-6">
            {/* Top Row Pair */}
            <div ref={topImagesRef} className="grid grid-cols-2 gap-4 sm:gap-6 items-end">
              {/* Top Left: Minimalist Interior Corner */}
              <div className="about-image-card group relative aspect-[4/5] overflow-hidden">
                <div className="image-reveal-inner absolute inset-0 h-full w-full will-change-[clip-path]">
                  <Image
                    src="/images/about/interior-corner.jpg"
                    alt="Minimalist architectural daybed and art corner"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="image-scale-target object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Top Right: Architect at Studio Workspace (Taller / Offset) */}
              <div className="about-image-card group relative aspect-[3/4] overflow-hidden">
                <div className="image-reveal-inner absolute inset-0 h-full w-full will-change-[clip-path]">
                  <Image
                    src="/images/about/architect-workspace.jpg"
                    alt="Architect and designer working at studio desk"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="image-scale-target object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row: Team Reviewing Blueprints on Site */}
            <div
              ref={bottomImageRef}
              className="about-image-card group relative aspect-[16/9] w-full overflow-hidden"
            >
              <div className="image-reveal-inner absolute inset-0 h-full w-full will-change-[clip-path]">
                <Image
                  src="/images/about/team-blueprints.jpg"
                  alt="Architects reviewing blueprints on construction site"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="image-scale-target object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Text & Metrics */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-start space-y-7 lg:pl-4 xl:pl-8">
            <div ref={headerContentRef} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber font-semibold">
                  ABOUT
                </span>
                <span className="h-3 w-px bg-black/20" aria-hidden="true" />
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted font-medium">
                  OUR STUDIO
                </span>
              </div>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-[3.25rem] font-bold text-graphite tracking-tight leading-[1.08]">
                About Company
              </h2>
              <p className="font-sans text-sm sm:text-base text-muted/90 font-normal leading-relaxed max-w-xl pt-1">
                G&amp;B is a studio of designers, architects and project leads
                who treat every brief as a single, unbroken line: from the first
                measurements to the day you move in.
              </p>
            </div>

            {/* Metrics List with Large Numbers */}
            <div ref={statsListRef} className="space-y-6 pt-2">
              {STATS_DATA.map((stat) => (
                <div
                  key={stat.title}
                  className="stat-row flex flex-col sm:flex-row items-start gap-4 sm:gap-8 pt-6 border-t border-border/70"
                >
                  {/* Big Number with Count-Up Roll */}
                  <div className="min-w-[5.5rem] sm:min-w-[7rem]">
                    <span
                      data-value={stat.number}
                      className="stat-number font-sans text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-graphite tracking-tight leading-none block"
                    >
                      {stat.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-sans text-base sm:text-lg font-bold text-graphite tracking-tight">
                      {stat.title}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-muted/90 font-normal leading-relaxed">
                      {stat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
