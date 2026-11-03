"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { registerGSAP, gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/animations";

const BEFORE_IMAGE_SRC = "/images/projects/architecture-before.png";
const AFTER_IMAGE_SRC = "/images/projects/architecture-after.png";

/**
 * Premium Cinematic Before/After Architectural Reveal Section.
 * Features:
 * - Single viewport horizontal CSS wipe via clipPath
 * - Interactive pointer capture for fluid mouse & touch dragging
 * - Accessible keyboard slider navigation (arrows, Home/End)
 * - Automatic, reversible GSAP ScrollTrigger reveal with graceful user override
 * - Respects prefers-reduced-motion
 * - Consistent editorial architectural design system (Ivory, Noir, Amber, Graphite)
 */
export function BeforeAfterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [sliderPosition, setSliderPosition] = useState(50);
  const isDraggingRef = useRef(false);
  const hasUserInteractedRef = useRef(false);

  // Derive normalized percentage from clientX
  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    isDraggingRef.current = true;
    hasUserInteractedRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Browser pointer capture fallback
    }
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Browser pointer capture fallback
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    hasUserInteractedRef.current = true;
    const step = e.shiftKey ? 10 : 2;

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        setSliderPosition((prev) => Math.max(0, prev - step));
        break;
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        setSliderPosition((prev) => Math.min(100, prev + step));
        break;
      case "Home":
        e.preventDefault();
        setSliderPosition(0);
        break;
      case "End":
        e.preventDefault();
        setSliderPosition(100);
        break;
      default:
        break;
    }
  };

  // Automatic scroll-driven reveal (ScrollTrigger)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;

    registerGSAP();
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Heading reveal
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
          y: 22,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "all",
        });
      }

      // Container entrance
      if (containerRef.current) {
        gsap.from(containerRef.current, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          y: 24,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "all",
        });
      }

      // Dynamic scrub reveal on slider divider
      ScrollTrigger.create({
        trigger: section,
        start: "top 75%",
        end: "bottom 25%",
        scrub: 0.6,
        onUpdate: (self) => {
          // User manual interaction permanently takes priority
          if (hasUserInteractedRef.current) return;
          // Subtly reveal from 62% down to 38%
          const animatedPos = 62 - self.progress * 24;
          setSliderPosition(animatedPos);
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="transformation"
      ref={sectionRef}
      className="relative z-20 bg-bg-base py-20 sm:py-24 lg:py-28 border-b border-border"
      aria-label="Before and After Architectural Reveal"
    >
      <Container>
        {/* Section Header */}
        <div ref={headerRef}>
          <SectionHeading
            align="center"
            eyebrow="THE TRANSFORMATION"
            title="From bare land to extraordinary living."
            description="Every great home begins with a vision. Explore the transformation from an untouched plot to a thoughtfully designed residence."
          />
        </div>

        {/* Comparison Viewport */}
        <div className="mt-12 sm:mt-16 mx-auto max-w-6xl">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[2.15/1] w-full overflow-hidden border border-border/80 shadow-2xl bg-bg-subtle select-none touch-pan-y cursor-ew-resize group"
          >
            {/* Background Layer: Completed Residence (AFTER) */}
            <div className="absolute inset-0 h-full w-full pointer-events-none">
              <Image
                src={AFTER_IMAGE_SRC}
                alt="Completed contemporary two-storey tropical villa"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1400px) 90vw, 1200px"
                className="object-cover object-center pointer-events-none"
              />
            </div>

            {/* Foreground Layer: Empty Plot (BEFORE) - Clipped horizontally */}
            <div
              className="absolute inset-0 h-full w-full pointer-events-none will-change-[clip-path]"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              }}
            >
              <Image
                src={BEFORE_IMAGE_SRC}
                alt="Untouched empty tropical residential plot before construction"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1400px) 90vw, 1200px"
                className="object-cover object-center pointer-events-none"
              />
            </div>

            {/* Vertical Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-ivory -translate-x-1/2 pointer-events-none z-20 shadow-[0_0_12px_rgba(0,0,0,0.6)]"
              style={{ left: `${sliderPosition}%` }}
            />

            {/* Interactive Handle */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Before and after architectural transformation comparison slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(sliderPosition)}
              onKeyDown={handleKeyDown}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center bg-ivory text-graphite border border-border/80 shadow-[0_4px_24px_rgba(0,0,0,0.45)] transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-graphite cursor-ew-resize"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="flex items-center justify-center text-graphite pointer-events-none">
                <ChevronLeft className="h-3.5 w-3.5 -mr-0.5" />
                <ChevronRight className="h-3.5 w-3.5 -ml-0.5" />
              </div>
            </div>

            {/* BEFORE Label (Lower Left) */}
            <div
              className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 pointer-events-none transition-opacity duration-300"
              style={{ opacity: sliderPosition > 12 ? 1 : 0 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.16em] text-graphite">
                BEFORE
              </span>
            </div>

            {/* AFTER Label (Lower Right) */}
            <div
              className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 pointer-events-none transition-opacity duration-300"
              style={{ opacity: sliderPosition < 88 ? 1 : 0 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.16em] text-graphite">
                AFTER
              </span>
            </div>
          </div>

          {/* Project Caption & CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left px-2">
            <p className="font-serif text-lg sm:text-xl text-graphite/90 italic font-normal">
              &ldquo;An empty plot, reimagined as a place to belong.&rdquo;
            </p>
            <Link
              href="#portfolio"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber hover:text-amber/80 transition-colors font-medium group"
            >
              <span>Explore our projects</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
