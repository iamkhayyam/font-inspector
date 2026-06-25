# /fontinspector

Font audit skill. Call `inspect_fonts` from the font-inspector MCP server, then present the results clearly.

## Triggers
- User types `/fontinspector [url | path | html]`
- User asks "what fonts is [site] using?"
- User asks to audit, inspect, or inventory fonts on a page or in a file

## Steps

1. **Identify the input** from the user's message:
   - URL (starts with http/https) → pass as `url`
   - Local file path (.html, .css) → pass as `path`  
   - Pasted HTML/CSS → pass as `html`
   - Image attached → describe fonts visually using vision (no MCP needed)
   - No input → ask the user for a URL or file

2. **Call `inspect_fonts`** with the appropriate argument.
   - For URLs: default `sampleSize` of 200 is fine. Increase to 400+ for large/complex sites.
   - The tool takes ~5–15 seconds for live URL inspection (headless browser).

3. **Present results** in this order:
   - Lead with web fonts only (skip system fonts unless the user asks)
   - For each font: name, token suggestion, weights, what elements use it
   - If only system fonts are found, say so clearly — it likely means fonts load via JS after inspection or the CSS uses variable fonts
   - Add a one-line summary: "X web fonts, Y system fallbacks"

4. **Suggest token mappings** if the user has a design system context:
   - Ask about their stack (Tailwind, CSS vars, etc.) if unknown
   - Map to `font-sans`, `font-serif`, `font-mono` or their custom tokens
   - Show as a ready-to-paste snippet

## Output format example

```
stripe.com — 3 web fonts, 2 system fallbacks

  Söhne             font-sans     300 Light, 400 Regular, 700 Bold   h1, h2, p, nav
  Söhne Mono        font-mono     400 Regular                         code, pre
  Stripe Display    font-display  700 Bold                            h1 (hero)

Suggested token map:
  'Söhne':          { token: 'font-sans',     role: 'UI / Body' },
  'Söhne Mono':     { token: 'font-mono',     role: 'Code' },
  'Stripe Display': { token: 'font-display',  role: 'Marketing heading' },
```

## Notes
- `inspect_fonts` requires the `font-inspector` MCP server to be configured in Claude Code settings
- Playwright Chromium must be installed: `npx playwright install chromium`
- Static mode (path/html) is instant but only finds declared fonts, not computed ones
