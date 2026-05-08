#!/usr/bin/env node

/**
 * Blog image generator using Nano Banana (Gemini Flash Image via OpenRouter)
 *
 * Generates feature images and section images for AY Designs blog posts,
 * composites the AY Designs logo watermark, and saves locally as WebP.
 * Use push-blog.mjs / update-blog.mjs to upload to Framer afterwards.
 *
 * Usage:
 *   node scripts/generate-blog-images-nano-banana.mjs <slug> <mode>
 *
 * Modes:
 *   feature  — Generate only the feature image
 *   all      — Generate feature image + section images
 *   section  — Generate only section images (assumes feature exists)
 *
 * Examples:
 *   node scripts/generate-blog-images-nano-banana.mjs saas-ui-design feature
 *   node scripts/generate-blog-images-nano-banana.mjs saas-ui-design all
 *
 * Prerequisites:
 *   - OPENROUTER_API_KEY in .env
 *   - npm install sharp (already in package.json)
 */

import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import sharp from "sharp";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");
const PROJECT_ROOT = join(__dirname, "../../../..");
dotenv.config({ path: join(PROJECT_ROOT, ".env.local") });
dotenv.config({ path: join(PROJECT_ROOT, ".env") });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error("Missing OPENROUTER_API_KEY in .env");
  process.exit(1);
}

const MODEL = "google/gemini-3.1-flash-image-preview";
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

const FEATURE_WIDTH = 3840;
const FEATURE_HEIGHT = 2160;
const SECTION_WIDTH = 2400;
const SECTION_HEIGHT = 1350;
const WEBP_QUALITY = 85;
const MAX_FILE_SIZE_KB = 1024;
const MAX_RETRIES = 2;

// ---------------------------------------------------------------------------
// AY Designs brand style
//
// AY Designs is a premium design agency for AI-built SaaS products.
// Brand aesthetic: clean, dark, editorial, premium.
//
// Core colors:
//   Deep black/charcoal: #0a0a0a
//   Pure white:          #ffffff
//   Electric purple:     #7c3aed  (violet accent)
//   Soft lavender:       #a78bfa
//   Mid grey:            #374151
//   Light grey:          #f3f4f6
//
// Leave TOP-LEFT corner empty — AY logo watermark is composited programmatically.
// Never mention the logo in the prompt.
// No text in images (Framer overlays title separately).
// 16:9 landscape aspect ratio.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Blog image configs — add a new entry per blog post slug
// ---------------------------------------------------------------------------

