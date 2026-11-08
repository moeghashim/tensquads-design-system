// Builds every generated file in this repository from scripts/mascots.mjs and agent-ui/.
// Run it from the repository root: npm run build
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { MASCOTS, svg } from "./mascots.mjs";

const require = createRequire(`${process.cwd()}/package.json`);
const { chromium } = require("playwright");
const RAW = "https://raw.githubusercontent.com/moeghashim/tensquads-design-system/main";
const REPO = "https://github.com/moeghashim/tensquads-design-system";
const slug = (m) => m.name.toLowerCase();
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
for (const d of ["mascots/svg", "mascots/png", "mascots/jpeg", "mascots/cards", "agent-ui/previews"]) rmSync(d, { recursive: true, force: true });
for (const d of ["mascots/svg", "mascots/png", "mascots/jpeg", "mascots/cards/png", "mascots/cards/jpeg", "agent-ui/previews"]) mkdirSync(d, { recursive: true });
const tokens = JSON.parse(readFileSync("agent-ui/tokens.json", "utf8"));

// ---- tokens.css: every token as a custom property. Light in :root, dark under data-theme="dark". ----
// A value may name another token, such as {gray-900}. CSS gets var(--gray-900). The page shows the resolved value.
const all = ["color", "spacing", "radius", "shadow", "easing", "duration"].flatMap((g) => tokens[g].tokens);
const byName = new Map(all.map((t) => [t.name, t.value]));
const pick = (v, theme) => (typeof v === "string" ? v : (v[theme] ?? null));
const resolve = (v, theme, depth = 0) => (v == null || depth > 8 ? v : v.replace(/\{([a-z0-9-]+)\}/g, (_, n) => resolve(pick(byName.get(n), theme) ?? pick(byName.get(n), "light"), theme, depth + 1)));
const light = (v) => resolve(pick(v, "light"), "light");
const dark = (v) => (typeof v === "string" ? null : resolve(v.dark, "dark"));
const cssValue = (v) => v.replace(/\{([a-z0-9-]+)\}/g, "var(--$1)");
const lightVars = [...all.map((t) => `  --${t.name}: ${cssValue(pick(t.value, "light"))};`), ...Object.entries(tokens.type.families).map(([k, v]) => `  --font-${k}: ${v};`)];
const darkVars = all.filter((t) => typeof t.value !== "string" && t.value.dark).map((t) => `  --${t.name}: ${cssValue(t.value.dark)};`);
writeFileSync(
	"agent-ui/tokens.css",
	`/* Agent-UI tokens. Built from tokens.json by scripts/build.mjs. Do not edit by hand. */
:root {
${lightVars.join("\n")}
  color-scheme: light;
}
:root[data-theme="dark"] {
${darkVars.join("\n")}
  color-scheme: dark;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${darkVars.map((l) => `  ${l}`).join("\n")}
    color-scheme: dark;
  }
}
`,
);

// ---- Component previews: each preview.html inside a page that loads the tokens and the bundle. ----
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400&amp;display=swap">`;
const components = readdirSync("agent-ui/components", { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => d.name)
	.filter((n) => n !== "Cover");
const meta = (src) => {
	const m = src.match(/@dsCard([^>]*)-->/)?.[1] ?? "";
	return { group: m.match(/group="([^"]*)"/)?.[1] ?? "Other", height: Number(m.match(/height=(\d+)/)?.[1] ?? 240), subtitle: m.match(/subtitle="([^"]*)"/)?.[1] ?? "" };
};
const info = components.map((name) => {
	const src = readFileSync(`agent-ui/components/${name}/preview.html`, "utf8");
	writeFileSync(
		`agent-ui/previews/${name}.html`,
		`<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name} · Agent-UI</title>
<script>try { const t = localStorage.getItem("agent-ui.theme"); if (t === "light" || t === "dark") document.documentElement.dataset.theme = t; } catch {}</script>
${FONTS}
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
<script src="../components/bundle.js"></script>
</head>
<body>
${src}
</body>
</html>
`,
	);
	const readme = existsSync(`agent-ui/components/${name}/README.md`) ? readFileSync(`agent-ui/components/${name}/README.md`, "utf8") : "";
	return { name, readme, ...meta(src) };
});

// ---- A small Markdown renderer for the guides: headings, lists, paragraphs, bold and code. ----
const inline = (s) =>
	esc(s)
		.replace(/`([^`]+)`/g, "<code>$1</code>")
		.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
const md = (text, base = 3) => {
	const out = [];
	for (const block of text.trim().split(/\n\s*\n/)) {
		const lines = block.split("\n");
		if (/^#{1,6} /.test(lines[0])) {
			const n = Math.min(6, base + lines[0].match(/^#+/)[0].length - 2);
			out.push(`<h${n}>${inline(lines[0].replace(/^#+ /, ""))}</h${n}>`);
			if (lines.length > 1) out.push(md(lines.slice(1).join("\n"), base));
			continue;
		}
		if (lines.every((l) => /^- /.test(l))) {
			out.push(`<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join("")}</ul>`);
			continue;
		}
		out.push(`<p>${lines.map(inline).join("<br>")}</p>`);
	}
	return out.join("\n");
};

