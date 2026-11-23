// The thirteen squad mascots. Flat 2D characters, one for each agent. Each body takes its shape
// from the place the agent is named after. Every mascot has a warm dark outline, flat fills in
// two or three tones, big round eyes, a round nose and worn brown boots.
// The source is github.com/moeghashim/tensquads-design-system (scripts/squadmates/mascots.ts).
// The eyes and the mouth come from a Face, so the avatar can show an Agent loop state.

export type Palette = { readonly light: string; readonly base: string; readonly deep: string; readonly limb: string };

// Draws the eyes and the mouth. Coordinates are in the 300 x 370 drawing.
// `size` is the eye radius.
export type Face = {
	readonly eyes: (left: number, right: number, y: number, size: number) => string;
	readonly mouth: (x: number, y: number, kind?: "smile" | "o") => string;
};

export const PALETTES: Record<string, Palette> = {
	master: { light: "#FBD8D0", base: "#EBA196", deep: "#C9746A", limb: "#E3958A" },
	orders: { light: "#DCE8FF", base: "#97B7F5", deep: "#5F86D6", limb: "#8AACEE" },
	support: { light: "#FFD3C7", base: "#F08B70", deep: "#CC5A40", limb: "#E98065" },
	marketing: { light: "#E6DBFF", base: "#B194F2", deep: "#7E5ED0", limb: "#A88BEB" },
	finance: { light: "#EEF1F6", base: "#B6C0CF", deep: "#7E8BA0", limb: "#A9B4C5" },
	inventory: { light: "#FFE1C4", base: "#F4A866", deep: "#D27A34", limb: "#EE9F5A" },
	market: { light: "#D3F0DF", base: "#93D2B1", deep: "#5EA885", limb: "#86C7A5" },
	website: { light: "#FFE7AE", base: "#F5C25C", deep: "#D6952C", limb: "#EDB54E" },
	analytics: { light: "#E8F2C9", base: "#B5CB72", deep: "#7F9840", limb: "#A9C065" },
	hr: { light: "#D4F1FB", base: "#86CDE8", deep: "#4C9EC2", limb: "#7AC4E2" },
	places: { light: "#F6FBC4", base: "#DDEB5C", deep: "#A8B824", limb: "#D3E350" },
	catalog: { light: "#D9DBFF", base: "#8E95F2", deep: "#4F56C4", limb: "#8288EC" },
	channels: { light: "#FFD6F0", base: "#F28CCB", deep: "#C9529C", limb: "#EC80C2" },
};

// The square that shows the head in a small avatar: x, y and side, in the drawing.
export const BUST: Record<string, readonly [number, number, number]> = {
	master: [50, 108, 200],
	orders: [54, 100, 200],
	support: [50, 82, 200],
	marketing: [52, 92, 200],
	finance: [50, 92, 200],
	inventory: [50, 98, 200],
	market: [50, 78, 200],
	website: [50, 100, 200],
	analytics: [50, 76, 200],
	hr: [52, 108, 200],
	places: [50, 112, 200],
	catalog: [50, 26, 200],
	channels: [50, 86, 200],
};

// The ink for eyes, outlines and the mouth.
export const INK = "#1B1B1F";
export const OUTLINE = "#3B2418";
export const IRIS = "#6B3B22";
const BOOT = "#8A4E2B";
const BOOT_DARK = "#5E3219";
const LACE = "#E2B07A";
const WOOD = "#9A5E34";
const GOLD = "#F2C14E";

export function defs(k: string, _c: Palette): string {
	return `<defs><filter id="${k}s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs>`;
}

export const shadow = (k: string) =>
	`<ellipse cx="150" cy="358" rx="104" ry="9" fill="#1B2430" opacity=".14" filter="url(#${k}s)"/>`;

// ---- Shapes. Every shape has the same outline. ----
const shape = (d: string, fill: string, w = 4) =>
	`<path d="${d}" fill="${fill}" stroke="${OUTLINE}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const flat = (d: string, fill: string, opacity = 1) =>
	`<path d="${d}" fill="${fill}"${opacity < 1 ? ` opacity="${opacity}"` : ""}/>`;
const line = (d: string, color: string, w = 3) =>
	`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circle = (x: number, y: number, r: number, fill: string, w = 4) =>
	`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${OUTLINE}" stroke-width="${w}"/>`;
