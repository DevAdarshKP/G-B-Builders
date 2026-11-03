import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center py-24">
      <Container narrow className="text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-amber font-medium">
          404 &mdash; Page Not Found
        </p>
        <h1 className="font-serif text-4xl sm:text-6xl text-graphite font-light">
          Structure Unresolved
        </h1>
        <p className="text-muted max-w-md mx-auto text-sm sm:text-base leading-relaxed font-light">
          The architectural plan you requested does not exist or has been relocated within the studio archives.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-noir bg-noir px-6 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-noir/90"
          >
            Return to Studio
          </Link>
        </div>
      </Container>
    </main>
  );
}