// ---- Mascot card, as on the design canvas. Sizes are in cqw, so one card scales to any width. ----
const CARD_CSS = `.mcard-wrap{container-type:inline-size}
.mcard{min-height:150cqw;box-sizing:border-box;padding:8cqw;background:#fff;color:#1E2229;font-family:'DM Sans',system-ui,sans-serif;display:flex;flex-direction:column;gap:4cqw}
.mcard-art{height:63.3cqw;border-radius:4.67cqw;background:#EEF0F3;display:flex;align-items:center;justify-content:center}
.mcard-art svg{width:50cqw;height:61.7cqw}
.mcard-head{display:flex;justify-content:space-between;align-items:flex-end;gap:3cqw}
.mcard-name{margin:0;font-family:'Fredoka','DM Sans',system-ui,sans-serif;font-weight:600;font-size:7.33cqw;line-height:1.15}
.mcard-role{font-size:3cqw;color:#5A616C;margin-top:.67cqw}
.mcard-sw{display:flex;gap:1.33cqw}.mcard-sw span{width:6cqw;height:6cqw;border-radius:1.67cqw}
.mcard-row{display:flex;flex-direction:column;gap:.67cqw}
.mcard-label{font-size:2.17cqw;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#5A616C}
.mcard-text{font-size:2.83cqw;line-height:1.5}
.mcard-pair{display:flex;gap:5.33cqw}`;
const CARD_FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&amp;family=DM+Sans:wght@400;500;600&amp;display=swap">`;
const card = (m, k) => `<div class="mcard-wrap"><article class="mcard" aria-label="${m.name} mascot card">
<div class="mcard-art">${svg(m, k)}</div>
<div class="mcard-head"><div><h3 class="mcard-name">${m.name}</h3><div class="mcard-role">${m.role === "Master" ? "The master" : m.role}</div></div>
<div class="mcard-sw" aria-hidden="true">${["light", "base", "deep"].map((s) => `<span style="background:${m.p[s]}"></span>`).join("")}</div></div>
<div class="mcard-row"><div class="mcard-label">Shape</div><div class="mcard-text">${m.shape}</div></div>
<div class="mcard-row"><div class="mcard-label">Why it fits</div><div class="mcard-text">${m.why}</div></div>
<div class="mcard-pair"><div class="mcard-row"><div class="mcard-label">Pose</div><div class="mcard-text">${m.pose}</div></div><div class="mcard-row"><div class="mcard-label">Colour</div><div class="mcard-text">${m.colour}</div></div></div>
</article></div>`;

