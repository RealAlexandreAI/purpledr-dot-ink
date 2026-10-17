import { defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "purpledr-dot-ink",
		compatibilityDate: "2026-10-10",
		workersDev: false,
		previewUrls: false,
		// Static SPA: every unmatched path serves index.html, same as the
		// Pages project this replaces. `_headers` in public/ is copied into
		// dist/ by Vite and applied natively by Workers static assets.
		assets: {
			notFoundHandling: "single-page-application",
		},
		domains: ["purpledr.ink"],
	},
});
