#!/usr/bin/env node

/**
 * Discover AY Designs Framer CMS structure — collections, field IDs, category IDs.
 *
 * Run this once after setting FRAMER_PROJECT_URL in .env to get all the IDs
 * needed to configure the other scripts.
 *
 * Usage:
 *   node .claude/skills/general-blog-post/scripts/discover-cms.mjs
 */

import { connect } from "framer-api";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../../..");
dotenv.config({ path: join(PROJECT_ROOT, ".env") });

function validateEnv() {
  const missing = ["FRAMER_API_KEY", "FRAMER_PROJECT_URL"].filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(", ")} — check .env in project root`);
    process.exit(1);
  }
  if (process.env.FRAMER_PROJECT_URL === "REPLACE_WITH_YOUR_FRAMER_SITE_URL") {
    console.error("Set FRAMER_PROJECT_URL in .env to your published Framer site URL.");
    console.error("Example: https://aydesigns.framer.website");
    process.exit(1);
  }
}

validateEnv();

console.log(`Connecting to Framer at: ${process.env.FRAMER_PROJECT_URL}`);
const framer = await connect(process.env.FRAMER_PROJECT_URL, process.env.FRAMER_API_KEY);

try {
  const collections = await framer.getCollections();
  console.log(`\nFound ${collections.length} collection(s):\n`);
  console.log("=".repeat(80));

  for (const col of collections) {
    console.log(`\nCOLLECTION: ${col.name}`);
    console.log(`  ID: ${col.id}`);

    const fields = col.fields || [];
    if (fields.length > 0) {
      console.log(`  Fields:`);
      for (const f of fields) {
        console.log(`    ${f.name.padEnd(24)} id: ${f.id}  type: ${f.type}`);
      }
    }

    const items = await col.getItems();
    console.log(`  Items: ${items.length}`);

    if (items.length > 0) {
      console.log(`  Sample item slug: ${items[0].slug}`);
      console.log(`  Sample item fieldData keys: ${Object.keys(items[0].fieldData || {}).join(", ")}`);

      // Print first item's field values to understand structure
      const fd = items[0].fieldData;
      for (const [key, val] of Object.entries(fd)) {
        const display = JSON.stringify(val).slice(0, 80);
        console.log(`    [${key}]: ${display}`);
      }
    }

    console.log("-".repeat(80));
  }

  console.log("\nCopy the collection ID and field IDs above into the scripts.");
  console.log("Update ARTICLES_COLLECTION_ID and FIELDS in:");
  console.log("  - push-blog.mjs");
  console.log("  - update-blog.mjs");
  console.log("  - list-blogs.mjs");
  console.log("  - get-blog.mjs");
} finally {
  await framer.disconnect();
}