const rect = (x: number, y: number, w: number, h: number, fill: string, rx = 3, sw = 3) =>
	`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${OUTLINE}" stroke-width="${sw}"/>`;

// The body with its shading: a deep tone on the right and a light tone on the left, cut to the body.
const body = (k: string, c: Palette, d: string, extra = "") =>
	`<clipPath id="${k}c"><path d="${d}"/></clipPath>${flat(d, c.base)}<g clip-path="url(#${k}c)">${flat(
		"M200 0 L340 0 L340 370 L196 370 Q230 200 200 0 Z",
		c.deep,
		0.32,
	)}${flat("M0 0 L104 0 Q76 160 100 370 L0 370 Z", c.light, 0.4)}${extra}</g>${line(d, OUTLINE, 4)}`;

// An arm: a tube with an outline.
const arm = (c: Palette, d: string) =>
	`<path d="${d}" fill="none" stroke="${OUTLINE}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c.limb}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`;
const hand = (c: Palette, x: number, y: number, r = 12) =>
	`${circle(x, y, r, c.limb, 3.5)}<path d="M${x - r * 0.45} ${y - r * 0.15} Q${x - r * 0.1} ${y + r * 0.35} ${x + r * 0.35} ${y + r * 0.1}" fill="none" stroke="${OUTLINE}" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
// An open hand that waves: a palm and four fingers.
const wave = (c: Palette, x: number, y: number) => {
	const fingers = (
		[
			[-11, -10, -17, -27],
			[-4, -13, -5, -32],
			[4, -13, 7, -31],
			[11, -9, 18, -24],
		] as const
	)
		.map(([a, b, d, e]) => `M${x + a} ${y + b} L${x + d} ${y + e}`)
		.join(" ");
	const thumb = `M${x - 13} ${y + 2} L${x - 25} ${y - 6}`;
	return `<path d="${fingers} ${thumb}" fill="none" stroke="${OUTLINE}" stroke-width="13" stroke-linecap="round"/><path d="${fingers} ${thumb}" fill="none" stroke="${c.limb}" stroke-width="6.5" stroke-linecap="round"/><ellipse cx="${x}" cy="${y}" rx="15" ry="14" fill="${c.limb}" stroke="${OUTLINE}" stroke-width="3.5"/>`;
};
// A fist with the index finger up.
const point = (c: Palette, x: number, y: number) =>
	`<path d="M${x + 2} ${y - 6} L${x + 4} ${y - 30}" fill="none" stroke="${OUTLINE}" stroke-width="13" stroke-linecap="round"/><path d="M${x + 2} ${y - 6} L${x + 4} ${y - 30}" fill="none" stroke="${c.limb}" stroke-width="6.5" stroke-linecap="round"/>${hand(c, x, y)}`;

// Legs and worn brown boots. The toes point out.
const boot = (x: number, dir: 1 | -1) => {
	const p = (dx: number) => x + dx * dir;
	return `<path d="M${p(-14)} 322 L${p(12)} 322 L${p(14)} 334 Q${p(34)} 336 ${p(36)} 348 L${p(36)} 352 L${p(-18)} 352 L${p(-18)} 338 Q${p(-18)} 328 ${p(-14)} 322 Z" fill="${BOOT}" stroke="${OUTLINE}" stroke-width="3.5" stroke-linejoin="round"/><path d="M${p(-18)} 348 L${p(36)} 348 L${p(36)} 355 L${p(-18)} 355 Z" fill="${BOOT_DARK}" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>${line(`M${p(-8)} 328 L${p(6)} 334 M${p(6)} 328 L${p(-8)} 334`, LACE, 2.5)}`;
};
const legs = (c: Palette, a: number, b: number, top: number) =>
	`${rect(a - 9, top, 18, 330 - top, c.limb, 6, 3.5)}${rect(b - 9, top, 18, 330 - top, c.limb, 6, 3.5)}${boot(a, -1)}${boot(b, 1)}`;

// The round nose sits between the eyes and the mouth.
const nose = (c: Palette, x: number, y: number) =>
	`<ellipse cx="${x}" cy="${y}" rx="10" ry="8" fill="${c.limb}" stroke="${OUTLINE}" stroke-width="3"/><ellipse cx="${x - 3}" cy="${y - 3}" rx="3.5" ry="2.2" fill="#fff" opacity=".55"/>`;

type Draw = (k: string, c: Palette, f: Face) => string;

export const DRAW: Record<string, Draw> = {
	// Petra: an arched doorway with a round finial and the Treasury front. Waves the team in.
	master: (k, c, f) => {
		const d = "M86 304 L86 150 A64 64 0 0 1 214 150 L214 304 Q214 314 204 314 L96 314 Q86 314 86 304 Z";
		const niche = "M104 304 L104 160 A46 46 0 0 1 196 160 L196 304 Z";
		const columns = [106, 184].map((x) => rect(x, 182, 10, 118, c.light, 2, 2.5)).join("");
		return `${legs(c, 124, 176, 306)}
