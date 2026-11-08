import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { MASCOTS, svg } from "./mascots.mjs";
const require = createRequire(process.cwd() + "/package.json");
const { chromium } = require("playwright");
const OUT = ".";
const RAW = "https://raw.githubusercontent.com/moeghashim/tensquads-design-system/main";
const REPO = "https://github.com/moeghashim/tensquads-design-system";
for (const d of ["mascots/svg", "mascots/png", "mascots/jpeg"]) rmSync(d, { recursive: true, force: true });
for (const d of ["mascots/svg", "mascots/png", "mascots/jpeg", "tokens"]) mkdirSync(`${OUT}/${d}`, { recursive: true });
const tokens = JSON.parse(readFileSync("tokens/agent-ui.tokens.json", "utf8"));

const slug = (m) => m.name.toLowerCase();
writeFileSync(`${OUT}/mascots/mascots.json`, JSON.stringify(MASCOTS.map((m) => ({
  id: m.id, name: m.name, role: m.role, namedAfter: m.place, colourName: m.colour, palette: m.p,
  shape: m.shape, why: m.why, pose: m.pose,
  files: { svg: `mascots/svg/${slug(m)}.svg`, png: `mascots/png/${slug(m)}.png`, jpeg: `mascots/jpeg/${slug(m)}.jpg` },
})), null, 2) + "\n");
for (const m of MASCOTS) writeFileSync(`${OUT}/mascots/svg/${slug(m)}.svg`, `<?xml version="1.0" encoding="UTF-8"?>\n${svg(m, m.id, true)}\n`);

// Raster files: 1200 x 1480. PNG has a clear background. JPEG has a white one.
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 600, height: 740 }, deviceScaleFactor: 2 });
for (const m of MASCOTS) {
  await p.setContent(`<body style="margin:0;background:transparent">${svg(m, m.id, true)}</body>`);
  await p.screenshot({ path: `${OUT}/mascots/png/${slug(m)}.png`, omitBackground: true });
  await p.setContent(`<body style="margin:0;background:#fff">${svg(m, m.id, true)}</body>`);
  await p.screenshot({ path: `${OUT}/mascots/jpeg/${slug(m)}.jpg`, type: "jpeg", quality: 92 });
}
const lineup = `<body style="margin:0;background:#fff;display:grid;grid-template-columns:repeat(5,300px);gap:24px 40px;padding:48px 60px;font:600 22px Inter,system-ui,sans-serif;color:#0d0d0d">${MASCOTS.map((m) => `<div style="text-align:center"><div style="width:300px;height:370px">${svg(m, "L" + m.id)}</div>${m.name}<div style="font-weight:400;font-size:16px;color:#5d5d5d;margin-top:4px">${m.role}</div></div>`).join("")}</body>`;
const lp = await b.newPage({ viewport: { width: 1780, height: 1040 }, deviceScaleFactor: 2 });
await lp.setContent(lineup); await lp.waitForTimeout(200);
await lp.screenshot({ path: `${OUT}/mascots/lineup.png` });
await lp.screenshot({ path: `${OUT}/mascots/lineup.jpg`, type: "jpeg", quality: 90 });

