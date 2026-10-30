#!/usr/bin/env node
// Enforces the atomic dependency rule: a component may import only from its
// own level or lower (atoms < molecules < organisms < templates < pages).
// An atom importing a molecule is a sign the "atom" is really a molecule, or
// that a shared piece should move down a level.
//
//   node lint-levels.mjs src/components
//
// Levels are read from folder names anywhere in the path: layout, atoms,
// molecules, organisms, templates, pages. Layout primitives rank with atoms.
// Exit 1 on any violation.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const RANK = { layout: 1, atoms: 1, molecules: 2, organisms: 3, templates: 4, pages: 5 };
const roots = process.argv.slice(2);
if (!roots.length) {
  console.error('Usage: lint-levels.mjs <components-dir>...');
  process.exit(2);
}

const levelOf = (p) => {
  const parts = resolve(p).split(sep);
  for (let i = parts.length - 1; i >= 0; i--) if (RANK[parts[i]]) return parts[i];
  return null;
};

function* walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const e of readdirSync(p)) if (e !== 'node_modules' && !e.startsWith('.')) yield* walk(join(p, e));
  } else if (/\.(tsx?|jsx?)$/.test(p) && !/\.(stories|test|spec)\.[jt]sx?$/.test(p)) yield p;
}

let violations = 0;
for (const root of roots) {
  for (const file of walk(root)) {
    const own = levelOf(file);
    if (!own) continue;
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(/(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]/g)) {
      const spec = m[1];
      if (!spec.startsWith('.')) continue;
      const target = levelOf(resolve(dirname(file), spec));
      if (target && RANK[target] > RANK[own]) {
        violations++;
        const line = src.slice(0, m.index).split('\n').length;
        console.log(
          `ERROR  ${relative(process.cwd(), file)}:${line}  ${own} imports ${target} ("${spec}"). ` +
            `Move the shared piece down a level, or move this component up.`,
        );
      }
    }
  }
}
console.log(violations ? `\n${violations} violation(s).` : 'No level violations.');
process.exit(violations ? 1 : 0);
