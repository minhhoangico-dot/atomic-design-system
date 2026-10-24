// Shared color math for the design-system scripts. No dependencies.
// sRGB <-> OKLab/OKLCH conversion follows Björn Ottosson's reference
// (https://bottosson.github.io/posts/oklab/); contrast follows WCAG 2.x
// relative luminance (https://www.w3.org/TR/WCAG22/#dfn-relative-luminance).

export function parseHex(input) {
  let hex = String(input).trim().replace(/^#/, '');
  if (hex.length === 3 || hex.length === 4) hex = [...hex].map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) {
    throw new Error(`Not a hex color: "${input}" (expected #RGB or #RRGGBB)`);
  }
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

export function toHex(rgb) {
  return (
    '#' +
    rgb
      .map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function luminance(rgb) {
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const la = luminance(typeof a === 'string' ? parseHex(a) : a);
  const lb = luminance(typeof b === 'string' ? parseHex(b) : b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function rgbToOklch(rgb) {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  const H = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return [L, C, H];
}

// Returns linear-free sRGB in 0..1 (may be out of gamut; check with inGamut).
export function oklchToRgb([L, C, H]) {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(fromLinear);
}

export const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

// Reduce chroma until the color fits in sRGB, keeping lightness and hue.
export function clampChroma([L, C, H]) {
  let lo = 0;
  let hi = C;
  if (inGamut(oklchToRgb([L, C, H]))) return [L, C, H];
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToRgb([L, mid, H]))) lo = mid;
    else hi = mid;
  }
  return [L, lo, H];
}

export const rating = (ratio) =>
  ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA-large/UI' : 'fail';

// Resolve CSS custom properties from a stylesheet's text. Only top-level rules
// are read (rules nested in @media/@supports are conditional, so they are
// ignored unless `atRule` names that condition, e.g. '@media (prefers-contrast: more)').
// Later declarations win, like the cascade on a single element.
export function readCssVars(cssText, scopeSelector, atRule) {
  const vars = {};
  const text = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  const norm = (s) => s.replace(/\s+/g, ' ').replace(/"/g, "'").trim();
  const stack = []; // prelude of each open block
  let buf = '';
  for (const ch of text) {
    if (ch === '{') {
      stack.push(norm(buf));
      buf = '';
    } else if (ch === '}') {
      const selector = stack.pop() ?? '';
      const parents = stack.filter((p) => p.startsWith('@'));
      const inScope = atRule ? parents.length === 1 && parents[0] === norm(atRule) : parents.length === 0;
      const matches = !scopeSelector || selector.split(',').map((s) => s.trim()).includes(norm(scopeSelector));
      if (inScope && matches && !selector.startsWith('@')) {
        for (const d of buf.matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)) vars[d[1]] = d[2].trim();
      }
      buf = '';
    } else {
      buf += ch;
    }
  }
  return vars;
}

export function resolveVar(value, vars, depth = 0) {
  if (depth > 20) throw new Error(`Circular or too-deep var() chain at "${value}"`);
  const m = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(value.trim());
  if (!m) return value.trim();
  const next = vars[m[1]] ?? m[2];
  if (next === undefined) throw new Error(`Undefined custom property ${m[1]}`);
  return resolveVar(next, vars, depth + 1);
}