// The design system page. The same file is the repo's index.html and 10squads.com/design.
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const light = (v) => (typeof v === "string" ? v : v.light);
const dark = (v) => (typeof v === "string" ? null : v.dark);
const scales = ["gray", "blue", "green", "red", "orange", "yellow", "purple", "pink"];
const isScale = (t) => scales.some((s) => new RegExp(`^${s}-\\d+$`).test(t.name));
const scaleRows = scales.map((s) => {
  const ts = tokens.color.tokens.filter((t) => new RegExp(`^${s}-\\d+$`).test(t.name));
  return `<div class="scale"><div class="scale-name">${s}</div><div class="chips">${ts.map((t) => `<div class="chip" title="${esc(t.name)} ${esc(light(t.value))}"><span style="background:${esc(light(t.value))}"></span><small>${esc(t.name.split("-").pop())}</small></div>`).join("")}</div></div>`;
}).join("");
const semantic = tokens.color.tokens.filter((t) => !isScale(t)).map((t) => `<tr><td><span class="sw" style="background:${esc(light(t.value))}"></span>${dark(t.value) ? `<span class="sw" style="background:${esc(dark(t.value))}"></span>` : ""}</td><td><code>${esc(t.name)}</code></td><td class="mono">${esc(light(t.value))}${dark(t.value) ? ` / ${esc(dark(t.value))}` : ""}</td><td>${esc(t.usage ?? "")}</td></tr>`).join("");
const typeRows = tokens.type.groups.map((g) => `<h3>${esc(g.name)}</h3>${g.styles.map((s) => `<div class="type-row"><div class="type-meta"><code>${esc(s.name)}</code><span class="mono">${esc(s.fontSize)} / ${esc(s.lineHeight)} · ${esc(s.fontWeight)}</span><span>${esc(s.usage ?? "")}</span></div><div style="font-family:${esc(tokens.type.families[g.family] ?? tokens.type.families.sans)};font-size:${esc(s.fontSize)};line-height:${esc(s.lineHeight)};font-weight:${esc(s.fontWeight)};letter-spacing:${esc(s.letterSpacing ?? "normal")};${s.textTransform ? `text-transform:${esc(s.textTransform)};` : ""}overflow-wrap:anywhere">Your squad is running</div></div>`).join("")}`).join("");
const simpleTable = (list, render) => `<table><tbody>${list.map(render).join("")}</tbody></table>`;
const spacing = simpleTable(tokens.spacing.tokens, (t) => `<tr><td><code>${esc(t.name)}</code></td><td class="mono">${esc(t.value)}</td><td><span class="bar" style="width:${esc(t.value)}"></span></td><td>${esc(t.usage ?? "")}</td></tr>`);
const radius = `<div class="radii">${tokens.radius.tokens.map((t) => `<div class="radius"><span style="border-radius:${esc(t.value)}"></span><code>${esc(t.name)}</code><small class="mono">${esc(t.value)}</small></div>`).join("")}</div>`;
const shadows = `<div class="radii">${tokens.shadow.tokens.map((t) => `<div class="radius"><span style="box-shadow:${esc(light(t.value))};border:0;background:#fff"></span><code>${esc(t.name)}</code><small>${esc(t.usage ?? "")}</small></div>`).join("")}</div>`;
const motion = simpleTable([...tokens.easing.tokens, ...tokens.duration.tokens], (t) => `<tr><td><code>${esc(t.name)}</code></td><td class="mono">${esc(t.value)}</td><td>${esc(t.usage ?? "")}</td></tr>`);
const cards = MASCOTS.map((m) => `<article class="mascot">
<div class="art">${svg(m, "p" + m.id)}</div>
<div class="info">
<div class="head"><div><h3>${m.name}</h3><p class="role">${m.role} · named after ${m.place}</p></div>
<div class="pal" aria-label="${m.colour} palette">${["light", "base", "deep"].map((k) => `<span title="${k} ${m.p[k]}" style="background:${m.p[k]}"></span>`).join("")}</div></div>
<dl><dt>Shape</dt><dd>${m.shape}</dd><dt>Why it fits</dt><dd>${m.why}</dd><dt>Pose</dt><dd>${m.pose}</dd><dt>Colour</dt><dd>${m.colour}: <span class="mono">${m.p.light} · ${m.p.base} · ${m.p.deep}</span></dd></dl>
<p class="dl"><a href="${RAW}/mascots/svg/${slug(m)}.svg">SVG</a><a href="${RAW}/mascots/png/${slug(m)}.png">PNG</a><a href="${RAW}/mascots/jpeg/${slug(m)}.jpg">JPEG</a></p>
</div></article>`).join("\n");
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>tensquads design system</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400&amp;display=swap">
<style>
:root{--bg:#fcfcfc;--surface:#fff;--ink:#0d0d0d;--muted:#5d5d5d;--line:rgba(13,13,13,.1);--accent:#0169cc;--soft:#f3f3f3}
/* Layout: one 1120px column. Mascots first, then the tokens. */
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:400 15px/1.6 Inter,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:1120px;margin:0 auto;padding:56px 24px 96px;display:flex;flex-direction:column;gap:56px}
h1{margin:0;font-size:48px;line-height:1.05;font-weight:600;letter-spacing:-.02em;text-wrap:balance}
h2{margin:0 0 6px;font-size:28px;font-weight:600;letter-spacing:-.01em}
h3{margin:0;font-size:18px;font-weight:600}
p{margin:0}
.lead{max-width:680px;font-size:18px;color:var(--muted);margin-top:14px}
.meta{font-size:14px;color:var(--muted);margin-top:14px;display:flex;gap:18px;flex-wrap:wrap}
a{color:var(--accent)} a:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px}
code,.mono{font-family:"JetBrains Mono",ui-monospace,Menlo,monospace;font-size:13px}
.section-note{color:var(--muted);max-width:680px;margin-bottom:22px}
.lineup{width:100%;height:auto;border-radius:16px;box-shadow:0 0 0 1px var(--line);background:#fff}
.mascots{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,520px),1fr));gap:16px}
.mascot{display:flex;gap:18px;background:var(--surface);border-radius:16px;box-shadow:0 0 0 1px var(--line);padding:18px;flex-wrap:wrap}
.art{flex:0 0 150px;height:185px;background:#eef0f3;border-radius:12px;display:flex;align-items:center;justify-content:center}
.art svg{width:140px;height:173px}
.info{flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:10px}
.head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.role{color:var(--muted);font-size:14px}
.pal{display:flex;gap:4px}.pal span{width:20px;height:20px;border-radius:6px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}
dl{margin:0;display:grid;grid-template-columns:86px 1fr;gap:4px 10px;font-size:14px}
dt{color:var(--muted)} dd{margin:0}
.dl{display:flex;gap:8px;margin-top:auto}
.dl a{font-size:13px;font-weight:500;text-decoration:none;padding:5px 12px;border-radius:999px;box-shadow:0 0 0 1px var(--line);color:var(--ink)}
.dl a:hover{background:var(--soft)}
.scale{display:flex;gap:14px;align-items:center;margin-bottom:10px;flex-wrap:wrap}
.scale-name{width:64px;font-weight:500;text-transform:capitalize}
.chips{display:flex;gap:4px;flex-wrap:wrap;flex:1}
.chip{display:flex;flex-direction:column;align-items:center;gap:2px}
.chip span{width:40px;height:32px;border-radius:6px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}
.chip small{font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums}
.box{overflow-x:auto;background:var(--surface);border-radius:12px;box-shadow:0 0 0 1px var(--line)}
table{border-collapse:collapse;width:100%;font-size:14px}
td{padding:8px 12px;border-top:1px solid var(--line);vertical-align:middle}
tr:first-child td{border-top:0}
.sw{display:inline-block;width:18px;height:18px;border-radius:5px;margin-right:4px;vertical-align:middle;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}
.bar{display:inline-block;height:10px;background:var(--accent);border-radius:2px;opacity:.7}
.type-row{display:grid;grid-template-columns:260px 1fr;gap:20px;padding:14px 0;border-top:1px solid var(--line);align-items:center}
.type-meta{display:flex;flex-direction:column;font-size:13px;color:var(--muted)}
.type-meta code{color:var(--ink)}
h3+.type-row{border-top:0}
.radii{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}
.radius{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--muted)}
.radius span{height:72px;background:var(--soft);border:1px solid var(--line)}
.radius code{color:var(--ink)}
@media (max-width:640px){h1{font-size:36px}.type-row{grid-template-columns:1fr}.art{flex-basis:100%}}
</style>
</head>
<body>
<main>
<header>
<h1>tensquads design system</h1>
<p class="lead">The reference for how tensquads looks. It holds the ten squad mascots and the Agent-UI tokens that every screen uses.</p>
<p class="meta"><span>Source: <a href="${REPO}">moeghashim/tensquads-design-system</a></span><span>Tokens: ${esc(tokens.name)} version ${esc(tokens.version)}, ${tokens.color.tokens.length} colours</span></p>
</header>

