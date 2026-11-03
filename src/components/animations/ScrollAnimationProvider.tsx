"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { registerGSAP, gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/animations";

interface ScrollAnimationProviderProps {
  children: ReactNode;
}

/**
 * Initializes Lenis smooth scrolling synchronized with GSAP ScrollTrigger.
 * - Drives Lenis RAF via GSAP ticker for frame-perfect animation lockstep.
 * - Synchronizes scroll events directly with ScrollTrigger.update.
 * - Disables lagSmoothing to eliminate scroll-snapping and visual stutter.
 * - Handles anchor link clicks with silky smooth easing.
 * - Respects prefers-reduced-motion.
 */
export function ScrollAnimationProvider({ children }: ScrollAnimationProviderProps) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    registerGSAP();

    const isReduced = prefersReducedMotion();

    function update(time: number) {
      if (!isReduced) {
        lenisRef.current?.lenis?.raf(time * 1000);
      }
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const lenis = lenisRef.current?.lenis;
    if (lenis && !isReduced) {
      lenis.on("scroll", ScrollTrigger.update);
    }

    // Smoothly handle in-page anchor links (e.g., #portfolio, #about, #services)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const targetElement = document.querySelector(href);
        if (targetElement && lenisRef.current?.lenis) {
          e.preventDefault();
          lenisRef.current.lenis.scrollTo(targetElement as HTMLElement, {
            offset: 0,
            duration: 1.4,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    // Initial trigger refresh
    ScrollTrigger.refresh();

    // Refresh when fonts are loaded
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    // Refresh when all assets/images finish loading
    const handleLoad = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("load", handleLoad);

    // Staggered refreshes to catch progressive Next.js image decodes and layout changes
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 200);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 600);
    const t3 = setTimeout(() => ScrollTrigger.refresh(), 1200);
    const t4 = setTimeout(() => ScrollTrigger.refresh(), 2500);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("load", handleLoad);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.5,
      }}
    >
      {children}
    </ReactLenis>
  );
}
