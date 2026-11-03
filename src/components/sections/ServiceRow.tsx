"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { type EditorialService } from "@/data/services";
import { registerGSAP, gsap, prefersReducedMotion } from "@/lib/animations";

interface ServiceRowProps {
  service: EditorialService;
  priority?: boolean;
}

/**
 * Editorial Service Row Component.
 * Implements alternating image and text compositions with directional clip-path
 * image reveal and coordinated text + bullet item stagger matching the reference video.
 */
export function ServiceRow({ service, priority = false }: ServiceRowProps) {
  const rowRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;

    registerGSAP();
    const row = rowRef.current;
    const textEl = textRef.current;
    const imgFrame = imageFrameRef.current;
    if (!row || !textEl || !imgFrame) return;

    const ctx = gsap.context(() => {
      const innerReveal = imgFrame.querySelector(".image-reveal-inner");
      const imgTarget = imgFrame.querySelector(".image-scale-target");

      const tagEl = textEl.querySelector(".service-tag");
      const headingEl = textEl.querySelector(".service-heading");
      const descEl = textEl.querySelector(".service-desc");
      const bullets = textEl.querySelectorAll(".service-bullet");
      const linkEl = textEl.querySelector(".service-link");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // 1. Tag & Heading
      if (tagEl) {
        tl.from(tagEl, {
          y: 18,
          opacity: 0,
          duration: 0.65,
          ease: "power3.out",
          clearProps: "all",
        }, 0);
      }

      if (headingEl) {
        tl.from(headingEl, {
          y: 22,
          opacity: 0,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "all",
        }, 0.08);
      }

      // 2. Image Reveal (starts right alongside heading)
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
          0.05
        );
      }

      if (imgTarget) {
        tl.fromTo(
          imgTarget,
          { scale: 1.05 },
          {
            scale: 1,
            duration: 1.15,
            ease: "power3.out",
            clearProps: "transform",
          },
          0.05
        );
      }

      // 3. Description
      if (descEl) {
        tl.from(descEl, {
          y: 20,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          clearProps: "all",
        }, 0.18);
      }

      // 4. Staggered Bullets
      if (bullets.length > 0) {
        tl.from(bullets, {
          y: 16,
          opacity: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power3.out",
          clearProps: "all",
        }, 0.28);
      }

      // 5. Link
      if (linkEl) {
        tl.from(linkEl, {
          y: 14,
          opacity: 0,
          duration: 0.55,
          ease: "power3.out",
          clearProps: "all",
        }, 0.45);
      }
    }, row);

    return () => ctx.revert();
  }, []);

  return (
    <article
      ref={rowRef}
      className="group relative flex flex-col lg:flex-row items-center gap-10 sm:gap-14 lg:gap-16 xl:gap-20"
      aria-label={`${service.index} ${service.discipline}`}
    >
      {/* Text Column (42% width on desktop) */}
      <div
        ref={textRef}
        className={`w-full lg:w-[42%] space-y-5 ${
          service.imageOnRight ? "lg:order-1" : "lg:order-2"
        }`}
      >
        {/* Discipline Tag */}
        <div className="service-tag flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber font-medium">
            N&deg; {service.index} &mdash; {service.discipline}
          </span>
          <span className="h-px w-8 bg-amber/40" aria-hidden="true" />
        </div>

        {/* Editorial Heading */}
        <h3 className="service-heading font-sans text-3xl sm:text-4xl lg:text-[2.5rem] font-bold leading-[1.12] text-graphite tracking-tight">
          {service.heading}
        </h3>

        {/* Description */}
        <p className="service-desc font-sans text-sm sm:text-base text-muted font-normal leading-relaxed max-w-lg">
          {service.description}
        </p>

        {/* Deliverables List (Matching Frame 00:05, 00:06 of reference video) */}
        {service.bullets && service.bullets.length > 0 && (
          <ul className="space-y-2.5 pt-1">
            {service.bullets.map((bullet) => (
              <li
                key={bullet}
                className="service-bullet flex items-center gap-3 text-xs sm:text-sm font-sans text-graphite/85 font-medium"
              >
                <span className="h-1.5 w-1.5 bg-graphite/60 shrink-0" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Editorial Text Link */}
        <div className="service-link pt-2">
          <Link
            href={service.href}
            className="group/link inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-graphite hover:text-amber transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          >
            <span className="border-b border-graphite/30 pb-0.5 group-hover/link:border-amber transition-colors">
              {service.linkText}
            </span>
            <span
              className="text-sm font-sans transition-transform duration-200 group-hover/link:translate-x-1 group-hover/link:-translate-y-0.5 text-amber"
              aria-hidden="true"
            >
              ↗
            </span>
          </Link>
        </div>
      </div>

      {/* Image Column (58% width on desktop) */}
      <div
        className={`w-full lg:w-[58%] ${
          service.imageOnRight ? "lg:order-2" : "lg:order-1"
        }`}
      >
        <div
          ref={imageFrameRef}
          className="relative aspect-[16/10] w-full overflow-hidden"
        >
          <div className="image-reveal-inner absolute inset-0 h-full w-full will-change-[clip-path]">
            <Image
              src={service.imageSrc}
              alt={service.imageAlt}
              fill
              priority={priority}
              sizes="(max-width: 1024px) 100vw, (max-width: 1400px) 58vw, 800px"
              className="image-scale-target object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-104"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