${arm(c, "M212 228 Q238 250 232 280")}${hand(c, 232, 284)}
${rect(143, 80, 14, 16, c.base, 3, 3.5)}${circle(150, 70, 13, c.base)}
${body(k, c, d, `${flat(niche, c.deep, 0.42)}`)}
${rect(136, 120, 28, 26, c.light, 3, 2.5)}${shape("M132 122 Q150 100 168 122 Z", c.light, 2.5)}
${shape("M100 176 L150 150 L200 176 Z", c.light, 2.5)}${rect(98, 176, 104, 8, c.light, 2, 2.5)}
${columns}${rect(122, 262, 9, 40, c.light, 2, 2.5)}${rect(169, 262, 9, 40, c.light, 2, 2.5)}${rect(137, 268, 26, 34, "#7A3B2C", 2, 2.5)}
${nose(c, 150, 226)}${f.eyes(128, 172, 206, 13)}${f.mouth(150, 244)}
${arm(c, "M90 222 Q62 210 58 174")}${wave(c, 56, 164)}`;
	},

	// Pisa: a leaning tower of arcades with a bell top. Carries a parcel.
	orders: (k, c, f) => {
		const d =
			"M100 300 L100 96 Q100 84 112 84 L188 84 Q200 84 200 96 L200 300 Q200 310 190 310 L110 310 Q100 310 100 300 Z";
		const arcade = (y: number) =>
			[112, 132, 152, 172]
				.map((x) =>
					flat(
						`M${x} ${y + 26} L${x} ${y + 9} A8 8 0 0 1 ${x + 16} ${y + 9} L${x + 16} ${y + 26} Z`,
						c.deep,
						0.55,
					),
				)
				.join("");
		const band = (y: number) => rect(94, y, 112, 9, c.light, 4, 3);
		return `${legs(c, 128, 176, 300)}
<g transform="rotate(7 150 306)">
${rect(116, 46, 68, 42, c.base, 6, 4)}${flat("M126 84 L126 64 A8 8 0 0 1 142 64 L142 84 Z M158 84 L158 64 A8 8 0 0 1 174 64 L174 84 Z", c.deep, 0.55)}
<path d="M144 62 Q150 52 156 62 L158 72 L142 72 Z" fill="${GOLD}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
${rect(110, 40, 80, 8, c.light, 4, 3)}
${body(k, c, d, `${arcade(92)}${arcade(124)}${arcade(260)}`)}
${band(88)}${band(120)}${band(154)}${band(252)}${band(292)}
${nose(c, 150, 210)}${f.eyes(129, 171, 190, 13)}${f.mouth(150, 230)}
</g>
${arm(c, "M104 226 Q80 244 82 276")}${hand(c, 82, 280)}
<g transform="rotate(-6 238 262)">${rect(206, 236, 60, 48, "#C8955A", 4, 3.5)}${line("M206 256 L266 256 M236 236 L236 284", "#8A5A2E", 3)}</g>
${arm(c, "M196 222 Q214 232 214 246")}${hand(c, 214, 248)}${hand(c, 262, 240, 11)}`;
	},

	// Kyoto: a paper lantern with ribs, two wooden caps and a warm glow. Listens on a headset.
	support: (k, c, f) => {
		const d = "M150 96 C216 96 236 150 236 190 C236 236 214 284 150 284 C86 284 64 236 64 190 C64 150 84 96 150 96 Z";
		const ribs = [128, 154, 246, 268].map((y) => `M60 ${y} Q150 ${y + (y < 190 ? -10 : 10)} 240 ${y}`).join(" ");
		return `${legs(c, 126, 174, 290)}
