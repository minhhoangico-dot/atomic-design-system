#!/usr/bin/env node
// Create a component folder from the skill's template so every component
// starts with the same structure: component, CSS module, stories, test, index.
//
//   node scaffold.mjs Button --level atoms --dir src/components --prefix ds
//   node scaffold.mjs AppointmentSlot --level molecules --dir src/components --prefix fdc --title "Molecules/AppointmentSlot"
//
// Never overwrites existing files. Prints the created paths.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i === -1 ? d : args[i + 1];
};
const name = args[0];
const level = opt('--level');
const LEVELS = ['layout', 'atoms', 'molecules', 'organisms', 'templates', 'pages'];
if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name) || !LEVELS.includes(level)) {
  console.error(`Usage: scaffold.mjs <PascalName> --level ${LEVELS.join('|')} [--dir src/components] [--prefix ds] [--title "Atoms/Name"]`);
  process.exit(2);
}
const dir = opt('--dir', 'src/components');
const prefix = opt('--prefix', 'ds');
const levelTitle = level[0].toUpperCase() + level.slice(1);
const title = opt('--title', `${levelTitle}/${name}`);
const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const templateDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'component-template');
const outDir = join(dir, level, name);
mkdirSync(outDir, { recursive: true });

const fill = (s) =>
  s
    .replaceAll('__NAME__', name)
    .replaceAll('__KEBAB__', kebab)
    .replaceAll('__PREFIX__', prefix)
    .replaceAll('__LEVEL__', level)
    .replaceAll('__TITLE__', title);

for (const file of readdirSync(templateDir)) {
  const target = join(outDir, fill(file));
  if (existsSync(target)) {
    console.log(`skip    ${target} (exists)`);
    continue;
  }
  writeFileSync(target, fill(readFileSync(join(templateDir, file), 'utf8')));
  console.log(`create  ${target}`);
}
console.log(`\nNext: add the export to your barrel (src/index.ts):\n  export * from './components/${level}/${name}';`);
