// src/mcp/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { existsSync } from "fs";

// src/mcp/types.ts
var WEIGHT_NAMES = {
  "100": "Thin",
  "200": "ExtraLight",
  "300": "Light",
  "400": "Regular",
  "500": "Medium",
  "600": "Semibold",
  "700": "Bold",
  "800": "ExtraBold",
  "900": "Black"
};
var SYSTEM_FONTS = /* @__PURE__ */ new Set([
  "-apple-system",
  "blinkmacsystemfont",
  "segoe ui",
  "roboto",
  "oxygen",
  "ubuntu",
  "cantarell",
  "helvetica neue",
  "arial",
  "helvetica",
  "tahoma",
  "verdana",
  "trebuchet ms",
  "georgia",
  "times new roman",
  "courier new",
  "lucida console",
  "monaco",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy"
]);
function suggestToken(family, elementTypes) {
  const f = family.toLowerCase();
  if (/mono|code|courier|consolas|fira|jetbrains|victor|inconsolata|cascadia|berkeley|source code/i.test(f)) return "font-mono";
  if (elementTypes.some((t) => ["code", "pre", "kbd", "samp"].includes(t))) return "font-mono";
  if (/serif|playfair|garamond|georgia|times|baskerville|caslon|charter|utopia|merriweather|lora|vollkorn/i.test(f)) return "font-serif";
  return "font-sans";
}

