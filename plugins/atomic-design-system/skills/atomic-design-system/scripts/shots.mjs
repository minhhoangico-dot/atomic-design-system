#!/usr/bin/env node
// Visual review, measured: renders every Storybook story (or plain pages) in a real browser,
// at several widths and in every theme, and measures what screenshots alone make you guess.
//   overflow     page scrolls sideways (WCAG 1.4.10 reflow)               Blocker
//   target-size  control smaller than 24px (WCAG 2.5.8) / --target-min    Blocker / High
//   text-size    visible text smaller than 12px / --min-font               High / Medium
//   text-clip    text cut off by overflow:hidden or an ellipsis            Medium
//   focus        Tab reaches an element whose look does not change         Blocker
//   console      console errors and uncaught exceptions                    High
//   story        Storybook render or play function failed                  Blocker
//   axe          axe-core violations (critical, serious, moderate, minor)  Blocker / High / Medium / Nit
// Writes report.json, report.md and screenshots (PNG) to --out; exit 1 when anything
// reaches --fail-on (default blocker). Needs Playwright (and axe-core for the axe check)
// resolvable from the project or globally.
//
//   node shots.mjs --storybook storybook-static [--filter re] [--exclude re] [--themes clinic,nursing-home]
//   node shots.mjs --page page.html [--page https://…] [--themes light,dark]
//   options: --out visual-review  --widths 320,390,768,1280  --target-min 44  --min-font 16
//            --shots findings|all|none  --fail-on blocker|high|medium  --theme-global theme
//            --theme-attr data-theme  --max-tabs 40  --axe path/to/axe.min.js
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';

const HELP = readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n');
const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) { console.log(HELP); process.exit(0); }
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i > -1 ? args[i + 1] : def; };
const many = (name) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []));

const out = resolve(opt('out', 'visual-review'));
const widths = opt('widths', '320,390,768,1280').split(',').map(Number).sort((a, b) => a - b);
const themes = opt('themes', '').split(',').filter(Boolean);
const targetMin = Number(opt('target-min', 44));
const minFont = Number(opt('min-font', 16));
const shotsMode = opt('shots', 'findings');
const failOn = opt('fail-on', 'blocker');
const themeGlobal = opt('theme-global', 'theme');
const themeAttr = opt('theme-attr', 'data-theme');
const maxTabs = Number(opt('max-tabs', 40));
const filter = opt('filter') ? new RegExp(opt('filter')) : null;
const exclude = opt('exclude') ? new RegExp(opt('exclude')) : null;
const SEVERITIES = ['blocker', 'high', 'medium', 'nit'];

// Resolve from the project first, then from this script (and NODE_PATH).
function load(name) {
  for (const base of [join(process.cwd(), 'noop.js'), import.meta.url]) {
    try { return createRequire(base)(name); } catch { /* next */ }
  }
  return null;
}
function resolvePath(name) {
  for (const base of [join(process.cwd(), 'noop.js'), import.meta.url]) {
    try { return createRequire(base).resolve(name); } catch { /* next */ }
  }
  return null;
}
const pw = load('playwright');
if (!pw) { console.error('FAIL: Playwright not found. Install it (npm i -D playwright) — a review without a browser is not a review.'); process.exit(2); }
const axePath = opt('axe') || resolvePath('axe-core/axe.min.js');
const axeSrc = axePath && existsSync(axePath) ? readFileSync(axePath, 'utf8') : null;
if (!axeSrc) console.warn('warn: axe-core not found; the axe check is skipped (npm i -D axe-core).');

// ---- targets ---------------------------------------------------------------
const httpServers = [];
async function serveDir(dir) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon' };
  const server = createServer((req, res) => {
    let p = join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
    if (!p.startsWith(dir) || !existsSync(p)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' });
    res.end(readFileSync(p));
  });
  httpServers.push(server);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return `http://127.0.0.1:${server.address().port}`;
}