${arm(c, "M70 214 Q46 236 52 266")}${hand(c, 52, 270)}
<path d="M124 92 Q124 54 150 54 Q176 54 176 92" fill="none" stroke="${OUTLINE}" stroke-width="13" stroke-linecap="round"/><path d="M124 92 Q124 54 150 54 Q176 54 176 92" fill="none" stroke="#6A3420" stroke-width="7" stroke-linecap="round"/>
${body(k, c, d, `<ellipse cx="150" cy="250" rx="70" ry="40" fill="#FFD27A" opacity=".55"/>${line(ribs, "#E9B872", 3)}${line("M112 100 Q96 190 112 280 M188 100 Q204 190 188 280", "#E9B872", 3)}`)}
${rect(110, 84, 80, 20, "#6A3420", 5, 4)}${rect(112, 278, 76, 18, "#6A3420", 5, 4)}
${[122, 150, 178].map((x) => `<circle cx="${x}" cy="94" r="3" fill="${GOLD}"/><circle cx="${x}" cy="287" r="3" fill="${GOLD}"/>`).join("")}
${nose(c, 150, 200)}${f.eyes(126, 174, 178, 14)}${f.mouth(150, 222)}
${line("M178 92 Q234 100 232 160", OUTLINE, 11)}${line("M178 92 Q234 100 232 160", "#2E2E33", 6)}
${line("M222 188 Q214 222 182 232", OUTLINE, 7)}${line("M222 188 Q214 222 182 232", "#2E2E33", 3.5)}<ellipse cx="178" cy="233" rx="8" ry="6" fill="#2E2E33" stroke="${OUTLINE}" stroke-width="2.5"/>
${arm(c, "M228 230 Q256 214 250 186")}
<ellipse cx="232" cy="176" rx="13" ry="18" fill="#2E2E33" stroke="${OUTLINE}" stroke-width="3.5"/><ellipse cx="236" cy="176" rx="5" ry="9" fill="${GOLD}" opacity=".85"/>
${hand(c, 250, 180, 12)}`;
	},

	// Rio: a tall rounded rock, like Sugarloaf Mountain, with moss at its foot. Calls out on a megaphone.
	marketing: (k, c, f) => {
		const d = "M80 300 Q66 190 108 116 Q150 52 192 116 Q234 190 220 300 Q150 314 80 300 Z";
		const moss =
			"M70 300 Q80 282 94 292 Q104 278 120 290 Q132 278 148 290 Q162 278 176 290 Q190 278 204 292 Q218 282 230 300 Q150 318 70 300 Z";
		return `${legs(c, 124, 176, 300)}
${arm(c, "M216 226 Q242 248 236 278")}${hand(c, 236, 282)}
${body(k, c, d, line("M120 132 L110 168 M190 150 L204 196 M96 236 L106 262 M178 248 L190 276", c.deep, 3))}
${shape(moss, "#7DB04B", 3.5)}${flat("M98 294 Q110 286 120 292 M160 292 Q172 284 186 292", "#5E8F33")}
${nose(c, 152, 198)}${f.eyes(130, 176, 176, 14)}${f.mouth(154, 226, "o")}
${arm(c, "M86 238 Q70 236 74 226")}
<path d="M120 216 L84 200 L84 248 L120 232 Z" fill="#E04A3C" stroke="${OUTLINE}" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="84" cy="224" rx="9" ry="24" fill="#F7F1EA" stroke="${OUTLINE}" stroke-width="3.5"/>${rect(108, 228, 12, 18, "#B8372C", 3, 3)}
${hand(c, 112, 244, 11)}`;
	},

	// Zurich: a thick coin with a milled edge and a mountain on its face. Holds up a gold coin.
	finance: (k, c, f) => {
		const d = "M150 98 A92 92 0 1 1 149.9 98 Z";
		return `${legs(c, 126, 174, 270)}
