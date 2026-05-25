// scripts/optimize-images.mjs
//
// Convert oversized PNG/JPEG assets to compressed WebP for the live site.
//
//   node scripts/optimize-images.mjs

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const targets = [
  // [input, output, options]
  // MN Shipping cinematic mockups (5MB PNG -> ~200KB WebP)
  { in: 'assets/projects/mn-chartering/mockup.png', out: 'assets/projects/mn-chartering/mockup.webp', w: 1600, q: 82 },
  { in: 'assets/projects/mn-shipping/mockup.png',   out: 'assets/projects/mn-shipping/mockup.webp',   w: 1600, q: 82 },
  // Hero background (1.2MB JPG -> ~250KB WebP)
  { in: 'assets/hero-blue.jpg', out: 'assets/hero-blue.webp', w: 2400, q: 78 },
  // Hero seq frames (5 × 1MB JPG -> ~150KB WebP each)
  { in: 'assets/seq/1.jpeg', out: 'assets/seq/1.webp', w: 1800, q: 76 },
  { in: 'assets/seq/2.jpeg', out: 'assets/seq/2.webp', w: 1800, q: 76 },
  { in: 'assets/seq/3.jpeg', out: 'assets/seq/3.webp', w: 1800, q: 76 },
  { in: 'assets/seq/4.jpeg', out: 'assets/seq/4.webp', w: 1800, q: 76 },
  { in: 'assets/seq/5.jpeg', out: 'assets/seq/5.webp', w: 1800, q: 76 },
];

function fmt(n) { return (n / 1024).toFixed(0) + ' KB'; }

const results = [];
for (const t of targets) {
  const inAbs  = path.join(ROOT, t.in);
  const outAbs = path.join(ROOT, t.out);
  if (!fs.existsSync(inAbs)) { console.warn('skip (missing):', t.in); continue; }
  const inSize = fs.statSync(inAbs).size;
  await sharp(inAbs)
    .resize({ width: t.w, withoutEnlargement: true })
    .webp({ quality: t.q, effort: 6 })
    .toFile(outAbs);
  const outSize = fs.statSync(outAbs).size;
  const pct = (100 - (outSize / inSize) * 100).toFixed(1);
  results.push({ file: t.in, in: inSize, out: outSize, pct });
  console.log(`✓ ${t.in.padEnd(48)} ${fmt(inSize).padStart(8)} -> ${fmt(outSize).padStart(8)}  (-${pct}%)`);
}

const totalIn  = results.reduce((s, r) => s + r.in,  0);
const totalOut = results.reduce((s, r) => s + r.out, 0);
console.log(`\nTotal: ${fmt(totalIn)} -> ${fmt(totalOut)}  saved ${fmt(totalIn - totalOut)}`);
