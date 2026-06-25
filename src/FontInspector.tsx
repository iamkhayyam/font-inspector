import { useEffect, useState, useCallback, useRef } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface FontTokenEntry {
  token: string;
  role: string;
}

export interface FontInspectorColors {
  accent: string;
  bg: string;
}

export interface FontInspectorProps {
  /**
   * Map of font-family names to design-system tokens.
   * Key: exact CSS font-family name (no quotes).
   * Value: { token, role } — e.g. { token: 'font-sans', role: 'UI / Body' }
   */
  tokenMap?: Record<string, FontTokenEntry>;
  /**
   * UI accent and tooltip background colors.
   * Defaults to a neutral dark theme.
   */
  colors?: FontInspectorColors;
  /**
   * Keyboard shortcut label shown in the button title.
   * Default: Shift+F
   */
  shortcutLabel?: string;
}

// ── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_TOKEN_MAP: Record<string, FontTokenEntry> = {};

const DEFAULT_COLORS: FontInspectorColors = {
  accent: '#6366f1', // indigo
  bg: '#0f0f13',
};

const WEIGHT_NAMES: Record<string, string> = {
  '100': 'Thin',      '200': 'ExtraLight', '300': 'Light',
  '400': 'Regular',   '500': 'Medium',     '600': 'Semibold',
  '700': 'Bold',      '800': 'ExtraBold',  '900': 'Black',
};

// ── Internal data ─────────────────────────────────────────────────────────────

interface FontData {
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

function resolveFontData(
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

// ── Component ─────────────────────────────────────────────────────────────────

export function FontInspector({
  tokenMap = DEFAULT_TOKEN_MAP,
  colors = DEFAULT_COLORS,
  shortcutLabel = 'Shift+F',
}: FontInspectorProps = {}) {
  const [active, setActive] = useState(false);
  const [data, setData] = useState<FontData | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setActive(a => !a), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.shiftKey && e.key === 'F') toggle(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  useEffect(() => {
    if (!active) { setData(null); return; }
    const onMove = (e: MouseEvent) => {
      const el = e.target as Element;
      if (!el || tooltipRef.current?.contains(el)) return;
      setCursor({ x: e.clientX, y: e.clientY });
      setData(resolveFontData(el, tokenMap));
    };
    document.addEventListener('mousemove', onMove, { passive: true });
    return () => document.removeEventListener('mousemove', onMove);
  }, [active, tokenMap]);

  const TW = 270, TH = 130;
  const tx = cursor.x + 18 + TW > window.innerWidth  ? cursor.x - TW - 10 : cursor.x + 18;
  const ty = cursor.y + 18 + TH > window.innerHeight ? cursor.y - TH - 10 : cursor.y + 18;

  const { accent: A, bg: BG } = colors;
  const isKnown = data && tokenMap[data.family];

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggle}
        title={`Font Inspector · ${shortcutLabel}`}
        style={{
          position: 'fixed', bottom: 14, left: 14, zIndex: 9999,
          width: 34, height: 34,
          border: `1.5px solid ${active ? A : 'rgba(120,120,140,0.3)'}`,
          background: active ? A : 'rgba(245,245,248,0.93)',
          color: active ? '#fff' : 'rgba(80,80,100,0.5)',
          fontSize: 11, fontFamily: 'ui-monospace, monospace', fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          transition: 'border-color 0.12s, background 0.12s, color 0.12s',
          borderRadius: 3, letterSpacing: '0.04em', userSelect: 'none',
        }}
      >
        Aa
      </button>

      {/* Element highlight */}
      {active && data && (
        <div style={{
          position: 'fixed',
          top: data.rect.top, left: data.rect.left,
          width: data.rect.width, height: data.rect.height,
          outline: `2px solid ${isKnown ? A : 'rgba(255,107,0,0.5)'}`,
          outlineOffset: 2,
          background: `${A}18`,
          zIndex: 9990, pointerEvents: 'none',
        }} />
      )}

      {/* Tooltip */}
      {active && data && (
        <div ref={tooltipRef} style={{
          position: 'fixed', top: ty, left: tx, zIndex: 9999,
          background: BG,
          border: `1px solid rgba(255,255,255,0.1)`,
          borderLeft: `3px solid ${A}`,
          padding: '10px 14px',
          width: TW,
          pointerEvents: 'none',
          borderRadius: '0 3px 3px 0',
          boxSizing: 'border-box',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}>

          {/* Token badge + family */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 9, fontWeight: 700,
              background: isKnown ? A : 'rgba(255,107,0,0.4)',
              color: '#fff', padding: '2px 6px', borderRadius: 2,
              letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}>
              {data.token}
            </span>
            <span style={{
              fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {data.family}
            </span>
          </div>

          {/* Role */}
          {data.role && (
            <div style={{
              fontSize: 9, color: `${A}cc`,
              letterSpacing: '0.06em', marginBottom: 8,
            }}>
              {data.role}
            </div>
          )}

          {/* Weight · Style · Size */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 10px', marginBottom: 8 }}>
            {[
              { label: 'weight', value: <>{data.weight}<span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>{data.weightName}</span></> },
              { label: 'style',  value: data.style },
              { label: 'size / lh', value: <>{data.size}<span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 3px' }}>·</span>{data.lineHeight}</> },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 8, color: A, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 10, color: '#fff', fontFamily: 'ui-monospace, monospace' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Element path */}
          <div style={{
            fontSize: 9, color: 'rgba(255,255,255,0.22)',
            fontFamily: 'ui-monospace, monospace',
            borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {data.tagPath}
          </div>
        </div>
      )}
    </>
  );
}
