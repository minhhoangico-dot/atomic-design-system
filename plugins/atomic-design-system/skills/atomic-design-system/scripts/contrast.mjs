#!/usr/bin/env node
// WCAG 2.x contrast checker.
//
//   node contrast.mjs '#FFFFFF' '#1C75BC'                 one pair, min 4.5
//   node contrast.mjs '#FFFFFF' '#1C75BC' --min 3          non-text UI / large text
//   node contrast.mjs --css tokens.css --pairs pairs.json  semantic token pairs
//   node contrast.mjs --css tokens.css --scope '[data-theme="dark"]' --pairs pairs.json
//   node contrast.mjs --css tokens.css --media '@media (prefers-contrast: more)' --pairs pairs.json
//   node contrast.mjs --css tokens.css --pairs pairs.json \
//       --layer "[data-theme='dark']" --layer "@media (prefers-contrast: more) { [data-theme='dark'] }"
//
// pairs.json: [{ "fg": "--ds-color-fg-default", "bg": "--ds-color-bg-surface", "min": 4.5, "note": "body text" }]
// A MATRIX entry checks every role against every surface it is allowed on, so a pair nobody
// thought of cannot slip through: { "fg": ["--text-default", "--text-link"], "bg": ["--surface", "--surface-alt"] }.
// fg/bg may be hex values or custom-property names, resolved from --css. Values
// are layered like the cascade: :root first, then --scope, then --media (read
// inside that at-rule, from the --scope selector or :root), then each --layer in
// order. A --layer is a selector, or "@media (...) { selector }" for a rule nested
// in one at-rule. Use layers to check stacked states (dark + more contrast).
// Exit code 1 if any pair is below its minimum, so it can gate CI.

import { readFileSync } from 'node:fs';
import { contrast, rating, readCssVars, resolveVar } from './color.mjs';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};

const min = Number(opt('--min') ?? 4.5);
const cssPath = opt('--css');
const scope = opt('--scope');
const pairsPath = opt('--pairs');
const media = opt('--media');
const layers = [];
for (let l = opt('--layer'); l !== undefined; l = opt('--layer')) layers.push(l);

const readLayer = (css, spec) => {
  const m = /^(@[^{]+)\{\s*([^}]*)\s*\}?\s*$/.exec(spec.trim());
  return m ? readCssVars(css, m[2].trim() || ':root', m[1].trim()) : readCssVars(css, spec);
};

let vars = {};
if (cssPath) {
  const css = readFileSync(cssPath, 'utf8');
  vars = {
    ...readCssVars(css, ':root'),
    ...(scope ? readCssVars(css, scope) : {}),
    ...(media ? readCssVars(css, scope ?? ':root', media) : {}),
  };
  for (const l of layers) Object.assign(vars, readLayer(css, l));
}

const resolve = (v) => (v.startsWith('--') ? resolveVar(`var(${v})`, vars) : v);

let pairs;
if (pairsPath) {
  pairs = JSON.parse(readFileSync(pairsPath, 'utf8')).flatMap((p) =>
    [p.fg].flat().flatMap((fg) => [p.bg].flat().map((bg) => ({ ...p, fg, bg }))),
  );
} else if (args.length >= 2) {
  pairs = [{ fg: args[0], bg: args[1], min }];
} else {
  console.error('Usage: contrast.mjs <fg> <bg> [--min 4.5] | --css file.css --pairs pairs.json [--scope selector]');
  process.exit(2);
}

let failures = 0;
for (const p of pairs) {
  const need = p.min ?? min;
  let fg, bg, ratio;
  try {
    fg = resolve(p.fg);
    bg = resolve(p.bg);
    ratio = contrast(fg, bg);
  } catch (e) {
    failures++;
    console.log(`ERROR  ${p.fg} on ${p.bg}: ${e.message}`);
    continue;
  }
  const ok = ratio >= need;
  if (!ok) failures++;
  const label = p.fg === fg ? fg : `${p.fg} (${fg})`;
  const blabel = p.bg === bg ? bg : `${p.bg} (${bg})`;
  console.log(
    // Never round a failure up: 4.498 prints as 4.498, not 4.50.
    `${ok ? 'PASS' : 'FAIL'}  ${Math.abs(ratio - need) < 0.01 ? (Math.floor(ratio * 1000) / 1000).toFixed(3) : ratio.toFixed(2)}:1  need ${need}  [${rating(ratio)}]  ${label} on ${blabel}${p.note ? `  — ${p.note}` : ''}`,
  );
}
if (failures) {
  console.log(`\n${failures} pair(s) below minimum. Fix by moving the semantic token to a darker/lighter ramp step, not by editing the primitive.`);
}
process.exit(failures ? 1 : 0);
