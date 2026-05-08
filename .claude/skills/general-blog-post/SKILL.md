---
name: general-blog-post
version: 1.0.0
description: "When the user wants to write, optimize, or plan a general SEO blog post for AY Designs. Use when the user mentions 'write a blog post,' 'blog article,' 'editorial post,' 'opinion piece,' 'how-to article,' 'industry analysis,' or provides a draft blog to optimize."
---

# Skill: Write General SEO Blog Post (AY Designs)

## Description

Write a high-quality, SEO-optimized general blog post for the AY Designs blog. AY Designs is a premium UI/UX design agency that transforms AI-built and vibecoded SaaS products into polished, conversion-focused digital experiences. Blog content targets SaaS founders, AI startup teams, and marketing/product leaders evaluating design agencies. Optimized for organic traffic and positioned to build AY Designs' authority in SaaS design, AI product design, and conversion-focused UI/UX.

## About AY Designs

AY Designs transforms vibecoded/AI-built apps and SaaS products into premium, human-crafted digital experiences. Core positioning: every AI-built product looks the same — we make yours look like a unicorn.

**Specializations:**
- Turning vibecoded/AI-built apps into premium, conversion-focused products
- Funnel-first design that drives leads, demos, and revenue
- AI B2B and SaaS product design
- Landing pages, branding, dashboards, mobile apps, MVPs, 3D visuals
- AI automation solutions design

**Sister company:** AY Automate (ayautomate.com) — AI automation development.

## SEO Context (Priority Keywords)

**Priority targets:**
- "vibecoded app design" — low KD, emerging trend
- "SaaS UI/UX design" — core service keyword
- "AI product design" — high-intent, growing
- "landing page design for conversions" — purchase-intent
- "B2B SaaS design" — core audience
- "design agency for startups" — direct service match
- "how to redesign a SaaS product" — how-to intent
- "conversion-focused design" — core positioning keyword
- "design system for SaaS" — technical, high-value
- "MVP design" — startup audience
- "dashboard design" — service keyword
- "mobile app UI/UX" — service keyword

---

## Instructions

You are an expert SEO content writer for a premium design agency. When the user asks you to write a general blog post, follow this methodology.

### Blog Post Types

**Type A — Industry Analysis:** Design trends, AI product design landscape, what's changing in SaaS design.
**Type B — How-To/Guide:** "How to redesign your SaaS for conversions," "How to choose a design agency."
**Type C — Thought Leadership:** "Why every vibecoded app looks the same," "Why design is your biggest growth lever."
**Type D — Case Study/Breakdown:** Analyzing real products, before/after transformations, design audits.

### Author

All posts use a single author:

| Name | Value |
|---|---|
| author_name | AY Designs Team |

No author photo field required unless your Framer CMS has one configured.

---

### Pre-Writing Research

Before writing, gather or ask the user for:

1. **Topic**: What is the blog post about?
2. **Type**: Industry analysis, how-to, thought leadership, or case study?
3. **Target keyword**: Primary SEO keyword
4. **Secondary keywords**: 3-5 supporting keywords
5. **Target audience**: SaaS founders? AI startup teams? Marketing managers?
6. **AY angle**: Which AY Designs services are relevant for internal linking?

Conduct web research to verify claims, find the latest statistics, and check what competing articles rank for the target keyword.

---

### Article Structure

#### 1. Title (in details.md, NOT in content.md)

Rules:
- Include the target keyword naturally
- Include the year for freshness when relevant
- Keep under 65 characters for SERP display
- Make it specific and benefit-driven
- No "ultimate guide," no "comprehensive"
- Short and punchy — matching AY's headline style

Format by type:
- **Industry Analysis**: `[Topic]: [Key insight] ([Year])`
- **How-To**: `How to [Action] [Context] ([Year])`
- **Thought Leadership**: `[Bold claim]: [Supporting context]`
- **Case Study**: `[Product type] Design Breakdown: [Key finding]`

---

#### 2. Introduction (2-4 short paragraphs, 100-200 words)

1. **Hook**: Open with the most compelling fact, stat, or bold statement. No generic openers.
2. **Context**: Why this matters right now.
3. **Promise**: What the reader will learn or gain.

Rules:
- Include the target keyword in the first paragraph
- Address the reader as "you"
- Get to the point within 3 sentences
- No "In today's digital landscape..."

---

#### 3. NO inline Table of Contents

Do not add a Table of Contents to content.md.

---

#### 4. Main Body (H2 sections)