${arm(c, "M234 214 Q258 238 250 270")}${hand(c, 250, 274)}
${body(k, c, d, `<circle cx="150" cy="190" r="76" fill="none" stroke="${c.light}" stroke-width="4"/>${flat("M104 156 L128 126 L142 142 L156 118 L196 156 Z", c.deep, 0.6)}${flat("M150 124 L156 118 L162 128 L154 132 Z M124 132 L128 126 L134 134 Z", "#fff", 0.9)}`)}
<circle cx="150" cy="190" r="86" fill="none" stroke="${c.deep}" stroke-width="5" stroke-dasharray="2 5"/>
${nose(c, 150, 206)}${f.eyes(128, 172, 186, 14)}${f.mouth(150, 228)}
${arm(c, "M66 214 Q40 196 46 160")}${hand(c, 46, 154)}
${circle(42, 130, 17, GOLD, 3.5)}<circle cx="42" cy="130" r="11" fill="none" stroke="#C9952A" stroke-width="2.5"/>`;
	},

	// Giza: a pyramid of stacked blocks. Carries a crate.
	inventory: (k, c, f) => {
		const d = "M150 60 Q156 60 160 70 L252 290 Q256 300 244 300 L56 300 Q44 300 48 290 L140 70 Q144 60 150 60 Z";
		const rows = line(
			"M30 112 L270 112 M30 160 L270 160 M30 252 L270 252 M30 278 L270 278 M150 112 L150 160 M118 160 L118 192 M182 160 L182 192 M96 252 L96 278 M204 252 L204 278 M150 278 L150 300",
			OUTLINE,
			2.5,
		);
		return `${legs(c, 126, 174, 296)}
${body(k, c, d, rows)}
${nose(c, 150, 210)}${f.eyes(128, 172, 190, 14)}${f.mouth(150, 230)}
${arm(c, "M92 222 Q98 252 112 262")}${arm(c, "M208 222 Q202 252 188 262")}
${rect(112, 244, 76, 54, "#B57A43", 4, 3.5)}${line("M112 244 L188 298 M188 244 L112 298 M112 262 L188 262", "#7E4E25", 3)}
${hand(c, 112, 266)}${hand(c, 188, 266)}`;
	},

	// Machu: a mountain peak with two stone terraces. Points up at something it found.
	market: (k, c, f) => {
		const d = "M70 298 Q84 210 118 150 L150 74 L182 150 Q216 210 230 298 Q150 312 70 298 Z";
		const terraces = `${shape("M60 262 L240 262 L240 282 L60 282 Z", "#B4B1A3", 3)}${line("M84 262 L84 282 M112 262 L112 282 M140 262 L140 282 M168 262 L168 282 M196 262 L196 282 M224 262 L224 282", OUTLINE, 2)}${shape("M70 112 L230 112 L230 126 L70 126 Z", "#B4B1A3", 3)}${flat("M70 104 L230 104 L230 112 L70 112 Z", "#7DB04B")}${flat("M50 254 L250 254 L250 262 L50 262 Z", "#7DB04B")}`;
		return `${legs(c, 124, 176, 298)}
