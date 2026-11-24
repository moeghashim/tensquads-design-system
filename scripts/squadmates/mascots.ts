// The thirteen squad mascots. Clay toy characters, one for each agent. Each body takes its shape
// from the place the agent is named after. Every mascot has soft studio light, big glossy brown
// eyes, a round nose, an open smile, stout hands and scuffed lace-up boots. No glasses.
// Designed by GPT-6.2 Sol. The source is github.com/moeghashim/tensquads-design-system
// (scripts/squadmates/mascots.ts). The face is drawn for each Agent loop state.

export type Palette = { readonly light: string; readonly base: string; readonly deep: string; readonly limb: string };

// The Agent loop states the face can show, and idle.
export type FaceState =
	| "idle"
	| "waiting"
	| "planning"
	| "running"
	| "checking"
	| "done"
	| "sentback"
	| "blocked"
	| "escalated"
	| "dropped";

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

// Where the face sits in the 300 x 370 drawing.
const FACE: Record<string, readonly [number, number]> = {
	master: [150, 174],
	orders: [164, 174],
	support: [150, 160],
	marketing: [150, 170],
	finance: [141, 164],
	inventory: [150, 190],
	market: [148, 176],
	website: [150, 179],
	analytics: [150, 158],
	hr: [139, 175],
	places: [150, 180],
	catalog: [150, 150],
	channels: [150, 158],
};

// The square that shows the head in a small avatar: x, y and side, in the drawing.
const BUST_CROPS: Partial<Record<string, readonly [number, number, number]>> = {
	orders: [52, 25, 232],
	hr: [32, 38, 242],
	channels: [63, 53, 228],
};

export const BUST: Record<string, readonly [number, number, number]> = Object.fromEntries(
	Object.entries(FACE).map(([id, [x, y]]) => [id, BUST_CROPS[id] ?? [x - 100, y - 95, 200]]),
);

export const INK = "#41252C";

