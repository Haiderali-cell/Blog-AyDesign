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

const ARTICLES_COLLECTION_ID = "URVVS5bec";

const FIELDS = {
  name:            "bSYd9Dwn8",  // string — article title (shown as Name in CMS)
  content:         "CoToCvmsn",  // formattedText — article body
  metaDescription: "AAKgrEp6U",  // string — meta description
  featureImageAlt: "UtU9TQMq1",  // string — feature image alt text
  date:            "egTOWMWmI",  // date
  authorName:      "IHIRuBlbU",  // string
  category:        "M8lHTj4cF",  // string
};

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
renderer.tablecell = (content, flags) => {
  if (flags.header) {
    return `<th style="text-align:left;padding:10px 14px;border-bottom:2px solid #0a0a0a;font-weight:600;white-space:nowrap;">${content}</th>\n`;
  }
  return `<td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;vertical-align:top;">${content}</td>\n`;
};
renderer.table = (header, body) => {
  return `<table style="width:100%;border-collapse:collapse;margin:1.5rem 0;font-size:0.95em;"><thead>\n${header}</thead><tbody>\n${body}</tbody></table>\n`;
};
marked.use({ renderer });

const html = await marked.parse(markdown);

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

  const fieldData = {
    [FIELDS.name]:            { type: "string",        value: details.title || slug },
    [FIELDS.content]:         { type: "formattedText", value: html, contentType: "html" },
    [FIELDS.metaDescription]: { type: "string",        value: (details.meta_description || "").slice(0, 64) },
    [FIELDS.featureImageAlt]: { type: "string",        value: details.feature_image_alt || details.title || slug },
    [FIELDS.date]:            { type: "date",          value: new Date(details.date || new Date()).toISOString() },
    [FIELDS.authorName]:      { type: "string",        value: details.author_name || "AY Designs Team" },
    [FIELDS.category]:        { type: "string",        value: (details.categories || "blog").split(",")[0].trim() },
  };

  await collection.addItems([{ slug, draft: true, fieldData }]);

  console.log(`\nDraft created successfully.`);
  console.log(`Slug:  ${slug}`);
  console.log(`Title: ${details.title}`);
  console.log(`\nOpen Framer to review and publish: ${process.env.FRAMER_PROJECT_URL}`);
} finally {
  await framer.disconnect();
}
