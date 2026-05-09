import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { connect } from 'framer-api';
import { marked, Renderer } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
dotenv.config({ path: join(PROJECT_ROOT, '.env') });

const POSTS_DIR = join(PROJECT_ROOT, '.claude/skills/general-blog-post/posts');
const CLAUDE_MD = readFileSync(join(PROJECT_ROOT, 'CLAUDE.md'), 'utf8');
const BRANCH = 'claude/blog-content-generator-NVCjw';

const ARTICLES_COLLECTION_ID = 'URVVS5bec';
const FIELDS = {
  name:            'bSYd9Dwn8',
  content:         'CoToCvmsn',
  metaDescription: 'AAKgrEp6U',
  featureImageAlt: 'UtU9TQMq1',
  date:            'egTOWMWmI',
  authorName:      'IHIRuBlbU',
  category:        'M8lHTj4cF',
};

// marked v12 table renderer
const renderer = new Renderer();
renderer.tablecell = (content, flags) => {
  if (flags.header) {
    return `<th style="text-align:left;padding:10px 14px;border-bottom:2px solid #0a0a0a;font-weight:600;white-space:nowrap;">${content}</th>\n`;
  }
  return `<td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;vertical-align:top;">${content}</td>\n`;
};
renderer.table = (header, body) =>
  `<table style="width:100%;border-collapse:collapse;margin:1.5rem 0;font-size:0.95em;"><thead>\n${header}</thead><tbody>\n${body}</tbody></table>\n`;
marked.use({ renderer });

function parseDetails(raw) {
  const result = {};
  for (const line of raw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) result[key] = value;
  }
  return result;
}

async function callClaude(system, user, maxTokens = 8000) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://aydesigns.com',
      'X-Title': 'AY Designs Blog Pipeline',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-5',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Generate topic suggestions
app.get('/api/topics', async (req, res) => {
  try {
    const raw = await callClaude(
      CLAUDE_MD,
      `Generate 8 diverse blog post topic suggestions for AY Designs. Use the brand guidelines, content philosophy, and target keywords from the guide above.

Avoid topics already covered:
- Why Your Vibecoded SaaS Needs a Redesign
- Landing Page Design for Conversions

Return ONLY a valid JSON array with no markdown or explanation:
[
  {
    "title": "Short punchy title under 65 chars",
    "slug": "kebab-case-slug",
    "keyword": "primary target keyword",
    "type": "B",
    "description": "One sentence describing what this post covers"
  }
]

Types: A=Industry Analysis, B=How-To/Guide, C=Thought Leadership, D=Case Study`,
      2000
    );

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array found in response');
    res.json(JSON.parse(match[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Full pipeline: generate + save + git + framer (SSE)
app.post('/api/generate', async (req, res) => {
  const { topic } = req.body;
  if (!topic?.slug || !topic?.title) {
    return res.status(400).json({ error: 'Invalid topic' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const today = new Date().toISOString().slice(0, 10);
    const { slug, title, keyword, type } = topic;

    // Step 1: Generate content
    send({ step: 'generating', status: 'running' });

    const [detailsRaw, contentMd] = await Promise.all([
      callClaude(
        'You generate blog post metadata. Return only the exact format requested, no extra text.',
        `Generate details.md metadata for a blog post.
Title: ${title}
Slug: ${slug}
Keyword: ${keyword}
Date: ${today}

Return ONLY this exact format, nothing else:
title: ${title}
slug: ${slug}
meta_description: [max 64 chars, natural sentence, includes keyword]
feature_image_url:
feature_image_alt: [descriptive alt text for a premium SaaS design image]
date: ${today}
author_name: AY Designs Team
categories: blog`,
        500
      ),
      callClaude(
        CLAUDE_MD,
        `Write a complete SEO blog post for AY Designs.

Topic: ${title}
Target keyword: ${keyword}
Type: ${type} (A=Industry Analysis, B=How-To/Guide, C=Thought Leadership, D=Case Study)

STRICT REQUIREMENTS — follow ALL brand guidelines above:
- Do NOT include an H1 heading (Framer adds it automatically)
- Do NOT include a Table of Contents
- Zero em dashes (never use —)
- No exclamation marks
- 2,500-3,500 words total
- Short paragraphs (2-4 sentences max)
- At least 2 markdown comparison tables
- FAQ section with 8-10 questions at the end
- 3-5 contextual internal links to /services /portfolio /pricing /contact /about
- 2 section images using: <figure><img src="" alt="..."><figcaption>...</figcaption></figure>
- Sources section before FAQ using: *Sources: [Name](url), [Name](url)*
- Start directly with the introduction hook, no preamble

Write the complete article now.`,
        12000
      ),
    ]);

    send({ step: 'generating', status: 'done' });

    // Step 2: Save files
    send({ step: 'saving', status: 'running' });

    const postDir = join(POSTS_DIR, slug);
    mkdirSync(postDir, { recursive: true });
    writeFileSync(join(postDir, 'details.md'), detailsRaw.trim(), 'utf8');
    writeFileSync(join(postDir, 'content.md'), contentMd.trim(), 'utf8');

    send({ step: 'saving', status: 'done' });

    // Step 3: Git commit and push
    send({ step: 'git', status: 'running' });

    try {
      execSync(`git add .claude/skills/general-blog-post/posts/${slug}/`, { cwd: PROJECT_ROOT });
      execSync(`git commit -m "Add blog post: ${title}"`, { cwd: PROJECT_ROOT });
      execSync(`git push -u origin ${BRANCH}`, { cwd: PROJECT_ROOT });
    } catch (gitErr) {
      if (!gitErr.message.includes('nothing to commit')) throw gitErr;
    }

    send({ step: 'git', status: 'done' });

    // Step 4: Publish to Framer
    send({ step: 'framer', status: 'running' });

    const details = parseDetails(detailsRaw);
    const html = await marked.parse(contentMd);

    const framer = await connect(process.env.FRAMER_PROJECT_URL, process.env.FRAMER_API_KEY);
    try {
      const collections = await framer.getCollections();
      const collection = collections.find(c => c.id === ARTICLES_COLLECTION_ID);
      if (!collection) throw new Error('Framer articles collection not found');

      const fieldData = {
        [FIELDS.name]:            { type: 'string',        value: details.title || slug },
        [FIELDS.content]:         { type: 'formattedText', value: html, contentType: 'html' },
        [FIELDS.metaDescription]: { type: 'string',        value: (details.meta_description || '').slice(0, 64) },
        [FIELDS.featureImageAlt]: { type: 'string',        value: details.feature_image_alt || title },
        [FIELDS.date]:            { type: 'date',          value: new Date(details.date || Date.now()).toISOString() },
        [FIELDS.authorName]:      { type: 'string',        value: 'AY Designs Team' },
        [FIELDS.category]:        { type: 'string',        value: 'blog' },
      };

      const existing = (await collection.getItems()).find(i => i.slug === slug);
      if (existing) {
        await collection.addItems([{ id: existing.id, slug, draft: true, fieldData }]);
      } else {
        await collection.addItems([{ slug, draft: true, fieldData }]);
      }
    } finally {
      await framer.disconnect();
    }

    send({ step: 'framer', status: 'done' });
    send({ step: 'done', status: 'done', slug });

  } catch (e) {
    send({ step: 'error', status: 'error', message: e.message });
  }

  res.end();
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`\nAY Designs Blog Pipeline`);
  console.log(`Open in browser: http://localhost:${PORT}\n`);
});