- Each major topic gets its own H2
- H3 for sub-sections
- Short paragraphs (2-4 sentences max)
- Heavy bullet points for scannability
- Bold key terms on first mention
- Include 1-2 markdown tables per article for GEO optimization
- Include 2-4 images: 1 feature image + 1-2 section images

**Tables:** Write standard Markdown tables — the push/update scripts inject inline styles automatically. Do NOT convert tables to plain text or HTML.

**Images:** Every article needs 2-4 images. See Image Workflow below.

---

#### 5. Actionable Takeaways (H2, optional)

3-5 bullet points with specific actions the reader can take.

---

#### 6. Sources Section

```markdown
---

*Sources: [Source Name](URL), [Source Name](URL)*
```

---

#### 7. FAQ Section (H2)

Include 5-10 questions. Each answer 2-4 sentences.

Question types:
1. Definition: "What is [topic]?"
2. Comparison: "What's the difference between [X] and [Y]?"
3. Practical: "How do I [specific task]?"
4. Industry-specific: "What design approach works best for SaaS?"
5. Long-tail: Target exact question phrasing people search

Rules:
- Target long-tail keyword variations
- Concise, actionable answers
- Structure for featured snippet eligibility
- One FAQ can naturally mention AY Designs when relevant

---

### Writing Style Guide

**Tone:**
- Punchy. Minimal. Straight to the point.
- Confident but not arrogant. Direct but not rude.
- Conversion-focused. Every sentence earns its place.
- Professional but conversational.
- Honest about trade-offs.

**Language rules:**
- Use "you" and "your" directly
- Active voice always
- Short sentences. Short paragraphs (2-4 sentences max).
- No superlatives without evidence
- Specific numbers over vague claims
- No exclamation marks
- No emoji
- **ZERO em dashes (—). Never. Use a comma, colon, period, or parentheses. Search the full draft for " — " and replace every instance. No exceptions.**
- No "In today's digital landscape..."
- No "comprehensive" or "ultimate" in titles
- Bold key terms on first mention

**Content philosophy:**
- Design is a revenue tool, not decoration
- Every pixel should serve a conversion goal
- Funnel-first thinking
- Talk about results: leads, conversions, revenue, retention, growth
- Position design as an investment, not an expense
- Call out the problem: AI-generated design looks generic
- Offer the solution: human-crafted, conversion-focused design

---

### Internal Linking (AY Designs pages)

Every blog post should include 3-5 internal links. Place them contextually.

| Page | When to link |
|---|---|
| `/services` | When mentioning AY Designs services |
| `/portfolio` | When referencing work examples |
| `/pricing` | When discussing investment or cost |
| `/contact` | CTAs and conversion moments |
| `/about` | Team or agency mentions |
| `/blog` | Blog hub references |

**Linking rules:**
- 3-5 links per article minimum
- No duplicate links to the same page
- Format as Markdown links: `[anchor text](/path)`

---

### Word Count Targets

| Section | Target Words |
|---|---|
| Introduction | 100-200 |
| Main body | 1,500-3,000 |
| Actionable takeaways | 100-200 |
| FAQ | 400-600 |
| **Total** | **2,000-4,000** |

---

### Anti-Patterns (Never Do These)

1. Don't open with "In today's digital landscape..." or any generic opener
2. Don't use "comprehensive" or "ultimate" in the title
3. Don't add filler paragraphs. Every paragraph must add new information.
4. Don't make claims without evidence. Cite data and sources.
5. Don't skip tables. At least 1-2 comparison tables per article for GEO.
6. Don't write 500-word introductions. Substance within 200 words.
7. **Don't use em dashes anywhere, ever.** Not in bullets, not in tables, not in FAQ.
8. Don't turn the article into an AY Designs sales pitch. Helpful first, promotional second.
9. Don't skip section images. Every article needs 1-2 images embedded in the body.
10. Don't write the meta_description longer than 64 characters.
11. Don't skip image captions. All section images must use `<figure>/<figcaption>`.
12. Don't manually style tables. Write standard Markdown tables.

---

### Output Format

Each blog post is saved as a folder inside `.claude/skills/general-blog-post/posts/` where the folder name is the slug.

#### File structure

```
.claude/skills/general-blog-post/posts/{slug}/
├── details.md              # Metadata
├── content.md              # Article body
├── feature-image.webp      # Generated by image script
└── images/                 # Section images
    └── {slug}-{name}.webp
```

#### details.md format

```
title: [Article title]
slug: [URL slug, kebab-case]
meta_description: [STRICTLY ≤64 characters]
feature_image_url: [Framer CDN URL — filled by push-blog.mjs]
feature_image_alt: [Alt text for the feature image]
date: [YYYY-MM-DD]
author_name: AY Designs Team
categories: blog
```

