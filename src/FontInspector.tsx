import { useEffect, useState, useCallback, useRef } from 'react';
import {
  DEFAULT_COLORS,
  FontData,
  FontInspectorOptions,
  resolveFontData,
} from './core';

export type { FontTokenEntry, FontInspectorColors, FontInspectorOptions } from './core';

function Attribution() {
  return (
    <div style={{ marginTop: 6, textAlign: 'right' }}>
      <a
        href="https://knowware.institute"
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        style={{
          fontSize: 8, color: 'rgba(255,255,255,0.18)', textDecoration: 'none',
          fontFamily: 'ui-monospace,monospace', letterSpacing: '0.06em',
          pointerEvents: 'auto',
        }}
      >
        Knowware
      </a>
    </div>
  );
}

export function FontInspector({
  tokenMap = {},
  colors = DEFAULT_COLORS,
  shortcutLabel = 'Shift+F',
}: FontInspectorOptions = {}) {
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
      setData(resolveFontData(el, tokenMap ?? {}));
    };
    document.addEventListener('mousemove', onMove, { passive: true });
    return () => document.removeEventListener('mousemove', onMove);
  }, [active, tokenMap]);

  const { accent: A, bg: BG } = colors ?? DEFAULT_COLORS;
  const TW = 270, TH = 148;
  const tx = cursor.x + 18 + TW > window.innerWidth  ? cursor.x - TW - 10 : cursor.x + 18;
  const ty = cursor.y + 18 + TH > window.innerHeight ? cursor.y - TH - 10 : cursor.y + 18;
  const isKnown = data && tokenMap?.[data.family];

  return (
    <>
      <button
        onClick={toggle}
        title={`Font Inspector · ${shortcutLabel ?? 'Shift+F'}`}
        style={{
          position: 'fixed', bottom: 14, left: 14, zIndex: 9999,
          width: 34, height: 34, boxSizing: 'border-box', padding: 0,
          border: `1.5px solid ${active ? A : 'rgba(120,120,140,0.3)'}`,
          background: active ? A : 'rgba(245,245,248,0.93)',
          color: active ? '#fff' : 'rgba(80,80,100,0.5)',
          fontSize: 11, fontFamily: 'ui-monospace,monospace', fontWeight: 700,
          lineHeight: 1, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', borderRadius: 3,
          letterSpacing: '0.04em', userSelect: 'none',
          transition: 'border-color .12s,background .12s,color .12s',
        }}
      >
        Aa
      </button>

      {active && data && (
        <div style={{
          position: 'fixed',
          top: data.rect.top, left: data.rect.left,
          width: data.rect.width, height: data.rect.height,
          outline: `2px solid ${isKnown ? A : 'rgba(255,107,0,0.5)'}`,
          outlineOffset: 2, background: `${A}18`,
          zIndex: 9990, pointerEvents: 'none',
        }} />
      )}

      {active && data && (
        <div ref={tooltipRef} style={{
          position: 'fixed', top: ty, left: tx, zIndex: 9999,
          background: BG, border: '1px solid rgba(255,255,255,0.1)',
          borderLeft: `3px solid ${A}`, padding: '10px 14px 8px',
          width: TW, boxSizing: 'border-box', pointerEvents: 'none',
          borderRadius: '0 3px 3px 0',
          fontFamily: 'ui-sans-serif,system-ui,sans-serif',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 9, fontWeight: 700,
              background: isKnown ? A : 'rgba(255,107,0,0.4)',
              color: '#fff', padding: '2px 6px', borderRadius: 2,
              letterSpacing: '.12em', textTransform: 'uppercase', whiteSpace: 'nowrap',
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

          {data.role && (
            <div style={{ fontSize: 9, color: `${A}cc`, letterSpacing: '.06em', marginBottom: 8 }}>
              {data.role}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 10px', marginBottom: 8 }}>
            {[
              { label: 'weight',   value: <>{data.weight}<span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>{data.weightName}</span></> },
              { label: 'style',    value: data.style },
              { label: 'size / lh',value: <>{data.size}<span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 3px' }}>·</span>{data.lineHeight}</> },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 8, color: A, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 10, color: '#fff', fontFamily: 'ui-monospace,monospace' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{
            fontSize: 9, color: 'rgba(255,255,255,0.22)', fontFamily: 'ui-monospace,monospace',
            borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {data.tagPath}
          </div>

          <Attribution />
        </div>
      )}
    </>
  );
}
