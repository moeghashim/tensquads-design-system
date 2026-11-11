// design-check: proves that screens/ is the same as the version in its manifest.
// Reads screens/MANIFEST.json. Hashes each file. Exits 1 on any difference.
// Run: node scripts/design-check.mjs
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const manifest = JSON.parse(readFileSync(resolve(root, "screens/MANIFEST.json"), "utf8"));

let bad = 0;
for (const [file, expected] of Object.entries(manifest.files)) {
	const bytes = readFileSync(resolve(root, "screens", file));
	const actual = createHash("sha256").update(bytes).digest("hex");
	const ok = actual === expected;
	if (!ok) bad += 1;
	console.log(`${ok ? "OK  " : "DIFF"} ${file}`);
}

console.log(`canvas ${manifest.canvas} version ${manifest.version}, pulled ${manifest.pulled}`);
if (bad > 0) {
	console.error(
		`${bad} file(s) differ from screens/MANIFEST.json. Change a screen only with an approved design change, then update its hash in the manifest.`,
	);
	process.exit(1);
}
console.log("screens/ matches the manifest.");
