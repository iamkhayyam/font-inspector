export const WEIGHT_NAMES: Record<string, string> = {
  '100': 'Thin',      '200': 'ExtraLight', '300': 'Light',
  '400': 'Regular',   '500': 'Medium',     '600': 'Semibold',
  '700': 'Bold',      '800': 'ExtraBold',  '900': 'Black',
};

export interface FontTokenEntry {
  token: string;
  role: string;
}

export interface FontInspectorColors {
  accent: string;
  bg: string;
}

export interface FontInspectorOptions {
  tokenMap?: Record<string, FontTokenEntry>;
  colors?: FontInspectorColors;
  shortcutLabel?: string;
}

export interface FontData {
  family: string;
  token: string;
  role: string;
  weight: string;
  weightName: string;
  style: string;
  size: string;
  lineHeight: string;
  tagPath: string;
  rect: DOMRect;
}

export const DEFAULT_COLORS: FontInspectorColors = {
  accent: '#6366f1',
  bg: '#0f0f13',
};

export function resolveFontData(
  el: Element,
  tokenMap: Record<string, FontTokenEntry>,
): FontData {
  const cs = getComputedStyle(el);
  const family = cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  const weight = String(Math.round(parseFloat(cs.fontWeight)) || 400);
  const style = cs.fontStyle;
  const sizePx = parseFloat(cs.fontSize);
  const size = `${Math.round(sizePx)}px`;
  const lhRaw = cs.lineHeight;
  const lineHeight =
    lhRaw === 'normal' ? 'normal' : (parseFloat(lhRaw) / sizePx).toFixed(2);

  const mapped = tokenMap[family];
  const token = mapped?.token ?? family;
  const role = mapped?.role ?? '';
  const weightName = WEIGHT_NAMES[weight] ?? weight;

  const parts: string[] = [];
  let cur: Element | null = el;
  let depth = 0;
  while (cur && cur !== document.body && depth < 6) {
    const tag = cur.tagName.toLowerCase();
    const id = cur.id ? `#${cur.id}` : '';
    const cls = !id && cur.classList.length ? `.${[...cur.classList][0]}` : '';
    parts.unshift(`${tag}${id || cls}`);
    if (id) break;
    cur = cur.parentElement;
    depth++;
  }

  return {
    family, token, role, weight, weightName, style, size, lineHeight,
    tagPath: parts.join(' › '),
    rect: el.getBoundingClientRect(),
  };
}