${arm(c, "M78 236 Q56 254 62 282")}${hand(c, 62, 286)}
${body(k, c, d, terraces)}
${rect(96, 236, 16, 14, "#B4B1A3", 2, 2.5)}${rect(188, 238, 16, 12, "#B4B1A3", 2, 2.5)}
${nose(c, 150, 186)}${f.eyes(130, 170, 164, 13)}${f.mouth(150, 210)}
${arm(c, "M210 214 Q240 196 242 158")}${point(c, 242, 152)}`;
	},

	// Angkor: a tower of carved tiers with a lotus-bud tip. Carries a building block.
	website: (k, c, f) => {
		const d =
			"M150 52 Q168 72 164 96 L176 96 L176 130 L190 130 L190 178 L204 178 L204 236 L216 236 L216 296 Q216 304 208 304 L92 304 Q84 304 84 296 L84 236 L96 236 L96 178 L110 178 L110 130 L124 130 L124 96 L136 96 Q132 72 150 52 Z";
		const ledges = line("M124 96 L176 96 M110 130 L190 130 M96 178 L204 178 M84 236 L216 236", OUTLINE, 3.5);
		const niches = [138, 162]
			.map((x) => flat(`M${x - 6} 126 L${x - 6} 112 A6 6 0 0 1 ${x + 6} 112 L${x + 6} 126 Z`, c.deep, 0.6))
			.join("");
		return `${legs(c, 124, 176, 300)}
${body(k, c, d, `${niches}${flat("M86 230 L214 230 L214 236 L86 236 Z M98 172 L202 172 L202 178 L98 178 Z M112 124 L188 124 L188 130 L112 130 Z", c.light, 0.7)}`)}
${ledges}
${nose(c, 150, 214)}${f.eyes(128, 172, 196, 13)}${f.mouth(150, 232)}
${arm(c, "M92 240 Q94 262 108 270")}${arm(c, "M208 240 Q206 262 192 270")}
${rect(106, 252, 88, 44, c.light, 4, 3.5)}${line("M118 274 Q134 262 150 274 Q166 286 182 274", c.deep, 3)}
${hand(c, 108, 274)}${hand(c, 192, 274)}`;
	},

	// Delphi: a fluted column with a scroll capital. Holds up a chart.
	analytics: (k, c, f) => {
		const d = "M104 124 L196 124 L196 284 L104 284 Z";
		const flutes = line("M118 132 L118 278 M134 132 L134 278 M166 132 L166 278 M182 132 L182 278", c.deep, 3);
		const volute = (x: number, s: 1 | -1) =>
			`${circle(x, 106, 22, c.base)}<path d="M${x} 106 m${-8 * s} 0 a8 8 0 1 ${s > 0 ? 1 : 0} ${16 * s} 0 a12 12 0 1 ${s > 0 ? 1 : 0} ${-22 * s} 4" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>`;
		return `${legs(c, 128, 172, 304)}
${arm(c, "M110 240 Q86 252 88 280")}${hand(c, 88, 284)}
${body(k, c, d, flutes)}
${rect(108, 92, 84, 32, c.base, 6, 4)}${[124, 138, 152, 166, 180].map((x) => `<ellipse cx="${x - 2}" cy="108" rx="5" ry="7" fill="${c.light}" stroke="${OUTLINE}" stroke-width="2"/>`).join("")}
${volute(96, 1)}${volute(204, -1)}${rect(86, 72, 128, 18, c.base, 7, 4)}
${rect(94, 282, 112, 14, c.base, 5, 4)}${rect(88, 294, 124, 12, c.base, 5, 4)}
${nose(c, 150, 190)}${f.eyes(130, 170, 170, 13)}${f.mouth(150, 214)}
${arm(c, "M192 200 Q214 196 220 186")}
<g transform="rotate(6 236 210)">${rect(208, 184, 58, 52, "#F6EBC9", 4, 3.5)}${line("M216 226 L258 226 M216 226 L216 192", "#8A5A2E", 2.5)}<path d="M222 224 L222 214 L230 214 L230 224 Z M236 224 L236 206 L244 206 L244 224 Z M250 224 L250 196 L258 196 L258 224 Z" fill="#5E8C2E"/></g>
${hand(c, 222, 184)}`;
	},

	// Sydney: two shell sails, like the Opera House, on a stone base. Shows a name badge.
	hr: (k, c, f) => {
		const d = "M72 270 Q66 170 140 120 Q160 108 176 104 Q224 178 228 270 Z";
		const back = "M140 160 Q162 92 226 58 Q244 150 236 240 L176 240 Z";
		return `${legs(c, 126, 176, 296)}
