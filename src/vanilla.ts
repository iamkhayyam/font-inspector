import { DEFAULT_COLORS, FontData, FontInspectorOptions, resolveFontData } from './core';

const ATTRIBUTION = `<a href="https://knowware.institute" target="_blank" rel="noopener" tabindex="-1" style="font-size:8px;color:rgba(255,255,255,0.18);text-decoration:none;font-family:ui-monospace,monospace;letter-spacing:.06em;pointer-events:auto">Knowware</a>`;

export class VanillaFontInspector {
  private active = false;
  private opts: Required<FontInspectorOptions>;
  private btn: HTMLButtonElement;
  private hl: HTMLDivElement;
  private tip: HTMLDivElement;

  constructor(opts: FontInspectorOptions = {}) {
    this.opts = {
      tokenMap:      opts.tokenMap      ?? {},
      colors:        opts.colors        ?? { ...DEFAULT_COLORS },
      shortcutLabel: opts.shortcutLabel ?? 'Shift+F',
    };
    this.btn = this._mkBtn();
    this.hl  = this._mkHl();
    this.tip = this._mkTip();
    document.body.append(this.btn, this.hl, this.tip);
    this.btn.addEventListener('click', () => this.toggle());
    window.addEventListener('keydown', this._onKey);
  }

  toggle() {
    this.active = !this.active;
    const { accent: A } = this.opts.colors;
    if (this.active) {
      document.addEventListener('mousemove', this._onMove, { passive: true });
      Object.assign(this.btn.style, { background: A, color: '#fff', borderColor: A });
    } else {
      document.removeEventListener('mousemove', this._onMove);
      this.hl.style.display  = 'none';
      this.tip.style.display = 'none';
      Object.assign(this.btn.style, {
        background: 'rgba(245,245,248,0.93)',
        color: 'rgba(80,80,100,0.5)',
        borderColor: 'rgba(120,120,140,0.3)',
      });
    }
  }

  destroy() {
    window.removeEventListener('keydown', this._onKey);
    document.removeEventListener('mousemove', this._onMove);
    this.btn.remove(); this.hl.remove(); this.tip.remove();
  }

  private _onKey = (e: KeyboardEvent) => { if (e.shiftKey && e.key === 'F') this.toggle(); };

  private _onMove = (e: MouseEvent) => {
    const el = e.target as Element;
    if (!el || this.tip.contains(el) || el === this.btn) return;
    const data = resolveFontData(el, this.opts.tokenMap);
    this._drawHl(data);
    this._drawTip(data, e.clientX, e.clientY);
  };

  private _mkBtn(): HTMLButtonElement {
    const b = document.createElement('button');
    Object.assign(b.style, {
      position: 'fixed', bottom: '14px', left: '14px', zIndex: '2147483647',
      width: '34px', height: '34px', boxSizing: 'border-box', padding: '0',
      border: '1.5px solid rgba(120,120,140,0.3)',
      background: 'rgba(245,245,248,0.93)', color: 'rgba(80,80,100,0.5)',
      fontSize: '11px', fontFamily: 'ui-monospace,monospace', fontWeight: '700',
      lineHeight: '1', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)', borderRadius: '3px',
      letterSpacing: '0.04em', userSelect: 'none',
      transition: 'border-color .12s,background .12s,color .12s',
    });
    b.textContent = 'Aa';
    b.title = `Font Inspector · ${this.opts.shortcutLabel}`;
    return b;
  }

  private _mkHl(): HTMLDivElement {
    const d = document.createElement('div');
    Object.assign(d.style, {
      position: 'fixed', zIndex: '2147483646',
      pointerEvents: 'none', display: 'none', boxSizing: 'border-box',
    });
    return d;
  }

  private _mkTip(): HTMLDivElement {
    const d = document.createElement('div');
    Object.assign(d.style, {
      position: 'fixed', zIndex: '2147483647', display: 'none',
      background: this.opts.colors.bg,
      border: '1px solid rgba(255,255,255,0.1)',
      borderLeft: `3px solid ${this.opts.colors.accent}`,
      padding: '10px 14px 8px', width: '270px', boxSizing: 'border-box',
      borderRadius: '0 3px 3px 0',
      fontFamily: 'ui-sans-serif,system-ui,sans-serif',
      pointerEvents: 'none',
    });
    return d;
  }

  private _drawHl(data: FontData) {
    const { rect } = data;
    const known = !!this.opts.tokenMap[data.family];
    const A = known ? this.opts.colors.accent : 'rgba(255,107,0,0.5)';
    Object.assign(this.hl.style, {
      display: 'block',
      top: `${rect.top}px`, left: `${rect.left}px`,
      width: `${rect.width}px`, height: `${rect.height}px`,
      outline: `2px solid ${A}`, outlineOffset: '2px',
      background: `${A}18`,
    });
  }

  private _drawTip(data: FontData, cx: number, cy: number) {
    const TW = 270, TH = 148;
    const tx = cx + 18 + TW > window.innerWidth  ? cx - TW - 10 : cx + 18;
    const ty = cy + 18 + TH > window.innerHeight ? cy - TH - 10 : cy + 18;
    const A = this.opts.colors.accent;
    const known = !!this.opts.tokenMap[data.family];
    const badge = known ? A : 'rgba(255,107,0,0.4)';

    Object.assign(this.tip.style, {
      display: 'block', top: `${ty}px`, left: `${tx}px`,
      borderLeftColor: A,
    });

    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:9px;font-weight:700;background:${badge};color:#fff;padding:2px 6px;border-radius:2px;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap">${esc(data.token)}</span>
        <span style="font-size:12px;color:rgba(255,255,255,0.65);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(data.family)}</span>
      </div>
      ${data.role ? `<div style="font-size:9px;color:${A}cc;letter-spacing:.06em;margin-bottom:8px">${esc(data.role)}</div>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 10px;margin-bottom:8px">
        ${col(A,'weight',`${data.weight}<span style="color:rgba(255,255,255,0.45);margin-left:4px">${esc(data.weightName)}</span>`)}
        ${col(A,'style', esc(data.style))}
        ${col(A,'size / lh', `${esc(data.size)}<span style="color:rgba(255,255,255,0.3);margin:0 3px">·</span>${esc(data.lineHeight)}`)}
      </div>
      <div style="font-size:9px;color:rgba(255,255,255,0.22);font-family:ui-monospace,monospace;border-top:1px solid rgba(255,255,255,0.08);padding-top:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(data.tagPath)}</div>
      <div style="margin-top:6px;text-align:right;pointer-events:auto">${ATTRIBUTION}</div>
    `;
  }
}

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function col(accent: string, label: string, value: string) {
  return `<div>
    <div style="font-size:8px;color:${accent};font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:3px">${label}</div>
    <div style="font-size:10px;color:#fff;font-family:ui-monospace,monospace">${value}</div>
  </div>`;
}
