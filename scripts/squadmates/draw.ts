import { BUST, clay, DRAW, defs, type Face, INK, IRIS, OUTLINE, PALETTES, shadow } from "./mascots.ts";

// The face lines stay crisp over the clay: brows, closed eyes and the mouth.
const FACE_LINE = "#2A1810";
import { AGENT_LOOP_STATES, type AgentLoopState, SQUADMATES, type Squadmate } from "./roster.ts";

export type SquadmateDrawState = AgentLoopState | "idle";

const DRAW_STATES = new Set<string>(["idle", ...AGENT_LOOP_STATES.map((state) => state.id)]);
const BY_ID = new Map<string, Squadmate>(SQUADMATES.map((mate) => [mate.id, mate]));

export class UnknownSquadmateError extends Error {
	readonly imageId: string;

	constructor(imageId: string) {
		super(`Unknown squadmate image: ${imageId}`);
		this.name = "UnknownSquadmateError";
		this.imageId = imageId;
	}
}

export class UnknownSquadmateStateError extends Error {
	readonly state: string;

	constructor(state: string) {
		super(`Unknown squadmate state: ${state}`);
		this.name = "UnknownSquadmateStateError";
		this.state = state;
	}
}

// ---- Eyes for each state, in the 300 x 370 drawing. Big round eyes with a brown iris. No glasses. ----
const r1 = (n: number) => Number(n.toFixed(1));
// An open eye. dx and dy move the iris; scale grows or shrinks it.
const eye = (x: number, y: number, s: number, dx = 0, dy = 0, iris = 1) => {
	const ix = r1(x + dx * s);
	const iy = r1(y + dy * s);
	return `<ellipse cx="${x}" cy="${y}" rx="${r1(s * 0.84)}" ry="${s}" fill="#fff" stroke="${OUTLINE}" stroke-width="3"/><circle cx="${ix}" cy="${iy}" r="${r1(s * 0.62 * iris)}" fill="${IRIS}"/><circle cx="${ix}" cy="${iy}" r="${r1(s * 0.34 * iris)}" fill="${INK}"/><circle cx="${r1(ix - s * 0.2)}" cy="${r1(iy - s * 0.24)}" r="${r1(s * 0.18)}" fill="#fff"/>`;
};
// A closed eye: an arc. Up is a happy eye, down is asleep.
const shut = (x: number, y: number, s: number, up: boolean) =>
	`<path d="M${r1(x - s * 0.8)} ${r1(y + (up ? s * 0.25 : -s * 0.1))} Q${x} ${r1(y + (up ? -s * 0.75 : s * 0.65))} ${r1(x + s * 0.8)} ${r1(y + (up ? s * 0.25 : -s * 0.1))}" fill="none" stroke="${FACE_LINE}" stroke-width="4" stroke-linecap="round"/>`;
const bar = (x: number, y: number, s: number) =>
	`<path d="M${r1(x - s * 0.75)} ${y} L${r1(x + s * 0.75)} ${y}" stroke="${FACE_LINE}" stroke-width="4.5" stroke-linecap="round"/>`;
// A half-closed eye: the lid covers the top half.
const lidded = (x: number, y: number, s: number) =>
	`<path d="M${r1(x - s * 0.84)} ${y} A${r1(s * 0.84)} ${s} 0 0 0 ${r1(x + s * 0.84)} ${y} Z" fill="#fff" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/><path d="M${r1(x - s * 0.5)} ${y} A${r1(s * 0.5)} ${r1(s * 0.5)} 0 0 0 ${r1(x + s * 0.5)} ${y} Z" fill="${IRIS}"/><path d="M${r1(x - s * 0.95)} ${y} L${r1(x + s * 0.95)} ${y}" stroke="${FACE_LINE}" stroke-width="4" stroke-linecap="round"/>`;