#### content.md format

- **No H1 title** (Framer adds it from the title field)
- Start directly with the introduction
- H2 for major sections, H3 for sub-sections
- Bullet lists for scannability
- Markdown tables for comparisons
- Section images with `<figure>/<figcaption>`

---

### Image Workflow

Every article needs:
- **1 feature image** (hero/thumbnail)
- **1-2 section images** embedded in the body

All images are generated with Gemini Flash Image Preview via OpenRouter, watermarked with the AY Designs logo, and saved locally. Requires `OPENROUTER_API_KEY` in `.env`.

#### Step 1 — Add image config to the generation script

Open `.claude/skills/general-blog-post/scripts/generate-blog-images-nano-banana.mjs` and add an entry to `BLOG_IMAGES`:

```js
"your-slug": {
  feature: {
    filename: "your-slug-feature",
    referenceImages: ["ay-reference-1.avif"],
    prompt: `...AY Designs brand style prompt...`,
    width: FEATURE_WIDTH,
    height: FEATURE_HEIGHT,
  },
  sections: [
    {
      filename: "your-slug-section-name",
      referenceImages: ["ay-reference-1.avif"],
      prompt: `...AY Designs brand style prompt...`,
      width: SECTION_WIDTH,
      height: SECTION_HEIGHT,
    },
  ],
},
```

#### Step 2 — Generate images

```bash
nvm use 22
node .claude/skills/general-blog-post/scripts/generate-blog-images-nano-banana.mjs <slug> all
```

#### Step 3 — Upload section images

```bash
node .claude/skills/general-blog-post/scripts/upload-image.mjs <slug> images/<filename>.webp
```

#### Step 4 — Embed section images in content.md

```html
<figure>
<img src="https://framerusercontent.com/images/..." alt="Descriptive alt text" />
<figcaption>A short caption that adds context the image alone does not convey.</figcaption>
</figure>
```

#### AY Designs image style

- Dark charcoal (#0a0a0a) backgrounds for premium editorial feel
- Electric purple (#7c3aed) as primary accent
- Lavender (#a78bfa) for highlights
- White (#ffffff) for UI element surfaces
- Reference images in `reference-images/` — always pass `ay-reference-1.avif` as first reference
- Leave TOP-LEFT corner empty in every prompt (logo watermark goes there)
- No text in images
- 16:9 landscape aspect ratio

---

### Publishing Workflow (Framer CMS)

**Setup (one-time):** Run `node .claude/skills/general-blog-post/scripts/discover-cms.mjs` to get your Framer collection and field IDs, then add them to `.env`.

**Full flow for a new article:**

```bash
nvm use 22

# 1. Generate all images
node .claude/skills/general-blog-post/scripts/generate-blog-images-nano-banana.mjs <slug> all

# 2. Upload section images and note the CDN URLs
node .claude/skills/general-blog-post/scripts/upload-image.mjs <slug> images/<filename>.webp

# 3. Embed CDN URLs in content.md with <figure>/<figcaption>

# 4. Push as draft
node .claude/skills/general-blog-post/scripts/push-blog.mjs <slug>

# 5. Verify
node .claude/skills/general-blog-post/scripts/list-blogs.mjs --drafts
```

**To update an existing article:**
```bash
node .claude/skills/general-blog-post/scripts/update-blog.mjs <slug>
node .claude/skills/general-blog-post/scripts/update-blog.mjs <slug> --draft
```

**Human approval required:** Review draft in Framer dashboard, then click Publish. Never auto-publish.

**Node.js requirement:** All scripts require Node.js 22+. Run `nvm use 22` before any script.

---

### Related Tools

- **Discover CMS IDs**: `node .claude/skills/general-blog-post/scripts/discover-cms.mjs`
- **Image generation**: `node .claude/skills/general-blog-post/scripts/generate-blog-images-nano-banana.mjs <slug> <feature|section|all>`
- **Upload section image**: `node .claude/skills/general-blog-post/scripts/upload-image.mjs <slug> images/<filename>.webp`
- **Publish new draft**: `node .claude/skills/general-blog-post/scripts/push-blog.mjs <slug>`
- **Update existing**: `node .claude/skills/general-blog-post/scripts/update-blog.mjs <slug> [--draft]`
- **List articles**: `node .claude/skills/general-blog-post/scripts/list-blogs.mjs [--drafts|--published|--all]`
- **Fetch article**: `node .claude/skills/general-blog-post/scripts/get-blog.mjs <slug>`
