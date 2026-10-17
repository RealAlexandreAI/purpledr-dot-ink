# purpledr.ink

[中文](README.zh.md)

Placeholder page for `purpledr.ink`. It renders one word and nothing else.

The page is a Vite + TypeScript single-page app with no UI framework: a WebGL2 [GradientASCII](https://reactbits.dev/backgrounds/gradient-ascii) field fills the top of the viewport, and `PURPLEDR.INK` sits centered below it, looping a katakana decode in [Chakra Petch](https://fonts.google.com/specimen/Chakra+Petch) via [@scrambl/core](https://scrambl.vikingz.me) (which drives DOM directly — React is not needed). There is no navigation, no copy, and no Lottie player. `public/robots.txt` disallows every crawler, and `index.html` sets `noindex, nofollow`.

## What the page draws

```text
page (#050408)
├─ GradientASCII   WebGL2 canvas, top 55% of the viewport
└─ h1   PURPLEDR.INK   Chakra Petch 700
```

| Layer | Source | Setting |
| --- | --- | --- |
| Backdrop | `src/GradientASCII.jsx` | Purple ramp, `scale: 1.6`, `density: 1`, `cellSize: 20`, `glow: 0.35` |
| Title | `@scrambl/core` `scramble` (`src/scramble.ts`) | `text: "PURPLEDR.INK"`, `chars: "katakanaFull"`, `from: "random"`, `duration: 1500`, `perturbation: 0`, `renderMode: "auto"` |

The scramble runs for 1500ms, holds the decoded text for 1400ms (`SCRAMBLE_PAUSE_MS`), then replays. Press `R` to restart immediately.

With `prefers-reduced-motion: reduce` the scramble never loads: the title is set to plain text, and `src/scramble.ts` (a separate 3.7 KB gzip chunk) is not fetched.

## Performance and caching

The production bundle is ~24 KB raw / ~8.8 KB gzip for the entry chunk. React and its DOM runtime are gone; the page loads one small module plus the field.

| Asset | Cache-Control |
| --- | --- |
| `/*` (HTML, `fonts.css`, favicon) | `public, max-age=0, must-revalidate` |
| `/assets/*` (content-hashed JS/CSS) | `public, max-age=31536000, immutable` |
| `/ChakraPetch-Bold.woff2` (fixed name) | `public, max-age=2592000, stale-while-revalidate=604800` |

HTML revalidates on every visit so a deploy is visible immediately; the hashed chunks never revalidate. The font keeps a fixed filename (it is preloaded by name), so it gets 30 days rather than `immutable`.

`index.html` inlines the first-paint styles for `#root` and `.hero`, so the frame and the word paints before the module bundle parses. The font is preloaded with `crossorigin` and uses `font-display: swap`. Every response also sends `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, and a restrictive `Permissions-Policy`.

Mobile: `viewport-fit=cover` plus `env(safe-area-inset-*)` padding keep the word clear of notches; under `30rem` the title sizes from the viewport width and stays on one line. The keyboard listener still restarts the scramble with `R`. The canvas caps device pixel ratio at 2 and stops its rAF loop when the canvas scrolls out of view or the tab is hidden.

## Run

Node `^20.19.0` or `>=22.12.0`. `package.json` does not pin an engine; the lockfile resolves Vite 8.3.4, and that release asks for this range.

```bash
npm install
npm run dev
```

Dev server listens on port 5173 (`strictPort: false`, so a busy port moves). `host: true` binds all interfaces; open `http://127.0.0.1:5173/`.

```bash
npm run build    # tsc -b && vite build → dist/
npm run preview  # serves dist/ on port 4173
```

## Deploy

A Cloudflare **Worker with static assets**, not a Pages project. `cloudflare.config.ts` is the source of truth: worker `purpledr-dot-ink`, `assets.directory` from the Vite build, `notFoundHandling: "single-page-application"` (every unmatched path serves `index.html`), and the `purpledr.ink` custom domain.

The Worker owns the apex `purpledr.ink` as a Workers custom domain; `www.purpledr.ink` is not bound to this project.

```bash
npx cf dev       # local Worker + assets on the Vite dev server
npx cf deploy    # build then publish the Worker
```

`public/_headers` is copied into the built assets and applied natively by Workers. Note that Workers **merges every matching rule** (unlike Pages, which takes only the most specific): a request under `/assets/` receives both the `/*` rule and the `/assets/*` rule, joined by a comma. Browsers take the last directive, so the `immutable` policy wins:

| Path | Cache-Control |
| --- | --- |
| `/*` | `public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800` |
| `/assets/*` | `public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800, public, max-age=31536000, immutable` |

Both also send `X-Content-Type-Options: nosniff`.

`npm run build` still writes `dist/` (Vite's `build.outDir`), so `vite preview` keeps working; `cf build`/`cf deploy` write their own tree under `.cloudflare/output/`. The Vite plugin adds `dist/wrangler.json` and `dist/.assetsignore`; `.assetsignore` keeps `wrangler.json` out of the served assets.

## Credits

| Piece | Version in the lockfile | License |
| --- | --- | --- |
| [GradientASCII](https://reactbits.dev/backgrounds/gradient-ascii) | copied into `src/`, no package dependency | MIT |
| [@scrambl/core](https://www.npmjs.com/package/@scrambl/core) | 0.1.1 | MIT |
| [Chakra Petch](https://fonts.google.com/specimen/Chakra+Petch) | Latin subset self-hosted in `public/` | SIL Open Font License |

This repository has no `LICENSE` file of its own. `package.json` sets `"private": true`, so the package is not published to npm.
