import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  theme?: "light" | "dark";
}

/**
 * Editorial typography section heading.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  theme = "light",
  className,
  ...props
}: SectionHeadingProps) {
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" ? "text-center mx-auto" : "text-left",
        className
      )}
      {...props}
    >
      {eyebrow && (
        <p
          className={cn(
            "text-xs tracking-[0.25em] uppercase font-sans font-medium",
            isDark ? "text-amber" : "text-amber"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight",
          isDark ? "text-ivory" : "text-graphite"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-base sm:text-lg max-w-2xl font-light leading-relaxed",
            align === "center" && "mx-auto",
            isDark ? "text-ivory/70" : "text-muted"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
