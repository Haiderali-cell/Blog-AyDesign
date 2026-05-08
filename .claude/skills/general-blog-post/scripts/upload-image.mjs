#!/usr/bin/env node

/**
 * Upload a local image from a blog post to Framer and get the CDN URL.
 *
 * Requires Node.js >= 22 (framer-api requirement).
 *
 * Usage:
 *   node .claude/skills/general-blog-post/scripts/upload-image.mjs <slug> <relative-path>
 *
 * Examples:
 *   node upload-image.mjs saas-ui-design images/saas-ui-design-stats.webp
 *   node upload-image.mjs saas-ui-design feature-image.webp
 *
 * Prints the Framer CDN URL — paste it into content.md.
 */

import { connect } from "framer-api";
import dotenv from "dotenv";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");
const PROJECT_ROOT = join(__dirname, "../../../..");
dotenv.config({ path: join(PROJECT_ROOT, ".env") });

function validateEnv() {
  const missing = ["FRAMER_API_KEY", "FRAMER_PROJECT_URL"].filter(k => !process.env[k]);
  if (missing.length) { console.error(`Missing: ${missing.join(", ")} in .env`); process.exit(1); }
}

const slug = process.argv[2];
const relativePath = process.argv[3];

if (!slug || !relativePath) {
  console.error("Usage: node upload-image.mjs <slug> <relative-path>");
  console.error("Example: node upload-image.mjs saas-ui-design images/saas-ui-design-stats.webp");
  process.exit(1);
}

validateEnv();

const filePath = join(SKILL_DIR, "posts", slug, relativePath);
if (!existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const ext = relativePath.split(".").pop().toLowerCase();
const mimeTypes = { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", avif: "image/avif" };
const mimeType = mimeTypes[ext] || "image/webp";

console.log(`Connecting to Framer...`);
const framer = await connect(process.env.FRAMER_PROJECT_URL, process.env.FRAMER_API_KEY);

try {
  const buffer = readFileSync(filePath);
  console.log(`Uploading ${basename(relativePath)} (${(buffer.length / 1024).toFixed(0)} KB)...`);

  const asset = await framer.uploadImage({
    image: { bytes: new Uint8Array(buffer), mimeType },
    name: basename(relativePath),
  });

  console.log(`\nUploaded.`);
  console.log(`URL: ${asset.url}`);
  console.log(`\nMarkdown:`);
  console.log(`![Alt text](${asset.url})`);
} finally {
  await framer.disconnect();
}