// A brow over each eye. tilt > 0 lifts the inner end (worried); tilt < 0 drops it (focused).
const brows = (l: number, r: number, y: number, s: number, lift = 0, tilt = 0) => {
	const by = r1(y - s * 1.45 - lift);
	const one = (x: number, inner: 1 | -1) => {
		const xi = r1(x + inner * s * 0.7);
		const xo = r1(x - inner * s * 0.7);
		return `M${xo} ${by} Q${x} ${r1(by - s * 0.35)} ${xi} ${r1(by - tilt)}`;
	};
	return `<path d="${one(l, 1)} ${one(r, -1)}" fill="none" stroke="${FACE_LINE}" stroke-width="4" stroke-linecap="round"/>`;
};

const EYES: Record<SquadmateDrawState, (l: number, r: number, y: number, s: number) => string> = {
	idle: (l, r, y, s) => eye(l, y, s) + eye(r, y, s),
	waiting: (l, r, y, s) => lidded(l, y, s) + lidded(r, y, s),
	planning: (l, r, y, s) => eye(l, y, s, -0.18, -0.3) + eye(r, y, s, -0.18, -0.3),
	running: (l, r, y, s) => eye(l, y, s, 0.24, 0.05, 0.9) + eye(r, y, s, 0.24, 0.05, 0.9),
	checking: (l, r, y, s) => eye(l, y, s) + bar(r, y, s),
	done: (l, r, y, s) => shut(l, y, s, true) + shut(r, y, s, true),
	sentback: (l, r, y, s) => eye(l, y, s, 0, 0.3) + eye(r, y, s, 0, 0.3),
	blocked: (l, r, y, s) => bar(l, y, s) + bar(r, y, s),
	escalated: (l, r, y, s) => eye(l, y, s * 1.15, 0, 0, 0.62) + eye(r, y, s * 1.15, 0, 0, 0.62),
	dropped: (l, r, y, s) => shut(l, y, s, false) + shut(r, y, s, false),
};

const BROWS: Record<SquadmateDrawState, [number, number]> = {
	idle: [0, 0],
	waiting: [-2, 0],
	planning: [3, 0],
	running: [0, -4],
	checking: [0, -3],
	done: [2, 0],
	sentback: [0, 5],
	blocked: [-1, -5],
	escalated: [6, 4],
	dropped: [-3, 0],
};

const FLAT = new Set<SquadmateDrawState>(["sentback", "blocked", "dropped"]);

function face(_k: string, state: SquadmateDrawState): Face {
	const blink = state === "waiting" || state === "idle" ? ' class="sm-blink"' : "";
	return {
		eyes: (l, r, y, size) => {
			const s = r1(size * 1.25);
			return `<g${blink}>${EYES[state](l, r, y, s)}</g>${brows(l, r, y, s, ...BROWS[state])}`;
		},
		mouth: (x, y, kind = "smile") => {
			if (kind === "o" || state === "escalated") {
				const big = kind === "o" && state !== "escalated";
				return `<ellipse cx="${x}" cy="${y}" rx="${big ? 12 : 7}" ry="${big ? 10 : 8}" fill="#8E3B2E" stroke="${FACE_LINE}" stroke-width="3"/><ellipse cx="${x}" cy="${y + (big ? 4 : 3)}" rx="${big ? 6 : 3.5}" ry="${big ? 3.5 : 2.5}" fill="#E58A86"/>`;
			}
			if (FLAT.has(state))
				return `<path d="M${x - 9} ${y + 2} Q${x} ${y - 1} ${x + 9} ${y + 2}" fill="none" stroke="${FACE_LINE}" stroke-width="3.5" stroke-linecap="round"/>`;
			return `<path d="M${x - 14} ${y - 2} Q${x} ${y - 4} ${x + 14} ${y - 2} Q${x + 12} ${y + 14} ${x} ${y + 14} Q${x - 12} ${y + 14} ${x - 14} ${y - 2} Z" fill="#8E3B2E" stroke="${FACE_LINE}" stroke-width="3" stroke-linejoin="round"/><path d="M${x - 7} ${y + 10} Q${x} ${y + 4} ${x + 7} ${y + 10} Q${x} ${y + 14} ${x - 7} ${y + 10} Z" fill="#E58A86"/>`;
		},
	};
}

