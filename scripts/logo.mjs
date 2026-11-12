// The tensquads logo: the round table.
// Ten seats sit around one table. The seat colours come from the squad mascots.
// The centre is the owner: the squad works around the owner.
// Use the tile on light backgrounds. Use the "dark" variant (white tile) on dark backgrounds.
export const SEATS = ["#E98065", "#EDB54E", "#86C7A5", "#8AACEE", "#A88BEB", "#E3958A", "#EE9F5A", "#A9B4C5", "#0169cc", "#2A2D34"];

export function logoSvg({ size = 64, dark = false, label = "tensquads" } = {}) {
	const tile = dark ? "#fff" : "#0d0d0d";
	const centre = dark ? "#0d0d0d" : "#fff";
	const seats = SEATS.map((c, i) => {
		const a = -Math.PI / 2 + (i * 2 * Math.PI) / 10;
		return `<circle cx="${(32 + 19 * Math.cos(a)).toFixed(2)}" cy="${(32 + 19 * Math.sin(a)).toFixed(2)}" r="4.6" fill="${c}"/>`;
	}).join("");
	const a11y = label ? `role="img" aria-label="${label}"` : `aria-hidden="true"`;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" ${a11y}><rect width="64" height="64" rx="16" fill="${tile}"/>${seats}<circle cx="32" cy="32" r="6" fill="${centre}"/></svg>`;
}
