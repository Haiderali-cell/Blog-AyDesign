#!/usr/bin/env node

/**
 * Create a new AY Designs blog article in Framer CMS as DRAFT.
 *
 * Requires Node.js >= 22 (framer-api requirement).
 *
 * Usage:
 *   node .claude/skills/general-blog-post/scripts/push-blog.mjs <slug>
 *
 * Example:
 *   node .claude/skills/general-blog-post/scripts/push-blog.mjs saas-ui-ux-design-guide
 *
 * Reads from: .claude/skills/general-blog-post/posts/<slug>/details.md
 *             .claude/skills/general-blog-post/posts/<slug>/content.md
 * Feature image: .claude/skills/general-blog-post/posts/<slug>/feature-image.webp (optional)
 *
 * The article is created as DRAFT — a human must publish it in the Framer dashboard.
 */

import { connect } from "framer-api";
import { marked, Renderer } from "marked";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");
const PROJECT_ROOT = join(__dirname, "../../../..");
dotenv.config({ path: join(PROJECT_ROOT, ".env") });

// ---------------------------------------------------------------------------
// Framer CMS schema — AY Designs Articles collection
// Run discover-cms.mjs first to get these IDs from your Framer project.
// ---------------------------------------------------------------------------

const ARTICLES_COLLECTION_ID = process.env.FRAMER_COLLECTION_ID || "REPLACE_WITH_COLLECTION_ID";
const CATEGORIES_COLLECTION_ID = process.env.FRAMER_CATEGORIES_COLLECTION_ID || null;

const FIELDS = {
  title:      process.env.FRAMER_FIELD_TITLE      || "REPLACE_WITH_FIELD_ID",
  date:       process.env.FRAMER_FIELD_DATE        || "REPLACE_WITH_FIELD_ID",
  authorName: process.env.FRAMER_FIELD_AUTHOR_NAME || null,
  authorPhoto:process.env.FRAMER_FIELD_AUTHOR_PHOTO|| null,
  image:      process.env.FRAMER_FIELD_IMAGE       || "REPLACE_WITH_FIELD_ID",
  categories: process.env.FRAMER_FIELD_CATEGORIES  || null,
  oneLiner:   process.env.FRAMER_FIELD_ONE_LINER   || "REPLACE_WITH_FIELD_ID",
  content:    process.env.FRAMER_FIELD_CONTENT     || "REPLACE_WITH_FIELD_ID",
};

const CATEGORY_IDS = {
  "blog": process.env.FRAMER_CATEGORY_BLOG || "REPLACE_WITH_CATEGORY_ID",
};

const VALID_CATEGORIES = Object.keys(CATEGORY_IDS);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function validateEnv() {
  const missing = ["FRAMER_API_KEY", "FRAMER_PROJECT_URL"].filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(", ")} — check .env in project root`);
    process.exit(1);
  }
  if (ARTICLES_COLLECTION_ID === "REPLACE_WITH_COLLECTION_ID") {
    console.error("Run discover-cms.mjs first to get your Framer collection IDs, then update .env or the FIELDS constants in this script.");
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node push-blog.mjs <slug>");
  process.exit(1);
}

validateEnv();

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

const details = parseDetails(readFileSync(detailsPath, "utf8"));
const markdown = readFileSync(contentPath, "utf8");

// Custom renderer — inline styles on tables so Framer renders them properly
const renderer = new Renderer();
renderer.table = ({ header, rows }) => {
  const thCells = header.map(cell =>
    `<th style="text-align:left;padding:10px 14px;border-bottom:2px solid #0a0a0a;font-weight:600;white-space:nowrap;">${cell.text}</th>`
  ).join("");
  const bodyRows = rows.map(row => {
    const tds = row.map(cell =>
      `<td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;vertical-align:top;">${cell.text}</td>`
    ).join("");
    return `<tr>${tds}</tr>`;
  }).join("");
  return `<table style="width:100%;border-collapse:collapse;margin:1.5rem 0;font-size:0.95em;">
<thead><tr>${thCells}</tr></thead>
<tbody>${bodyRows}</tbody>
</table>`;
};
marked.use({ renderer });

const html = await marked.parse(markdown);

const categorySlugs = (details.categories || "blog")
  .split(",")
  .map(c => c.trim())
  .filter(c => VALID_CATEGORIES.includes(c));

if (categorySlugs.length === 0) categorySlugs.push("blog");

const categories = categorySlugs.map(s => CATEGORY_IDS[s]).filter(Boolean);

console.log(`Connecting to Framer...`);
const framer = await connect(process.env.FRAMER_PROJECT_URL, process.env.FRAMER_API_KEY);

try {
  const collections = await framer.getCollections();
  const collection = collections.find(c => c.id === ARTICLES_COLLECTION_ID);
  if (!collection) {
    console.error("Articles collection not found in Framer project.");
    console.error("Run discover-cms.mjs to see available collections.");
    process.exit(1);
  }

  // Upload feature image if local file exists
  let imageUrl = details.feature_image_url || null;
  const localImage = join(postsDir, "feature-image.webp");
  if (existsSync(localImage)) {
    console.log("Uploading feature image to Framer...");
    const buf = readFileSync(localImage);
    const asset = await framer.uploadImage({
      image: { bytes: new Uint8Array(buf), mimeType: "image/webp" },
      name: `${slug}.webp`,
    });
    imageUrl = asset.url;
    console.log(`Image uploaded: ${imageUrl}`);
  }

  const authorName = details.author_name || "AY Designs Team";

  const fieldData = {
    [FIELDS.title]:    { type: "string", value: details.title || slug },
    [FIELDS.date]:     { type: "date",   value: new Date(details.date || new Date()).toISOString() },
    [FIELDS.oneLiner]: { type: "string", value: (details.meta_description || "").slice(0, 64) },
    [FIELDS.content]:  { type: "formattedText", value: html, contentType: "html" },
  };

  if (FIELDS.authorName) fieldData[FIELDS.authorName] = { type: "string", value: authorName };
  if (FIELDS.categories && categories.length > 0) {
    fieldData[FIELDS.categories] = { type: "multiCollectionReference", value: categories };
  }
  if (imageUrl) {
    fieldData[FIELDS.image] = {
      type: "image",
      value: imageUrl,
      alt: details.feature_image_alt || details.title || slug,
    };
  }

  await collection.addItems([{ slug, draft: true, fieldData }]);

  console.log(`\nDraft created successfully.`);
  console.log(`Slug:  ${slug}`);
  console.log(`Title: ${details.title}`);
  console.log(`\nPublish in Framer: ${process.env.FRAMER_PROJECT_URL}`);
} finally {
  await framer.disconnect();
}