${arm(c, "M86 248 Q62 262 66 288")}${hand(c, 66, 292)}
${shape(back, "#F7EBD7")}${flat("M180 110 Q200 84 224 64 Q240 140 234 226 Q212 156 180 110 Z", c.base)}${line("M194 96 Q218 146 230 206 M208 82 Q228 136 234 186", c.deep, 2.5)}
<clipPath id="${k}c"><path d="${d}"/></clipPath>${flat(d, "#F7EBD7")}<g clip-path="url(#${k}c)">${flat("M168 108 Q190 150 222 270 L240 270 L240 100 Z", "#E5D3B4")}${line("M110 160 Q130 200 128 270 M140 132 Q164 190 164 270", "#E5D3B4", 3)}</g>${line(d, OUTLINE, 4)}
${rect(70, 266, 160, 30, "#D9B88A", 5, 4)}${line("M70 280 L230 280 M110 266 L110 296 M150 266 L150 296 M190 266 L190 296", "#A9865A", 2.5)}
${nose(c, 152, 222)}${f.eyes(130, 174, 202, 14)}${f.mouth(152, 244)}
${arm(c, "M212 236 Q236 228 236 212")}
${line("M236 214 Q244 236 232 250", c.deep, 4)}${rect(214, 248, 40, 28, "#fff", 5, 3)}${rect(222, 256, 24, 4, c.base, 1, 0)}${rect(222, 264, 16, 3, "#C9C9CF", 1, 0)}
${hand(c, 236, 208)}`;
	},

	// Greenwich: an observatory dome with an open shutter slit and a red time ball. Holds up a folded map.
	places: (k, c, f) => {
		const dome = "M84 184 A66 72 0 0 1 216 184 Z";
		const drum = "M88 184 L212 184 L212 290 Q212 300 202 300 L98 300 Q88 300 88 290 Z";
		return `${legs(c, 126, 174, 298)}
${line("M150 112 L150 82", OUTLINE, 5)}${circle(150, 72, 11, "#D83A34", 3.5)}
${body(k, c, dome, line("M118 128 Q110 156 108 184 M182 128 Q190 156 192 184", c.deep, 3))}
${shape("M140 184 L140 116 Q150 108 160 116 L160 184 Z", "#3A3A44", 3.5)}${line("M146 150 L156 136", GOLD, 4)}
<clipPath id="${k}d"><path d="${drum}"/></clipPath>${flat(drum, "#F2E6C6")}<g clip-path="url(#${k}d)">${flat("M190 180 L240 180 L240 300 L190 300 Z", "#DCCB9F")}</g>${line(drum, OUTLINE, 4)}
${rect(82, 180, 136, 12, c.light, 4, 3.5)}${line("M96 184 L96 192 M110 184 L110 192 M124 184 L124 192 M138 184 L138 192 M162 184 L162 192 M176 184 L176 192 M190 184 L190 192 M204 184 L204 192", OUTLINE, 2)}
${flat("M96 256 L96 236 A8 8 0 0 1 112 236 L112 256 Z M188 256 L188 236 A8 8 0 0 1 204 236 L204 256 Z", c.deep, 0.75)}
${nose(c, 150, 228)}${f.eyes(128, 172, 210, 13)}${f.mouth(150, 246)}
${arm(c, "M92 240 Q94 262 108 268")}${arm(c, "M208 240 Q206 262 192 268")}
${rect(104, 252, 92, 44, "#F3E3B5", 3, 3.5)}${line("M134 252 L134 296 M166 252 L166 296", "#C9B27A", 2.5)}${line("M112 286 Q130 262 150 276 Q170 290 188 262", "#3C7DD9", 3)}${flat("M112 258 L126 258 L122 270 L112 272 Z M170 280 L188 274 L188 290 L174 290 Z", "#7DB04B")}
${hand(c, 106, 272)}${hand(c, 194, 272)}`;
	},

	// Alexandria: a tall bookcase with an arched top and shelves of book spines. Holds up a price tag.
	catalog: (k, c, f) => {
		const d = "M86 300 L86 118 Q86 50 150 44 Q214 50 214 118 L214 300 Z";
		const spines = (y: number, h: number) => {
			const colours = ["#D64545", "#3C7DD9", "#E8B53C", "#4BA36B", "#8E5CC9", "#E07B39", "#D64545", "#3C7DD9"];
			let x = 104;
			let out = "";
			colours.forEach((col, i) => {
				const w = 9 + ((i * 7) % 5);
				const hh = h - ((i * 5) % 9);
				out += `<rect x="${x}" y="${y + h - hh}" width="${w}" height="${hh}" fill="${col}" stroke="${OUTLINE}" stroke-width="1.5"/>`;
				x += w + 1;
			});
			return out;
		};
		return `${legs(c, 126, 174, 298)}
