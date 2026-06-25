export const WEIGHT_NAMES: Record<string, string> = {
  '100': 'Thin',      '200': 'ExtraLight', '300': 'Light',
  '400': 'Regular',   '500': 'Medium',     '600': 'Semibold',
  '700': 'Bold',      '800': 'ExtraBold',  '900': 'Black',
};

export const SYSTEM_FONTS = new Set([
  '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'roboto', 'oxygen', 'ubuntu',
  'cantarell', 'helvetica neue', 'arial', 'helvetica', 'tahoma', 'verdana',
  'trebuchet ms', 'georgia', 'times new roman', 'courier new', 'lucida console',
  'monaco', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace',
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
]);

export interface FontAuditEntry {
  family: string;
  weights: string[];
  weightNames: string[];
  elementTypes: string[];
  count: number;
  tokenSuggestion: string;
  isSystemFont: boolean;
}

export interface FontAuditResult {
  source: string;
  mode: 'live' | 'static';
  elementsSampled: number;
  fonts: FontAuditEntry[];
}

export function suggestToken(family: string, elementTypes: string[]): string {
  const f = family.toLowerCase();
  if (/mono|code|courier|consolas|fira|jetbrains|victor|inconsolata|cascadia|berkeley|source code/i.test(f)) return 'font-mono';
  if (elementTypes.some(t => ['code', 'pre', 'kbd', 'samp'].includes(t))) return 'font-mono';
  if (/serif|playfair|garamond|georgia|times|baskerville|caslon|charter|utopia|merriweather|lora|vollkorn/i.test(f)) return 'font-serif';
  return 'font-sans';
}
