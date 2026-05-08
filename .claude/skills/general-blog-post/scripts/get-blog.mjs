#!/usr/bin/env node

/**
 * Fetch an AY Designs blog article from Framer CMS and save locally.
 *
 * Requires Node.js >= 22 (framer-api requirement).
 *
 * Usage:
 *   node .claude/skills/general-blog-post/scripts/get-blog.mjs <slug>
 *
 * Saves to: .claude/skills/general-blog-post/posts/<slug>/details.md
 *           .claude/skills/general-blog-post/posts/<slug>/content.html
 */

import { connect } from "framer-api";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { writeFileSync, mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");
const PROJECT_ROOT = join(__dirname, "../../../..");
dotenv.config({ path: join(PROJECT_ROOT, ".env") });

const ARTICLES_COLLECTION_ID = process.env.FRAMER_COLLECTION_ID || "REPLACE_WITH_COLLECTION_ID";

const FIELDS = {
  title:      process.env.FRAMER_FIELD_TITLE      || "REPLACE_WITH_FIELD_ID",
  date:       process.env.FRAMER_FIELD_DATE        || "REPLACE_WITH_FIELD_ID",
  authorName: process.env.FRAMER_FIELD_AUTHOR_NAME || null,
  image:      process.env.FRAMER_FIELD_IMAGE       || "REPLACE_WITH_FIELD_ID",
  oneLiner:   process.env.FRAMER_FIELD_ONE_LINER   || "REPLACE_WITH_FIELD_ID",
  content:    process.env.FRAMER_FIELD_CONTENT     || "REPLACE_WITH_FIELD_ID",
};

function validateEnv() {
  const missing = ["FRAMER_API_KEY", "FRAMER_PROJECT_URL"].filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(", ")} — check .env in project root`);
    process.exit(1);
  }
}

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node get-blog.mjs <slug>");
  process.exit(1);
}

validateEnv();

console.log(`Connecting to Framer...`);
const framer = await connect(process.env.FRAMER_PROJECT_URL, process.env.FRAMER_API_KEY);

try {
  const collections = await framer.getCollections();
  const collection = collections.find(c => c.id === ARTICLES_COLLECTION_ID);
  if (!collection) {
    console.error("Articles collection not found. Run discover-cms.mjs to check collection IDs.");
    process.exit(1);
  }

  const items = await collection.getItems();
  const item = items.find(i => i.slug === slug);
  if (!item) {
    console.error(`No article found with slug "${slug}".`);
    console.error(`\nAvailable slugs (recent 10):`);
    items.slice(0, 10).forEach(i => console.error(`  ${i.slug}`));
    process.exit(1);
  }

  const fd = item.fieldData;
  const title = fd[FIELDS.title]?.value || "";
  const date = (fd[FIELDS.date]?.value || new Date().toISOString()).slice(0, 10);
  const authorName = FIELDS.authorName ? (fd[FIELDS.authorName]?.value || "AY Designs Team") : "AY Designs Team";
  const oneLiner = fd[FIELDS.oneLiner]?.value || "";
  const imageUrl = fd[FIELDS.image]?.value?.url || fd[FIELDS.image]?.value || "";
  const imageAlt = fd[FIELDS.image]?.value?.altText || title;
  const content = fd[FIELDS.content]?.value || "";

  const postsDir = join(SKILL_DIR, "posts", slug);
  mkdirSync(postsDir, { recursive: true });

  const details = [
    `title: ${title}`,
    `slug: ${slug}`,
    `meta_description: ${oneLiner}`,
    `feature_image_url: ${imageUrl}`,
    `feature_image_alt: ${imageAlt}`,
    `date: ${date}`,
    `author_name: ${authorName}`,
    `categories: blog`,
    `draft: ${item.draft ?? true}`,
  ].join("\n");

  writeFileSync(join(postsDir, "details.md"), details, "utf8");
  writeFileSync(join(postsDir, "content.html"), content, "utf8");

  console.log(`\nArticle saved to posts/${slug}/`);
  console.log(`Title:  ${title}`);
  console.log(`Status: ${item.draft ? "DRAFT" : "PUBLISHED"}`);
  console.log(`Date:   ${date}`);
} finally {
  await framer.disconnect();
}