${arm(c, "M208 226 Q234 248 228 276")}${hand(c, 228, 280)}
${body(k, c, d)}
${shape("M100 290 L100 136 L200 136 L200 290 Z", c.deep, 3.5)}
${spines(140, 34)}${spines(186, 34)}${spines(232, 34)}
${[174, 220, 266].map((y) => rect(98, y, 104, 8, c.light, 2, 3)).join("")}${rect(98, 128, 104, 8, c.light, 2, 3)}
${rect(78, 118, 14, 182, c.light, 4, 3.5)}${rect(208, 118, 14, 182, c.light, 4, 3.5)}
${nose(c, 150, 104)}${f.eyes(130, 170, 86, 12)}${f.mouth(150, 120)}
${arm(c, "M90 206 Q64 192 64 168")}${hand(c, 64, 162)}
${line("M64 160 Q52 176 50 196", OUTLINE, 2)}<path d="M38 196 L62 196 L62 228 L50 238 L38 228 Z" fill="#F0D9A8" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="204" r="3" fill="#fff" stroke="${OUTLINE}" stroke-width="1.5"/>`;
	},

	// Venice: a humped bridge with a centre arch, a small portico and shop windows. Holds a gondola oar.
	channels: (k, c, f) => {
		const d = "M34 298 L34 240 Q74 150 150 134 Q226 150 266 240 L266 298 L222 298 Q216 244 150 238 Q84 244 78 298 Z";
		const shops = [62, 86, 192, 216]
			.map((x, i) => {
				const y = i < 2 ? 214 - i * 18 : 196 + (i - 2) * 18;
				return `${flat(`M${x} ${y + 16} L${x} ${y + 6} A7 7 0 0 1 ${x + 14} ${y + 6} L${x + 14} ${y + 16} Z`, c.deep, 0.7)}${flat(`M${x - 1} ${y + 2} L${x + 15} ${y + 2} L${x + 15} ${y + 6} L${x - 1} ${y + 6} Z`, "#E04A3C")}`;
			})
			.join("");
		return `${legs(c, 58, 242, 296)}
${rect(124, 102, 52, 36, c.base, 3, 3.5)}${flat("M142 138 L142 118 A8 8 0 0 1 158 118 L158 138 Z", c.deep, 0.75)}${shape("M118 104 L150 84 L182 104 Z", c.light, 3.5)}
${body(k, c, d, shops)}
${line("M86 250 Q150 230 214 250", c.light, 3)}
${nose(c, 150, 200)}${f.eyes(130, 170, 180, 13)}${f.mouth(150, 218)}
${arm(c, "M60 250 Q42 266 44 288")}${hand(c, 44, 292)}
${line("M236 112 L252 334", OUTLINE, 12)}${line("M236 112 L252 334", WOOD, 6)}<path d="M246 300 Q262 318 256 350 Q246 352 244 336 Q240 318 246 300 Z" fill="${WOOD}" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>
${arm(c, "M246 240 Q252 222 244 206")}${hand(c, 243, 204)}`;
	},
};
