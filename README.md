# Font Inspector

**Hover any element. See every font.**

A font audit tool that lives wherever you need it — browser bookmarklet, React component, `<script>` drop-in, or MCP server that lets Claude audit any website on command.

[![npm](https://img.shields.io/npm/v/font-inspector?style=flat-square)](https://www.npmjs.com/package/font-inspector)
[![license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-ready-8b5cf6?style=flat-square)](https://modelcontextprotocol.io)

---

## Four ways to use it

| I want to... | Use |
|---|---|
| Inspect fonts on **any live site** right now | [Bookmarklet](#bookmarklet--any-site-no-install) |
| Add an inspector to **my React project** | [npm → React](#react-component) |
| Drop it into **any HTML page** (Vue, Svelte, plain) | [npm → Vanilla](#vanilla-script-tag) |
| Let **Claude audit a site** for me | [MCP server](#claude--mcp) |

---

## Bookmarklet — any site, no install

Open [`dist/bookmarklet.html`](dist/bookmarklet.html) in your browser. Drag the **⊞ Font Inspector** button to your bookmarks bar. Click it on any webpage — the inspector activates instantly. Click again to toggle off.

No install. No build step. Works on any site.

### Browser setup

<details>
<summary><strong>Chrome · Brave · Edge</strong></summary>

1. Show the bookmarks bar: `Cmd+Shift+B` (Mac) or `Ctrl+Shift+B` (Windows)
2. Open `dist/bookmarklet.html`
3. Drag **⊞ Font Inspector** to the bar

</details>

<details>
<summary><strong>Safari</strong></summary>

1. Show the Favorites bar: `View → Show Favorites Bar` or `Cmd+Shift+B`
2. Open `dist/bookmarklet.html`
3. Drag **⊞ Font Inspector** to the Favorites bar

> Safari may show a "Are you sure?" prompt when adding a `javascript:` bookmarklet — click **Add** to confirm. It's safe.

</details>

<details>
<summary><strong>Firefox</strong></summary>

1. Show the bookmarks toolbar: `View → Toolbars → Bookmarks Toolbar`
2. Open `dist/bookmarklet.html`
3. Drag **⊞ Font Inspector** to the toolbar

</details>

<details>
<summary><strong>Arc</strong></summary>

Arc has no bookmarks bar — bookmarks live in the sidebar instead.

1. Open `dist/bookmarklet.html`
2. Right-click **⊞ Font Inspector** → **Add to Favorites**
3. It pins to the top of your current Space
4. Click it from the sidebar just like any pinned link

Alternatively: drag the link directly into the sidebar's Favorites section.

</details>

---

## npm

```bash
npm install font-inspector
```

### React component

```tsx
import { FontInspector } from 'font-inspector';

// Optional: map your font families to design-system tokens
const TOKEN_MAP = {
  'Inter':            { token: 'font-sans',    role: 'UI / Body' },
  'Playfair Display': { token: 'font-display', role: 'Heading' },
  'Fira Code':        { token: 'font-mono',    role: 'Code' },
};

export function App() {
  return (
    <>
      {/* your app */}
      <FontInspector tokenMap={TOKEN_MAP} />
    </>
  );
}
```

Press **Shift+F** or click the **Aa** button (bottom-left corner) to activate. Mapped fonts highlight in your accent color; unknown fonts highlight orange so strays are easy to spot.

### Vanilla / script tag

No React? No problem.

```js
import { VanillaFontInspector } from 'font-inspector/vanilla';

const inspector = new VanillaFontInspector({
  tokenMap: { 'Inter': { token: 'font-sans', role: 'Body' } },
  colors:   { accent: '#6366f1', bg: '#0f0f13' },
});
```

Or drop the pre-built IIFE into any HTML page:

```html
<script src="https://cdn.jsdelivr.net/npm/font-inspector/dist/font-inspector.iife.js"></script>
```

This exposes `window.FontInspector` and activates immediately. Toggle it:

```js
window.FontInspector.toggle();
```

---

## Claude + MCP

The MCP server gives Claude a `inspect_fonts` tool: load any URL in a headless browser, sample computed styles across hundreds of DOM elements, and return a full font audit with token suggestions.

### Setup

**1. Build the server**

```bash
git clone https://github.com/iamkhayyam/font-inspector
cd font-inspector
npm install
npm run build:mcp
npx playwright install chromium
```

**2. Add to Claude Code**

In your Claude Code MCP settings (`.claude/settings.json` or global `~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "font-inspector": {
      "command": "node",
      "args": ["/absolute/path/to/font-inspector/dist/mcp/server.js"]
    }
  }
}
```

**3. Install the skill** (optional but nice)

Copy [`skills/SKILL.md`](skills/SKILL.md) to `~/.claude/skills/fontinspector/SKILL.md`.
Then `/fontinspector` becomes a first-class Claude command.

### Usage

Ask Claude naturally — or use the skill directly:

```
/fontinspector https://stripe.com
/fontinspector https://linear.app
/fontinspector ./src/styles.css
What fonts is Notion using?
Audit the typography on vercel.com
```

### What the output looks like

```
📍 https://stripe.com
🔬 Mode: live · 200 elements sampled
🔤 3 web fonts · 2 system fonts filtered

Web fonts:
  Sohne
    token suggestion : font-sans
    weights          : 400 Regular, 500 Medium, 600 Semibold, 700 Bold
    used on          : p, span, a, li, button, div · 118 elements
  Sohne Mono
    token suggestion : font-mono
    weights          : 400 Regular
    used on          : code, pre · 6 elements
  Stripe Display
    token suggestion : font-display
    weights          : 700 Bold
    used on          : h1, h2 · 8 elements

System / fallback fonts: -apple-system, Helvetica Neue
```

Claude can then suggest a `tokenMap`, compare stacks across sites, flag inconsistencies in your own codebase, or generate design-token config — whatever you need next.

---

## Configuration

### React / Vanilla props

```ts
interface FontInspectorOptions {
  // Map font-family names to your design tokens.
  // Mapped fonts highlight in accent color; unmapped highlight orange.
  tokenMap?: Record<string, { token: string; role: string }>;

  // Tooltip colors. Defaults to indigo accent on near-black.
  colors?: { accent: string; bg: string };

  // Keyboard shortcut hint shown in the toggle button title.
  // Default: 'Shift+F'
  shortcutLabel?: string;
}
```

### MCP tool schema

```ts
inspect_fonts({
  url?:        string,  // live URL — opens headless Chromium
  path?:       string,  // local .html or .css file path
  html?:       string,  // raw HTML/CSS string (no browser needed)
  sampleSize?: number,  // DOM elements to sample; default 200
})
```

---

## Build

```bash
npm run build:all   # everything: lib + IIFE + MCP server + bookmarklet
npm run build:lib   # React ESM/CJS for npm consumers
npm run build:iife  # self-contained vanilla bundle
npm run build:mcp   # Node.js MCP server → dist/mcp/server.js
npm run bookmarklet # regenerate dist/bookmarklet.html from built IIFE
npm run dev         # demo app on localhost:3000
```

### dist layout

```
dist/
  index.js / index.cjs       ← React component (ESM + CJS)
  vanilla.js / vanilla.cjs   ← Vanilla class (ESM + CJS)
  font-inspector.iife.js     ← Self-contained script-tag bundle
  bookmarklet.html           ← Drag-to-bookmarks page
  bookmarklet.txt            ← Raw javascript: URI
  mcp/
    server.js                ← MCP server entry point
```

---

## How it works

```
Bookmarklet / <script> tag
  └─ iife.ts → VanillaFontInspector
       └─ mousemove → getComputedStyle → tooltip + highlight overlay

React component
  └─ FontInspector.tsx
       └─ mousemove → getComputedStyle → JSX tooltip

MCP server
  └─ server.ts → inspect_fonts tool
       ├─ url  → Playwright → page.evaluate(getComputedStyle × N) → JSON
       └─ path/html → CSS regex parser → JSON
```

All paths share the same font-resolution and token-suggestion logic from `src/core.ts`.

---

## License

MIT · [Knowware Institute](https://knowware.institute)
