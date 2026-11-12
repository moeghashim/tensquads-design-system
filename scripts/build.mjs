// Builds every generated file in this repository from scripts/mascots.mjs and agent-ui/.
// Run it from the repository root: npm run build
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { logoSvg } from "./logo.mjs";
import { MASCOTS, svg } from "./mascots.mjs";
import { AGENT_LOOP_STATES, SQUADMATE_CSS, SQUADMATES, squadmateMarkup } from "./squadmates/index.ts";

const require = createRequire(`${process.cwd()}/package.json`);
const { chromium } = require("playwright");
const REPO = "https://github.com/moeghashim/tensquads-design-system";
const slug = (m) => m.name.toLowerCase();
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
for (const d of ["mascots/svg", "mascots/png", "mascots/jpeg", "mascots/cards", "mascots/states", "mascots/avatars", "agent-ui/previews"]) rmSync(d, { recursive: true, force: true });
for (const d of ["mascots/svg", "mascots/png", "mascots/jpeg", "mascots/cards/png", "mascots/cards/jpeg", "mascots/states", "mascots/avatars", "agent-ui/previews"]) mkdirSync(d, { recursive: true });
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
<script>
// Inside the design system page, a preview must not scroll the page around it.
// Focus does not scroll, and scrollIntoView moves only the element's own scroll box.
if (window.top !== window) {
  const focus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (options) { focus.call(this, { ...options, preventScroll: true }); };
  Element.prototype.scrollIntoView = function () {
    let box = this.parentElement;
    while (box && !(box.scrollHeight > box.clientHeight && /auto|scroll/.test(getComputedStyle(box).overflowY))) box = box.parentElement;
    if (!box) return;
    const r = this.getBoundingClientRect(), b = box.getBoundingClientRect();
    if (r.top < b.top) box.scrollTop -= b.top - r.top;
    else if (r.bottom > b.bottom) box.scrollTop += r.bottom - b.bottom;
  };
}
</script>
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
// The mascots in each Agent loop state, as the app draws them. The drawing code is scripts/squadmates/, the same code as the app.
const STATES = [["idle", "Idle", "No task. Blinks slowly."], ...AGENT_LOOP_STATES.map((s) => [s.id, s.label, s.hint])];
const mateName = (id) => SQUADMATES.find((x) => x.id === id).name.toLowerCase();
for (const m of SQUADMATES) for (const [st] of STATES) writeFileSync(`mascots/states/${mateName(m.id)}-${st}.svg`, `<?xml version="1.0" encoding="UTF-8"?>\n${squadmateMarkup(m.id, st, 160)}\n`);
// The upper-body crop for small avatars, such as the screens use. Under 64 px the app draws this crop.
for (const m of SQUADMATES) for (const [st] of STATES) writeFileSync(`mascots/avatars/${mateName(m.id)}-${st}.svg`, `<?xml version="1.0" encoding="UTF-8"?>\n${squadmateMarkup(m.id, st, 48)}\n`);
// The logo: SVG for the web, PNG for places that need a bitmap.
mkdirSync("logo", { recursive: true });
writeFileSync("logo/logo.svg", `<?xml version="1.0" encoding="UTF-8"?>\n${logoSvg({ size: 64 })}\n`);
writeFileSync("logo/logo-dark.svg", `<?xml version="1.0" encoding="UTF-8"?>\n${logoSvg({ size: 64, dark: true })}\n`);
writeFileSync("logo/favicon.svg", `${logoSvg({ size: 32 })}\n`);
const browser = await chromium.launch();
const lg = await browser.newPage({ viewport: { width: 512, height: 512 } });
for (const [file, px, dark] of [["logo/logo-512.png", 512, false], ["logo/logo-dark-512.png", 512, true], ["logo/apple-touch-icon.png", 180, false], ["logo/favicon-32.png", 32, false]]) {
	await lg.setViewportSize({ width: px, height: px });
	await lg.setContent(`<body style="margin:0;background:transparent">${logoSvg({ size: px, dark })}</body>`);
	await lg.screenshot({ path: file, omitBackground: true });
}
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
const lp = await browser.newPage({ viewport: { width: 2460, height: 1040 }, deviceScaleFactor: 2 });
await lp.setContent(
	`<body style="margin:0;background:#fff;display:grid;grid-template-columns:repeat(7,300px);gap:24px 40px;padding:48px 60px;font:600 22px Inter,system-ui,sans-serif;color:#0d0d0d">${MASCOTS.map((m) => `<div style="text-align:center"><div style="width:300px;height:370px">${svg(m, `L${m.id}`)}</div>${m.name}<div style="font-weight:400;font-size:16px;color:#5d5d5d;margin-top:4px">${m.role}</div></div>`).join("")}</body>`,
);
await lp.screenshot({ path: "mascots/lineup.png" });
await lp.screenshot({ path: "mascots/lineup.jpg", type: "jpeg", quality: 90 });
await browser.close();