// ---- Mascot files: SVG, PNG, JPEG, and a card in PNG and JPEG. ----
writeFileSync(
	"mascots/mascots.json",
	`${JSON.stringify(
		MASCOTS.map((m) => ({
			id: m.id,
			name: m.name,
			role: m.role,
			namedAfter: m.place,
			colourName: m.colour,
			palette: m.p,
			shape: m.shape,
			why: m.why,
			pose: m.pose,
			files: { svg: `mascots/svg/${slug(m)}.svg`, png: `mascots/png/${slug(m)}.png`, jpeg: `mascots/jpeg/${slug(m)}.jpg`, cardPng: `mascots/cards/png/${slug(m)}.png`, cardJpeg: `mascots/cards/jpeg/${slug(m)}.jpg` },
		})),
		null,
		2,
	)}\n`,
);
for (const m of MASCOTS) writeFileSync(`mascots/svg/${slug(m)}.svg`, `<?xml version="1.0" encoding="UTF-8"?>\n${svg(m, m.id, true)}\n`);
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 600, height: 740 }, deviceScaleFactor: 2 });
for (const m of MASCOTS) {
	await p.setContent(`<body style="margin:0;background:transparent">${svg(m, m.id, true)}</body>`);
	await p.screenshot({ path: `mascots/png/${slug(m)}.png`, omitBackground: true });
	await p.setContent(`<body style="margin:0;background:#fff">${svg(m, m.id, true)}</body>`);
	await p.screenshot({ path: `mascots/jpeg/${slug(m)}.jpg`, type: "jpeg", quality: 92 });
}
const cp = await browser.newPage({ viewport: { width: 600, height: 900 }, deviceScaleFactor: 2 });
for (const m of MASCOTS) {
	await cp.setContent(`<html><head>${CARD_FONTS}<style>body{margin:0}${CARD_CSS}</style></head><body>${card(m, `c${m.id}`)}</body></html>`, { waitUntil: "networkidle" });
	await cp.evaluate(() => document.fonts.ready);
	const el = await cp.$(".mcard");
	await el.screenshot({ path: `mascots/cards/png/${slug(m)}.png` });
	await el.screenshot({ path: `mascots/cards/jpeg/${slug(m)}.jpg`, type: "jpeg", quality: 92 });
}
const lp = await browser.newPage({ viewport: { width: 1780, height: 1040 }, deviceScaleFactor: 2 });
await lp.setContent(
	`<body style="margin:0;background:#fff;display:grid;grid-template-columns:repeat(5,300px);gap:24px 40px;padding:48px 60px;font:600 22px Inter,system-ui,sans-serif;color:#0d0d0d">${MASCOTS.map((m) => `<div style="text-align:center"><div style="width:300px;height:370px">${svg(m, `L${m.id}`)}</div>${m.name}<div style="font-weight:400;font-size:16px;color:#5d5d5d;margin-top:4px">${m.role}</div></div>`).join("")}</body>`,
);
await lp.screenshot({ path: "mascots/lineup.png" });
await lp.screenshot({ path: "mascots/lineup.jpg", type: "jpeg", quality: 90 });
await browser.close();

// ---- The design system page. The same file is index.html here and 10squads.com/design. ----
const scales = ["gray", "blue", "green", "red", "orange", "yellow", "purple", "pink"];
const isScale = (t) => scales.some((s) => new RegExp(`^${s}-\\d+$`).test(t.name));
const scaleRows = scales
	.map((s) => {
		const ts = tokens.color.tokens.filter((t) => new RegExp(`^${s}-\\d+$`).test(t.name));
		return `<div class="scale"><div class="scale-name">${s}</div><div class="chips">${ts.map((t) => `<div class="chip" title="${esc(t.name)} ${esc(light(t.value))}"><span style="background:${esc(light(t.value))}"></span><small>${esc(t.name.split("-").pop())}</small></div>`).join("")}</div></div>`;
	})
	.join("");
const semantic = tokens.color.tokens
	.filter((t) => !isScale(t))
	.map(
		(t) =>
			`<tr><td class="sws"><span class="sw" style="background:${esc(light(t.value))}"></span>${dark(t.value) ? `<span class="sw" style="background:${esc(dark(t.value))}"></span>` : ""}</td><td><code>${esc(t.name)}</code></td><td class="mono">${esc(light(t.value))}${dark(t.value) ? ` / ${esc(dark(t.value))}` : ""}</td><td>${esc(t.usage ?? "")}</td></tr>`,
	)
	.join("");
const typeRows = tokens.type.groups
	.map(
		(g) =>
			`<h3>${esc(g.name)}</h3>${g.styles.map((s) => `<div class="type-row"><div class="type-meta"><code>${esc(s.name)}</code><span class="mono">${esc(s.fontSize)} / ${esc(s.lineHeight)} · ${esc(s.fontWeight)}</span><span>${esc(s.usage ?? "")}</span></div><div style="font-family:${esc(tokens.type.families[g.family] ?? tokens.type.families.sans)};font-size:${esc(s.fontSize)};line-height:${esc(s.lineHeight)};font-weight:${esc(s.fontWeight)};letter-spacing:${esc(s.letterSpacing ?? "normal")};${s.textTransform ? `text-transform:${esc(s.textTransform)};` : ""}overflow-wrap:anywhere">Your squad is running</div></div>`).join("")}`,
	)
	.join("");
