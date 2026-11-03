/**
 * Architecture Studio — Cinematic Hero Frame Sequence Manager
 * Manages frame URL resolution, bounded in-memory image cache, and canvas rendering.
 */

export interface FrameManifest {
  frameCount: number;
  width: number;
  height: number;
  aspectRatio: number;
  basePath: string;
}

export const HERO_FRAME_MANIFEST: FrameManifest = {
  frameCount: 201,
  width: 1600,
  height: 900,
  aspectRatio: 1600 / 900,
  basePath: "/frames/hero-construction",
};

/**
 * Returns the public URL for a 0-indexed frame.
 * e.g., index 0 -> "/frames/hero-construction/frame_0001.webp"
 */
export function getFrameUrl(index: number, basePath = HERO_FRAME_MANIFEST.basePath): string {
  const frameNumber = String(index + 1).padStart(4, "0");
  return `${basePath}/frame_${frameNumber}.webp`;
}

/**
 * Bounded image cache to prevent unbounded memory growth during scrubbed scrolling.
 * Employs a sliding window around the active frame index and evicts distant frames.
 */
export class FrameSequenceManager {
  private cache = new Map<number, HTMLImageElement>();
  private loadingSet = new Set<number>();
  private readonly maxCacheSize: number;
  private readonly totalFrames: number;
  private readonly basePath: string;
  private isDestroyed = false;

  constructor(
    totalFrames = HERO_FRAME_MANIFEST.frameCount,
    basePath = HERO_FRAME_MANIFEST.basePath,
    maxCacheSize = 60
  ) {
    this.totalFrames = totalFrames;
    this.basePath = basePath;
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Preloads an initial batch of frames necessary to begin interactive playback.
   */
  public async preloadInitialBatch(
    batchSize = 25,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<void> {
    const targetCount = Math.min(batchSize, this.totalFrames);
    let loadedCount = 0;

    const promises: Promise<void>[] = [];
    for (let i = 0; i < targetCount; i++) {
      promises.push(
        this.loadFrame(i).then(() => {
          loadedCount++;
          if (onProgress) {
            onProgress(loadedCount, targetCount);
          }
        }).catch(() => {
          // Graceful fallback: continue even if an individual frame fails
          loadedCount++;
          if (onProgress) {
            onProgress(loadedCount, targetCount);
          }
        })
      );
    }

    await Promise.all(promises);
  }

  /**
   * Loads a single frame into memory.
   */
  public loadFrame(index: number): Promise<HTMLImageElement> {
    if (this.cache.has(index)) {
      return Promise.resolve(this.cache.get(index)!);
    }

    if (this.isDestroyed || index < 0 || index >= this.totalFrames) {
      return Promise.reject(new Error(`Invalid frame index: ${index}`));
    }

    if (this.loadingSet.has(index)) {
      return new Promise((resolve, reject) => {
        const check = () => {
          if (this.cache.has(index)) {
            resolve(this.cache.get(index)!);
          } else if (!this.loadingSet.has(index)) {
            reject(new Error(`Frame ${index} failed to load`));
          } else {
            setTimeout(check, 16);
          }
        };
        check();
      });
    }

    this.loadingSet.add(index);
    const img = new Image();
    img.decoding = "async";

    return new Promise((resolve, reject) => {
      img.onload = () => {
        this.loadingSet.delete(index);
        if (!this.isDestroyed) {
          this.cache.set(index, img);
          this.pruneCache(index);
          resolve(img);
        }
      };

      img.onerror = (err) => {
        this.loadingSet.delete(index);
        reject(err);
      };

      img.src = getFrameUrl(index, this.basePath);
    });
  }

  /**
   * Gets a loaded frame synchronously if present, or null.
   */
  public getFrame(index: number): HTMLImageElement | null {
    return this.cache.get(index) ?? null;
  }

  /**
   * Preloads a window of frames around the current index in the direction of scroll.
   */
  public updateWindow(currentIndex: number, lookahead = 20, lookbehind = 10): void {
    if (this.isDestroyed) return;

    const start = Math.max(0, currentIndex - lookbehind);
    const end = Math.min(this.totalFrames - 1, currentIndex + lookahead);

    for (let i = start; i <= end; i++) {
      if (!this.cache.has(i) && !this.loadingSet.has(i)) {
        this.loadFrame(i).catch(() => {
          // Non-blocking background fetch error
        });
      }
    }
  }

  /**
   * Evicts distant frames when cache exceeds maxCacheSize.
   */
  private pruneCache(activeCenterIndex: number): void {
    if (this.cache.size <= this.maxCacheSize) return;

    // Sort cached indexes by distance from active index (farthest first)
    const sortedEntries = Array.from(this.cache.keys()).sort(
      (a, b) => Math.abs(b - activeCenterIndex) - Math.abs(a - activeCenterIndex)
    );

    const removeCount = this.cache.size - this.maxCacheSize;
    for (let i = 0; i < removeCount; i++) {
      const idxToRemove = sortedEntries[i];
      // Keep frame 0 and final frame cached as anchors
      if (idxToRemove !== 0 && idxToRemove !== this.totalFrames - 1) {
        this.cache.delete(idxToRemove);
      }
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.cache.clear();
    this.loadingSet.clear();
  }
}

/**
 * Draws an image to a canvas respecting object-fit: cover while preserving the 16:9 ratio.
 */
export function drawCoverFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const imageAspect = img.naturalWidth / img.naturalHeight || HERO_FRAME_MANIFEST.aspectRatio;
  const canvasAspect = canvasWidth / canvasHeight;

  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (canvasAspect > imageAspect) {
    // Canvas is wider than image -> match width, crop height
    drawHeight = canvasWidth / imageAspect;
    offsetY = (canvasHeight - drawHeight) / 2;
  } else {
    // Canvas is taller than image -> match height, crop width
    drawWidth = canvasHeight * imageAspect;
    offsetX = (canvasWidth - drawWidth) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}
