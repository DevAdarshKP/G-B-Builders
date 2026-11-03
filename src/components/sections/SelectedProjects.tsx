import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PROJECTS_FOUNDATION } from "@/data/projects";

export function SelectedProjects() {
  return (
    <section id="portfolio" className="relative z-20 bg-bg-base py-24 sm:py-32 border-b border-border">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-border/80">
          <SectionHeading
            eyebrow="Curated Portfolio"
            title="Selected Architectural Works"
            description="A monograph of built environments exploring spatial purity, monolithic materiality, and contextual integration."
          />
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-muted font-mono">
              01 &mdash; 03 of 12 Projects
            </span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROJECTS_FOUNDATION.map((project, index) => {
            // Use real extracted frames for the hero-featured residence
            const imageSrc =
              index === 0
                ? "/frames/hero-construction/frame_0201.webp"
                : index === 1
                ? "/frames/hero-construction/frame_0100.webp"
                : "/frames/hero-construction/frame_0001.webp";

            return (
              <article
                key={project.id}
                className="group flex flex-col border border-border bg-bg-base transition-all duration-300 hover:border-graphite"
              >
                {/* Project Image Frame */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-noir/10">
                  <Image
                    src={imageSrc}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2 rounded-md bg-white px-3 py-1 text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-graphite">
                    <span className="font-mono text-amber font-bold">0{index + 1}</span>
                    <span className="h-2 w-px bg-black/15" />
                    <span>{project.category}</span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="flex flex-1 flex-col justify-between p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-amber">
                      {project.location}
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-graphite group-hover:text-amber transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-muted font-light leading-relaxed">
                      {project.excerpt}
                    </p>
                  </div>

                  {project.metrics && (
                    <div className="flex items-center justify-between border-t border-border pt-4 text-[11px] font-mono text-muted">
                      <span>{project.metrics.area}</span>
                      <span>&bull;</span>
                      <span>{project.metrics.duration}</span>
                      <span>&bull;</span>
                      <span>{project.metrics.completion}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="#contact"
            className="inline-flex items-center justify-center border border-noir bg-transparent px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-noir transition-colors hover:bg-noir hover:text-ivory"
          >
            Commission an Architecture Inquiry
          </Link>
        </div>
      </Container>
    </section>
  );
}