const table = (list, render) => `<div class="box"><table><tbody>${list.map(render).join("")}</tbody></table></div>`;
const spacing = table(tokens.spacing.tokens, (t) => `<tr><td><code>${esc(t.name)}</code></td><td class="mono">${esc(t.value)}</td><td><span class="bar" style="width:min(${esc(t.value)},100%)"></span></td><td>${esc(t.usage ?? "")}</td></tr>`);
const radius = `<div class="radii">${tokens.radius.tokens.map((t) => `<div class="radius"><span style="border-radius:${esc(t.value)}"></span><code>${esc(t.name)}</code><small class="mono">${esc(t.value)}</small></div>`).join("")}</div>`;
const shadows = `<div class="radii">${tokens.shadow.tokens.map((t) => `<div class="radius"><span style="box-shadow:${esc(light(t.value))};border:0;background:#fff"></span><code>${esc(t.name)}</code><small>${esc(t.usage ?? "")}</small></div>`).join("")}</div>`;
const motion = table([...tokens.easing.tokens, ...tokens.duration.tokens], (t) => `<tr><td><code>${esc(t.name)}</code></td><td class="mono">${esc(t.value)}</td><td>${esc(t.usage ?? "")}</td></tr>`);
const ORDER = ["Actions", "Forms", "Canvas", "Panels", "Chrome", "Data display", "Pages"];
const rank = (g) => (ORDER.includes(g) ? ORDER.indexOf(g) : ORDER.length);
const groups = [...new Set(info.map((c) => c.group))].sort((a, b) => rank(a) - rank(b));
const comps = groups
	.map(
		(g) =>
			`<h3 class="group">${esc(g)}</h3>${info
				.filter((c) => c.group === g)
				.map(
					(c) => `<article class="comp" id="c-${c.name}">
<div class="comp-head"><div><h4>${c.name}</h4><p class="sub">${esc(c.subtitle)}</p></div><a class="open" href="agent-ui/previews/${c.name}.html">Open</a></div>
<iframe src="agent-ui/previews/${c.name}.html" title="${c.name} preview" loading="lazy" style="height:${c.height}px"></iframe>
<div class="guide">${md(c.readme, 5)}</div>
</article>`,
				)
				.join("")}`,
	)
	.join("");
