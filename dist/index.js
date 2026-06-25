import { jsxs as s, Fragment as f, jsx as t } from "react/jsx-runtime";
import { useState as g, useRef as I, useCallback as L, useEffect as y } from "react";
import { D as v, r as A } from "./core-DRcKuA-l.js";
function C() {
  return /* @__PURE__ */ t("div", { style: { marginTop: 6, textAlign: "right" }, children: /* @__PURE__ */ t(
    "a",
    {
      href: "https://knowware.institute",
      target: "_blank",
      rel: "noopener noreferrer",
      tabIndex: -1,
      style: {
        fontSize: 8,
        color: "rgba(255,255,255,0.18)",
        textDecoration: "none",
        fontFamily: "ui-monospace,monospace",
        letterSpacing: "0.06em",
        pointerEvents: "auto"
      },
      children: "Knowware"
    }
  ) });
}
function B({
  tokenMap: a = {},
  colors: w = v,
  shortcutLabel: S = "Shift+F"
} = {}) {
  const [r, z] = g(!1), [e, m] = g(null), [l, F] = g({ x: 0, y: 0 }), u = I(null), c = L(() => z((o) => !o), []);
  y(() => {
    const o = (i) => {
      i.shiftKey && i.key === "F" && c();
    };
    return window.addEventListener("keydown", o), () => window.removeEventListener("keydown", o);
  }, [c]), y(() => {
    if (!r) {
      m(null);
      return;
    }
    const o = (i) => {
      var b;
      const p = i.target;
      !p || (b = u.current) != null && b.contains(p) || (F({ x: i.clientX, y: i.clientY }), m(A(p, a ?? {})));
    };
    return document.addEventListener("mousemove", o, { passive: !0 }), () => document.removeEventListener("mousemove", o);
  }, [r, a]);
  const { accent: n, bg: E } = w ?? v, d = 270, h = 148, T = l.x + 18 + d > window.innerWidth ? l.x - d - 10 : l.x + 18, k = l.y + 18 + h > window.innerHeight ? l.y - h - 10 : l.y + 18, x = e && (a == null ? void 0 : a[e.family]);
  return /* @__PURE__ */ s(f, { children: [
    /* @__PURE__ */ t(
      "button",
      {
        onClick: c,
        title: `Font Inspector · ${S ?? "Shift+F"}`,
        style: {
          position: "fixed",
          bottom: 14,
          left: 14,
          zIndex: 9999,
          width: 34,
          height: 34,
          boxSizing: "border-box",
          padding: 0,
          border: `1.5px solid ${r ? n : "rgba(120,120,140,0.3)"}`,
          background: r ? n : "rgba(245,245,248,0.93)",
          color: r ? "#fff" : "rgba(80,80,100,0.5)",
          fontSize: 11,
          fontFamily: "ui-monospace,monospace",
          fontWeight: 700,
          lineHeight: 1,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          borderRadius: 3,
          letterSpacing: "0.04em",
          userSelect: "none",
          transition: "border-color .12s,background .12s,color .12s"
        },
        children: "Aa"
      }
    ),
    r && e && /* @__PURE__ */ t("div", { style: {
      position: "fixed",
      top: e.rect.top,
      left: e.rect.left,
      width: e.rect.width,
      height: e.rect.height,
      outline: `2px solid ${x ? n : "rgba(255,107,0,0.5)"}`,
      outlineOffset: 2,
      background: `${n}18`,
      zIndex: 9990,
      pointerEvents: "none"
    } }),
    r && e && /* @__PURE__ */ s("div", { ref: u, style: {
      position: "fixed",
      top: k,
      left: T,
      zIndex: 9999,
      background: E,
      border: "1px solid rgba(255,255,255,0.1)",
      borderLeft: `3px solid ${n}`,
      padding: "10px 14px 8px",
      width: d,
      boxSizing: "border-box",
      pointerEvents: "none",
      borderRadius: "0 3px 3px 0",
      fontFamily: "ui-sans-serif,system-ui,sans-serif"
    }, children: [
      /* @__PURE__ */ s("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
        /* @__PURE__ */ t("span", { style: {
          fontSize: 9,
          fontWeight: 700,
          background: x ? n : "rgba(255,107,0,0.4)",
          color: "#fff",
          padding: "2px 6px",
          borderRadius: 2,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          whiteSpace: "nowrap"
        }, children: e.token }),
        /* @__PURE__ */ t("span", { style: {
          fontSize: 12,
          color: "rgba(255,255,255,0.65)",
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }, children: e.family })
      ] }),
      e.role && /* @__PURE__ */ t("div", { style: { fontSize: 9, color: `${n}cc`, letterSpacing: ".06em", marginBottom: 8 }, children: e.role }),
      /* @__PURE__ */ t("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 10px", marginBottom: 8 }, children: [
        { label: "weight", value: /* @__PURE__ */ s(f, { children: [
          e.weight,
          /* @__PURE__ */ t("span", { style: { color: "rgba(255,255,255,0.45)", marginLeft: 4 }, children: e.weightName })
        ] }) },
        { label: "style", value: e.style },
        { label: "size / lh", value: /* @__PURE__ */ s(f, { children: [
          e.size,
          /* @__PURE__ */ t("span", { style: { color: "rgba(255,255,255,0.3)", margin: "0 3px" }, children: "·" }),
          e.lineHeight
        ] }) }
      ].map(({ label: o, value: i }) => /* @__PURE__ */ s("div", { children: [
        /* @__PURE__ */ t("div", { style: { fontSize: 8, color: n, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 3 }, children: o }),
        /* @__PURE__ */ t("div", { style: { fontSize: 10, color: "#fff", fontFamily: "ui-monospace,monospace" }, children: i })
      ] }, o)) }),
      /* @__PURE__ */ t("div", { style: {
        fontSize: 9,
        color: "rgba(255,255,255,0.22)",
        fontFamily: "ui-monospace,monospace",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingTop: 6,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }, children: e.tagPath }),
      /* @__PURE__ */ t(C, {})
    ] })
  ] });
}
export {
  B as FontInspector
};
