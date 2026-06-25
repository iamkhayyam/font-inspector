import { readFileSync } from 'fs';
import { FontAuditEntry, FontAuditResult, SYSTEM_FONTS, suggestToken } from '../types.js';

export function inspectStatic(input: string, isFilePath = false): FontAuditResult {
  const src = isFilePath ? readFileSync(input, 'utf8') : input;
  const families = new Set<string>();

  // font-family: ... declarations
  const declRe = /font-family\s*:\s*([^;{}]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = declRe.exec(src)) !== null) {
    for (const chunk of m[1].split(',')) {
      const name = chunk.trim().replace(/['"]/g, '').trim();
      if (name && !name.startsWith('var(') && !name.startsWith('--') && name.length < 80) {
        families.add(name);
      }
    }
  }

  // @font-face { font-family: "..." }
  const faceRe = /@font-face\s*\{[^}]*?font-family\s*:\s*['"]?([^'";}\n]+)/gi;
  while ((m = faceRe.exec(src)) !== null) {
    families.add(m[1].trim().replace(/['"]/g, '').trim());
  }

  // Google Fonts URL families
  const gfRe = /family=([A-Za-z][A-Za-z0-9+]*)/g;
  while ((m = gfRe.exec(src)) !== null) {
    families.add(m[1].replace(/\+/g, ' '));
  }

  const fonts: FontAuditEntry[] = [...families]
    .filter(f => f.length > 0)
    .map(family => ({
      family,
      weights: [],
      weightNames: [],
      elementTypes: [],
      count: 0,
      tokenSuggestion: suggestToken(family, []),
      isSystemFont: SYSTEM_FONTS.has(family.toLowerCase()),
    }));

  return {
    source: isFilePath ? input : 'inline',
    mode: 'static',
    elementsSampled: 0,
    fonts,
  };
}
