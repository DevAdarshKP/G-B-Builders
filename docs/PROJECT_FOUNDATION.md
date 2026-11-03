# Project Foundation Documentation: architecture-studio

## 1. Selected Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.4.3` | React Server Components, Turbopack, route handling |
| **Runtime / Library** | React &amp; React DOM | `19.3.0` | Declarative UI component architecture |
| **Language** | TypeScript | `5.x` (Strict mode) | Type safety, strict null checks, build-time contract enforcement |
| **Styling** | Tailwind CSS | `v4.x` | CSS-first `@theme` configuration, utility classes |
| **Animation Engine** | GSAP &amp; `@gsap/react` | `^3.15.0` &amp; `^2.1.2` | Core animation engine, timeline control, React integration |
| **Scroll Trigger** | GSAP ScrollTrigger | Included with GSAP | Scrubbed scroll animations, pinning, scroll-progress triggers |
| **Icons** | Lucide React | `^1.61.0` | Minimal functional editorial icons |
| **Utilities** | `clsx` &amp; `tailwind-merge` | `^2.1.1` &amp; `^3.7.0` | Safe class name concatenation and Tailwind conflict resolution |

---

## 2. Project Directory Structure

```text
G&B/
├── eslint.config.mjs              # Flat ESLint configuration with Next.js core web vitals and TypeScript rules
├── next.config.ts                 # Next.js configuration with Turbopack CSS loaders
├── package.json                   # Dependency definitions and scripts
├── tsconfig.json                  # Strict TypeScript configuration with @/* path alias
│
├── docs/
│   └── PROJECT_FOUNDATION.md      # Architecture studio foundation documentation
│
├── public/
│   ├── favicon.ico
│   ├── images/                    # Architectural stills, material swatches, project covers (.gitkeep)
│   ├── videos/                    # Construction time-lapses, drone footage, loop assets (.gitkeep)
│   └── posters/                   # Fallback poster frames for HTML5 video elements (.gitkeep)
│
└── src/
    ├── app/
    │   ├── globals.css            # Tailwind v4 import, design tokens, resets, selection, focus, reduced-motion
    │   ├── layout.tsx             # Root layout with Cormorant Garamond & Inter, metadata, ScrollAnimationProvider
    │   ├── not-found.tsx          # Architectural branded 404 handler
    │   └── page.tsx               # Foundation entry page validating tokens, typography, and system matrix
    │
    ├── components/
    │   ├── animations/
    │   │   └── ScrollAnimationProvider.tsx  # Client lifecycle provider for GSAP and ScrollTrigger cleanup
    │   ├── layout/
    │   │   ├── SiteHeader.tsx     # Editorial header with brand mark & navigation anchors
    │   │   └── SiteFooter.tsx     # Architectural footer with palette styling
    │   ├── sections/              # Planned phase 2 landing page sections (HeroSection, ArchitecturalReveal, etc.)
    │   └── ui/
    │       ├── Container.tsx      # Standardized responsive layout container
    │       └── SectionHeading.tsx # Editorial serif section heading component with eyebrow and description
    │
    ├── data/
    │   ├── projects.ts            # Project data contract & foundation portfolio data
    │   └── services.ts            # Architectural service data contract & foundation offerings
    │
    └── lib/
        ├── animations.ts          # GSAP client registration, reduced-motion detection, easing tokens
        └── utils.ts               # cn() utility merging clsx and tailwind-merge
```

---

## 3. Brand Design System & Color Tokens

Established in `src/app/globals.css` using Tailwind CSS v4 `@theme`:

| Token | CSS Variable | Hex Value | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Forest** | `--color-forest` | `#182D25` | Deep architectural green, dark sections, high-contrast buttons |
| **Ivory** | `--color-ivory` | `#F4F0E8` | Limestone base background, inverse text on dark surfaces |
| **Amber** | `--color-amber` | `#C77A43` | Burnt oxidized amber accent, focus rings, status indicators, badges |
| **Graphite** | `--color-graphite` | `#292A27` | Primary dark editorial text and high-contrast structural borders |
| **Muted** | `--color-muted` | `#77766E` | Secondary descriptive text, metadata, captions |
| **Border** | `--color-border` | `#DCD7CD` | Subtle architectural dividing lines and container borders |

### Typography Tokens

- **Display Serif**: `Cormorant Garamond` via `next/font/google` (`--font-cormorant`, fallback: Georgia, serif).
- **Interface & Body Sans**: `Inter` via `next/font/google` (`--font-inter`, fallback: system-ui, sans-serif).

