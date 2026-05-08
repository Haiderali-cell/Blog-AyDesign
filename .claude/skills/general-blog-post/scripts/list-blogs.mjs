#!/usr/bin/env node

/**
 * List AY Designs blog articles from Framer CMS.
 *
 * Requires Node.js >= 22 (framer-api requirement).
 *
 * Usage:
 *   node .claude/skills/general-blog-post/scripts/list-blogs.mjs [--drafts | --published | --all]
 *
 * Defaults to --all if no flag provided.
 */

import { connect } from "framer-api";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../../..");
dotenv.config({ path: join(PROJECT_ROOT, ".env") });

const ARTICLES_COLLECTION_ID = "URVVS5bec";

const FIELDS = {
  name: "bSYd9Dwn8",
  date: "egTOWMWmI",
};

function validateEnv() {
  const missing = ["FRAMER_API_KEY", "FRAMER_PROJECT_URL"].filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(", ")} — check .env in project root`);
    process.exit(1);
  }
}

validateEnv();

const args = process.argv.slice(2);
const showDrafts    = args.includes("--drafts");
const showPublished = args.includes("--published");
const showAll       = !showDrafts && !showPublished;

console.log("Connecting to Framer...");
const framer = await connect(process.env.FRAMER_PROJECT_URL, process.env.FRAMER_API_KEY);

try {
  const collections = await framer.getCollections();
  const collection = collections.find(c => c.id === ARTICLES_COLLECTION_ID);
  if (!collection) {
    console.error("Articles collection not found. Run discover-cms.mjs to check collection IDs.");
    process.exit(1);
  }

  const items = await collection.getItems();
  const filtered = items.filter(item => {
    if (showAll) return true;
    if (showDrafts) return item.draft === true;
    if (showPublished) return item.draft !== true;
    return true;
  });

  const sorted = filtered.sort((a, b) => {
    const dateA = a.fieldData[FIELDS.date]?.value || "";
    const dateB = b.fieldData[FIELDS.date]?.value || "";
    return dateB.localeCompare(dateA);
  });

  const filter = showDrafts ? "drafts" : showPublished ? "published" : "all";
  console.log(`\nArticles (${filter}) — ${sorted.length} of ${items.length} total\n`);
  console.log("─".repeat(100));

  for (const item of sorted) {
    const status = item.draft ? "DRAFT    " : "PUBLISHED";
    const title = item.fieldData[FIELDS.name]?.value || "(no title)";
    const date = (item.fieldData[FIELDS.date]?.value || "").slice(0, 10);
    console.log(`[${status}] ${date}  ${item.slug.padEnd(50)} ${title}`);
  }

  console.log("─".repeat(100));
  console.log(`Total: ${sorted.length} articles`);
} finally {
  await framer.disconnect();
}
