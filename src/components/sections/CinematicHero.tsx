"use client";

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { registerGSAP, ScrollTrigger } from "@/lib/animations";
import {
  HERO_FRAME_MANIFEST,
  FrameSequenceManager,
  drawCoverFrame,
} from "@/lib/frameSequence";

const TOTAL_FRAMES = HERO_FRAME_MANIFEST.frameCount; // 201

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

export function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<FrameSequenceManager | null>(null);

  const [currentProgress, setCurrentProgress] = useState(0);

  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // References to keep drawing state synchronous and avoid React state lag
  const activeFrameIndexRef = useRef(0);
  const lastDrawnImageRef = useRef<HTMLImageElement | null>(null);
  const isRenderingRef = useRef(false);

  // Canvas drawing routine
  const renderCurrentFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const manager = managerRef.current;
    if (!manager) return;

    const frameIdx = activeFrameIndexRef.current;
    const img = manager.getFrame(frameIdx);

    if (img && img.complete && img.naturalWidth > 0) {
      lastDrawnImageRef.current = img;
      drawCoverFrame(ctx, img, canvas.width, canvas.height);
    } else if (lastDrawnImageRef.current) {
      // Retain last successfully drawn frame to prevent blank flashes
      drawCoverFrame(ctx, lastDrawnImageRef.current, canvas.width, canvas.height);
    }
  }, []);

  // Window resize handler with DPR capping to prevent excessive GPU memory usage
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    renderCurrentFrame();
  }, [renderCurrentFrame]);

  useEffect(() => {
    registerGSAP();

    // Initialize the bounded cache manager
    const manager = new FrameSequenceManager(TOTAL_FRAMES, HERO_FRAME_MANIFEST.basePath, 65);
    managerRef.current = manager;

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    let isMounted = true;
    let scrollTriggerInstance: ScrollTrigger | null = null;

    // Load initial frame immediately
    const initialIndex = isReducedMotion ? TOTAL_FRAMES - 1 : 0;
    activeFrameIndexRef.current = initialIndex;

    manager.loadFrame(initialIndex).then((img) => {
      if (!isMounted) return;
      lastDrawnImageRef.current = img;
      renderCurrentFrame();
    });

    // Preload initial batch in the background
    const initialBatchSize = isReducedMotion ? 1 : 25;
    manager.preloadInitialBatch(initialBatchSize);

    if (!isReducedMotion) {
      // Set up GSAP ScrollTrigger for pinned scrubbed playback
      const isMobile = window.innerWidth < 768;
      const scrollDistance = isMobile ? "+=170%" : "+=230%";

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: scrollDistance,
        pin: true,
        scrub: 0.35,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          setCurrentProgress(p);

          // Directly map scroll progress to frame index
          const targetIndex = Math.min(
            TOTAL_FRAMES - 1,
            Math.max(0, Math.round(p * (TOTAL_FRAMES - 1)))
          );

          if (targetIndex !== activeFrameIndexRef.current) {
            activeFrameIndexRef.current = targetIndex;
            manager.updateWindow(targetIndex, 24, 12);

            if (!isRenderingRef.current) {
              isRenderingRef.current = true;
              requestAnimationFrame(() => {
                renderCurrentFrame();
                isRenderingRef.current = false;
              });
            }
          }
        },
      });

      // Refresh triggers after DOM settles
      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);

      return () => {
        isMounted = false;
        clearTimeout(refreshTimeout);
        window.removeEventListener("resize", handleResize);
        if (scrollTriggerInstance) {
          scrollTriggerInstance.kill();
        }
        manager.destroy();
      };
    }

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      manager.destroy();
    };
  }, [handleResize, renderCurrentFrame, isReducedMotion]);

  // Progressive opacity transitions for hero typography
  // 0% -> 10%: 1.0 opacity
  // 10% -> 28%: Smooth fade out
  // > 28%: Hidden to showcase rising architectural structure
  const scrollFadeProgress = Math.max(0, Math.min(1, (currentProgress - 0.1) / 0.18));
  const textOpacity = 1 - scrollFadeProgress;
  const textTranslateY = -(scrollFadeProgress * 32);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-noir select-none overflow-hidden"
      style={{ minHeight: "100vh" }}
      aria-label="Cinematic Construction Journey"
    >
      {/* Background Poster Fallback (Instantly visible from SSR without JS dependency) */}
      <Image
        src="/posters/hero-construction-poster.webp"
        alt="G&B Builders Construction Initial Frame"
        fill
        priority
        className="absolute inset-0 h-full w-full object-cover z-0 pointer-events-none"
      />

      {/* Background HTML5 Canvas - Pure Original Quality Scrubber */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-cover z-10 block"
        aria-hidden="true"
      />

      {/* Central Hero Composition (Visible immediately without artificial delays) */}
      <div
        className="relative z-20 flex h-screen w-full flex-col items-center justify-center px-6 text-center transition-all duration-300"
        style={{
          opacity: isReducedMotion ? 1 : textOpacity,
          transform: isReducedMotion ? "none" : `translateY(${textTranslateY}px)`,
          pointerEvents: textOpacity < 0.1 ? "none" : "auto",
        }}
      >
        <div className="max-w-4xl space-y-6 pt-12 sm:pt-8">
          {/* Eyebrow */}
          <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.3em] text-white/80 font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] opacity-100 translate-y-0 transition-all duration-500">
            Architecture &amp; Turnkey Construction
          </p>

          {/* Monumental Headline: G&B Builders */}
          <h1 className="font-sans text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-bold tracking-tight text-white leading-[1.02] drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] opacity-100 translate-y-0 transition-all duration-500">
            G&amp;B
            <br />
            Builders
          </h1>

          {/* Supporting Statement */}
          <p className="font-sans text-sm sm:text-base md:text-lg text-white/95 font-normal tracking-wide max-w-lg mx-auto leading-relaxed drop-shadow-[0_2px_16px_rgba(0,0,0,0.95)] opacity-100 translate-y-0 transition-all duration-500">
            We design and build your house, from bare land.
          </p>

          {/* Single White CTA Button */}
          <div className="pt-3 opacity-100 translate-y-0 transition-all duration-500">
            <Link
              href="#contact"
              className="group inline-flex items-center gap-3.5 rounded-xl bg-white px-7 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-graphite shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-ivory hover:scale-[1.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Start your project</span>
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md bg-graphite text-white text-xs transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              >
                ↗
              </span>
            </Link>
          </div>
        </div>

        {/* Minimal Scroll Cue at Bottom Center */}
        <div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/70 transition-opacity duration-300 pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
          style={{
            opacity: currentProgress > 0.05 ? 0 : 1,
          }}
        >
          <ArrowDown className="h-3.5 w-3.5 animate-bounce text-white" />
          <span className="font-sans text-[11px] font-medium tracking-widest uppercase text-white/80">
            Scroll to build
          </span>
        </div>
      </div>

      {/* Reduced-Motion Fallback Static Banner */}
      {isReducedMotion && (
        <div className="absolute bottom-6 right-6 z-20 rounded-md bg-white px-4 py-2 text-xs font-sans font-medium text-graphite">
          Reduced motion active &mdash; displaying completed residence
        </div>
      )}
    </section>
  );
}
