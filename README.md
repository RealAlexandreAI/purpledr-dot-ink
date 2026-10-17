# purpledr.ink

[中文](README.zh.md)

Placeholder page for `purpledr.ink`. It renders one word and nothing else.

The page is a Vite + React 19 single-page app. A WebGL2 [GradientASCII](https://reactbits.dev/backgrounds/gradient-ascii) field fills the top of the viewport; `PURPLEDR.INK` sits centered below it, looped through a katakana decode in [Chakra Petch](https://fonts.google.com/specimen/Chakra-Petch) by [@scrambl/react](https://scrambl.vikingz.me). There is no navigation, no copy, and no Lottie player. `public/robots.txt` disallows every crawler, and `index.html` sets `noindex, nofollow`.

## What the page draws

```text
page (#050408)
├─ GradientASCII   WebGL2 canvas, top 55% of the viewport
└─ h1   PURPLEDR.INK   Chakra Petch 700
```

| Layer | Source | Setting |
| --- | --- | --- |
| Backdrop | `src/GradientASCII.jsx` | Purple ramp, `scale: 1.6`, `density: 1`, `cellSize: 20`, `glow: 0.35` |
| Title | `@scrambl/react` `useScramble` | `text: "PURPLEDR.INK"`, `chars: "katakanaFull"`, `from: "random"`, `duration: 1500`, `perturbation: 0`, `renderMode: "auto"` |

The scramble runs for 1500ms, holds the decoded text for 1400ms (`SCRAMBLE_PAUSE_MS`), then replays. Press `R` to restart immediately.

`src/index.css` shortens animations when `prefers-reduced-motion: reduce` is set.

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

`www.purpledr.ink` is not part of this Worker; the apex is the only hostname it owns.

## Credits

| Piece | Version in the lockfile | License |
| --- | --- | --- |
| [GradientASCII](https://reactbits.dev/backgrounds/gradient-ascii) | copied into `src/`, no package dependency | MIT |
| [@scrambl/react](https://www.npmjs.com/package/@scrambl/react) | 0.1.1 | MIT |
| [Chakra Petch](https://fonts.google.com/specimen/Chakra+Petch) | Google Fonts stylesheet | SIL Open Font License |

This repository has no `LICENSE` file of its own. `package.json` sets `"private": true`, so the package is not published to npm.
