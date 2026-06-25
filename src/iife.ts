import { VanillaFontInspector } from './vanilla';
import type { FontInspectorOptions } from './core';

declare global {
  interface Window {
    FontInspector?: {
      toggle(): void;
      destroy(): void;
      _i?: VanillaFontInspector;
    };
  }
}

function boot() {
  // Bookmarklet re-click: just toggle the existing instance
  if (window.FontInspector?._i) {
    window.FontInspector.toggle();
    return;
  }

  const instance = new VanillaFontInspector();

  window.FontInspector = {
    _i: instance,
    toggle()  { instance.toggle(); },
    destroy() { instance.destroy(); delete window.FontInspector; },
  };

  // Activate immediately — the whole point of the bookmarklet
  instance.toggle();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

export type { FontInspectorOptions };