// ---- The design system page. The same file is index.html here and 10squads.com/design. ----
// One page with a side menu. Each menu item shows one view. The hash names the view, such as #colors.
const ICON = {
	overview: '<path d="M2.5 3.5h4.5a2 2 0 0 1 2 2v8a1.5 1.5 0 0 0-1.5-1.5h-5zM15.5 3.5H11a2 2 0 0 0-2 2v8a1.5 1.5 0 0 1 1.5-1.5h5z"/>',
	colors: '<path d="M9 2.5a6.5 6.5 0 1 0 0 13c1 0 1.5-.6 1.5-1.4 0-1.1-.9-1.4-.9-2.3 0-.8.6-1.3 1.4-1.3h1.6a2.9 2.9 0 0 0 2.9-2.9C15.5 4.9 12.6 2.5 9 2.5z"/><circle cx="5.8" cy="8" r=".9"/><circle cx="8" cy="5.5" r=".9"/><circle cx="11.2" cy="6.2" r=".9"/>',
	typography: '<path d="M2.5 6V4.5h7V6M6 4.5v9M10 9V8h5.5v1M12.75 8v5.5"/>',
	spacing: '<path d="M2.5 9h13M5 6.5 2.5 9 5 11.5M13 6.5l2.5 2.5-2.5 2.5"/>',
	radius: '<path d="M3 7V5a2 2 0 0 1 2-2h2M11 3h2a2 2 0 0 1 2 2v2M15 11v2a2 2 0 0 1-2 2h-2M7 15H5a2 2 0 0 1-2-2v-2"/>',
	shadows: '<rect x="2.5" y="2.5" width="9.5" height="9.5" rx="2"/><path d="M12 6h1.5a2 2 0 0 1 2 2v5.5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V12"/>',
	easing: '<circle cx="9" cy="9" r="6.5"/><path d="M9 2.5a6.5 6.5 0 0 0 0 13"/>',
	duration: '<circle cx="9" cy="9.5" r="6"/><path d="M9 6.5v3l2 1.5M7 2h4"/>',
	components: '<path d="M9 2.5 15 5.8v6.4L9 15.5 3 12.2V5.8zM3 5.8 9 9l6-3.2M9 9v6.5"/>',
	logo: '<circle cx="9" cy="3.5" r="1.3"/><circle cx="14.2" cy="7.3" r="1.3"/><circle cx="12.2" cy="13.4" r="1.3"/><circle cx="5.8" cy="13.4" r="1.3"/><circle cx="3.8" cy="7.3" r="1.3"/><circle cx="9" cy="9" r="1.6"/>',
	mascots: '<rect x="2.5" y="2.5" width="13" height="13" rx="3"/><circle cx="7" cy="8" r="1"/><circle cx="11.5" cy="8" r="2"/><path d="M6.5 12c1.5 1 3.5 1 5 0"/>',
	screens: '<rect x="2.5" y="3.5" width="13" height="9.5" rx="1.5"/><path d="M6.5 15.5h5M9 13v2.5"/>',
	pages: '<path d="M4.5 2.5h6l3 3v10h-9z"/><path d="M10.5 2.5v3h3M6.5 9h5M6.5 12h5"/>',
	states: '<circle cx="6" cy="6" r="2.5"/><circle cx="12" cy="6" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="12" cy="12" r="2.5"/>',
	source: '<path d="M2.5 5.5a1.5 1.5 0 0 1 1.5-1.5h3.2l1.6 1.8H14a1.5 1.5 0 0 1 1.5 1.5v6.2A1.5 1.5 0 0 1 14 15H4a1.5 1.5 0 0 1-1.5-1.5z"/>',
	search: '<circle cx="8" cy="8" r="4.8"/><path d="m11.6 11.6 3.4 3.4"/>',
	menu: '<path d="M3 5h12M3 9h12M3 13h12"/>',
};
const icon = (k) => `<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>`;

