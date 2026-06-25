import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { existsSync } from 'fs';
import { inspectUrl } from './tools/inspect-url.js';
import { inspectStatic } from './tools/inspect-static.js';
import type { FontAuditResult } from './types.js';

const server = new Server(
  { name: 'font-inspector', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'inspect_fonts',
      description:
        'Audit fonts on a webpage or in HTML/CSS source. ' +
        'Pass a URL for live inspection (headless Chromium, accurate computed styles across real DOM elements). ' +
        'Pass a local file path or raw HTML/CSS string for fast static analysis without a browser. ' +
        'Returns font families, weights used, element types, system-font flags, and design-token suggestions.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          url: {
            type: 'string',
            description: 'Public URL to load in a headless browser for live computed-style inspection.',
          },
          path: {
            type: 'string',
            description: 'Absolute local path to an HTML or CSS file (static analysis).',
          },
          html: {
            type: 'string',
            description: 'Raw HTML or CSS string (static analysis, no browser).',
          },
          sampleSize: {
            type: 'number',
            description: 'Max DOM elements to sample for live inspection (default: 200).',
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'inspect_fonts') {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const args = (request.params.arguments ?? {}) as {
    url?: string;
    path?: string;
    html?: string;
    sampleSize?: number;
  };

  let result: FontAuditResult;

  if (args.url) {
    result = await inspectUrl(args.url, args.sampleSize ?? 200);
  } else if (args.path) {
    if (!existsSync(args.path)) throw new Error(`File not found: ${args.path}`);
    result = inspectStatic(args.path, true);
  } else if (args.html) {
    result = inspectStatic(args.html, false);
  } else {
    throw new Error('Provide at least one of: url, path, or html.');
  }

  const web    = result.fonts.filter(f => !f.isSystemFont);
  const system = result.fonts.filter(f =>  f.isSystemFont);

  const lines: string[] = [
    `📍 ${result.source}`,
    `🔬 Mode: ${result.mode}${result.mode === 'live' ? ` · ${result.elementsSampled} elements sampled` : ''}`,
    `🔤 ${web.length} web font${web.length !== 1 ? 's' : ''} · ${system.length} system font${system.length !== 1 ? 's' : ''} filtered`,
    '',
  ];

  if (web.length === 0) {
    lines.push('No web fonts detected — only system fonts in use.');
  } else {
    lines.push('Web fonts:');
    for (const f of web) {
      const weights = f.weights.length ? f.weights.map((w, i) => `${w} ${f.weightNames[i]}`).join(', ') : '(weights unknown)';
      const elements = f.elementTypes.length ? f.elementTypes.slice(0, 6).join(', ') : '(elements unknown)';
      const count = f.count ? ` · ${f.count} elements` : '';
      lines.push(`  ${f.family}`);
      lines.push(`    token suggestion : ${f.tokenSuggestion}`);
      lines.push(`    weights          : ${weights}`);
      lines.push(`    used on          : ${elements}${count}`);
    }
  }

  if (system.length > 0) {
    lines.push('', `System / fallback fonts: ${system.map(f => f.family).join(', ')}`);
  }

  return {
    content: [
      { type: 'text', text: lines.join('\n') },
      { type: 'text', text: '\n---\n' + JSON.stringify(result, null, 2) },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
