// scripts/gen-mockup.mjs
//
// Generate a cinematic device-mockup for a project using Replicate's
// google/nano-banana-pro (Gemini-3 image-edit) model. Takes a screenshot
// and composites it onto a laptop in a themed scene.
//
// Usage:
//   REPLICATE_API_TOKEN=... node scripts/gen-mockup.mjs <input.png> <output.png> "<prompt>"
//
// Falls back to google/nano-banana if pro is unavailable.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function loadEnv(filePath) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  } catch { /* ignore */ }
}
loadEnv(path.join(ROOT, '.env.local'));
loadEnv(path.join(ROOT, '.env'));

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) { console.error('Missing REPLICATE_API_TOKEN (add to .env.local)'); process.exit(1); }

// Usage:
//   node gen-mockup.mjs <output.png> "<prompt>" <input1.png> [<input2.png> ...]
//
// The first positional arg is the output, the second is the prompt, the
// rest are 1..N input images that nano-banana composites into one scene.
const [, , outputPath, prompt, ...inputPaths] = process.argv;
if (!outputPath || !prompt || inputPaths.length === 0) {
  console.error('Usage: node gen-mockup.mjs <output.png> "<prompt>" <input1.png> [<input2.png> ...]');
  process.exit(1);
}

const MODELS = ['google/nano-banana-pro', 'google/nano-banana'];

async function fileToDataUrl(p) {
  const buf = await fs.promises.readFile(p);
  const ext = path.extname(p).toLowerCase().replace('.', '') || 'png';
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  return `data:image/${mime};base64,${buf.toString('base64')}`;
}

async function api(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const txt = await res.text();
  let body; try { body = JSON.parse(txt); } catch { body = txt; }
  if (!res.ok) throw new Error(`Replicate ${res.status}: ${txt.slice(0, 400)}`);
  return body;
}

async function runWithModel(modelSlug, dataUrls) {
  const create = await api(`https://api.replicate.com/v1/models/${modelSlug}/predictions`, {
    method: 'POST',
    body: JSON.stringify({
      input: {
        prompt,
        image_input: dataUrls,           // nano-banana accepts an array
        output_format: 'png',
      },
    }),
  });
  let pred = create;
  const t0 = Date.now();
  while (pred.status === 'starting' || pred.status === 'processing') {
    if (Date.now() - t0 > 180_000) throw new Error('Prediction timed out after 180s');
    await new Promise(r => setTimeout(r, 1500));
    pred = await api(pred.urls.get);
    process.stdout.write('.');
  }
  process.stdout.write('\n');
  if (pred.status !== 'succeeded') throw new Error(`Prediction ${pred.status}: ${JSON.stringify(pred.error)}`);
  const outUrl = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  if (!outUrl) throw new Error('No output URL returned');
  const imgRes = await fetch(outUrl);
  if (!imgRes.ok) throw new Error(`Failed to download output (${imgRes.status})`);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.promises.writeFile(outputPath, buf);
  console.log(`✓ Wrote ${outputPath} (${buf.length.toLocaleString()} bytes) via ${modelSlug}`);
}

(async () => {
  console.log(`→ ${inputPaths.length} input(s) → ${outputPath}`);
  inputPaths.forEach((p, i) => console.log(`    [${i + 1}] ${p}`));
  console.log(`  prompt: ${prompt.slice(0, 140)}${prompt.length > 140 ? '…' : ''}`);
  const dataUrls = [];
  for (const p of inputPaths) dataUrls.push(await fileToDataUrl(p));
  let lastErr;
  for (const m of MODELS) {
    try { await runWithModel(m, dataUrls); return; }
    catch (e) { console.warn(`  ! ${m} failed: ${e.message.slice(0, 200)}`); lastErr = e; }
  }
  throw lastErr;
})().catch(e => { console.error('FATAL:', e.message); process.exit(2); });