const targets = [];
const sb = opt('storybook');
if (sb) {
  if (!/^https?:/.test(sb) && !existsSync(join(resolve(sb), 'index.json'))) { console.error(`FAIL: ${resolve(sb)}/index.json not found. Build Storybook first (npm run build-storybook).`); process.exit(2); }
  const base = /^https?:/.test(sb) ? sb.replace(/\/$/, '') : await serveDir(resolve(sb));
  const res = await fetch(`${base}/index.json`);
  if (!res.ok) { console.error(`FAIL: ${base}/index.json answered ${res.status}.`); process.exit(2); }
  const index = await res.json();
  for (const e of Object.values(index.entries)) {
    if (e.type !== 'story' || (filter && !filter.test(e.id)) || (exclude && exclude.test(e.id))) continue;
    targets.push({ kind: 'story', id: e.id, title: `${e.title} › ${e.name}`, url: (theme) => `${base}/iframe.html?id=${encodeURIComponent(e.id)}&viewMode=story${theme ? `&globals=${themeGlobal}:${theme}` : ''}` });
  }
}
// Local pages are served over http (file:// breaks fetches, fonts and axe).
const servers = new Map();
for (const p of many('page')) {
  let href = p;
  if (!/^https?:/.test(p)) {
    const file = resolve(p);
    const dir = dirname(file);
    if (!servers.has(dir)) servers.set(dir, await serveDir(dir));
    href = `${servers.get(dir)}/${basename(file)}`;
  }
  targets.push({ kind: 'page', id: p.replace(/[^\w.-]+/g, '_'), title: p, url: () => href });
}
if (!targets.length) { console.error('FAIL: nothing to review (pass --storybook <dir|url> or --page <file|url>).'); process.exit(2); }