// src/mcp/tools/inspect-url.ts
async function inspectUrl(url, sampleSize = 200) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error(
      "Playwright not installed. Run: npx playwright install chromium"
    );
  }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 3e4 });
  } catch {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15e3 });
  }
  await page.waitForTimeout(800);
  const raw = await page.evaluate((max) => {
    const els = Array.from(document.querySelectorAll("body *")).filter((el) => {
      const s = getComputedStyle(el);
      return s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0";
    }).slice(0, max);
    const map = {};
    for (const el of els) {
      const cs = getComputedStyle(el);
      const family = cs.fontFamily.split(",")[0].replace(/['"]/g, "").trim();
      if (!family) continue;
      const w = String(Math.round(parseFloat(cs.fontWeight)) || 400);
      const t = el.tagName.toLowerCase();
      if (!map[family]) map[family] = { ws: [], ts: [], n: 0 };
      if (!map[family].ws.includes(w)) map[family].ws.push(w);
      if (!map[family].ts.includes(t) && map[family].ts.length < 10) map[family].ts.push(t);
      map[family].n++;
    }
    return {
      total: els.length,
      fonts: Object.entries(map).map(([family, d]) => ({
        family,
        weights: d.ws.sort(),
        elementTypes: d.ts,
        count: d.n
      }))
    };
  }, sampleSize);
  await browser.close();
  const fonts = raw.fonts.sort((a, b) => b.count - a.count).map((f) => ({
    ...f,
    weightNames: f.weights.map((w) => WEIGHT_NAMES[w] ?? w),
    tokenSuggestion: suggestToken(f.family, f.elementTypes),
    isSystemFont: SYSTEM_FONTS.has(f.family.toLowerCase())
  }));
  return { source: url, mode: "live", elementsSampled: raw.total, fonts };
}

// src/mcp/tools/inspect-static.ts
import { readFileSync } from "fs";
function inspectStatic(input, isFilePath = false) {
  const src = isFilePath ? readFileSync(input, "utf8") : input;
  const families = /* @__PURE__ */ new Set();
  const declRe = /font-family\s*:\s*([^;{}]+)/gi;
  let m;
  while ((m = declRe.exec(src)) !== null) {
    for (const chunk of m[1].split(",")) {
      const name = chunk.trim().replace(/['"]/g, "").trim();
      if (name && !name.startsWith("var(") && !name.startsWith("--") && name.length < 80) {
        families.add(name);
      }
    }
  }
  const faceRe = /@font-face\s*\{[^}]*?font-family\s*:\s*['"]?([^'";}\n]+)/gi;
  while ((m = faceRe.exec(src)) !== null) {
    families.add(m[1].trim().replace(/['"]/g, "").trim());
  }
  const gfRe = /family=([A-Za-z][A-Za-z0-9+]*)/g;
  while ((m = gfRe.exec(src)) !== null) {
    families.add(m[1].replace(/\+/g, " "));
  }
  const fonts = [...families].filter((f) => f.length > 0).map((family) => ({
    family,
    weights: [],
    weightNames: [],
    elementTypes: [],
    count: 0,
    tokenSuggestion: suggestToken(family, []),
    isSystemFont: SYSTEM_FONTS.has(family.toLowerCase())
  }));
  return {
    source: isFilePath ? input : "inline",
    mode: "static",
    elementsSampled: 0,
    fonts
  };
}

// src/mcp/server.ts
var server = new Server(
  { name: "font-inspector", version: "0.1.0" },
  { capabilities: { tools: {} } }
);
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "inspect_fonts",
      description: "Audit fonts on a webpage or in HTML/CSS source. Pass a URL for live inspection (headless Chromium, accurate computed styles across real DOM elements). Pass a local file path or raw HTML/CSS string for fast static analysis without a browser. Returns font families, weights used, element types, system-font flags, and design-token suggestions.",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "Public URL to load in a headless browser for live computed-style inspection."
          },
          path: {
            type: "string",
            description: "Absolute local path to an HTML or CSS file (static analysis)."
          },
          html: {
            type: "string",
            description: "Raw HTML or CSS string (static analysis, no browser)."
          },
          sampleSize: {
            type: "number",
            description: "Max DOM elements to sample for live inspection (default: 200)."
          }
        }
      }
    }
  ]
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "inspect_fonts") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
  const args = request.params.arguments ?? {};
  let result;
  if (args.url) {
    result = await inspectUrl(args.url, args.sampleSize ?? 200);
  } else if (args.path) {
    if (!existsSync(args.path)) throw new Error(`File not found: ${args.path}`);
    result = inspectStatic(args.path, true);
  } else if (args.html) {
    result = inspectStatic(args.html, false);
  } else {
    throw new Error("Provide at least one of: url, path, or html.");
  }
  const web = result.fonts.filter((f) => !f.isSystemFont);
  const system = result.fonts.filter((f) => f.isSystemFont);
  const lines = [
    `\u{1F4CD} ${result.source}`,
    `\u{1F52C} Mode: ${result.mode}${result.mode === "live" ? ` \xB7 ${result.elementsSampled} elements sampled` : ""}`,
    `\u{1F524} ${web.length} web font${web.length !== 1 ? "s" : ""} \xB7 ${system.length} system font${system.length !== 1 ? "s" : ""} filtered`,
    ""
  ];
  if (web.length === 0) {
    lines.push("No web fonts detected \u2014 only system fonts in use.");
  } else {
    lines.push("Web fonts:");
    for (const f of web) {
      const weights = f.weights.length ? f.weights.map((w, i) => `${w} ${f.weightNames[i]}`).join(", ") : "(weights unknown)";
      const elements = f.elementTypes.length ? f.elementTypes.slice(0, 6).join(", ") : "(elements unknown)";
      const count = f.count ? ` \xB7 ${f.count} elements` : "";
      lines.push(`  ${f.family}`);
      lines.push(`    token suggestion : ${f.tokenSuggestion}`);
      lines.push(`    weights          : ${weights}`);
      lines.push(`    used on          : ${elements}${count}`);
    }
  }
  if (system.length > 0) {
    lines.push("", `System / fallback fonts: ${system.map((f) => f.family).join(", ")}`);
  }
  return {
    content: [
      { type: "text", text: lines.join("\n") },
      { type: "text", text: "\n---\n" + JSON.stringify(result, null, 2) }
    ]
  };
});
var transport = new StdioServerTransport();
await server.connect(transport);
