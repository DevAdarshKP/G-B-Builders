import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function findFFmpegBinary() {
  // 1. Try PATH
  try {
    const whichCmd = process.platform === "win32" ? "where.exe ffmpeg" : "which ffmpeg";
    const stdout = execSync(whichCmd, { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" });
    const firstLine = stdout.trim().split(/\r?\n/)[0];
    if (firstLine && fs.existsSync(firstLine)) return firstLine;
  } catch {}

  // 2. Check WinGet package location on Windows
  if (process.platform === "win32" && process.env.LOCALAPPDATA) {
    const wingetBase = path.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Packages");
    if (fs.existsSync(wingetBase)) {
      try {
        const entries = fs.readdirSync(wingetBase, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.toLowerCase().includes("ffmpeg")) {
            const candidate = path.join(wingetBase, entry.name, "ffmpeg-9.0.2-full_build", "bin", "ffmpeg.exe");
            if (fs.existsSync(candidate)) return candidate;

            // Search one level down for bin/ffmpeg.exe
            const candidate2 = path.join(wingetBase, entry.name, "bin", "ffmpeg.exe");
            if (fs.existsSync(candidate2)) return candidate2;
          }
        }
      } catch {}
    }
  }

  // 3. Check Program Files
  const progFilesCandidate = "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe";
  if (fs.existsSync(progFilesCandidate)) return progFilesCandidate;

  throw new Error(
    "FFmpeg binary not found on PATH or WinGet location. Please install FFmpeg or ensure it is accessible."
  );
}

function findSourceVideo() {
  const primaryPath = path.join(projectRoot, "public", "videos", "hero-construction.mp4");
  if (fs.existsSync(primaryPath)) return primaryPath;

  const alternatePath = path.join(projectRoot, "public", "hero section.mp4");
  if (fs.existsSync(alternatePath)) {
    // Copy to primary path for standard structure
    const videosDir = path.join(projectRoot, "public", "videos");
    if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
    fs.copyFileSync(alternatePath, primaryPath);
    return primaryPath;
  }

  throw new Error("Source video not found in public/videos/hero-construction.mp4 or public/hero section.mp4");
}

async function extractHeroFrames() {
  console.log("=== Architecture Studio: Hero Frame Extraction ===");

  const ffmpeg = findFFmpegBinary();
  console.log(`Using FFmpeg at: ${ffmpeg}`);

  const videoPath = findSourceVideo();
  console.log(`Source video: ${videoPath}`);

  const outputDir = path.join(projectRoot, "public", "frames", "hero-construction");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPattern = path.join(outputDir, "frame_%04d.webp");
  console.log(`Extracting frames to: ${outputDir}`);
  console.log("Settings: 20 FPS, 1600x900, WebP Quality 76, Compression Level 6, Lanczos scale");

  const args = [
    "-i", videoPath,
    "-vf", "fps=20,scale=1600:900:flags=lanczos,setsar=1",
    "-c:v", "libwebp",
    "-quality", "76",
    "-compression_level", "6",
    "-y",
    outputPattern
  ];

  const result = spawnSync(ffmpeg, args, { stdio: "inherit" });
  if (result.error || result.status !== 0) {
    throw new Error(`FFmpeg frame extraction failed with exit code ${result.status}: ${result.error?.message || ""}`);
  }

  // Read extracted files
  const files = fs
    .readdirSync(outputDir)
    .filter((f) => f.startsWith("frame_") && f.endsWith(".webp"))
    .sort();

  if (files.length === 0) {
    throw new Error("No frames were extracted. Check FFmpeg output for errors.");
  }

  const frameCount = files.length;
  const firstFrame = files[0];
  const lastFrame = files[frameCount - 1];

  console.log(`Successfully extracted ${frameCount} frames.`);
  console.log(`First frame: ${firstFrame}`);
  console.log(`Last frame: ${lastFrame}`);

  // Create manifest.json
  const manifest = {
    version: "1.0.0",
    sourceVideo: "public/videos/hero-construction.mp4",
    frameCount,
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    fps: 20,
    sourceDuration: 10.033,
    filenamePattern: "frame_%04d.webp",
    firstFrame,
    lastFrame,
    format: "webp",
    quality: 76,
    extractedAt: new Date().toISOString()
  };

  const manifestPath = path.join(outputDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Manifest created at: ${manifestPath}`);
  console.log("Frame extraction complete.");
}

extractHeroFrames().catch((err) => {
  console.error("Extraction error:", err);
  process.exit(1);
});