// ---- in-page measurements (run in the browser) -------------------------------
const MEASURE = ({ targetMin, minFont }) => {
  const sel = (el) => {
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && parts.length < 3; n = n.parentElement) {
      let s = n.tagName.toLowerCase();
      if (n.id) { parts.unshift(`${s}#${n.id}`); break; }
      const cls = [...n.classList].slice(0, 2).map((c) => `.${c}`).join('');
      parts.unshift(s + cls);
    }
    return parts.join(' > ');
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false;
    if (r.width < 2 && r.height < 2) return false; // visually hidden (sr-only) patterns
    if (/inset\(50%\)|rect\(0/.test(cs.clipPath + cs.clip)) return false;
    if (r.right < 0 || r.bottom < 0) return false; // parked off-screen (skip links before focus)
    return !el.closest('[hidden],[inert],[aria-hidden="true"]') || el.closest('dialog[open]');
  };
  const doc = document.documentElement;
  const vw = doc.clientWidth;
  const res = { overflow: null, targets: [], small: [], clipped: [] };
  if (doc.scrollWidth > vw + 1) {
    const wide = [...document.body.querySelectorAll('*')]
      .filter((el) => { const r = el.getBoundingClientRect(); return r.right > vw + 1 && r.width > 0 && getComputedStyle(el).position !== 'fixed'; })
      .filter((el, _i, all) => !all.some((o) => o !== el && el.contains(o))) // deepest offenders
      .slice(0, 3).map((el) => `${sel(el)} (right edge ${Math.round(el.getBoundingClientRect().right)}px)`);
    res.overflow = { scrollWidth: doc.scrollWidth, clientWidth: vw, culprits: wide };
  }
  const interactive = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=checkbox],[role=radio],[role=switch],[role=tab],[role=menuitem],[role=option],[tabindex]:not([tabindex="-1"])';
  const found = [];
  for (const el of document.querySelectorAll(interactive)) {
    if (el.disabled) continue;
    const lab = (el.labels && el.labels[0]) || el;
    if (!visible(el) && !visible(lab)) continue;
    // Links inside running text are exempt (WCAG 2.5.8 "inline").
    if (el.tagName === 'A' && getComputedStyle(el).display === 'inline' && [...el.parentElement.childNodes].some((n) => n !== el && n.nodeType === 3 && n.textContent.trim())) continue;
    // Centre it so its wrapper is on screen too (hit-testing only sees the viewport).
    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    const r = window.__vrh.effectiveBox(el);
    found.push({ el, x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height });
  }
  scrollTo({ top: 0, left: 0, behavior: 'instant' });
  // WCAG 2.5.8 spacing exception: an undersized target passes if a 24px circle centred on it
  // touches no other target (or the circle of another undersized target).
  const centre = (b) => [b.x + b.w / 2, b.y + b.h / 2];
  const small = (b) => b.w < 24 || b.h < 24;
  const distToBox = ([px, py], b) => Math.hypot(Math.max(b.x - px, 0, px - (b.x + b.w)), Math.max(b.y - py, 0, py - (b.y + b.h)));
  for (const b of found) {
    const w = Math.round(b.w), h = Math.round(b.h);
    if (w >= targetMin && h >= targetMin) continue;
    const c = centre(b);
    const crowded = small(b) && found.some((o) => o !== b && (small(o) ? Math.hypot(c[0] - centre(o)[0], c[1] - centre(o)[1]) < 24 : distToBox(c, o) < 12));
    res.targets.push({ selector: sel(b.el), w, h, crowded, label: (b.el.getAttribute('aria-label') || b.el.textContent || b.el.value || '').trim().slice(0, 40) });
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const el = t.parentElement;
    if (!el || seen.has(el) || !t.textContent.trim() || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName)) continue;
    seen.add(el);
    if (!visible(el)) continue;
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize);
    if (px < minFont) res.small.push({ selector: sel(el), px, text: t.textContent.trim().slice(0, 40) });
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const s = getComputedStyle(n);
      if ((/hidden|clip/.test(s.overflowX) || s.textOverflow === 'ellipsis') && n.scrollWidth > n.clientWidth + 1) {
        res.clipped.push({ selector: sel(n), text: n.textContent.trim().slice(0, 40), scrollWidth: n.scrollWidth, clientWidth: n.clientWidth });
        break;
      }
      if (/hidden|clip/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 1 && s.overflowY !== 'auto') {
        res.clipped.push({ selector: sel(n), text: n.textContent.trim().slice(0, 40), scrollHeight: n.scrollHeight, clientHeight: n.clientHeight });
        break;
      }
    }
  }
  const uniq = (list) => {
    const m = new Map();
    for (const x of list) { const k = x.selector; if (m.has(k)) m.get(k).count++; else m.set(k, { ...x, count: 1 }); }
    return [...m.values()];
  };
  res.targets = uniq(res.targets); res.small = uniq(res.small); res.clipped = uniq(res.clipped);
  return res;
};

const FOCUS_INDEX = () => {
  const els = [...document.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex],[contenteditable]')];
  els.forEach((el, i) => { el.dataset.vrIdx = i; });
  return els.length;
};
// Where a focus indicator can appear: the control's real target plus room for an offset ring.
const FOCUS_NOW = () => {
  let el = document.activeElement;
  while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
  if (!el || el === document.body || el.dataset.vrIdx === undefined) return null;
  const r = window.__vrh.effectiveBox(el);
  const x = Math.max(0, Math.floor(r.left - 8)), y = Math.max(0, Math.floor(r.top - 8));
  const width = Math.min(innerWidth, Math.ceil(r.right + 8)) - x, height = Math.min(innerHeight, Math.ceil(r.bottom + 8)) - y;
  let s = el.tagName.toLowerCase();
  if (el.id) s += `#${el.id}`; else if (el.classList[0]) s += `.${el.classList[0]}`;
  return { idx: Number(el.dataset.vrIdx), selector: s, label: (el.getAttribute('aria-label') || el.textContent || el.value || el.name || '').trim().slice(0, 40), region: width > 0 && height > 0 ? { x, y, width, height } : null };
};

