"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PORTFOLIO_PROJECTS } from "@/data/projects";
import { registerGSAP, gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/animations";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return prefersReducedMotion();
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/**
 * Cinematic Side-Moving Architectural Portfolio.
 * - Coordinated card entrance stagger and directional image reveals matching the reference.
 * - Pinned desktop horizontal track translating right-to-left via vertical scrolling.
 * - Native touch-swipeable track on mobile without scroll-hijacking.
 * - Seamless release into the full-width monumental interior: "Creating a Cozy Interior".
 */
export function PortfolioShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef<HTMLSpanElement>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);
  const transitionSectionRef = useRef<HTMLElement>(null);
  const transitionHeaderRef = useRef<HTMLDivElement>(null);
  const transitionImageRef = useRef<HTMLDivElement>(null);

  const [activeProject, setActiveProject] = useState(1);

  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    registerGSAP();

    if (isReducedMotion) return;

    const rootEl = rootRef.current;
    const pinContainer = pinContainerRef.current;
    const track = trackRef.current;
    if (!rootEl || !pinContainer || !track) return;

    // Scoped GSAP context ensures 100% clean teardown and prevents React StrictMode lifecycle bugs
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // 1. DESKTOP & TABLET EXPERIENCE (>= 768px): Pinned Horizontal Track
      mm.add("(min-width: 768px)", () => {
        // Entrance animation for Portfolio Section Header
        if (headerRef.current) {
          gsap.from(headerRef.current.children, {
            scrollTrigger: {
              trigger: pinContainer,
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

        // Entrance reveal for all cards on desktop
        const cards = track.querySelectorAll(".portfolio-card");
        if (cards.length > 0) {
          const cardTl = gsap.timeline({
            scrollTrigger: {
              trigger: pinContainer,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });

          cards.forEach((card, index) => {
            const innerReveal = card.querySelector(".image-reveal-inner");
            const imgTarget = card.querySelector(".image-scale-target");
            const infoEl = card.querySelector(".portfolio-card-info");
            const badges = card.querySelectorAll(".portfolio-badge");
            const startTime = index * 0.12;

            cardTl.from(
              card,
              {
                y: 28,
                opacity: 0,
                duration: 0.85,
                ease: "power3.out",
                clearProps: "transform,opacity",
              },
              startTime
            );

            if (innerReveal) {
              cardTl.fromTo(
                innerReveal,
                { clipPath: "inset(18% 0% 0% 0%)" },
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  duration: 1.05,
                  ease: "power3.out",
                  clearProps: "clipPath",
                },
                startTime
              );
            }

            if (imgTarget) {
              cardTl.fromTo(
                imgTarget,
                { scale: 1.05 },
                {
                  scale: 1,
                  duration: 1.15,
                  ease: "power3.out",
                  clearProps: "transform",
                },
                startTime
              );
            }

            if (badges.length > 0) {
              cardTl.from(
                badges,
                {
                  opacity: 0,
                  duration: 0.5,
                  stagger: 0.05,
                  clearProps: "opacity",
                },
                startTime + 0.2
              );
            }

            if (infoEl) {
              cardTl.from(
                infoEl,
                {
                  opacity: 0,
                  y: 12,
                  duration: 0.6,
                  ease: "power3.out",
                  clearProps: "all",
                },
                startTime + 0.15
              );
            }
          });
        }

        // Horizontal scrub calculation
        const calculateScrollDistance = () => {
          const trackWidth = track.scrollWidth;
          const viewportWidth = window.innerWidth;
          return Math.max(0, trackWidth - viewportWidth + 120);
        };

        const scrollDist = calculateScrollDistance();
        // A generous release buffer so card 04 settles cleanly before transitioning into #contact
        const endBuffer = 260;
        const totalDistance = scrollDist + endBuffer;
        const trackRatio = scrollDist / totalDistance;

        const pinTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: pinContainer,
            start: "top top",
            end: () => `+=${totalDistance}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;

              // Scrub progress mapped across track distance
              const trackP = Math.min(1, Math.max(0, p / trackRatio));

              if (progressBarRef.current) {
                progressBarRef.current.style.width = `${Math.min(100, Math.max(4, trackP * 100))}%`;
              }

              const count = PORTFOLIO_PROJECTS.length;
              const currentIdx = Math.min(count, Math.max(1, Math.round(trackP * (count - 1)) + 1));
              setActiveProject(currentIdx);

              if (activeIndexRef.current) {
                activeIndexRef.current.textContent = `0${currentIdx}`;
              }

              // Smoothly fade out the status bar as we transition into #contact so there is zero collision
              if (statusBarRef.current) {
                if (p > trackRatio + 0.04) {
                  const fadeP = (p - (trackRatio + 0.04)) / (1 - (trackRatio + 0.04));
                  statusBarRef.current.style.opacity = `${Math.max(0, 1 - fadeP * 1.6)}`;
                } else {
                  statusBarRef.current.style.opacity = "1";
                }
              }
            },
          },
        });

        pinTimeline.to(
          track,
          {
            x: () => -scrollDist,
            ease: "none",
            duration: trackRatio,
          },
          0
        );

        const handleResize = () => {
          ScrollTrigger.refresh();
        };
        window.addEventListener("resize", handleResize, { passive: true });

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      });

      // 2. MOBILE EXPERIENCE (< 768px): Vertical Editorial Flow
      mm.add("(max-width: 767px)", () => {
        // Header entrance
        if (headerRef.current) {
          gsap.from(headerRef.current.children, {
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            y: 20,
            opacity: 0,
            stagger: 0.08,
            duration: 0.75,
            ease: "power3.out",
            clearProps: "all",
          });
        }

        // Each card reveals cleanly as the user scrolls into view
        const cards = track.querySelectorAll(".portfolio-card");
        cards.forEach((card) => {
          const innerReveal = card.querySelector(".image-reveal-inner");
          const imgTarget = card.querySelector(".image-scale-target");

          const cardTl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });

          cardTl.from(card, {
            y: 24,
            opacity: 0,
            duration: 0.75,
            ease: "power3.out",
            clearProps: "all",
          });

          if (innerReveal) {
            cardTl.fromTo(
              innerReveal,
              { clipPath: "inset(18% 0% 0% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.05,
                ease: "power3.out",
                clearProps: "clipPath",
              },
              0
            );
          }

          if (imgTarget) {
            cardTl.fromTo(
              imgTarget,
              { scale: 1.05 },
              {
                scale: 1,
                duration: 1.15,
                ease: "power3.out",
                clearProps: "transform",
              },
              0
            );
          }
        });
      });

      // 3. ENTRANCE ANIMATION FOR MONUMENTAL CONTACT SLIDE
      if (transitionSectionRef.current) {
        const transTl = gsap.timeline({
          scrollTrigger: {
            trigger: transitionSectionRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });

        if (transitionImageRef.current) {
          transTl.fromTo(
            transitionImageRef.current,
            { scale: 1.06, opacity: 0.8 },
            {
              scale: 1,
              opacity: 1,
              duration: 1.25,
              ease: "power2.out",
              clearProps: "transform,opacity",
            },
            0
          );
        }

        if (transitionHeaderRef.current?.children) {
          transTl.from(
            transitionHeaderRef.current.children,
            {
              y: 26,
              opacity: 0,
              stagger: 0.12,
              duration: 0.85,
              ease: "power3.out",
              clearProps: "all",
            },
            0.1
          );
        }
      }
    }, rootRef);

    // Initial trigger refresh to lock in calculated positions
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [isReducedMotion]);

  return (
    <div id="portfolio" ref={rootRef} className="relative z-30 bg-bg-base text-fg-base">
      {/* Pinned Horizontal Architectural Portfolio (Matches reference video Frame 00:09, 00:10, 00:11) */}
      <section
        ref={pinContainerRef}
        className={`relative z-30 w-full bg-bg-base overflow-hidden border-t border-border ${
          isReducedMotion
            ? "py-12"
            : "md:h-screen md:max-h-[100vh] md:flex md:flex-col md:justify-between pt-6 sm:pt-8 pb-4 sm:pb-6"
        }`}
        aria-label="Horizontal Architectural Portfolio"
      >
        {/* Pinned Section Header */}
        <div ref={headerRef} className="shrink-0 px-6 sm:px-16 lg:px-24 pb-2 sm:pb-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber font-semibold">
                  LITTLE MORE
                </span>
                <span className="h-3 w-px bg-black/20" aria-hidden="true" />
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted font-medium">
                  RECENT PROJECTS
                </span>
              </div>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-graphite tracking-tight leading-[1.08]">
                Our Portfolio
              </h2>
            </div>

            <div className="hidden sm:flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted pb-1">
              <span>Scroll to explore</span>
              <span className="text-amber">&rarr;</span>
            </div>
          </div>
        </div>

        {/* Project Track */}
        <div
          ref={trackRef}
          className={`flex my-auto ${
            isReducedMotion
              ? "flex-col gap-16 px-6 sm:px-12"
              : "flex-col md:flex-row items-stretch md:items-center gap-10 md:gap-14 lg:gap-20 px-6 md:pl-16 lg:pl-24 md:pr-24 lg:pr-36 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-6 md:pb-0 will-change-transform"
          }`}
        >
          {PORTFOLIO_PROJECTS.map((project) => (
            <article
              key={project.id}
              className={`portfolio-card shrink-0 flex flex-col justify-center space-y-3.5 snap-center ${project.widthClass}`}
            >
              {/* Image Frame with Inner Clip Reveal Container */}
              <div
                className={`group relative ${project.aspectClass} w-full max-h-[44vh] md:max-h-[400px] overflow-hidden`}
              >
                <div className="image-reveal-inner absolute inset-0 h-full w-full will-change-[clip-path]">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 88vw, (max-width: 1200px) 60vw, 50vw"
                    className="image-scale-target object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Top Category Badge */}
                <div className="portfolio-badge absolute top-4 left-4 z-10 flex items-center gap-2.5 rounded-md bg-white px-3 py-1.5 text-[11px] font-sans uppercase tracking-[0.14em] text-graphite">
                  <span className="font-mono text-xs font-bold text-amber">{project.number}</span>
                  <span className="h-3 w-px bg-black/15" aria-hidden="true" />
                  <span className="font-semibold text-graphite">{project.category}</span>
                </div>
              </div>

              {/* Project Headline & Context */}
              <div className="portfolio-card-info flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pt-0.5 px-1">
                <div className="space-y-1">
                  <h3 className="font-sans text-xl sm:text-2xl lg:text-3xl font-bold text-graphite tracking-tight">
                    {project.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-muted/90 font-normal leading-relaxed max-w-lg">
                    {project.description}
                  </p>
                </div>

                <Link
                  href="#contact"
                  className="group/link inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-graphite hover:text-black font-semibold pt-1 sm:pt-0 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-graphite"
                >
                  <span className="border-b border-graphite/40 pb-0.5 group-hover/link:border-black transition-colors">
                    Explore
                  </span>
                  <span
                    className="transition-transform duration-200 group-hover/link:translate-x-1"
                    aria-hidden="true"
                  >
                    &rarr;
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Minimal Progress Indicator & Track Status (Desktop only) */}
        {!isReducedMotion && (
          <div
            ref={statusBarRef}
            className="hidden md:flex shrink-0 items-center justify-between px-6 sm:px-16 lg:px-24 pt-2.5 pb-1 border-t border-border/60 text-xs font-mono text-graphite transition-opacity duration-200"
          >
            <div className="flex items-center gap-3">
              <span
                ref={activeIndexRef}
                className="font-bold text-base text-graphite font-sans"
              >
                0{activeProject}
              </span>
              <span className="text-muted/60">/ 0{PORTFOLIO_PROJECTS.length}</span>
              <span className="text-muted/60 text-[11px] uppercase tracking-widest ml-3">
                Scroll to navigate showcase
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-36 sm:w-48 lg:w-64 h-0.5 bg-black/10 overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full bg-graphite transition-all duration-100"
                  style={{ width: "25%" }}
                />
              </div>
              <span className="text-[11px] text-muted/80 tracking-widest uppercase">
                Horizontal Scroll
              </span>
            </div>
          </div>
        )}
      </section>

      {/* SECTION TRANSITION: FULL-SCREEN CINEMATIC INTERIOR & CONTACT (Matches reference video Frame 00:12-00:15) */}
      <section
        id="contact"
        ref={transitionSectionRef}
        className="relative z-30 w-full min-h-screen flex flex-col justify-between bg-noir text-white overflow-hidden"
        aria-label="Creating Spaces That Feel Like You"
      >
        {/* Background Full-Bleed Image with Subtle Scale Settle */}
        <div ref={transitionImageRef} className="absolute inset-0 h-full w-full">
          <Image
            src="/images/portfolio/transition-interior.jpg"
            alt="Warm architectural interior with atmospheric evening lighting"
            fill
            sizes="100vw"
            priority
            className="object-cover object-center brightness-75 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/40 to-noir/60" />
        </div>

        {/* Top Spacer */}
        <div className="relative z-10 pt-16 sm:pt-24" />

        {/* Central Monumental Headline & Contact Information (Matching Frame 00:12-00:15) */}
        <Container className="relative z-10 my-auto py-12">
          <div
            ref={transitionHeaderRef}
            className="max-w-4xl space-y-8 text-left"
          >
            {/* Two-part Badge */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-md font-sans text-xs uppercase tracking-[0.18em] text-graphite font-semibold bg-white px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                LET&apos;S TALK
              </span>
              <span className="h-3 w-px bg-white/30" aria-hidden="true" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/70 font-medium">
                START A PROJECT
              </span>
            </div>

            {/* Monumental Headline */}
            <h2 className="font-sans text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-bold text-white tracking-tight leading-[1.02] drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
              Creating a
              <br />
              Cozy Interior
            </h2>

            {/* Large Prominent Clickable Contact Phone Number */}
            <div className="pt-2">
              <a
                href="tel:+14155550192"
                className="font-sans text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white hover:text-amber transition-colors drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)] inline-block"
              >
                +1 415 555 0192
              </a>
            </div>

            {/* Contact Us Button with + Square Icon */}
            <div className="pt-3">
              <a
                href="mailto:contact@gb-builders.internal?subject=Start%20Your%20Project%20Inquiry"
                className="group inline-flex items-center gap-3.5 rounded-xl bg-white px-7 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-graphite shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-all duration-300 hover:bg-ivory hover:scale-[1.04] active:scale-[0.98]"
              >
                <span>Contact Us</span>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-graphite text-white text-sm font-bold transition-transform duration-200 group-hover:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </a>
            </div>
          </div>
        </Container>

        {/* Ambient transitional accent seamlessly leading into SiteFooter */}
        <div className="relative z-10 w-full border-t border-white/10 bg-noir/50 backdrop-blur-md py-4 sm:py-5">
          <Container>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-widest text-white/50">
              <span>Bespoke Architecture &middot; Interior Design &middot; Turnkey Construction</span>
              <span className="text-amber/80 flex items-center gap-1.5">
                <span>Studio Information &amp; Navigation Below</span>
                <span aria-hidden="true">&darr;</span>
              </span>
            </div>
          </Container>
        </div>
      </section>
    </div>
  );
}