const cards = MASCOTS.map(
	(m) =>
		`<div class="mc">${card(m, `p${m.id}`)}<p class="dl"><a href="${RAW}/mascots/svg/${slug(m)}.svg">SVG</a><a href="${RAW}/mascots/png/${slug(m)}.png">PNG</a><a href="${RAW}/mascots/jpeg/${slug(m)}.jpg">JPEG</a><a href="${RAW}/mascots/cards/png/${slug(m)}.png">Card PNG</a><a href="${RAW}/mascots/cards/jpeg/${slug(m)}.jpg">Card JPEG</a></p></div>`,
).join("\n");
const readme = readFileSync("agent-ui/README.md", "utf8");
const dataDisplay = readFileSync("agent-ui/data-display.md", "utf8").replace(/^# .*\n/, "");
const tokenCount = all.length + Object.keys(tokens.type.families).length;
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>tensquads design system</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400&amp;family=Fredoka:wght@500;600&amp;family=DM+Sans:wght@400;500;600&amp;display=swap">
<style>
:root{--bg:#fcfcfc;--surface:#fff;--ink:#0d0d0d;--muted:#5d5d5d;--line:rgba(13,13,13,.1);--accent:#0169cc;--soft:#f3f3f3}
/* Layout: one 1200px column. Mascots first, then Agent-UI: principles, components, data display, tokens. */
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:400 15px/1.6 Inter,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:1200px;margin:0 auto;padding:56px 24px 96px;display:flex;flex-direction:column;gap:64px}
h1{margin:0;font-size:48px;line-height:1.05;font-weight:600;letter-spacing:-.02em;text-wrap:balance}
h2{margin:0 0 6px;font-size:30px;font-weight:600;letter-spacing:-.015em}
h3{margin:28px 0 10px;font-size:19px;font-weight:600}
h4{margin:0;font-size:16px;font-weight:600}
h5,h6{margin:18px 0 6px;font-size:15px;font-weight:600}
p{margin:0}
a{color:var(--accent)} a:focus-visible,iframe:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px}
code,.mono{font-family:"JetBrains Mono",ui-monospace,Menlo,monospace;font-size:13px}
.lead{max-width:700px;font-size:18px;color:var(--muted);margin-top:14px}
.meta{font-size:14px;color:var(--muted);margin-top:14px;display:flex;gap:18px;flex-wrap:wrap}
nav{display:flex;gap:6px;flex-wrap:wrap;margin-top:22px}
nav a{font-size:14px;font-weight:500;text-decoration:none;color:var(--ink);padding:6px 14px;border-radius:999px;box-shadow:0 0 0 1px var(--line);background:var(--surface)}
nav a:hover{background:var(--soft)}
.section-note{color:var(--muted);max-width:700px;margin-bottom:22px}
.prose{max-width:760px}.prose p{margin:0 0 12px}.prose ul{margin:0 0 12px;padding-left:20px}.prose h3{margin-top:26px}
.mascots{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:20px}
.mc{display:flex;flex-direction:column;gap:10px}
.mc .mcard{border-radius:14px;box-shadow:0 0 0 1px var(--line),0 1px 3px rgba(13,13,13,.06)}
.dl{display:flex;gap:6px;flex-wrap:wrap}
.dl a{font-size:13px;font-weight:500;text-decoration:none;padding:5px 12px;border-radius:999px;box-shadow:0 0 0 1px var(--line);color:var(--ink);background:var(--surface)}
.dl a:hover{background:var(--soft)}
${CARD_CSS}
.group{margin-top:36px;padding-top:12px;border-top:1px solid var(--line)}
.comp{background:var(--surface);border-radius:16px;box-shadow:0 0 0 1px var(--line);margin:0 0 18px;overflow:hidden}
.comp-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:16px 18px 12px}
.sub{color:var(--muted);font-size:14px}
.open{font-size:13px;font-weight:500;white-space:nowrap}
.comp iframe{display:block;width:100%;border:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:#f7f7f7}
.guide{padding:6px 18px 16px;max-width:820px;font-size:14px}.guide p{margin:8px 0}
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
.sws{white-space:nowrap}
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
@media (max-width:640px){h1{font-size:36px}.type-row{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style>
</head>
<body>
<main>
<header>
<h1>tensquads design system</h1>
<p class="lead">The reference for how tensquads looks. It holds the ten squad mascots and Agent-UI, the visual language of the app: its principles, ${info.length} components and ${tokenCount} tokens.</p>
<p class="meta"><span>Source: <a href="${REPO}">moeghashim/tensquads-design-system</a></span><span>Agent-UI tokens version ${esc(tokens.version)}</span></p>
<nav aria-label="Sections"><a href="#mascots">Mascots</a><a href="#principles">Principles</a><a href="#components">Components</a><a href="#data-display">Data display</a><a href="#colour">Colour</a><a href="#type">Type</a><a href="#spacing">Spacing</a><a href="#radius">Radius</a><a href="#shadow">Shadow</a><a href="#motion">Motion</a></nav>
</header>

<section id="mascots">
<h2>Mascots</h2>
<p class="section-note">One frosted toy for each agent. Each body takes its shape from the place the agent is named after. Every mascot wears one lens over its right eye. The lens is the squad's mark. Each mascot comes as SVG, PNG with a clear background and JPEG with a white background. Each card comes as PNG and JPEG.</p>
<div class="mascots">
${cards}
</div>
</section>

<section id="principles">
<h2>Agent-UI principles</h2>
<div class="prose">${md(readme, 3)}</div>
</section>

<section id="components">
<h2>Components</h2>
<p class="section-note">Each preview is live. It loads <code>agent-ui/tokens.css</code>, <code>agent-ui/components/bundle.css</code> and <code>agent-ui/components/bundle.js</code>. The builders are on <code>window.AgentUI</code>. Their types are in <code>agent-ui/components/index.d.ts</code>.</p>
${comps}
</section>

<section id="data-display">
<h2>Data display</h2>
<div class="prose">${md(dataDisplay, 3)}</div>
</section>

<section id="colour">
<h2>Colour scales</h2>
<p class="section-note">Light theme values. The dark values are in the token files.</p>
${scaleRows}
<h3>Semantic colours</h3>
<p class="section-note">Use these before the raw scales. Each shows the light value, then the dark value.</p>
<div class="box"><table><tbody>${semantic}</tbody></table></div>
</section>

<section id="type">
<h2>Type</h2>
<p class="section-note">Sans: <code>${esc(tokens.type.families.sans)}</code>. Mono: <code>${esc(tokens.type.families.mono)}</code>.</p>
${typeRows}
</section>

<section id="spacing"><h2>Spacing and sizing</h2>${spacing}</section>
<section id="radius"><h2>Radius</h2>${radius}</section>
<section id="shadow"><h2>Shadow</h2>${shadows}</section>
<section id="motion"><h2>Motion</h2>${motion}</section>
</main>
</body>
</html>
`;
writeFileSync("index.html", page);
console.log("built", MASCOTS.length, "mascots and", info.length, "component previews");