---

## 4. Operational Scripts & Commands

All scripts are configured in `package.json` and execute via npm:

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Starts Next.js with Turbopack development server on `http://localhost:3000`.

### Run TypeScript Type Check
```bash
npm run typecheck
```
Executes `tsc --noEmit` under strict TypeScript rules without compiling files.

### Run Linting
```bash
npm run lint
```
Invokes ESLint 9 using the flat configuration in `eslint.config.mjs`.

### Generate Production Build
```bash
npm run build
```
Generates the optimized Next.js production build using Turbopack.

### Start Production Server
```bash
npm run start
```
Runs the compiled application server.

### Extract Hero Construction Frames
```bash
npm run frames:hero
```
Executes `scripts/extract-hero-frames.mjs` using FFmpeg to extract 201 WebP frames (1600x900 @ 20 FPS, quality 76) from `public/videos/hero-construction.mp4` into `public/frames/hero-construction/` and writes `manifest.json`.

---

## 5. Media Asset Organization

Architectural media files should be placed according to the following conventions:

1. **`public/frames/hero-construction/`**:
   - `frame_0001.webp` through `frame_0201.webp`: Extracted 16:9 WebP construction sequence.
   - `manifest.json`: Frame count (201), dimensions (1600x900), FPS (20), source duration (10.033s).

2. **`public/images/`**:
   - `projects/`: High-resolution photography of completed buildings and interiors.
   - `transformations/`: Paired `before` and `after` images with identical aspect ratios for interactive reveal components.
   - `materials/`: Close-up textures (rammed earth, brushed bronze, smoked oak, bush-hammered stone).

3. **`public/videos/`**:
   - `hero-construction.mp4`: Source footage (1920x1080 @ 30 FPS, H.264, 10.033s).
   - Short-form, muted, autoplaying background loops (MP4 / WebM).

4. **`public/posters/`**:
   - `hero-construction-poster.webp`: High-fidelity static poster frame (frame 201) used for initial lazy-load and reduced-motion fallback.

---

## 6. Cinematic Construction Hero Architecture

The scroll-driven hero sequence is implemented in `src/components/sections/CinematicHero.tsx` supported by `src/lib/frameSequence.ts`:

- **HTML5 Canvas Rendering**: Renders a single `<canvas>` element scaled by `devicePixelRatio` (capped at 2) with `drawCoverFrame()` for zero-distortion 16:9 object-fit cover.
- **Scroll-to-Frame Mapping**: GSAP ScrollTrigger maps scroll progress directly to frame index:
  `frameIndex = Math.round(progress * (frameCount - 1))`
- **Pinning & Scrubbing**: Hero stage pins at `top top` with scrub of `0.35` and releases at `+=230%` (desktop) or `+=170%` (mobile) directly into the `#portfolio` section.
- **Bounded Frame Cache**: `FrameSequenceManager` maintains an in-memory sliding window around the active frame (max 65 frames) with background prefetching and automatic eviction of distant frames.
- **Zero-Blank Guarantee**: If a target frame has not yet finished decoding during rapid scrubbing, the canvas retains the last valid rendered frame.
- **Progressive Editorial Overlay**: Opening headline and CTA fade gracefully between 20% and 45% scroll progress to expose the rising architectural structure. At completion (>85%), a 'Turnkey Execution' completed residence card and live phase HUD appear.
- **Accessibility & Reduced Motion**: Automatically queries `prefers-reduced-motion: reduce` via `useSyncExternalStore`. When active, pinning is bypassed and the completed twilight residence is displayed statically in normal document flow.

---

## 7. Known Environment Considerations & Resolutions

1. **Windows Workspace Path with Ampersand (`G&B`)**:
   - On Windows, standard `cmd.exe` interprets `&` as a command separator. This causes npm's default `cmd-shim` scripts in `.bin` to break unless executed through a POSIX-compliant shell.
   - **Resolution Applied**: Configure user-level npmrc (`npm config set script-shell "C:\\Program Files\\Git\\bin\\bash.exe" --location=user`). Windows-specific shell paths must never be committed to project `.npmrc`, ensuring Linux-based CI/CD and Vercel environments use standard platform shells without path collisions.
2. **FFmpeg on Windows**:
   - Installed via WinGet (`Gyan.FFmpeg`). The extraction script `scripts/extract-hero-frames.mjs` locates the binary automatically via WinGet package directory or system PATH.
