import { FontAuditEntry, FontAuditResult, SYSTEM_FONTS, WEIGHT_NAMES, suggestToken } from '../types.js';

export async function inspectUrl(url: string, sampleSize = 200): Promise<FontAuditResult> {
  let chromium: typeof import('playwright')['chromium'];
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    throw new Error(
      'Playwright not installed. Run: npx playwright install chromium',
    );
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
  } catch {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15_000 });
  }

  // Let web fonts settle
  await page.waitForTimeout(800);

  const raw = await page.evaluate((max: number) => {
    const els = Array.from(document.querySelectorAll('body *')).filter(el => {
      const s = getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
    }).slice(0, max);

    const map: Record<string, { ws: string[]; ts: string[]; n: number }> = {};

    for (const el of els) {
      const cs = getComputedStyle(el);
      const family = cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
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
        count: d.n,
      })),
    };
  }, sampleSize);

  await browser.close();

  const fonts: FontAuditEntry[] = raw.fonts
    .sort((a, b) => b.count - a.count)
    .map(f => ({
      ...f,
      weightNames: f.weights.map(w => WEIGHT_NAMES[w] ?? w),
      tokenSuggestion: suggestToken(f.family, f.elementTypes),
      isSystemFont: SYSTEM_FONTS.has(f.family.toLowerCase()),
    }));

  return { source: url, mode: 'live', elementsSampled: raw.total, fonts };
}