// ---- Marks over the avatar, in the 64 x 64 box. ----
function badge(state: SquadmateDrawState): string {
	if (state === "escalated")
		return `<circle cx="53" cy="53" r="8" fill="#e5484d" stroke="#fff" stroke-width="2.5"/><rect x="52" y="48.2" width="2" height="6" rx="1" fill="#fff"/><circle cx="53" cy="57.2" r="1.15" fill="#fff"/>`;
	if (state === "blocked")
		return `<circle cx="53" cy="53" r="8" fill="#e39b00" stroke="#fff" stroke-width="2.5"/><rect x="49.8" y="49.5" width="2.2" height="7" rx="1" fill="#fff"/><rect x="54" y="49.5" width="2.2" height="7" rx="1" fill="#fff"/>`;
	if (state === "done")
		return `<circle cx="53" cy="53" r="8" fill="#00a240" stroke="#fff" stroke-width="2.5"/><path d="M49.4 53.2 l2.5 2.5 l4.7 -5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
	if (state === "dropped")
		return `<text x="50" y="16" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="700" fill="#8f8f8f">z</text><text x="56" y="9" font-family="Inter,system-ui,sans-serif" font-size="8" font-weight="700" fill="#b4b4b4">z</text>`;
	if (state === "planning")
		return `<circle cx="53" cy="13" r="2" fill="#a8a8a8"/><circle cx="57.5" cy="8" r="2.8" fill="#a8a8a8"/>`;
	return "";
}

// At 64 px and up the avatar shows the whole mascot. Smaller, it shows the upper body,
// so the face stays readable at 16 px.
function avatar(mate: Squadmate, state: SquadmateDrawState, size: number): string {
	const k = `sm-${mate.name.toLowerCase()}-`;
	const palette = PALETTES[mate.id];
	const draw = DRAW[mate.id];
	const bust = BUST[mate.id];
	if (palette == null || draw == null || bust == null) throw new UnknownSquadmateError(mate.id);
	const full = size >= 64;
	const [x, y, side] = full ? [-35, 0, 370] : bust;
	const scale = Number((64 / side).toFixed(5));
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="${mate.name}, ${mate.role}${state === "idle" ? "" : `, ${state}`}">
${defs(k, palette)}<g transform="scale(${scale}) translate(${-x} ${-y})">${full ? shadow(k) : ""}${clay(k, draw(k, palette, face(k, state)))}</g>
${badge(state)}
</svg>`;
}

export const SQUADMATE_CSS = `<style>
.sm-blink{transform-box:fill-box;transform-origin:center;animation:sm-blink 4.8s infinite}
@keyframes sm-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
@media (prefers-reduced-motion:reduce){.sm-blink{animation:none}}
</style>`;

export function squadmateMarkup(imageId: string, state: string, size: number): string {
	const mate = BY_ID.get(imageId);
	if (mate == null) throw new UnknownSquadmateError(imageId);
	if (!DRAW_STATES.has(state)) throw new UnknownSquadmateStateError(state);
	return avatar(mate, state as SquadmateDrawState, size);
}

// The whole mascot with its idle face, in the 300 x 370 drawing, for the cards, the PNG files and the lineup.
export function mascotDrawing(imageId: string, k: string): string {
	const mate = BY_ID.get(imageId);
	if (mate == null) throw new UnknownSquadmateError(imageId);
	const palette = PALETTES[mate.id];
	const draw = DRAW[mate.id];
	if (palette == null || draw == null) throw new UnknownSquadmateError(mate.id);
	return `${defs(k, palette)}${shadow(k)}${clay(k, draw(k, palette, face(k, "idle")))}`;
}