<section>
<h2>Mascots</h2>
<p class="section-note">One frosted toy for each agent. Each body takes its shape from the place the agent is named after. Every mascot wears one lens over its right eye. The lens is the squad's mark. Each file comes as SVG, PNG with a clear background, and JPEG with a white background, at 1200 by 1480 pixels.</p>
<div class="mascots">
${cards}
</div>
</section>

<section>
<h2>Colour scales</h2>
<p class="section-note">Light theme values. The dark values are in the token file.</p>
${scaleRows}
</section>

<section>
<h2>Semantic colours</h2>
<p class="section-note">Use these before the raw scales. Each shows the light value, then the dark value.</p>
<div class="box"><table><tbody>${semantic}</tbody></table></div>
</section>

<section>
<h2>Type</h2>
<p class="section-note">Sans: <code>${esc(tokens.type.families.sans)}</code>. Mono: <code>${esc(tokens.type.families.mono)}</code>.</p>
${typeRows}
</section>

<section><h2>Spacing</h2><div class="box">${spacing}</div></section>
<section><h2>Radius</h2>${radius}</section>
<section><h2>Shadow</h2>${shadows}</section>
<section><h2>Motion</h2><div class="box">${motion}</div></section>
</main>
</body>
</html>
`;
writeFileSync(`${OUT}/index.html`, page);
await b.close();
