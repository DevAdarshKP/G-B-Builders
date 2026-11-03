import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  narrow?: boolean;
}

/**
 * Editorial layout container with standard responsive horizontal padding.
 */
export function Container({
  children,
  narrow = false,
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16",
        narrow ? "max-w-(--width-container-narrow)" : "max-w-(--width-container)",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