// Shared in-page helpers. A control's real target is what the pointer hits: labels, padded
// wrappers and ::after overlays count, so measure by hit-testing, not by the element's box.
const HELPERS = () => {
  const owns = (el, hit) => Boolean(hit) && (el === hit || el.contains(hit) || [...(el.labels || [])].some((l) => l === hit || l.contains(hit)));
  const effectiveBox = (el) => {
    const boxes = [el, ...(el.labels || [])];
    for (let n = el.parentElement, i = 0; n && i < 3; n = n.parentElement, i++) boxes.push(n);
    let best = null;
    for (const b of boxes) {
      const r = b.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      // Probe just inside the corners (past a 2–3px border, which belongs to the wrapper).
      const i = Math.min(4, r.width / 4, r.height / 4);
      const pts = [[r.left + i, r.top + i], [r.right - i, r.top + i], [r.left + i, r.bottom - i], [r.right - i, r.bottom - i], [r.left + r.width / 2, r.top + r.height / 2]];
      if (pts.every(([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight && owns(el, document.elementFromPoint(x, y)))) {
        if (!best || r.width * r.height > best.width * best.height) best = r;
      }
    }
    return best || el.getBoundingClientRect();
  };
  window.__vrh = { owns, effectiveBox };
};

// Storybook reports render/play results on its channel; wait for them.
const SB_HOOK = () => {
  window.__vr = { status: 'pending', error: null };
  const t = setInterval(() => {
    const ch = window.__STORYBOOK_ADDONS_CHANNEL__;
    if (!ch) return;
    clearInterval(t);
    ch.on('storyRendered', () => { if (window.__vr.status === 'pending') window.__vr.status = 'ok'; });
    for (const ev of ['playFunctionThrewException', 'storyThrewException', 'storyErrored', 'storyMissing']) {
      ch.on(ev, (e) => { window.__vr.status = 'fail'; window.__vr.error = `${ev}: ${(e && (e.message || e.description || e.title)) || ''}`; });
    }
  }, 5);
};

// ---- run --------------------------------------------------------------------
mkdirSync(join(out, 'shots'), { recursive: true });
const findings = [];
const add = (f) => findings.push(f);
const browser = await pw.chromium.launch();
const runs = themes.length ? themes : [null];
let checked = 0;

for (const theme of runs) {
  const ctx = await browser.newContext({ viewport: { width: widths.at(-1), height: 900 } });
  await ctx.addInitScript(HELPERS);
  await ctx.addInitScript(SB_HOOK);
  for (const t of targets) {
    checked++;
    const where = { target: t.title, id: t.id, theme };
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/favicon|fonts\.(googleapis|gstatic)|Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 240)); });
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 240)));
    await page.goto(t.url(theme), { waitUntil: 'networkidle' }).catch((e) => errors.push(`navigation: ${e.message.split('\n')[0]}`));
    if (t.kind === 'story') {
      await page.waitForFunction(() => window.__vr.status !== 'pending', null, { timeout: 30000 }).catch(() => {});
      const s = await page.evaluate(() => window.__vr);
      if (s.status === 'fail') add({ ...where, severity: 'blocker', check: 'story', message: s.error });
    } else if (theme) {
      await page.evaluate(([a, v]) => document.documentElement.setAttribute(a, v), [themeAttr, theme]);
    }
    await page.waitForTimeout(250);
    const slug = `${t.id}${theme ? `--${theme}` : ''}`.slice(0, 120);
    const shotFor = new Set();

    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(80);
      const m = await page.evaluate(MEASURE, { targetMin, minFont });
      const at = { ...where, width: w };
      if (m.overflow) { add({ ...at, severity: 'blocker', check: 'overflow', wcag: '1.4.10', message: `page is ${m.overflow.scrollWidth}px wide in a ${m.overflow.clientWidth}px viewport`, detail: m.overflow.culprits }); shotFor.add(w); }
      for (const x of m.targets) {
        const sev = x.crowded ? 'blocker' : 'high';
        add({ ...at, severity: sev, check: 'target-size', wcag: '2.5.8', message: `${x.w}×${x.h}px target "${x.label}"${x.count > 1 ? ` and ${x.count - 1} like it` : ''} (${sev === 'blocker' ? 'under 24px and crowded: fails WCAG 2.5.8' : `under ${targetMin}px`})`, selector: x.selector });
        shotFor.add(w);
      }
      for (const x of m.small) add({ ...at, severity: x.px < 12 ? 'high' : 'medium', check: 'text-size', message: `${x.px}px text "${x.text}"${x.count > 1 ? ` and ${x.count - 1} like it` : ''} (min ${minFont})`, selector: x.selector });
      for (const x of m.clipped) { add({ ...at, severity: 'medium', check: 'text-clip', wcag: '1.4.4', message: `text cut off: "${x.text}"`, selector: x.selector }); shotFor.add(w); }
      if (shotsMode === 'all') shotFor.add(w);
    }

    // Focus visibility, at the widest width: Tab to each stop, screenshot the area around it
    // focused and blurred; identical pixels mean the user cannot see where focus is (2.4.7).
    // Blurring keeps the browser's sequential-focus starting point, so the next Tab moves on.
    await page.setViewportSize({ width: widths.at(-1), height: 900 });
    const stops = await page.evaluate(FOCUS_INDEX);
    await page.addStyleTag({ content: '*, *::before, *::after { caret-color: transparent !important; }' });
    await page.mouse.move(0, 0);
    await page.evaluate(() => { document.activeElement?.blur?.(); scrollTo({ top: 0, left: 0, behavior: 'instant' }); });
    const order = [];
    for (let i = 0; i < Math.min(maxTabs, stops + 1); i++) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(FOCUS_NOW);
      if (!f) continue;
      if (order.includes(f.idx)) break;
      order.push(f.idx);
      if (!f.region) continue;
      const on = await page.screenshot({ clip: f.region, animations: 'disabled' });
      await page.evaluate(() => document.activeElement?.blur?.());
      const off = await page.screenshot({ clip: f.region, animations: 'disabled' });
      if (on.equals(off)) add({ ...where, width: widths.at(-1), severity: 'blocker', check: 'focus', wcag: '2.4.7', message: `focus on "${f.label}" changes nothing visible`, selector: f.selector });
    }
    await page.evaluate(() => { document.activeElement?.blur?.(); scrollTo({ top: 0, left: 0, behavior: 'instant' }); });

    if (axeSrc) {
      await page.addScriptTag({ content: axeSrc });
      // In Storybook a story is a fragment: page-level landmark rules are noise there.
      const disabled = t.kind === 'story' ? ['region', 'landmark-one-main', 'page-has-heading-one'] : [];
      const v = await page.evaluate(async (off) => {
        const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'], rules: Object.fromEntries(off.map((id) => [id, { enabled: false }])) });
        return r.violations.map((x) => ({ id: x.id, impact: x.impact, help: x.help, nodes: x.nodes.length, target: x.nodes[0]?.target?.join(' '), summary: x.nodes[0]?.failureSummary?.split('\n').slice(1, 2).join(' ').trim() }));
      }, disabled);
      const sevOf = { critical: 'blocker', serious: 'high', moderate: 'medium', minor: 'nit' };
      for (const x of v) add({ ...where, width: widths.at(-1), severity: sevOf[x.impact] || 'medium', check: 'axe', rule: x.id, message: `${x.help} (${x.nodes} node${x.nodes > 1 ? 's' : ''})${x.summary ? ` — ${x.summary}` : ''}`, selector: x.target });
    }
    for (const e of errors) add({ ...where, severity: 'high', check: 'console', message: e });

    if (shotsMode !== 'none' && (shotsMode === 'all' || findings.some((f) => f.id === t.id && f.theme === theme))) {
      if (!shotFor.size) shotFor.add(widths.at(-1));
      for (const w of shotFor) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.waitForTimeout(60);
        const file = join('shots', `${slug}--${w}.png`);
        await page.screenshot({ path: join(out, file), fullPage: true, animations: 'disabled' });
        for (const f of findings) if (f.id === t.id && f.theme === theme && (f.width === w || (!f.width && w === widths.at(-1)))) f.shot = file;
      }
    }
    await page.close();
    const mine = findings.filter((f) => f.id === t.id && f.theme === theme);
    process.stdout.write(`${mine.length ? 'FIND' : 'ok  '} ${theme ? `${theme} ` : ''}${t.title}${mine.length ? ` (${mine.length})` : ''}\n`);
  }
  await ctx.close();
}
await browser.close();
for (const s of httpServers) s.close();