const BLOG_IMAGES = {

  "saas-ui-design": {
    feature: {
      filename: "saas-ui-design-feature",
      referenceImages: ["ay-reference-1.avif"],
      prompt: `Create a professional, premium editorial feature image for a blog post about SaaS UI/UX design.

AY Designs brand style (follow exactly):
- Dark background: deep charcoal (#0a0a0a) with very subtle texture
- Electric purple (#7c3aed) as the primary accent color
- Soft lavender (#a78bfa) for highlights and secondary glows
- White (#ffffff) for clean UI element surfaces and contrast
- Clean, modern, premium editorial aesthetic — NO cartoon, NO characters, NO clipart
- Leave the TOP-LEFT corner completely empty — the logo watermark is composited programmatically

Design — a premium SaaS dashboard composition:
- CENTER: A dark-themed SaaS dashboard UI panel with clean card elements, a sidebar nav, and a minimal data chart in purple. Crisp white typography lines (no readable text).
- LEFT: Floating abstract UI components — a modal card, a toggle switch, a radio group — arranged diagonally with soft purple glow behind them.
- RIGHT: A clean analytics mini-chart — line graph with a purple gradient fill beneath the line, ascending left to right.
- Background: Subtle dark radial glow in deep purple from the center, fading to near-black edges.
- No text, no numbers, no labels.
- 16:9 landscape.`,
      width: FEATURE_WIDTH,
      height: FEATURE_HEIGHT,
    },
    sections: [
      {
        filename: "saas-ui-design-stats",
        referenceImages: ["ay-reference-1.avif"],
        prompt: `Create a professional editorial data visualization for a SaaS UI design blog post.

AY Designs brand style:
- Dark charcoal background (#0a0a0a)
- Electric purple (#7c3aed) for primary data
- Soft lavender (#a78bfa) for secondary data
- White for card surfaces and highlights
- Clean, minimal, editorial SaaS aesthetic — NO cartoon, NO characters
- Leave TOP-LEFT corner empty

Design — a 2x2 dark stat dashboard:
- TOP-LEFT: A large bold metric number silhouette in white on a dark card, purple accent underline, upward arrow shape.
- TOP-RIGHT: Two vertical bars — left bar short and grey, right bar tall and electric purple. 2.5x height difference.
- BOTTOM-LEFT: A donut ring chart, 75% filled electric purple, 25% dark grey. White center.
- BOTTOM-RIGHT: Three stacked horizontal progress bars, filling left to right in gradient lavender to purple. Small white accent dots at end of each bar.
- Each card: dark (#1a1a1a) background, soft white border, rounded corners, subtle shadow.
- No text or numbers.
- 16:9 landscape.`,
        width: SECTION_WIDTH,
        height: SECTION_HEIGHT,
      },
    ],
  },

  "vibecoded-app-design": {
    feature: {
      filename: "vibecoded-app-design-feature",
      referenceImages: ["ay-reference-1.avif"],
      prompt: `Create a premium editorial feature image for a blog post about transforming AI-built/vibecoded apps into premium design.

AY Designs brand style:
- Dark charcoal (#0a0a0a) background with subtle grain texture
- Electric purple (#7c3aed) as the primary accent
- Lavender (#a78bfa) for highlights
- White for UI element surfaces
- Clean, premium, editorial — NO cartoon, NO characters
- Leave TOP-LEFT completely empty

Design — before/after transformation concept:
- LEFT HALF: A dull, flat, grey UI wireframe — generic boxes, placeholder elements, flat cards with no depth or character. Light grey tones (#374151). Feels template-like and forgettable.
- CENTER: A thin vertical dividing line in electric purple with a subtle glow effect.
- RIGHT HALF: A premium redesigned version of the same layout — same structure but with refined typography lines, purple accent cards, subtle shadows, smooth gradients, intentional whitespace, and a hero element with a glowing purple CTA button shape.
- Background: Very dark, near-black with a faint purple ambient glow on the right side.
- No text, no readable labels.
- 16:9 landscape.`,
      width: FEATURE_WIDTH,
      height: FEATURE_HEIGHT,
    },
    sections: [
      {
        filename: "vibecoded-app-design-comparison",
        referenceImages: ["ay-reference-1.avif"],
        prompt: `Create a clean editorial comparison graphic for a blog post about AI-built vs human-designed products.

AY Designs brand style:
- Dark (#0a0a0a) background
- Electric purple (#7c3aed) accent
- Lavender (#a78bfa) highlights
- White card surfaces
- Premium, minimal editorial aesthetic — NO cartoon
- Leave TOP-LEFT empty

Design — a horizontal split comparison card:
- LEFT PANEL: Labeled area with generic flat UI elements — basic grey boxes, flat buttons, no hierarchy, no visual interest. Cold grey palette.
- RIGHT PANEL: Same layout transformed — purple accents, clean card shadows, refined spacing, intentional visual hierarchy, a bold hero element with a glowing purple gradient.
- Thin purple dividing line down the center with a subtle glow.
- Dark card background with white surface elements on the right.
- No text or labels.
- 16:9 landscape.`,
        width: SECTION_WIDTH,
        height: SECTION_HEIGHT,
      },
    ],
  },

  "landing-page-conversion": {
    feature: {
      filename: "landing-page-conversion-feature",
      referenceImages: ["ay-reference-1.avif"],
      prompt: `Create a premium editorial feature image for a blog post about landing page design for conversions.

AY Designs brand style:
- Dark charcoal (#0a0a0a) background
- Electric purple (#7c3aed) dominant accent
- Lavender (#a78bfa) for highlights
- White for UI surfaces
- Premium, clean, modern editorial aesthetic — NO cartoon, NO characters
- Leave TOP-LEFT completely empty

Design — a premium landing page layout mockup:
- CENTER: A tall, dark-themed landing page mockup frame showing: a hero section with a glowing purple CTA button shape, a feature grid below with three card elements, a subtle gradient background inside the frame.
- LEFT: Floating UI micro-elements — a conversion stat card (upward arrow + bar), a testimonial card shape (circle avatar placeholder + lines), stacked at an angle.
- RIGHT: A funnel diagram — wide at top, narrowing to a point, filled with a purple gradient. Three horizontal lines crossing the funnel.
- Background: Very dark with a soft radial purple glow from behind the center mockup.
- No text or numbers.
- 16:9 landscape.`,
      width: FEATURE_WIDTH,
      height: FEATURE_HEIGHT,
    },
    sections: [],
  },

};

