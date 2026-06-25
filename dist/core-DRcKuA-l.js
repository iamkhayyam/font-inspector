const y = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black"
}, E = {
  accent: "#6366f1",
  bg: "#0f0f13"
};
function p(n, h) {
  const e = getComputedStyle(n), s = e.fontFamily.split(",")[0].replace(/['"]/g, "").trim(), i = String(Math.round(parseFloat(e.fontWeight)) || 400), d = e.fontStyle, c = parseFloat(e.fontSize), f = `${Math.round(c)}px`, l = e.lineHeight, u = l === "normal" ? "normal" : (parseFloat(l) / c).toFixed(2), o = h[s], m = (o == null ? void 0 : o.token) ?? s, F = (o == null ? void 0 : o.role) ?? "", L = y[i] ?? i, r = [];
  let t = n, g = 0;
  for (; t && t !== document.body && g < 6; ) {
    const S = t.tagName.toLowerCase(), a = t.id ? `#${t.id}` : "", x = !a && t.classList.length ? `.${[...t.classList][0]}` : "";
    if (r.unshift(`${S}${a || x}`), a) break;
    t = t.parentElement, g++;
  }
  return {
    family: s,
    token: m,
    role: F,
    weight: i,
    weightName: L,
    style: d,
    size: f,
    lineHeight: u,
    tagPath: r.join(" › "),
    rect: n.getBoundingClientRect()
  };
}
export {
  E as D,
  p as r
};
