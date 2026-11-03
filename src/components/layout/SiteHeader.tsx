"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Our Work", href: "#portfolio" },
];

const INACTIVITY_TIMEOUT_MS = 3000;

/**
 * Centered Floating Pop-In / Pop-Out Navbar.
 * - Centered horizontally across all sections with simple refined border radius.
 * - Hides smoothly when user is inactive on the screen/site.
 * - Shows immediately on any interaction (mouse movement, scroll, touch, keypress).
 * - Remains visible while hovered or when mobile menu is open.
 * - Hides smoothly when scrolling down, pops in smoothly when scrolling up.
 * - Renders pure white with dark typography when scrolled.
 * - Transparent with backdrop blur and white typography when at the top of the hero.
 */
export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isInactiveRef = useRef(false);
  const isHoveredRef = useRef(false);
  const mobileMenuOpenRef = useRef(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync refs to avoid stale closures in event listeners
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    mobileMenuOpenRef.current = mobileMenuOpen;
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset inactivity timer and revive navbar if it was inactive
  const resetInactivityTimer = useCallback(() => {
    if (isInactiveRef.current) {
      isInactiveRef.current = false;
      setIsInactive(false);
      setIsVisible(true);
    }

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      if (!isHoveredRef.current && !mobileMenuOpenRef.current) {
        isInactiveRef.current = true;
        setIsInactive(true);
      }
    }, INACTIVITY_TIMEOUT_MS);
  }, []);

  // Inactivity tracking across the screen/site
  useEffect(() => {
    const activityEvents = [
      "mousemove",
      "mousedown",
      "pointerdown",
      "keydown",
      "touchstart",
      "touchmove",
      "wheel",
    ];

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Start inactivity countdown on mount
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [resetInactivityTimer]);

  // Scroll detection: hide on scroll down, smoothly pop in from top on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNavbarState = () => {
      const scrollY = window.scrollY;

      if (scrollY <= 40) {
        // At the top of the page (Hero section)
        setIsVisible(true);
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
        const delta = scrollY - lastScrollY;

        if (delta > 8 && scrollY > 90) {
          // Scrolling down: smoothly hide navbar
          setIsVisible(false);
          setMobileMenuOpen(false);
        } else if (delta < -6) {
          // Scrolling up: smoothly pop out navbar from top
          setIsVisible(true);
        }
      }

      lastScrollY = Math.max(0, scrollY);
      ticking = false;
    };

    const handleScroll = () => {
      resetInactivityTimer();
      if (!ticking) {
        window.requestAnimationFrame(updateNavbarState);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateNavbarState();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [resetInactivityTimer]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    isHoveredRef.current = true;
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (isInactiveRef.current) {
      isInactiveRef.current = false;
      setIsInactive(false);
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    isHoveredRef.current = false;
    resetInactivityTimer();
  };

  const handleFocus = () => {
    setIsHovered(true);
    isHoveredRef.current = true;
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (isInactiveRef.current) {
      isInactiveRef.current = false;
      setIsInactive(false);
      setIsVisible(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsHovered(false);
      isHoveredRef.current = false;
      resetInactivityTimer();
    }
  };

  // Navbar shows when:
  // 1. Mobile drawer is open
  // 2. OR user is hovering or keyboard-focused on navbar
  // 3. OR user is active (!isInactive) and scroll direction permits (isVisible)
  const showNavbar = mobileMenuOpen || isHovered || (!isInactive && isVisible);

  return (
    <header
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm sm:max-w-none sm:w-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        showNavbar
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-24 sm:-translate-y-28 opacity-0 pointer-events-none"
      }`}
      aria-label="Main Site Navigation"
    >
      <div
        className={`flex items-center justify-between sm:justify-center gap-6 sm:gap-8 md:gap-10 rounded-xl px-5 sm:px-8 py-2.5 sm:py-3 transition-all duration-300 ${
          isScrolled
            ? "bg-white text-graphite shadow-[0_10px_35px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.06)] border border-black/8"
            : "bg-black/10 backdrop-blur-xs text-white border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
        }`}
      >
        {/* Brand: G&B */}
        <Link
          href="/"
          className={`font-sans text-base sm:text-lg font-bold tracking-[0.18em] uppercase transition-colors ${
            isScrolled
              ? "text-graphite hover:text-black"
              : "text-white hover:opacity-90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
          }`}
          aria-label="G&B Builders Homepage"
        >
          G&amp;B
        </Link>

        {/* Subtle vertical divider between brand and links on desktop */}
        <span
          className={`hidden sm:inline-block h-3.5 w-px transition-colors ${
            isScrolled ? "bg-black/15" : "bg-white/25"
          }`}
          aria-hidden="true"
        />

        {/* Centered Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 lg:gap-8"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-xs font-semibold tracking-[0.14em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 ${
                isScrolled
                  ? "text-graphite/75 hover:text-black focus-visible:ring-black"
                  : "text-white/85 hover:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] focus-visible:ring-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={`flex h-8 w-8 items-center justify-center md:hidden transition-colors focus-visible:outline-none focus-visible:ring-1 ${
            isScrolled
              ? "text-graphite focus-visible:ring-black"
              : "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] focus-visible:ring-white"
          }`}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div
          className={`mt-2 w-full rounded-xl p-4 shadow-2xl backdrop-blur-lg md:hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
            isScrolled
              ? "bg-white text-graphite border border-black/10 shadow-xl"
              : "bg-noir/95 text-ivory border border-ivory/15"
          }`}
        >
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                  isScrolled
                    ? "text-graphite/80 hover:bg-black/5 hover:text-black"
                    : "text-ivory/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