// ---------------------------------------------------------------------------
// OpenRouter image generation
// ---------------------------------------------------------------------------

function loadImageAsBase64(filePath) {
  try {
    const buffer = readFileSync(filePath);
    const ext = filePath.split(".").pop().toLowerCase();
    const mimeMap = { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", avif: "image/avif" };
    const mimeType = mimeMap[ext] || "image/webp";
    return { mimeType, data: buffer.toString("base64") };
  } catch {
    return null;
  }
}

function resolveRefImage(slug, name) {
  const candidates = [
    join(SKILL_DIR, "logos", name),
    join(SKILL_DIR, "reference-images", name),
    join(SKILL_DIR, "posts", slug, "images", name),
  ];
  for (const p of candidates) {
    try { readFileSync(p); return p; } catch { /* try next */ }
  }
  return join(SKILL_DIR, "reference-images", name);
}

async function generateImage(prompt, referenceImages = []) {
  console.log(`  Generating with Nano Banana (${MODEL}) via OpenRouter...`);
  if (referenceImages.length > 0) console.log(`  Using ${referenceImages.length} reference image(s)`);

  const content = [];

  for (const ref of referenceImages) {
    if (ref) {
      content.push({
        type: "image_url",
        image_url: { url: `data:${ref.mimeType};base64,${ref.data}` },
      });
    }
  }

  content.push({ type: "text", text: prompt });

  const body = {
    model: MODEL,
    messages: [{ role: "user", content }],
    modalities: ["image", "text"],
    image_config: { aspect_ratio: "16:9" },
  };

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://aydesigns.com",
      "X-Title": "AY Designs Blog Image Generator",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${text}`);
  }

  const json = await response.json();
  const message = json.choices?.[0]?.message;
  if (!message) {
    console.error("  No message in response:", JSON.stringify(json, null, 2));
    return null;
  }

  if (message.images && message.images.length > 0) {
    const imageUrl = message.images[0].image_url?.url;
    if (imageUrl) {
      const base64 = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      return Buffer.from(base64, "base64");
    }
  }

  if (Array.isArray(message.content)) {
    for (const part of message.content) {
      if (part.type === "image_url" && part.image_url?.url) {
        const base64 = part.image_url.url.replace(/^data:image\/\w+;base64,/, "");
        return Buffer.from(base64, "base64");
      }
    }
  }

  console.error("  No image data found in response:", JSON.stringify(message, null, 2));
  return null;
}

// ---------------------------------------------------------------------------
// Image processing (sharp)
// ---------------------------------------------------------------------------

const LOGO_PATH = join(SKILL_DIR, "logos", "ay-logo.webp");
const LOGO_SIZE_RATIO = 0.10;
const LOGO_PADDING = 28;
const PILL_PADDING_H = 20;
const PILL_PADDING_V = 12;
const PILL_RADIUS = 16;

async function compositeLogoWatermark(buffer, targetWidth) {
  let logoBuffer;
  try {
    logoBuffer = readFileSync(LOGO_PATH);
  } catch {
    console.warn("  Warning: could not load AY logo for watermark, skipping. Add logos/ay-logo.webp to enable.");
    return buffer;
  }

  const logoWidth = Math.round(targetWidth * LOGO_SIZE_RATIO);

  const resizedLogo = await sharp(logoBuffer)
    .png()
    .resize(logoWidth, null, { fit: "inside" })
    .toBuffer();

  const logoMeta = await sharp(resizedLogo).metadata();
  const lw = logoMeta.width;
  const lh = logoMeta.height;

  const pillW = lw + PILL_PADDING_H * 2;
  const pillH = lh + PILL_PADDING_V * 2;

  const pillSvg = Buffer.from(
    `<svg width="${pillW}" height="${pillH}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${pillW}" height="${pillH}"
            rx="${PILL_RADIUS}" ry="${PILL_RADIUS}"
            fill="white" fill-opacity="0.92"/>
    </svg>`
  );

  const pill = await sharp(pillSvg)
    .png()
    .composite([{ input: resizedLogo, top: PILL_PADDING_V, left: PILL_PADDING_H }])
    .png()
    .toBuffer();

  const composited = await sharp(buffer)
    .composite([{ input: pill, top: LOGO_PADDING, left: LOGO_PADDING }])
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  console.log(`  Composited AY Designs watermark (${pillW}x${pillH}px)`);
  return composited;
}

async function processImage(imageBuffer, targetWidth, targetHeight) {
  const metadata = await sharp(imageBuffer).metadata();
  console.log(`  Original: ${metadata.width}x${metadata.height} (${metadata.format})`);

  const resized = sharp(imageBuffer).resize(targetWidth, targetHeight, {
    fit: "cover",
    position: "centre",
  });

  let quality = WEBP_QUALITY;
  let webpBuffer = await resized.clone().webp({ quality }).toBuffer();
  console.log(`  WebP quality ${quality}: ${(webpBuffer.length / 1024).toFixed(0)} KB`);

  while (webpBuffer.length / 1024 > MAX_FILE_SIZE_KB && quality > 50) {
    quality -= 10;
    webpBuffer = await resized.clone().webp({ quality }).toBuffer();
    console.log(`  WebP quality ${quality}: ${(webpBuffer.length / 1024).toFixed(0)} KB`);
  }

  webpBuffer = await compositeLogoWatermark(webpBuffer, targetWidth);
  console.log(`  Final: ${targetWidth}x${targetHeight} WebP (${(webpBuffer.length / 1024).toFixed(0)} KB)`);
  return webpBuffer;
}

function saveLocally(buffer, slug, filename) {
  const isFeature = filename === slug || filename.endsWith("-feature");
  const postsDir = join(SKILL_DIR, "posts", slug);
  let outPath;
  if (isFeature) {
    mkdirSync(postsDir, { recursive: true });
    outPath = join(postsDir, "feature-image.webp");
  } else {
    const imagesDir = join(postsDir, "images");
    mkdirSync(imagesDir, { recursive: true });
    outPath = join(imagesDir, `${filename}.webp`);
  }
  writeFileSync(outPath, buffer);
  console.log(`  Saved: ${outPath}`);
  return outPath;
}

async function generateAndSave(slug, imageConfig) {
  const { filename, prompt, width, height, referenceImages: refNames } = imageConfig;
  console.log(`\n--- Generating: ${filename} ---`);

  const refImages = (refNames || [])
    .map((name) => loadImageAsBase64(resolveRefImage(slug, name)))
    .filter(Boolean);

  let imageBuffer = null;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      imageBuffer = await generateImage(prompt, refImages);
      if (imageBuffer) break;
      console.error(`  Attempt ${attempt}: No image data returned.`);
    } catch (err) {
      console.error(`  Attempt ${attempt} failed:`, err.message);
    }
    if (attempt <= MAX_RETRIES) {
      console.log("  Retrying in 3s...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  if (!imageBuffer) {
    console.error(`  FAILED: Could not generate ${filename}`);
    return null;
  }

  const webpBuffer = await processImage(imageBuffer, width, height);
  return saveLocally(webpBuffer, slug, filename);
}

async function main() {
  const [slug, mode = "all"] = process.argv.slice(2);

  if (!slug || !BLOG_IMAGES[slug]) {
    console.error(`\nUsage: node scripts/generate-blog-images-nano-banana.mjs <slug> [feature|section|all]`);
    console.error(`\nAvailable slugs: ${Object.keys(BLOG_IMAGES).join(", ")}`);
    console.error(`\nTo add a new post, add an entry to BLOG_IMAGES in this script.`);
    process.exit(1);
  }

  const config = BLOG_IMAGES[slug];
  const results = {};

  if (mode === "feature" || mode === "all") {
    console.log("\n=== FEATURE IMAGE ===");
    const path = await generateAndSave(slug, config.feature);
    if (path) results.feature = path;
  }

  if ((mode === "section" || mode === "all") && config.sections?.length) {
    console.log("\n=== SECTION IMAGES ===");
    for (const sectionConfig of config.sections) {
      const path = await generateAndSave(slug, sectionConfig);
      if (path) results[sectionConfig.filename] = path;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log("\n\n========================================");
  console.log("GENERATION COMPLETE");
  console.log("========================================\n");

  for (const [key, path] of Object.entries(results)) {
    console.log(`${key}: ${path}`);
  }

  console.log("\nNext steps:");
  console.log("  1. Upload section images: node scripts/upload-image.mjs <slug> images/<file>.webp");
  console.log("  2. Add CDN URLs to content.md using <figure>/<figcaption>");
  console.log("  3. Push draft: node scripts/push-blog.mjs <slug>");
}

main().catch((err) => {
  console.error("Image generation failed:", err.message);
  process.exit(1);
});
