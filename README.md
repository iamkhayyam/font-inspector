# Font Inspector

A lightweight React overlay that lets you hover over any element to inspect its computed font properties — family, design-system token, weight, style, size, and line-height.

![demo screenshot](https://placeholder.com/demo.png)

## Features

- **Hover to inspect** — move your mouse over any element; a tooltip appears instantly
- **Element highlight** — a colored outline marks the exact element under your cursor
- **Design-system tokens** — map font families to your own token names (e.g. `font-sans`, `font-display`)
- **Element path** — shows the CSS selector path to the hovered element
- **Keyboard toggle** — `Shift+F` to turn on/off without reaching for the button
- **Configurable colors** — swap the accent color to match your brand
- **Zero runtime deps** — just React; no extra libraries

## Usage

Copy `src/FontInspector.tsx` into your project, then drop the component anywhere in your tree (typically at the root):

```tsx
import { FontInspector } from './FontInspector';

// Optional: map font-family names to your design tokens
const TOKEN_MAP = {
  'Inter':           { token: 'font-sans',    role: 'UI / Body' },
  'Playfair Display':{ token: 'font-display', role: 'Heading' },
  'Fira Code':       { token: 'font-mono',    role: 'Code' },
};

export function App() {
  return (
    <>
      {/* ... your app ... */}
      <FontInspector tokenMap={TOKEN_MAP} />
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tokenMap` | `Record<string, { token: string; role: string }>` | `{}` | Maps font-family names to design-system tokens |
| `colors` | `{ accent: string; bg: string }` | `{ accent: '#6366f1', bg: '#0f0f13' }` | Tooltip accent and background colors |
| `shortcutLabel` | `string` | `'Shift+F'` | Label shown in the toggle button tooltip |

## Running the demo

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` and hover over the typography samples. Click **Aa** (bottom-left) or press `Shift+F` to toggle.

## How it works

`FontInspector` attaches a `mousemove` listener when active. On each move it calls `getComputedStyle()` on the element under the cursor, resolves the font family against your token map, and renders a fixed-position tooltip. The element highlight is a separate fixed `<div>` positioned to match the element's `getBoundingClientRect()`.

## License

MIT