// A colour as the menu shows it: six hex digits in capitals, and the opacity when it is not 100%.
const hexParts = (v) => {
	let h = String(v).trim();
	if (!/^#[0-9a-f]{3,8}$/i.test(h)) return { hex: h, alpha: null };
	h = h.slice(1);
	if (h.length <= 4) h = [...h].map((c) => c + c).join("");
	const alpha = h.length === 8 ? Math.round((parseInt(h.slice(6), 16) / 255) * 100) : null;
	return { hex: `#${h.slice(0, 6).toUpperCase()}`, alpha: alpha === 100 ? null : alpha };
};
const colourCell = (v) => {
	if (v == null) return `<td class="empty">Same as light</td>`;
	const { hex, alpha } = hexParts(v);
	return `<td><span class="val"><span class="sw${alpha != null ? " see" : ""}"><i style="background:${esc(v)}"></i></span><span class="mono">${esc(hex)}</span>${alpha != null ? `<span class="pct">${alpha}%</span>` : ""}</span></td>`;
};
const nameCell = (t) => `<td class="name"><code>${esc(t.name)}</code>${t.usage ? `<small>${inline(t.usage)}</small>` : ""}</td>`;
const colourGroups = new Map();
for (const t of tokens.color.tokens) {
	const g = t.name.match(/^([a-z]+)-a?\d+$/)?.[1] ?? "Palette";
	if (!colourGroups.has(g)) colourGroups.set(g, []);
	colourGroups.get(g).push(t);
}
const colourOrder = ["Palette", ...[...colourGroups.keys()].filter((g) => g !== "Palette")];
const colourView = colourOrder
	.map(
		(g) => `<div class="tgroup" id="colors-${g.toLowerCase()}"><h2>${g}</h2>
<div class="box"><table><thead><tr><th>Name</th><th>Light</th><th>Dark</th></tr></thead><tbody>${colourGroups
			.get(g)
			.map((t) => `<tr data-q="${esc(t.name)}">${nameCell(t)}${colourCell(light(t.value))}${colourCell(dark(t.value))}</tr>`)
			.join("")}</tbody></table></div></div>`,
	)
	.join("");

const fam = (g) => tokens.type.families[g.family] ?? tokens.type.families.sans;
const typeView = `<div class="tgroup"><h2>Families</h2><div class="box"><table><thead><tr><th>Name</th><th>Stack</th><th>Sample</th></tr></thead><tbody>${Object.entries(tokens.type.families)
	.map(([k, v]) => `<tr><td class="name"><code>font-${esc(k)}</code></td><td class="mono small">${esc(v)}</td><td style="font-family:${esc(v)};font-size:20px">Aa Bb 0123</td></tr>`)
	.join("")}</tbody></table></div></div>${tokens.type.groups
	.map(
		(g) => `<div class="tgroup"><h2>${esc(g.name)}</h2><div class="box"><table class="type"><thead><tr><th>Name</th><th>Sample</th><th>Size / line</th><th>Weight</th></tr></thead><tbody>${g.styles
			.map(
				(s) =>
					`<tr>${nameCell(s)}<td><div style="font-family:${esc(fam(g))};font-size:${esc(s.fontSize)};line-height:${esc(s.lineHeight)};font-weight:${esc(s.fontWeight)};letter-spacing:${esc(s.letterSpacing ?? "normal")};${s.textTransform ? `text-transform:${esc(s.textTransform)};` : ""}overflow-wrap:anywhere">Your squad is running</div></td><td class="mono">${esc(s.fontSize)} / ${esc(s.lineHeight)}</td><td class="mono">${esc(s.fontWeight)}</td></tr>`,
			)
			.join("")}</tbody></table></div></div>`,
	)
	.join("")}`;

const tokenTable = (heads, list, cells) =>
	`<div class="box"><table><thead><tr>${heads.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${list.map((t) => `<tr>${nameCell(t)}${cells(t)}</tr>`).join("")}</tbody></table></div>`;
const spacingView = tokenTable(["Name", "Value", "Size"], tokens.spacing.tokens, (t) => `<td class="mono">${esc(t.value)}</td><td class="wide"><span class="bar" style="width:min(${esc(t.value)},100%)"></span></td>`);
const radiusView = tokenTable(["Name", "Value", "Shape"], tokens.radius.tokens, (t) => `<td class="mono">${esc(t.value)}</td><td><span class="shape" style="border-radius:${esc(t.value)}"></span></td>`);
const shadowView = tokenTable(
	["Name", "Light", "Dark"],
	tokens.shadow.tokens,
	(t) => `<td><span class="lift" style="box-shadow:${esc(light(t.value))}"></span><span class="mono small block">${esc(light(t.value))}</span></td><td><span class="dark-ground"><span class="lift on-dark" style="box-shadow:${esc(dark(t.value) ?? light(t.value))}"></span></span><span class="mono small block">${esc(dark(t.value) ?? "Same as light")}</span></td>`,
);
// The easing curve, drawn in a 48 x 48 box. "ease" is cubic-bezier(0.25, 0.1, 0.25, 1).
const curve = (v) => {
	const n = v === "ease" ? [0.25, 0.1, 0.25, 1] : (v.match(/-?[\d.]+/g) ?? []).map(Number);
	if (n.length !== 4) return "";
	const p = (x, y) => `${(4 + x * 40).toFixed(1)} ${(44 - y * 40).toFixed(1)}`;
	return `<svg class="curve" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><path d="M${p(0, 0)} L${p(1, 1)}" stroke="var(--line)" fill="none"/><path d="M${p(0, 0)} C${p(n[0], n[1])} ${p(n[2], n[3])} ${p(1, 1)}" stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
};
const track = (dur, ease) => `<span class="track" style="--d:${esc(dur)};--e:${esc(ease)}"><span></span></span>`;
const easingView = tokenTable(["Name", "Value", "Curve", "Try it"], tokens.easing.tokens, (t) => `<td class="mono small">${esc(t.value)}</td><td>${curve(t.value)}</td><td class="wide">${track("600ms", t.value)}</td>`);
const durationView = tokenTable(["Name", "Value", "Try it"], tokens.duration.tokens, (t) => `<td class="mono">${esc(t.value)}</td><td class="wide">${track(t.value, "cubic-bezier(0.65, 0, 0.35, 1)")}</td>`);

const ORDER = ["Actions", "Forms", "Canvas", "Panels", "Chrome", "Data display", "Pages"];
const rank = (g) => (ORDER.includes(g) ? ORDER.indexOf(g) : ORDER.length);
const groups = [...new Set(info.map((c) => c.group))].sort((a, b) => rank(a) - rank(b));
const inGroup = (g) => info.filter((c) => c.group === g);
const compIndex = groups
	.map(
		(g) => `<div class="tgroup"><h2>${esc(g)}</h2><div class="box"><table class="links"><tbody>${inGroup(g)
			.map((c) => `<tr><td class="name"><a href="#components/${c.name}">${c.name}</a></td><td class="muted">${esc(c.subtitle)}</td></tr>`)
			.join("")}</tbody></table></div></div>`,
	)
	.join("");
const compViews = info
	.map(
		(c) => `<section class="view" data-view="c-${c.name}" data-title="${c.name}" aria-labelledby="h-${c.name}">
<p class="crumb"><a href="#components">Components</a> / ${esc(c.group)}</p>
<header class="vhead"><div><h1 id="h-${c.name}" tabindex="-1">${c.name}</h1><p class="sub">${esc(c.subtitle)}</p></div><a class="btn" href="agent-ui/previews/${c.name}.html">Open preview</a></header>
<div class="frame"><iframe data-src="agent-ui/previews/${c.name}.html" title="${c.name} preview" style="height:${c.height}px"></iframe></div>
<div class="prose">${md(c.readme, 2)}</div>
</section>`,
	)
	.join("\n");
const compNav = groups
	.map((g) => `<li class="sub-h">${esc(g)}</li>${inGroup(g).map((c) => `<li><a href="#components/${c.name}" data-q="${esc(`${c.name} ${c.group}`)}">${c.name}</a></li>`).join("")}`)
	.join("");

const cards = MASCOTS.map(
	(m) =>
		`<div class="mc">${card(m, `p${m.id}`)}<p class="dl"><a href="mascots/svg/${slug(m)}.svg">SVG</a><a href="mascots/png/${slug(m)}.png">PNG</a><a href="mascots/jpeg/${slug(m)}.jpg">JPEG</a><a href="mascots/cards/png/${slug(m)}.png">Card PNG</a><a href="mascots/cards/jpeg/${slug(m)}.jpg">Card JPEG</a></p></div>`,
).join("\n");
const readme = readFileSync("agent-ui/README.md", "utf8").replace(/^# .*\n/, "");
const dataDisplay = readFileSync("agent-ui/data-display.md", "utf8").replace(/^# .*\n/, "");
const typeCount = tokens.type.groups.reduce((n, g) => n + g.styles.length, 0);

// ---- The product screens from the canvas, the approved page designs and the mascot states. ----
const canvas = JSON.parse(readFileSync("screens/canvas.json", "utf8"));
const manifest = JSON.parse(readFileSync("screens/MANIFEST.json", "utf8"));
const SCREENS = canvas.order.map((file) => ({ id: file.replace(".dc.html", ""), file, ...canvas.boards[file] }));
const PAGES = [
	{ id: "home-v2", title: "Homepage: the approval moment", note: "The homepage design. A squad does the work, and the owner says yes to what matters.", file: "pages/home-v2/home.html", w: 1440, h: 4852, shots: [["home-1440.png", "1440 px"], ["home-390.png", "390 px"], ["home-dashboard.jpg", "Dashboard image"]] },
	{ id: "squadmates-sidebar", title: "Squadmates in the sidebar", note: "How the squad shows in the app sidebar.", file: "pages/squadmates-sidebar/sidebar.html", w: 1180, h: 760, shots: [["sidebar.png", "1180 px"]] },
];
// A design drawn at its own width, scaled down to fit the sheet. The script sets --s.
const scaled = (src, title, w, h) => `<div class="scaled" style="--w:${w};--h:${h}"><iframe data-src="${src}" title="${esc(title)}" width="${w}" height="${h}" loading="lazy"></iframe></div>`;
const subView = (kind, label, id, title, note, open, body) => `<section class="view" data-view="${kind}-${id}" data-title="${esc(title)}" aria-labelledby="h-${kind}-${id}">
<p class="crumb"><a href="#${kind}">${label}</a></p>
<header class="vhead"><div><h1 id="h-${kind}-${id}" tabindex="-1">${esc(title)}</h1>${note ? `<p class="sub">${note}</p>` : ""}</div><a class="btn" href="${open}">Open full size</a></header>
${body}
</section>`;
const screenIndex = `<div class="box"><table class="links"><thead><tr><th>Screen</th><th>File</th><th>Size</th></tr></thead><tbody>${SCREENS.map((x) => `<tr><td class="name"><a href="#screens/${x.id}">${esc(x.title)}</a></td><td class="mono small">${x.file}</td><td class="mono small">${x.w} × ${x.h}</td></tr>`).join("")}</tbody></table></div>
<div class="prose" style="margin-top:24px"><p>The screens started as a copy of the canvas. Since 11 November 2026 they are edited here. <code>screens/MANIFEST.json</code> holds a SHA-256 hash for each approved file. Run <code>node scripts/design-check.mjs</code> to prove the screens match the manifest. Run <code>node scripts/design-inventory.mjs</code> to list the texts, handlers and loops of each screen in <code>screens/inventory/</code>.</p><p>Canvas version <code>${esc(manifest.version)}</code>, pulled ${esc(manifest.pulled)}.</p></div>`;
const screenViews = SCREENS.map((x) => subView("screens", "Screens", x.id, x.title, `<code>screens/${x.file}</code> · ${x.w} × ${x.h} · <a href="screens/inventory/${x.id}.json">Inventory</a>`, `screens/${x.file}`, scaled(`screens/${x.file}`, x.title, x.w, x.h))).join("\n");
const pageIndex = `<div class="box"><table class="links"><tbody>${PAGES.map((x) => `<tr><td class="name"><a href="#pages/${x.id}">${esc(x.title)}</a></td><td class="muted">${esc(x.note)}</td></tr>`).join("")}</tbody></table></div>`;
const dir = (x) => x.file.slice(0, x.file.lastIndexOf("/") + 1);
const pageViews = PAGES.map((x) => subView("pages", "Pages", x.id, x.title, esc(x.note), x.file, `<p class="dl" style="margin-bottom:16px">${x.shots.map(([f, l]) => `<a href="${dir(x)}${f}">${esc(l)}</a>`).join("")}</p>${scaled(x.file, x.title, x.w, x.h)}`)).join("\n");
const stateHead = `<tr><th></th>${STATES.map(([, l, h]) => `<th>${esc(l)}<small class="block">${esc(h)}</small></th>`).join("")}</tr>`;
const stateRows = SQUADMATES.map((m) => `<tr><td class="who"><b>${m.name}</b><small class="block">${esc(m.role)}</small></td>${STATES.map(([st]) => `<td><a href="mascots/states/${mateName(m.id)}-${st}.svg" aria-label="${m.name}, ${st}">${squadmateMarkup(m.id, st, 64)}</a></td>`).join("")}</tr>`).join("");
const stateView = `${SQUADMATE_CSS}<div class="box"><table class="states"><thead>${stateHead}</thead><tbody>${stateRows}</tbody></table></div>
<div class="prose" style="margin-top:24px"><p>Each avatar links to its SVG in <code>mascots/states/</code>, drawn at 160 px. At 64 px and above the whole mascot shows. Under 64 px only the upper body shows. The drawing code is in <code>scripts/squadmates/</code>. It is the same code the app uses.</p></div>`;

const logoView = `<div class="logos-grid"><div class="lg light">${logoSvg({ size: 128 })}</div><div class="lg dark">${logoSvg({ size: 128, dark: true })}</div></div>
<div class="lg-sizes"><span class="lg-nav">${logoSvg({ size: 28, label: "" })}<b>tensquads</b></span><span>${logoSvg({ size: 32 })}${logoSvg({ size: 16 })} favicon 32 and 16</span></div>
<p class="dl" style="margin:20px 0"><a href="logo/logo.svg">SVG</a><a href="logo/logo-dark.svg">SVG, dark background</a><a href="logo/logo-512.png">PNG 512</a><a href="logo/logo-dark-512.png">PNG 512, dark background</a><a href="logo/favicon.svg">Favicon SVG</a><a href="logo/favicon-32.png">Favicon PNG 32</a><a href="logo/apple-touch-icon.png">Apple touch icon 180</a></p>
<div class="prose"><p><strong>Do</strong>: use the black tile on light backgrounds and the white tile on dark backgrounds. Put the name "tensquads" to the right of the tile, in Inter 600, 8 px away at 28 px. <strong>Do not</strong>: change the seat colours, take away the tile, or put a mascot in place of the logo.</p><p>The drawing code is in <code>scripts/logo.mjs</code>.</p></div>`;

const VIEWS = [
	["overview", "Overview"],
	["colors", "Colors", tokens.color.tokens.length],
	["typography", "Typography", typeCount],
	["spacing", "Spacing", tokens.spacing.tokens.length],
	["radius", "Corner radius", tokens.radius.tokens.length],
	["shadows", "Shadows", tokens.shadow.tokens.length],
	["easing", "Easing", tokens.easing.tokens.length],
	["duration", "Duration", tokens.duration.tokens.length],
	["components", "Components", info.length],
	["logo", "Logo"],
	["mascots", "Mascots", MASCOTS.length],
	["states", "Mascot states", STATES.length],
	["screens", "Screens", SCREENS.length],
	["pages", "Pages", PAGES.length],
];
const navItem = ([id, label, n]) =>
	`<li><a href="#${id}" data-q="${esc(label)}">${icon(id)}<span>${label}</span>${n != null ? `<span class="n">${n}</span>` : ""}</a>${id === "components" ? `<ul class="subnav">${compNav}</ul>` : ""}${id === "screens" ? `<ul class="subnav">${SCREENS.map((x) => `<li><a href="#screens/${x.id}" data-q="${esc(x.title)}">${esc(x.title)}</a></li>`).join("")}</ul>` : ""}${id === "pages" ? `<ul class="subnav">${PAGES.map((x) => `<li><a href="#pages/${x.id}" data-q="${esc(x.title)}">${esc(x.title)}</a></li>`).join("")}</ul>` : ""}</li>`;
const view = (id, title, note, body) =>
	`<section class="view" data-view="${id}" data-title="${title}" aria-labelledby="h-${id}">
<header class="vhead"><div><h1 id="h-${id}" tabindex="-1">${title}</h1>${note ? `<p class="sub">${note}</p>` : ""}</div></header>
${body}
</section>`;
const stats = VIEWS.filter((v) => v[2] != null)
	.map(([id, label, n]) => `<a class="stat" href="#${id}">${icon(id)}<b>${n}</b><span>${label}</span></a>`)
	.join("");

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>tensquads design system</title>
<link rel="icon" href="logo/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="logo/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400&amp;family=Newsreader:opsz,wght@6..72,400&amp;family=Fredoka:wght@500;600&amp;family=DM+Sans:wght@400;500;600&amp;display=swap">
<style>
:root{--bg:#f9f9f9;--side:#fcfcfc;--surface:#fff;--ink:#0d0d0d;--muted:#5d5d5d;--faint:#8f8f8f;--line:rgba(13,13,13,.09);--accent:#0169cc;--soft:#f3f3f3;--hover:rgba(13,13,13,.05);--active:rgba(13,13,13,.09)}
/* Layout: a 264px side menu and one view at a time on a white sheet. Under 860px the menu is a drawer. */
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:400 14px/1.55 Inter,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--accent)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:6px}
h1:focus{outline:0}
code,.mono{font-family:"JetBrains Mono",ui-monospace,Menlo,monospace;font-size:13px}
.small{font-size:11.5px}.muted{color:var(--muted)}.block{display:block;margin-top:6px;color:var(--muted)}
.side{position:fixed;inset:0 auto 0 0;width:264px;background:var(--side);border-right:1px solid var(--line);display:flex;flex-direction:column;z-index:20}
.brand{display:flex;align-items:center;gap:10px;padding:16px 16px 6px;font-weight:600;font-size:15px;color:var(--ink);text-decoration:none}
.brand img{width:26px;height:26px}
.search{position:relative;margin:10px 12px 8px}
.search svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--faint)}
.search input{width:100%;font:inherit;color:var(--ink);padding:7px 10px 7px 34px;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
.search input:focus-visible{outline:2px solid var(--accent);outline-offset:0}
.side nav{overflow-y:auto;flex:1;padding:4px 10px 16px}
.side ul{list-style:none;margin:0;padding:0}
.side nav a{display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:8px;color:var(--ink);text-decoration:none;font-size:14.5px}
.side nav a:hover{background:var(--hover)}
.side nav a[aria-current]{background:var(--active)}
.side nav svg{flex:none;color:var(--muted)}
.side .n{margin-left:auto;font-size:12px;color:var(--faint);font-variant-numeric:tabular-nums}
.subnav{display:none;margin:2px 0 6px 19px!important;padding-left:10px!important;border-left:1px solid var(--line)}
.side li.open .subnav,.side.searching .subnav{display:block}
.subnav a{font-size:13.5px!important;padding:4px 10px!important}
.sub-h{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--faint);padding:10px 10px 2px}
.side hr{border:0;border-top:1px solid var(--line);margin:10px 4px}
.side .none{display:none;padding:8px 10px;color:var(--muted)}
.side.empty .none{display:block}
[data-hide]{display:none!important}
.topbar{display:none}
main{margin-left:264px;padding:28px 32px 80px;min-height:100vh}
.sheet{max-width:1160px;margin:0 auto;background:var(--surface);border-radius:16px;box-shadow:0 0 0 1px var(--line),0 1px 3px rgba(13,13,13,.04);padding:40px 40px 56px}
.view[hidden]{display:none}
.vhead{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:32px}
.vhead h1{margin:0;font:400 44px/1.1 Newsreader,"Iowan Old Style",Georgia,serif;letter-spacing:-.01em}
.sub{margin:8px 0 0;color:var(--muted);max-width:680px;font-size:15px}
.crumb{margin:0 0 10px;font-size:13px;color:var(--muted)}.crumb a{color:var(--muted)}
.btn{flex:none;font-size:13.5px;font-weight:500;color:var(--ink);text-decoration:none;padding:7px 14px;border-radius:9px;background:var(--soft)}
.btn:hover{background:#ececec}
.tgroup{margin-top:40px}.tgroup:first-of-type{margin-top:0}
.tgroup h2{margin:0 0 12px;font-size:16px;font-weight:500;text-transform:none}
.box{overflow-x:auto;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:0 -40px}
table{border-collapse:collapse;width:100%;min-width:640px}
th{text-align:left;font-weight:400;color:var(--muted);padding:12px 16px;border-bottom:1px solid var(--line)}
td{padding:14px 16px;border-top:1px solid var(--line);vertical-align:middle}
tbody tr:first-child td{border-top:0}
th:first-child,td:first-child{padding-left:40px}th:last-child,td:last-child{padding-right:40px}
th+th,td+td{border-left:1px solid var(--line)}
.name{width:30%}.name code{font-size:14px;color:var(--ink)}
.name small code{font-size:11.5px;color:var(--ink)}
.name small{display:block;margin-top:3px;font-size:12px;line-height:1.45;color:var(--muted);max-width:340px}
.val{display:flex;align-items:center;gap:10px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;max-width:280px}
.val .mono{font-size:13.5px}
.pct{margin-left:auto;font-size:12px;color:var(--faint)}
.sw{position:relative;flex:none;width:18px;height:18px;border-radius:5px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(13,13,13,.1)}
.sw i{position:absolute;inset:0}
.sw.see{background:repeating-conic-gradient(#d9d9d9 0 25%,#fff 0 50%) 0 0/8px 8px}
.empty{color:var(--faint)}
.wide{width:40%}
.bar{display:block;height:12px;background:var(--accent);border-radius:3px;opacity:.75;min-width:1px}
.shape{display:block;width:56px;height:56px;background:var(--soft);border:1px solid rgba(13,13,13,.14)}
.lift{display:block;width:72px;height:44px;border-radius:10px;background:#fff}
.dark-ground{display:inline-block;padding:10px;border-radius:12px;background:#161616}.lift.on-dark{background:#232323}
.curve{display:block}
.track{display:block;position:relative;height:24px;border-radius:12px;background:var(--soft)}
.track span{position:absolute;left:4px;top:4px;width:16px;height:16px;border-radius:50%;background:var(--accent);transition:left var(--d) var(--e)}
tr:hover .track span,tr:focus-within .track span{left:calc(100% - 20px)}
.type td>div{max-width:520px}
.links td{padding-top:11px;padding-bottom:11px}.links a{font-weight:500;text-decoration:none}.links a:hover{text-decoration:underline}
.stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:40px}
.stat{display:flex;flex-direction:column;gap:2px;padding:16px;border-radius:12px;box-shadow:0 0 0 1px var(--line);color:var(--ink);text-decoration:none}
.stat:hover{background:var(--soft)}.stat svg{color:var(--muted);margin-bottom:8px}.stat b{font-size:24px;font-weight:600}.stat span{color:var(--muted);font-size:13px}
.prose{max-width:760px;font-size:15px}.prose p{margin:0 0 12px}.prose ul{margin:0 0 12px;padding-left:20px}
.prose h2{margin:32px 0 10px;font-size:20px;font-weight:600}.prose h3{margin:24px 0 8px;font-size:16px;font-weight:600}.prose h4,.prose h5{margin:18px 0 6px;font-size:15px;font-weight:600}
.frame{margin:0 -40px 32px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:#f7f7f7}
.frame iframe{display:block;width:100%;border:0}
.logos-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:20px}.lg{display:grid;place-items:center;height:220px;border-radius:16px;box-shadow:0 0 0 1px var(--line)}.lg.light{background:#fff}.lg.dark{background:#0d0d0d}.lg-sizes{display:flex;flex-wrap:wrap;gap:32px;align-items:center;margin-top:20px;color:var(--muted);font-size:13px}.lg-sizes span{display:inline-flex;align-items:center;gap:10px}.lg-nav{gap:8px!important;color:var(--ink);font-size:16px}.lg-nav b{font-weight:600}
.mascots{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:20px}
.mc{display:flex;flex-direction:column;gap:10px}
.mc .mcard{border-radius:14px;box-shadow:0 0 0 1px var(--line),0 1px 3px rgba(13,13,13,.06)}
.dl{display:flex;gap:6px;flex-wrap:wrap;margin:0}
.dl a{font-size:12.5px;font-weight:500;text-decoration:none;padding:4px 11px;border-radius:999px;box-shadow:0 0 0 1px var(--line);color:var(--ink)}
.dl a:hover{background:var(--soft)}
${CARD_CSS}
.scaled{position:relative;margin:0 -40px;height:calc(var(--h) * var(--s, .75) * 1px);overflow:hidden;border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:#f7f7f7}
.scaled iframe{position:absolute;left:0;top:0;border:0;transform-origin:0 0;transform:scale(var(--s, .75))}
table.states{min-width:900px}table.states th,table.states td{text-align:center;padding:10px 8px}table.states th{font-size:12.5px;vertical-align:bottom}
table.states .who{text-align:left;white-space:nowrap}table.states svg{display:inline-block;vertical-align:middle}
.scrim{display:none}
@media (max-width:860px){
.topbar{display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:10;padding:10px 14px;background:var(--side);border-bottom:1px solid var(--line);font-weight:600}
.topbar button{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:9px;background:transparent;color:var(--ink);cursor:pointer}
.topbar button:hover{background:var(--hover)}
.side{transform:translateX(-100%);transition:transform .24s cubic-bezier(.19,1,.22,1);box-shadow:0 0 40px rgba(0,0,0,.12)}
body.menu .side{transform:none}
body.menu .scrim{display:block;position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:15}
main{margin-left:0;padding:16px 12px 64px}
.sheet{padding:28px 20px 40px}
.box,.frame,.scaled{margin-left:-20px;margin-right:-20px}
th:first-child,td:first-child{padding-left:20px}th:last-child,td:last-child{padding-right:20px}
.vhead{flex-direction:column}.vhead h1{font-size:36px}
}
@media (prefers-reduced-motion:reduce){.track span,.side{transition:none}}
</style>
</head>
<body>
<div class="topbar"><button type="button" class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="side">${icon("menu")}</button>tensquads design system</div>
<aside class="side" id="side">
<a class="brand" href="#overview">${logoSvg({ size: 24, label: "" })}tensquads design system</a>
<div class="search">${icon("search")}<input type="search" placeholder="Search" aria-label="Search the menu" autocomplete="off"></div>
<nav aria-label="Design system">
<ul class="main-nav">${VIEWS.map(navItem).join("")}</ul>
<p class="none">No match.</p>
<hr>
<ul><li><a href="${REPO}">${icon("source")}<span>Source files</span></a></li></ul>
</nav>
</aside>
<div class="scrim"></div>
<main>
<div class="sheet">
${view(
	"overview",
	"Overview",
	`The reference for how tensquads looks. It holds Agent-UI, the visual language of the app, the thirteen squad mascots, the product screens and the approved page designs. Agent-UI tokens version ${esc(tokens.version)}.`,
	`<div class="stats">${stats}</div><div class="prose">${md(readme, 2)}</div>`,
)}
${view("colors", "Colors", "Each token has a light and a dark value. Use the palette tokens before the raw scales.", colourView)}
${view("typography", "Typography", "", typeView)}
${view("spacing", "Spacing", "", spacingView)}
${view("radius", "Corner radius", "", radiusView)}
${view("shadows", "Shadows", "", shadowView)}
${view("easing", "Easing", "Point at a row to see the curve move.", easingView)}
${view("duration", "Duration", "Point at a row to see the time.", durationView)}
${view(
	"components",
	"Components",
	`Each preview is live. It loads <code>agent-ui/tokens.css</code>, <code>agent-ui/components/bundle.css</code> and <code>agent-ui/components/bundle.js</code>. The builders are on <code>window.AgentUI</code>.`,
	`${compIndex}<div class="tgroup"><h2>Data display</h2><div class="prose">${md(dataDisplay, 3)}</div></div>`,
)}
${compViews}
${view(
	"logo",
	"Logo",
	"The round table. Ten seats sit around one table, in the colours of the squad mascots. The white centre is the owner: the squad works around the owner. The logo is not a mascot. Petra is an agent, not the brand.",
	logoView,
)}
${view(
	"mascots",
	"Mascots",
	"One frosted toy for each agent. Each body takes its shape from the place the agent is named after. Every mascot wears one lens over its right eye. The lens is the squad's mark. Each mascot comes as SVG, PNG with a clear background and JPEG with a white background.",
	`<div class="mascots">${cards}</div>`,
)}
${view("states", "Mascot states", "Each mascot in each Agent loop state. The eyes show what the agent is doing now. A badge shows the states a person must see.", stateView)}
${view("screens", "Screens", "The product screens from the design canvas. The design is the source of truth for every screen.", screenIndex)}
${screenViews}
${view("pages", "Pages", "The approved designs for pages outside the app.", pageIndex)}
${pageViews}
</div>
</main>
<script>
(function () {
	var views = [].slice.call(document.querySelectorAll("[data-view]"));
	var links = [].slice.call(document.querySelectorAll(".side nav a[href^='#']"));
	var side = document.getElementById("side");
	var menuBtn = document.querySelector(".menu-btn");
	var mobile = window.matchMedia("(max-width:860px)");
	var input = side.querySelector("input");
	// Older links to this page used these names.
	var OLD = { mascot: "mascots", principles: "overview", colour: "colors", type: "typography", radius: "radius", shadow: "shadows", motion: "easing", "data-display": "components" };
	function setMenu(open) {
		document.body.classList.toggle("menu", open);
		menuBtn.setAttribute("aria-expanded", String(open));
		side.inert = mobile.matches && !open;
		document.querySelector("main").inert = open;
		document.querySelector(".topbar").inert = open;
		if (open) input.focus();
	}
	function show(moveFocus) {
		var hash = decodeURIComponent(location.hash.slice(1)) || "overview";
		var parts = hash.split("/");
		var id = OLD[parts[0]] || parts[0];
		if (id === "components" && parts[1]) id = "c-" + parts[1];
		if ((id === "screens" || id === "pages") && parts[1]) id = id + "-" + parts[1];
		var current = views.filter(function (v) { return v.dataset.view === id; })[0];
		if (!current) { id = "overview"; current = views[0]; }
		views.forEach(function (v) { v.hidden = v !== current; });
		current.querySelectorAll("iframe[data-src]").forEach(function (f) { f.src = f.dataset.src; f.removeAttribute("data-src"); });
		var sub = /^(screens|pages)-(.+)$/.exec(id);
		var here = id.indexOf("c-") === 0 ? "#components/" + id.slice(2) : sub ? "#" + sub[1] + "/" + sub[2] : "#" + id;
		links.forEach(function (a) {
			var parent = here.split("/")[0];
			var on = a.getAttribute("href") === here || (here.indexOf("/") !== -1 && a.getAttribute("href") === parent);
			if (on) a.setAttribute("aria-current", a.getAttribute("href") === here ? "page" : "true");
			else a.removeAttribute("aria-current");
		});
		side.querySelectorAll(".main-nav > li").forEach(function (li) { li.classList.toggle("open", li.querySelector("a").getAttribute("href") === here.split("/")[0]); });
		document.title = current.dataset.title + " · tensquads design system";
		fit();
		setMenu(false);
		if (moveFocus) { window.scrollTo(0, 0); current.querySelector("h1").focus({ preventScroll: true }); }
	}
	// Scale each design to the width of the sheet.
	function fit() {
		document.querySelectorAll(".scaled").forEach(function (box) {
			if (!box.offsetWidth) return;
			box.style.setProperty("--s", String(box.offsetWidth / Number(box.style.getPropertyValue("--w"))));
		});
	}
	window.addEventListener("resize", fit);
	window.addEventListener("hashchange", function () { show(true); });
	show(false);
	menuBtn.addEventListener("click", function () { setMenu(!document.body.classList.contains("menu")); });
	document.querySelector(".scrim").addEventListener("click", function () { setMenu(false); });
	mobile.addEventListener("change", function () { setMenu(false); });
	links.concat(side.querySelector(".brand")).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
	document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("menu")) { setMenu(false); menuBtn.focus(); } });
	// The search box filters the menu. Enter opens the first match.
	input.addEventListener("input", function () {
		var q = input.value.trim().toLowerCase();
		side.classList.toggle("searching", q !== "");
		var shown = 0;
		side.querySelectorAll(".main-nav > li").forEach(function (li) {
			var top = li.querySelector("a");
			var topHit = top.dataset.q.toLowerCase().indexOf(q) !== -1;
			var subHits = 0;
			li.querySelectorAll(".subnav li").forEach(function (s) {
				var a = s.querySelector("a");
				var hit = !q || (a ? a.dataset.q.toLowerCase().indexOf(q) !== -1 : false);
				if (a) { s.toggleAttribute("data-hide", !hit); if (hit && q) subHits++; }
				else s.toggleAttribute("data-hide", !!q);
			});
			var keep = !q || topHit || subHits > 0;
			li.toggleAttribute("data-hide", !keep);
			if (keep) shown++;
		});
		side.classList.toggle("empty", shown === 0);
	});
	input.addEventListener("keydown", function (e) {
		if (e.key !== "Enter") return;
		var first = [].slice.call(side.querySelectorAll(".main-nav a")).filter(function (a) { return a.offsetParent !== null && (a.closest(".subnav") || !side.classList.contains("searching") || a.dataset.q.toLowerCase().indexOf(input.value.trim().toLowerCase()) !== -1); })[0];
		if (first) {
			location.hash = first.getAttribute("href");
			setMenu(false);
		}
	});
})();
</script>
</body>
</html>
`;
writeFileSync("index.html", page);
console.log("built", MASCOTS.length, "mascots and", info.length, "component previews");
