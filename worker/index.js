// Serves this repository at 10squads.com/design. The route 10squads.com/design* is more
// specific than the website's 10squads.com/*, so Cloudflare sends these paths here.
// The page links with relative paths, so /design moves to /design/.
const PREFIX = "/design";

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		if (url.pathname === PREFIX) return Response.redirect(`${url.origin}${PREFIX}/${url.search}`, 301);
		if (!url.pathname.startsWith(`${PREFIX}/`)) return new Response("Not found", { status: 404 });
		let path = url.pathname.slice(PREFIX.length);
		if (path.endsWith("/")) path += "index.html";
		const file = await env.ASSETS.fetch(new Request(new URL(path, url.origin), request));
		const response = new Response(file.body, file);
		// The design is for the team. Search engines skip it.
		response.headers.set("x-robots-tag", "noindex, nofollow");
		response.headers.set("referrer-policy", "no-referrer");
		response.headers.set("x-content-type-options", "nosniff");
		response.headers.set("cache-control", "no-cache");
		return response;
	},
};
