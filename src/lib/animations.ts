import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let isRegistered = false;

/**
 * Safely registers GSAP plugins on the client side.
 * Prevents duplicate registrations during hot module replacement.
 */
export function registerGSAP(): typeof gsap {
  if (typeof window !== "undefined" && !isRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    // Configure defaults for architectural transitions
    gsap.defaults({
      ease: "power2.out",
      duration: 0.8,
    });
    isRegistered = true;
  }
  return gsap;
}

/**
 * Checks whether the user has requested reduced motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Standard animation tokens for the architecture studio aesthetic.
 */
export const ANIMATION_TOKENS = {
  durations: {
    instant: 0.2,
    fast: 0.4,
    medium: 0.8,
    slow: 1.4,
    cinematic: 2.2,
  },
  easings: {
    architectural: "power3.out",
    reveal: "expo.out",
    editorial: "power2.inOut",
    scrub: "none",
  },
} as const;

export { gsap, ScrollTrigger };
