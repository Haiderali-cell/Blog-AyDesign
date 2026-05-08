#!/usr/bin/env node

/**
 * Export an AY Designs blog post as a Framer CMS-ready CSV.
 *
 * Usage:
 *   node .claude/skills/general-blog-post/scripts/export-csv.mjs <slug>
 *
 * Example:
 *   node .claude/skills/general-blog-post/scripts/export-csv.mjs saas-ui-design
 *
 * Reads from: .claude/skills/general-blog-post/posts/<slug>/details.md
 *             .claude/skills/general-blog-post/posts/<slug>/content.md
 *
 * Outputs:  .claude/skills/general-blog-post/posts/<slug>/<slug>.csv
 *
 * Then import the CSV in Framer:
 *   CMS → Blogs collection → ... menu → Import CSV
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node export-csv.mjs <slug>");
  process.exit(1);
}

const postsDir = join(SKILL_DIR, "posts", slug);
const detailsPath = join(postsDir, "details.md");
const contentPath = join(postsDir, "content.md");

if (!existsSync(detailsPath)) {
  console.error(`Not found: posts/${slug}/details.md`);
  process.exit(1);
}
if (!existsSync(contentPath)) {
  console.error(`Not found: posts/${slug}/content.md`);
  process.exit(1);
}

// Parse details.md key: value pairs
function parseDetails(raw) {
  const result = {};
  for (const line of raw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) result[key] = value;
  }
  return result;
}

// Escape a CSV field: wrap in double quotes, escape internal double quotes
function csvField(value = "") {
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

const details = parseDetails(readFileSync(detailsPath, "utf8"));
const content = readFileSync(contentPath, "utf8");

// Map details.md fields to Framer CMS CSV columns
const row = {
  Name:                details.title || slug,
  Slug:                details.slug || slug,
  "Meta Description":  (details.meta_description || "").slice(0, 64),
  "Feature Image Alt": details.feature_image_alt || details.title || slug,
  Date:                details.date || new Date().toISOString().slice(0, 10),
  "Author Name":       details.author_name || "AY Designs Team",
  Category:            details.categories || "blog",
  Content:             content,
};

const headers = Object.keys(row);
const csvLine = headers.map(h => csvField(row[h])).join(",");
const csv = headers.map(h => csvField(h)).join(",") + "\n" + csvLine + "\n";

const outPath = join(postsDir, `${slug}.csv`);
writeFileSync(outPath, csv, "utf8");

console.log(`\nCSV exported: posts/${slug}/${slug}.csv`);
console.log(`\nTo import in Framer:`);
console.log(`  1. Open your Framer project`);
console.log(`  2. Go to CMS → Blogs collection`);
console.log(`  3. Click the ... menu (top right) → Import CSV`);
console.log(`  4. Select: posts/${slug}/${slug}.csv`);
console.log(`  5. Add your feature image manually in the CMS after import`);
console.log(`\nFields exported:`);
for (const [k, v] of Object.entries(row)) {
  const preview = String(v).slice(0, 60).replace(/\n/g, " ");
  console.log(`  ${k.padEnd(20)} ${preview}${String(v).length > 60 ? "..." : ""}`);
}
