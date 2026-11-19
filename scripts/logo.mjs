// The tensquads logo: the wordmark the owner supplied (scripts/logo-source.svg).
// The coral figure and the ring form the mark. The word "tensquads" follows it.
// The ink is near-black on light backgrounds and white on dark ones. The coral never changes.
// Build every logo file from this module; do not edit the files in logo/ by hand.
import { readFileSync } from "node:fs";

const SOURCE = readFileSync(new URL("./logo-source.svg", import.meta.url), "utf8");
const SOURCE_INK = "#151515";
export const INK = { light: "#151515", dark: "#ffffff" };
export const CORAL = "#E9806A";
const SHAPES = [...SOURCE.matchAll(/<(?:line|circle|rect|path)\b[^>]*\/>/g)].map((match) => match[0]);
const WORDMARK_VIEWBOX = /viewBox="([^"]+)"/.exec(SOURCE)?.[1] ?? "0 0 281.2 64";
// The first four shapes are the mark: the figure's antenna, its head dot, its body, and the ring.
const MARK_SHAPES = SHAPES.slice(0, 4);
// The mark spans x 8 to 69 and y 3.2 to 53 in the source drawing.
const MARK_BOX = { x: 8, y: 3.2, width: 61, height: 49.8 };

const ink = (shape, colour) => shape.replaceAll(SOURCE_INK, colour);
const a11y = (label) => (label ? `role="img" aria-label="${label}"` : `aria-hidden="true"`);

/** The full wordmark. `height` sets the rendered height; the width follows the drawing. */
export function wordmarkSvg({ height = 64, dark = false, label = "tensquads" } = {}) {
	const [, , w, h] = WORDMARK_VIEWBOX.split(/\s+/).map(Number);
	const width = Math.round((height * w) / h);
	const colour = dark ? INK.dark : INK.light;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${WORDMARK_VIEWBOX}" width="${width}" height="${height}" ${a11y(label)}>${SHAPES.map((shape) => ink(shape, colour)).join("")}</svg>`;
}

/**
 * The mark on a square tile, for favicons, app icons and avatars.
 * Light backgrounds take the near-black tile with a white ring; dark backgrounds take the white tile with an ink ring.
 */
export function logoSvg({ size = 64, dark = false, label = "tensquads" } = {}) {
	const tile = dark ? INK.dark : INK.light;
	const ring = dark ? INK.light : INK.dark;
	const scale = 40 / MARK_BOX.width;
	const tx = (32 - (MARK_BOX.x + MARK_BOX.width / 2) * scale).toFixed(2);
	const ty = (32 - (MARK_BOX.y + MARK_BOX.height / 2) * scale).toFixed(2);
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" ${a11y(label)}><rect width="64" height="64" rx="16" fill="${tile}"/><g transform="translate(${tx} ${ty}) scale(${scale.toFixed(4)})">${MARK_SHAPES.map((shape) => ink(shape, ring)).join("")}</g></svg>`;
}
