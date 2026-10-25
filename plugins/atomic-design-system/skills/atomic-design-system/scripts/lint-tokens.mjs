#!/usr/bin/env node
// Flags raw design values in component styles so every visual decision
// flows from tokens. Token files themselves are skipped.
//
//   node lint-tokens.mjs src/components            scan a folder (*.css)
//   node lint-tokens.mjs src/components --strict   also flag bare px (except 0/1px)
//
// Errors  : raw colors (#hex, rgb(), hsl(), oklch(), named colors in color props),
//           literal font-family names, margin on atom root classes (atoms must not
//           position themselves; the parent or a layout primitive does),
//           `transition: all` (or no property), and transitions/animations of layout
//           properties (width, height, top, left, margin…) — animate transform/opacity.
// Warnings: px lengths that are not 0 or 1px hairlines (with --strict they are errors);
//           raw durations in transition/animation (use duration tokens).
// Exit 1 on any error.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const roots = args.filter((a) => !a.startsWith('--'));
if (!roots.length) {
  console.error('Usage: lint-tokens.mjs <dir|file>... [--strict]');
  process.exit(2);
}

const isTokenFile = (p) => /(^|[\\/])(tokens?)([\\/]|[.-])/i.test(p) || /tokens?\.(module\.)?css$/i.test(p);

function* walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const e of readdirSync(p)) if (e !== 'node_modules' && !e.startsWith('.')) yield* walk(join(p, e));
  } else if (/\.css$/.test(p)) yield p;
}

const COLOR_FN = /\b(rgba?|hsla?|oklch|oklab|lab|lch|color)\(/i;
const HEX = /#[0-9a-f]{3,8}\b/i;
const NAMED = /:\s*(?:[^;]*\s)?(red|blue|green|white|black|gray|grey|orange|yellow|purple|pink)\b/i;
const COLOR_PROP = /^(color|background(-color)?|border(-\w+)?-color|border|outline(-color)?|fill|stroke|box-shadow|text-decoration-color|caret-color|accent-color)\s*:/i;
const FONT = /^font-family\s*:\s*(?!\s*(var\(|inherit|initial|unset)).+/i;
const PX = /(?<![\w-])(\d*\.?\d+)px\b/g;

let errors = 0;
let warnings = 0;
const report = (kind, file, line, msg, text) => {
  if (kind === 'error') errors++;
  else warnings++;
  console.log(`${kind.toUpperCase().padEnd(7)} ${file}:${line}  ${msg}\n          ${text.trim()}`);
};

for (const root of roots) {
  for (const file of walk(root)) {
    if (isTokenFile(file)) continue;
    const rel = relative(process.cwd(), file);
    const isAtom = file.split(sep).includes('atoms');
    const lines = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).split('\n');
    let selector = '';
    let rootClass = null;
    lines.forEach((raw, i) => {
      const line = raw.trim();
      const n = i + 1;
      if (line.includes('{')) {
        selector = line.slice(0, line.indexOf('{')).trim();
        if (rootClass === null && /^\.[A-Za-z][\w-]*$/.test(selector)) rootClass = selector;
      }
      if (!line.includes(':') || line.endsWith('{')) return;
      const decl = line.replace(/^[^{]*\{/, '').trim();
      if (decl.startsWith('--')) return; // defining a component-scoped custom property is fine if its value is a token
      if (HEX.test(decl) || COLOR_FN.test(decl) || (COLOR_PROP.test(decl) && NAMED.test(decl))) {
        report('error', rel, n, 'Raw color. Use a semantic token, e.g. var(--ds-color-bg-brand-emphasis).', raw);
      }
      if (FONT.test(decl)) report('error', rel, n, 'Literal font family. Use var(--ds-font-family-body|heading).', raw);
      if (isAtom && selector === rootClass && /^margin(-[\w]+)?\s*:/.test(decl) && !/:\s*0\s*;?$/.test(decl)) {
        report('error', rel, n, 'Margin on an atom root. Spacing belongs to the parent (Stack/Inline/Grid gap).', raw);
      }
      const motion = decl.match(/^(transition(?:-property)?|animation)\s*:\s*([^;]+)/i);
      if (motion && !/^\s*(none|inherit|initial|unset)\s*$/i.test(motion[2])) {
        const [, prop, value] = motion;
        const parts = value.split(',').map((x) => x.trim());
        if (/^transition/i.test(prop)) {
          const first = (x) => x.split(/\s+/)[0];
          if (parts.some((x) => first(x) === 'all' || (prop.toLowerCase() === 'transition' && /^[\d.]|^var\(/.test(first(x))))) {
            report('error', rel, n, 'transition: all. Name the properties (e.g. background-color, opacity, transform).', raw);
          }
          if (parts.some((x) => /^(width|height|(min|max)-(width|height)|top|left|right|bottom|inset|margin[\w-]*|padding[\w-]*|inline-size|block-size)$/.test(first(x)))) {
            report('error', rel, n, 'Animating a layout property. Animate transform or opacity instead (cheap, no reflow).', raw);
          }
        }
        if (/(?<![\w-])\d*\.?\d+m?s\b/.test(value)) report('warning', rel, n, 'Raw duration. Use a duration token (e.g. var(--ds-duration-base)) so reduced-motion can adjust it.', raw);
      }
      for (const m of decl.matchAll(PX)) {
        const v = Number(m[1]);
        if (v === 0 || v === 1) continue; // 1px hairlines are a common, intentional exception
        if (/^@media/.test(selector)) continue;
        report(strict ? 'error' : 'warning', rel, n, `Raw ${m[0]}. Use a space/size/radius token (rem-based so it scales with user font size).`, raw);
        break;
      }
    });
  }
}

console.log(`\n${errors} error(s), ${warnings} warning(s).`);
process.exit(errors ? 1 : 0);