// ---- report -----------------------------------------------------------------
// One finding per problem: the same check on the same element in the same theme is merged
// across widths ("320, 390").
const merged = new Map();
for (const f of findings) {
  const key = [f.id, f.theme, f.check, f.rule, f.selector, /overflow|focus/.test(f.check) ? f.severity : f.message.replace(/^\d+×\d+px/, '')].join('|');
  const m = merged.get(key);
  if (!m) { merged.set(key, { ...f, widths: f.width ? [f.width] : [], n: 1 }); continue; }
  if (f.check === 'focus' && !m.message.includes(f.message.match(/"[^"]*"/)?.[0])) {
    m.n++;
    m.message = m.message.replace(/^focus on (".*?")( and \d+ more)?/, (_, first) => `focus on ${first} and ${m.n - 1} more`);
  }
  if (f.width && !m.widths.includes(f.width)) m.widths.push(f.width);
  if (SEVERITIES.indexOf(f.severity) < SEVERITIES.indexOf(m.severity)) Object.assign(m, { severity: f.severity, message: f.message });
  m.shot ??= f.shot;
}
findings.length = 0;
for (const m of merged.values()) { delete m.width; delete m.n; findings.push(m); }
const rank = (s) => SEVERITIES.indexOf(s);
findings.sort((a, b) => rank(a.severity) - rank(b.severity) || a.check.localeCompare(b.check) || a.target.localeCompare(b.target));
const summary = Object.fromEntries(SEVERITIES.map((s) => [s, findings.filter((f) => f.severity === s).length]));
const meta = { date: new Date().toISOString(), widths, themes: runs, targetMin, minFont, checked, axe: Boolean(axeSrc) };
writeFileSync(join(out, 'report.json'), JSON.stringify({ meta, summary, findings }, null, 1));
const md = [
  '# Visual review — measured findings', '',
  `${checked} target×theme renders at ${widths.join('/')}px. Target min ${targetMin}px, text min ${minFont}px. axe: ${meta.axe ? 'on' : 'off'}.`, '',
  `| Blocker | High | Medium | Nit |`, `|---|---|---|---|`, `| ${summary.blocker} | ${summary.high} | ${summary.medium} | ${summary.nit} |`, '',
  '| Severity | Check | Where | Theme | Widths | Finding | Element | Screenshot |', '|---|---|---|---|---|---|---|---|',
  ...findings.map((f) => `| ${f.severity} | ${f.check}${f.wcag ? ` (${f.wcag})` : ''} | ${f.target} | ${f.theme || ''} | ${f.widths.join(', ')} | ${String(f.message).replace(/\|/g, '\\|')}${f.detail ? `: ${f.detail.join('; ')}` : ''} | \`${(f.selector || '').replace(/\|/g, '\\|')}\` | ${f.shot ? `[png](${f.shot})` : ''} |`),
].join('\n');
writeFileSync(join(out, 'report.md'), md + '\n');
console.log(`\n${checked} checked · blocker ${summary.blocker} · high ${summary.high} · medium ${summary.medium} · nit ${summary.nit}\nReport: ${join(out, 'report.md')}`);
const failing = SEVERITIES.slice(0, rank(failOn) + 1).reduce((n, s) => n + summary[s], 0);
process.exit(failing ? 1 : 0);
