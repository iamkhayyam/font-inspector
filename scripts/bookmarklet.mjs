import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const src  = resolve('dist/font-inspector.iife.js');
const code = readFileSync(src, 'utf8').trim();
const href = `javascript:${encodeURIComponent(code)}`;

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Font Inspector — Bookmarklet</title>
  <style>
    body { font-family: ui-sans-serif,system-ui,sans-serif; background:#f9f8f6; color:#1a1a1a; max-width:540px; margin:80px auto; padding:0 24px; line-height:1.6 }
    h1   { font-size:24px; margin-bottom:6px }
    p    { color:#555; margin-bottom:32px }
    .btn { display:inline-block; padding:12px 24px; background:#6366f1; color:#fff; text-decoration:none; border-radius:6px; font-size:14px; font-weight:600; cursor:grab }
    .btn:active { cursor:grabbing }
    .hint { margin-top:20px; font-size:13px; color:#888 }
    code  { font-family:ui-monospace,monospace; background:#eee; padding:2px 6px; border-radius:3px; font-size:12px }
  </style>
</head>
<body>
  <h1>Font Inspector</h1>
  <p>Drag the button below to your bookmarks bar, then click it on any page to activate the font inspector.</p>

  <a class="btn" href="${href}">⊞ Font Inspector</a>

  <p class="hint">Or use <code>Shift+F</code> to toggle once installed. Click the bookmarklet again to toggle off.</p>
  <p class="hint">Built by <a href="https://knowware.institute" target="_blank" rel="noopener">Knowware Institute</a>.</p>
</body>
</html>`;

writeFileSync('dist/bookmarklet.html', html);
writeFileSync('dist/bookmarklet.txt', href);

console.log(`✓ dist/bookmarklet.html`);
console.log(`✓ dist/bookmarklet.txt  (${(href.length / 1024).toFixed(1)} KB)`);