// ---- Shapes. ----
const path = (d: string, fill: string, extra = "") => `<path d="${d}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
const oval = (x: number, y: number, rx: number, ry: number, fill: string) =>
	`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const box = (x: number, y: number, w: number, h: number, r: number, fill: string) =>
	`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const line = (d: string, stroke: string, w: number, opacity = 1) =>
	path(
		d,
		"none",
		`stroke="${stroke}" stroke-width="${w}"${opacity < 1 ? ` opacity="${opacity}"` : ""} stroke-linecap="round" stroke-linejoin="round"`,
	);
const group = (transform: string, content: string) => `<g transform="${transform}">${content}</g>`;
const r2 = (n: number) => Number(n.toFixed(2));

const gradient = (id: string, colors: readonly string[], cx = "32%", cy = "23%", r = "78%") =>
	`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${colors.map((c, i) => `<stop offset="${[0, 0.54, 1][i]}" stop-color="${c}"/>`).join("")}</radialGradient>`;

// The gradients for one mascot. `k` keeps the ids apart when two avatars share a page.
export function defs(k: string, c: Palette): string {
	return `<defs>${gradient(`${k}clay`, [c.light, c.base, c.deep])}${gradient(`${k}arm`, [c.light, c.limb, c.deep])}${gradient(`${k}recess`, [c.deep, c.deep, "#594454"])}${gradient(`${k}boot`, ["#d39a69", "#966347", "#4a302d"])}${gradient(`${k}wood`, ["#ffe0a6", "#bb8051", "#774231"])}${gradient(`${k}gold`, ["#fff5bb", "#ebba54", "#aa612e"])}${gradient(`${k}red`, ["#ffb3a4", "#e47065", "#a53247"])}${gradient(`${k}white`, ["#fffef9", "#fff6e8", "#c9a8a5"])}${gradient(`${k}iris`, ["#d9ab73", "#905837", "#4b2b29"])}<radialGradient id="${k}floor"><stop stop-color="#38252e" stop-opacity=".31"/><stop offset=".55" stop-color="#483442" stop-opacity=".2"/><stop offset="1" stop-color="#483442" stop-opacity="0"/></radialGradient></defs>`;
}

// The soft floor shadow.
export const shadow = (k: string) => oval(150, 345, 123, 19, `url(#${k}floor)`);

// ---- The face: eyes, brows, nose, cheeks and mouth for each state. ----
function expression(state: FaceState, clay: string, deep: string, white: string, iris: string): string {
	const eyes = ([-1, 1] as const)
		.map((side) => {
			const closed = ["done", "blocked", "dropped"].includes(state) || (state === "checking" && side === 1);
			const arc = state === "done" || state === "checking" ? -19 : state === "dropped" ? 12 : 0;
			const height = state === "waiting" ? 11 : state === "escalated" ? 25 : 21;
			const dx = state === "running" ? 7 : 0;
			const dy = state === "planning" ? -8 : state === "sentback" ? 7 : 0;
			const brow =
				state === "escalated"
					? "M-12 -34Q0 -48 12 -34"
					: state === "running"
						? side === -1
							? "M-12 -37L12 -29"
							: "M-12 -29L12 -37"
						: state === "sentback"
							? side === -1
								? "M-12 -25Q0 -31 12 -35"
								: "M-12 -35Q0 -31 12 -25"
							: "M-12 -28Q0 -38 12 -29";
			const open =
				oval(1, 2, 22, height + 2, deep) +
				oval(0, 0, 20, height, white) +
				oval(dx, dy, 11, Math.min(height - 2, 12), iris) +
				oval(dx, dy, 6, Math.min(height - 4, 8), "#25161c") +
				oval(dx - 4, dy - 4, 3.7, 3.5, "white") +
				oval(dx + 4, dy + 4, 1.5, 1.5, "#fff4d5");
			const lid = closed ? line(`M-14 0Q0 ${arc} 14 0`, INK, 6) : open;
			return group(`translate(${side * 31} 0)`, line(brow, INK, 5, 0.72) + lid);
		})
		.join("");
	let mouth =
		path("M-20 30Q0 37 20 30Q18 55 0 56Q-17 55-20 30Z", INK) +
		path("M-16 33Q0 38 16 33Q13 41 0 41Q-13 41-16 33Z", "#fff4e4") +
		path("M-11 51Q0 43 11 51Q0 57-11 51Z", "#e78383");
	if (state === "blocked" || state === "sentback") mouth = line("M-13 40Q0 39 13 40", INK, 5);
	if (state === "escalated" || state === "dropped")
		mouth = oval(0, 40, state === "escalated" ? 9 : 5, state === "escalated" ? 11 : 4, INK);
	if (state === "running") mouth = line("M-10 40Q2 45 13 37", INK, 5);
	const blink = state === "idle" || state === "waiting" ? ' class="sm-blink"' : "";
	const cheek = (x: number) => `<ellipse cx="${x}" cy="23" rx="12" ry="6" fill="#a63655" opacity=".15"/>`;
	return `${cheek(-52)}${cheek(52)}<g${blink}>${eyes}</g>${oval(0, 18, 13, 11, deep)}${oval(-1, 15, 12, 11, clay)}${mouth}`;
}

// ---- The bodies. ----
type Paint = {
	readonly clay: string;
	readonly arm: string;
	readonly leather: string;
	readonly wood: string;
	readonly gold: string;
	readonly recess: string;
	readonly red: string;
};

type Body = { body: string; prop?: string; overlay?: string };

function bodies(id: string, c: Palette, p: Paint): Body {
	const { light, deep } = c;
	const { clay, leather, wood, gold, recess } = p;
	const seam = (d: string) => line(d, deep, 4, 0.73) + group("translate(0 -2)", line(d, light, 2, 0.6));
	const glint = (d: string) => line(d, "white", 4, 0.26);
	const arch = (x: number, y: number, w: number, h: number, fill = recess) =>
		path(`M${x} ${y + h}v-${h - w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0v${h - w / 2}Z`, fill);
	switch (id) {
		case "master":
			return {
				body:
					arch(76, 65, 156, 211, deep) +
					arch(67, 57, 154, 215, clay) +
					oval(144, 58, 20, 19, clay) +
					arch(90, 106, 109, 155, recess) +
					arch(96, 114, 98, 142, clay) +
					path("M80 124L145 77L210 124Q211 132 201 132H89Q79 132 80 124Z", clay) +
					line("M95 119L145 86L194 119", light, 4, 0.75) +
					[77, 198]
						.map(
							(x) =>
								box(x, 139, 14, 108, 7, clay) +
								box(x - 4, 131, 22, 11, 4, clay) +
								box(x - 5, 240, 24, 11, 4, clay),
						)
						.join("") +
					box(64, 249, 164, 25, 10, clay),
			};
		case "orders":
			return {
				body: group(
					"rotate(9 150 264)",
					box(89, 78, 122, 190, 13, clay) +
						path("M198 90H208V254H198Q204 178 198 90Z", deep, 'opacity=".24"') +
						box(112, 42, 76, 46, 11, clay) +
						box(108, 38, 84, 12, 6, clay) +
						arch(135, 52, 30, 35) +
						path("M140 77Q143 74 143 67Q150 60 157 67Q157 74 160 77V80H140Z", gold) +
						oval(150, 81, 3, 3, gold) +
						[98, 239].map((y) => [98, 127, 156, 185].map((x) => arch(x, y, 17, 24)).join("")).join("") +
						[87, 119, 228, 259].map((y) => box(82, y, 136, 12, 6, clay) + glint(`M93 ${y + 3}H204`)).join(""),
				),
				prop: group(
					"rotate(-9 219 233)",
					box(191, 207, 59, 53, 9, wood) +
						box(213, 207, 15, 53, 2, "#f2c98e") +
						box(195, 235, 13, 13, 2, "#fff3dd"),
				),
			};
		case "support":
			return {
				body:
					box(106, 53, 90, 35, 12, wood) +
					box(105, 236, 92, 28, 11, wood) +
					path(
						"M104 73Q57 97 59 161Q59 212 106 246Q154 259 196 244Q238 216 239 160Q241 101 195 73Q150 62 104 73Z",
						clay,
					) +
					seam("M85 93Q150 81 217 94M70 116Q151 104 229 118M68 208Q146 229 229 210M87 231Q148 248 210 232") +
					glint("M92 109Q78 127 77 148"),
				overlay:
					line("M66 153Q56 79 116 68Q158 53 202 81Q235 101 234 152", "#594354", 10) +
					box(51, 143, 27, 53, 11, leather) +
					box(223, 143, 27, 53, 11, leather) +
					line("M235 183Q228 225 200 221", "#594354", 6) +
					oval(196, 222, 11, 6, leather),
			};
		case "marketing":
			return {
				body:
					path(
						"M69 249Q59 225 71 175L97 95Q117 48 160 47Q199 47 211 91L239 223Q244 258 207 269L106 272Q78 269 69 249Z",
						clay,
					) +
					glint("M89 159Q102 98 130 76") +
					seam("M77 238Q102 247 122 241M183 248Q211 248 232 232"),
				prop: group(
					"rotate(-23 230 197)",
					box(221, 204, 13, 40, 5, leather) +
						path("M197 187L219 187L257 168V220L219 205H197Q189 196 197 187Z", gold) +
						oval(254, 194, 13, 27, gold) +
						oval(257, 194, 9, 20, "#733954") +
						oval(254, 194, 4, 8, "#f1c685"),
				),
			};
		case "finance": {
			const milled = Array.from({ length: 13 }, (_, i) => {
				const a = (i - 6) * 0.19;
				return line(`M${r2(161 + 85 * Math.cos(a) - 18)} ${r2(165 + 101 * Math.sin(a))}l17 -2`, light, 2, 0.56);
			}).join("");
			return {
				body:
					oval(161, 165, 88, 104, deep) +
					milled +
					oval(141, 162, 88, 104, clay) +
					oval(140, 162, 76, 91, recess) +
					oval(139, 160, 71, 87, clay) +
					glint("M67 135Q83 81 124 68"),
				prop: group(
					"rotate(15 240 153)",
					oval(243, 153, 27, 35, wood) +
						oval(237, 153, 27, 35, gold) +
						oval(237, 153, 19, 26, wood) +
						oval(236, 152, 16, 23, gold) +
						path("M237 136L247 153L237 169L227 153Z", "#fff0a5"),
				),
			};
		}
		case "inventory":
			return {
				body:
					path("M145 63Q150 54 159 63L250 240Q261 258 244 269L215 282H65Q49 280 54 264Z", deep) +
					path("M140 63Q147 53 152 66L228 260Q235 275 218 276H65Q47 276 55 259Z", clay) +
					seam("M118 108H170M102 142H184M67 235H218M57 258H227M143 108V141M111 236V257M178 236V257") +
					line("M186 103L248 242M220 234L244 224M227 255L253 244", light, 3, 0.34),
				prop: group(
					"rotate(8 235 250)",
					box(204, 223, 59, 49, 7, wood) +
						box(210, 229, 47, 37, 3, "#77472e") +
						line("M212 258L254 234M211 242H255M211 254H255", "#cc935b", 5),
				),
			};
		case "market":
			return {
				body:
					path(
						"M57 250Q52 240 66 224L83 194L102 125Q119 89 139 79L166 56Q180 50 185 70L213 162L238 226Q252 252 237 269H71Q57 267 57 250Z",
						clay,
					) +
					glint("M105 154Q118 101 157 79") +
					path("M64 228Q113 248 229 221L239 238Q141 270 55 247Z", recess) +
					path("M57 252Q134 271 243 241L243 261Q142 289 63 268Z", clay) +
					seam("M66 239Q139 260 232 231M71 259Q146 281 235 252"),
			};
		case "website":
			return {
				body:
					path("M123 91Q123 67 149 40Q177 63 177 91Z", clay) +
					seam("M149 49Q136 69 137 85M151 49Q162 70 160 85") +
					box(109, 80, 82, 39, 15, clay) +
					box(95, 103, 113, 41, 14, clay) +
					arch(81, 124, 142, 140, clay) +
					arch(99, 131, 104, 123, clay) +
					[238, 253, 269].map((y, i) => box(77 - i * 8, y, 150 + i * 16, 17, 7, clay)).join("") +
					seam("M121 89H178M108 112H193M93 135H107M193 135H210"),
				prop: group(
					"rotate(9 232 239)",
					box(201, 214, 59, 51, 9, gold) +
						box(204, 223, 53, 40, 7, clay) +
						oval(217, 236, 5, 5, recess) +
						oval(245, 236, 5, 5, recess) +
						line("M219 246H243", light, 4),
				),
			};
		case "analytics":
			return {
				body:
					box(88, 78, 127, 181, 24, clay) +
					[98, 113, 130, 149, 168, 186, 201].map((x) => seam(`M${x} 204v37`)).join("") +
					[97, 203]
						.map(
							(x, i) =>
								oval(x, 78, 27, 26, clay) +
								group(
									`translate(${x} 78) scale(${i ? -1 : 1} 1)`,
									seam("M-13 4Q-16-16 2-13Q15-11 12 1Q10 11 1 7Q-4 5 0 0"),
								),
						)
						.join("") +
					box(102, 61, 97, 28, 9, clay) +
					glint("M113 67H183") +
					box(78, 241, 146, 20, 8, clay) +
					box(72, 256, 159, 20, 9, clay),
				prop: group(
					"rotate(-10 223 227)",
					box(194, 198, 63, 58, 9, wood) +
						box(198, 201, 54, 49, 6, "#fff0d1") +
						line("M206 213V240H244", "#aa896a", 2) +
						line("M210 232L220 223L229 228L242 213", "#688333", 4),
				),
			};
		case "hr": {
			const shell = (d: string, whiteOpacity: number) =>
				path(d, clay) +
				path(d, "white", `fill-opacity="${whiteOpacity}" stroke="${deep}" stroke-opacity=".8" stroke-width="2"`);
			const ribs = (d: string) => line(d, deep, 3, 0.62);

			return {
				body:
					shell("M48 235C42 185 65 136 90 108Q94 104 94 111C90 146 109 186 137 217L134 238Z", 0.58) +
					ribs("M88 121Q63 153 60 210M89 122Q77 157 80 217") +
					shell("M147 231C157 176 195 124 242 94Q246 92 245 97C234 145 243 173 260 208Q267 224 250 238Z", 0.64) +
					path("M245 97Q224 154 241 231L251 237Q265 228 259 210Q237 163 245 97Z", deep, 'opacity=".22"') +
					ribs("M238 109Q207 144 203 215M239 110Q223 151 224 223") +
					shell("M68 227C76 145 126 76 202 47Q207 45 205 50C183 94 185 141 204 185Q218 217 206 237H72Z", 0.76) +
					path(
						"M202 54C182 100 183 148 199 189Q212 220 202 234H189Q199 218 190 190C178 145 177 97 202 54Z",
						deep,
						'opacity=".16"',
					) +
					ribs("M195 57Q124 95 95 169M195 58Q150 89 134 120M197 59Q176 89 173 125") +
					glint("M83 212Q87 195 93 181") +
					box(49, 232, 203, 34, 10, clay) +
					line("M61 241H239", light, 3, 0.8),
				prop: group(
					"rotate(11 235 229)",
					box(204, 212, 60, 43, 7, leather) +
						box(207, 213, 54, 38, 6, "#fff5de") +
						box(226, 207, 15, 11, 4, recess) +
						oval(220, 230, 6, 6, clay) +
						line("M231 226H251M231 235H246", deep, 3),
				),
			};
		}
		case "places":
			return {
				body:
					box(147, 49, 8, 43, 4, leather) +
					oval(151, 48, 17, 16, p.red) +
					box(70, 144, 161, 121, 23, clay) +
					path("M62 156Q67 77 150 72Q225 72 240 156Z", clay) +
					path("M140 73Q162 69 173 76L192 128H165Z", recess) +
					line("M138 74L160 128M176 78L196 128", light, 4, 0.76) +
					box(64, 131, 172, 18, 8, clay) +
					box(64, 246, 172, 26, 10, clay) +
					glint("M80 120Q99 91 125 85"),
				prop: group(
					"rotate(8 229 232)",
					path("M199 205L219 214L240 205L262 215L257 257L238 248L216 256L195 247Z", "#ffe9ba") +
						path("M219 214L240 205L238 248L216 256Z", "#d4e1ab") +
						line("M203 237L215 226L227 237L247 219L254 230", "#509ca0", 3) +
						oval(227, 237, 4, 4, "#b75055"),
				),
			};
		case "catalog": {
			const spines = ["#e5aa76", "#e494a4", "#b6cb86", "#99cddb", "#e6bc83", "#d7a1e6"]
				.map(
					(col, n) =>
						box(96 + n * 17, 218 - (n % 3) * 4, 14, 30 + (n % 3) * 4, 3, col) +
						line(`M${100 + n * 17} 237h6`, "#fff1de", 2, 0.7),
				)
				.join("");
			return {
				body:
					arch(82, 51, 147, 220, deep) +
					arch(71, 47, 146, 220, clay) +
					arch(86, 59, 117, 192, recess) +
					arch(91, 65, 106, 148, clay) +
					spines +
					box(78, 246, 137, 16, 6, clay) +
					glint("M77 125Q82 82 113 65"),
				prop: group(
					"rotate(17 235 222)",
					path("M228 198H253Q260 198 260 206V245Q260 252 253 252H218Q211 252 211 245V216Z", gold) +
						oval(227, 212, 5, 5, "#754936") +
						line("M227 212Q221 190 239 185", leather, 4) +
						line("M221 227H249M221 237H241", "#885440", 3),
				),
			};
		}
		default:
			// channels
			return {
				body:
					path(
						"M49 244V175Q53 161 77 155L114 114Q147 102 194 116L225 154Q252 166 253 183V245Q253 257 242 257H200Q190 257 188 245Q184 217 150 216Q116 217 112 245Q111 257 101 257H61Q49 257 49 244Z",
						clay,
					) +
					path("M112 102L150 73L190 102V120H112Z", clay) +
					arch(138, 92, 24, 28) +
					seam("M51 182Q82 164 96 150M205 150Q222 166 250 183") +
					[63, 84, 201, 222].map((x, i) => arch(x, i === 1 || i === 2 ? 180 : 194, 15, 22)).join("") +
					glint("M113 225Q145 197 183 219"),
				prop: group(
					"rotate(18 238 252)",
					box(234, 161, 8, 151, 4, wood) +
						path(
							"M234 180C233 162 227 147 226 121Q226 112 231 110L243 109Q247 109 247 114C246 141 240 160 242 180Z",
							wood,
						) +
						line("M231 118Q230 140 237 163M237 187V303", "#f2c98e", 2, 0.8) +
						line("M229 126L244 124", "#774231", 2, 0.5),
				),
			};
	}
}

// The right hand's height for each mascot that holds something.
const GRIP: Record<string, number> = {
	orders: 251,
	marketing: 218,
	finance: 172,
	inventory: 261,
	website: 253,
	analytics: 246,
	hr: 248,
	places: 250,
	catalog: 245,
	channels: 245,
};

type Draw = (k: string, c: Palette, state: FaceState) => string;

function draw(id: string): Draw {
	return (k, c, state) => {
		const p: Paint = {
			clay: `url(#${k}clay)`,
			arm: `url(#${k}arm)`,
			leather: `url(#${k}boot)`,
			wood: `url(#${k}wood)`,
			gold: `url(#${k}gold)`,
			recess: `url(#${k}recess)`,
			red: `url(#${k}red)`,
		};
		const { body, prop = "", overlay = "" } = bodies(id, c, p);
		const [faceX, faceY] = FACE[id] ?? [150, 170];
		const boots = [0, 1]
			.map((i) =>
				group(
					`translate(${i ? 181 : 119} 302) rotate(${i ? 9 : -9}) scale(${i ? -1 : 1} 1)`,
					box(-13, -53, 27, 71, 13, p.arm) +
						path("M-17-13Q-12-20 12-17Q23-17 21-6L20 23Q32 37 14 45H-27Q-45 44-42 29Q-41 12-22 11Z", p.leather) +
						path("M-42 32Q-24 42 22 32Q27 46 12 47H-28Q-45 45-42 32Z", "#49302b") +
						line("M-40 33Q-20 43 24 33", "#bd9169", 2.7) +
						line("M-39 30Q-33 17-19 17M-15-10Q-4-15 13-10", "#f1bd89", 3, 0.55) +
						[-3, 4, 11]
							.map(
								(y, n) =>
									oval(-15 - n * 2, y, 2.7, 2.7, "#3b2826") +
									oval(2 - n * 2, y + 2, 2.7, 2.7, "#3b2826") +
									line(`M${-15 - n * 2} ${y}l17 2`, "#f4d3a6", 2.5),
							)
							.join("") +
						line("M-10 17q-14 9-17 5M-10 17q8 4 10 11", "#dfad7d", 2, 0.7) +
						line("M-29 26l6 1m-9-5l4 1m36-3l5-1", "#d5a47a", 1.5, 0.65),
				),
			)
			.join("");
		const raisedLeft = id === "master" || id === "market";
		const rightY = GRIP[id] ?? 242;
		const leftArm = path(
			raisedLeft
				? "M92 190Q67 201 55 161L35 164Q35 227 83 226Z"
				: "M111 187Q65 176 45 220Q37 249 59 254Q76 247 76 225L110 211Z",
			p.arm,
		);
		const rightArm = path(`M207 183Q238 183 250 ${rightY - 6}L232 ${rightY + 9}Q219 209 204 222Z`, p.arm);
		const hand = (x: number, y: number, point = false) =>
			oval(x, y, 16, 18, p.arm) +
			oval(x - 10, y - 4, 7, 9, p.clay) +
			(point ? box(x - 4, y - 31, 10, 29, 5, p.clay) : "") +
			line(`M${x + 2} ${y + 9}q7 -1 9 -7`, c.deep, 2, 0.65);
		const leftHand = raisedLeft
			? hand(44, 151, id === "market") +
				(id === "master"
					? group(
							"rotate(-28 40 147)",
							box(28, 129, 8, 23, 4, p.arm) + box(38, 124, 9, 27, 4, p.arm) + box(49, 128, 8, 22, 4, p.arm),
						)
					: "")
			: hand(55, 244);
		const face = group(
			`translate(${faceX} ${faceY})`,
			expression(state, p.clay, c.deep, `url(#${k}white)`, `url(#${k}iris)`),
		);
		const rightX = id === "finance" ? 234 : id === "support" ? 241 : 238;
		return boots + leftArm + rightArm + body + overlay + leftHand + face + prop + hand(rightX, rightY + 7);
	};
}

export const DRAW: Record<string, Draw> = Object.fromEntries(Object.keys(PALETTES).map((id) => [id, draw(id)]));
