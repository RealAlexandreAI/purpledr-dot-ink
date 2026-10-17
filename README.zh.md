# purpledr.ink

[English](README.md)

`purpledr.ink` 的占位页。页面只画一个词，没有其他内容。

这是一个 Vite + TypeScript 单页应用，不带 UI 框架。WebGL2 的 [GradientASCII](https://reactbits.dev/backgrounds/gradient-ascii) 铺满视口上半部分，`PURPLEDR.INK` 居中显示在其下方，由 [@scrambl/core](https://scrambl.vikingz.me) 直接操作 DOM 循环播放 [Chakra Petch](https://fonts.google.com/specimen/Chakra+Petch) 的片假名解码动画（不需要 React）。没有导航、没有文案，也没有 Lottie 播放器。`public/robots.txt` 拒绝所有爬虫，`index.html` 设置 `noindex, nofollow`。

## 页面画了什么

```text
page (#050408)
├─ GradientASCII   WebGL2 canvas，视口上部 55%
└─ h1   PURPLEDR.INK   Chakra Petch 700
```

| 层 | 来源 | 设置 |
| --- | --- | --- |
| 背景 | `src/GradientASCII.jsx` | 紫色渐变，`scale: 1.6`、`density: 1`、`cellSize: 20`、`glow: 0.35` |
| 标题 | `@scrambl/core` 的 `scramble`（`src/scramble.ts`）| `text: "PURPLEDR.INK"`、`chars: "katakanaFull"`、`from: "random"`、`duration: 1500`、`perturbation: 0`、`renderMode: "auto"` |

解码跑 1500ms，停在最终文字上 1400ms（`SCRAMBLE_PAUSE_MS`），再重播。按 `R` 立即重新开始。

`prefers-reduced-motion: reduce` 时解码模块根本不会加载：标题直接设为静态文本，`src/scramble.ts`（独立 chunk，gzip 3.7 KB）不会被请求。

## 性能与缓存

生产产物入口 chunk 约 24 KB（gzip 8.8 KB）。React 及其 DOM 运行时已移除。

| 资源 | Cache-Control |
| --- | --- |
| `/*`（HTML、`fonts.css`、favicon） | `public, max-age=0, must-revalidate` |
| `/assets/*`（内容哈希的 JS/CSS） | `public, max-age=31536000, immutable` |
| `/ChakraPetch-Bold.woff2`（固定文件名） | `public, max-age=2592000, stale-while-revalidate=604800` |

HTML 每次访问都回源校验，部署后立即可见；哈希文件永不校验。字体必须保留固定名（被 preload 引用），因此给 30 天而不是 `immutable`。

`index.html` 内联了 `#root` 与 `.hero` 的首屏样式，模块包解析前就能画出底色和标题。字体以 `crossorigin` preload，并设 `font-display: swap`。所有响应同时带 `X-Content-Type-Options`、`Referrer-Policy`、`X-Frame-Options: DENY` 和收紧的 `Permissions-Policy`。

移动端：`viewport-fit=cover` 配合 `env(safe-area-inset-*)` 避开刘海；`30rem` 以下标题按视口宽度缩放并保持单行。按 `R` 仍可重播解码。画布 DPR 上限为 2，滚出视口或标签页隐藏时停止 rAF 循环。

## 运行

需要 Node `^20.19.0` 或 `>=22.12.0`。`package.json` 没有 `engines` 字段；lockfile 解析到 Vite 8.3.4，这个版本要求上述范围。

```bash
npm install
npm run dev
```

开发服务监听 5173（`strictPort: false`，端口被占会顺延）。`host: true` 绑定全部网卡，打开 `http://127.0.0.1:5173/`。

```bash
npm run build    # tsc -b && vite build → dist/
npm run preview  # 在 4173 端口提供 dist/
```

## 部署

Cloudflare **Worker + 静态资源**，不再用 Pages。`cloudflare.config.ts` 是唯一事实来源：worker 名 `purpledr-dot-ink`、`assets.directory` 取自 Vite 构建、`notFoundHandling: "single-page-application"`（未命中的路径都回退 `index.html`）、自定义域 `purpledr.ink`。

```bash
npx cf dev       # 本地起 Worker + 资源（跑在 Vite dev server 上）
npx cf deploy    # 构建后发布 Worker
```

`public/_headers` 会被拷进构建产出的资源目录，由 Workers 原生应用。注意 Workers 会**合并所有命中的规则**（Pages 只取最具体的一条）：`/assets/` 下的请求会同时拿到 `/*` 和 `/assets/*` 两条，用逗号拼接。浏览器取最后一条指令，所以 `immutable` 生效：

| 路径 | Cache-Control |
| --- | --- |
| `/*` | `public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800` |
| `/assets/*` | `public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800, public, max-age=31536000, immutable` |

两条都加 `X-Content-Type-Options: nosniff`。

`npm run build` 仍写 `dist/`（Vite 的 `build.outDir`），所以 `vite preview` 照旧可用；`cf build`/`cf deploy` 写自己的 `.cloudflare/output/`。Vite 插件会额外生成 `dist/wrangler.json` 与 `dist/.assetsignore`，后者把 `wrangler.json` 挡在对外资源之外。

Worker 通过 Workers 自定义域接管顶点 `purpledr.ink`；`www.purpledr.ink` 不绑定到本项目。

## 信用

| 组件 | lockfile 中的版本 | 许可证 |
| --- | --- | --- |
| [GradientASCII](https://reactbits.dev/backgrounds/gradient-ascii) | 源码直接拷入 `src/`，无包依赖 | MIT |
| [@scrambl/react](https://www.npmjs.com/package/@scrambl/react) | 0.1.1 | MIT |
| [Chakra Petch](https://fonts.google.com/specimen/Chakra+Petch) | Latin 子集自托管于 `public/` | SIL Open Font License |

本仓库没有自己的 `LICENSE` 文件。`package.json` 设置 `"private": true`，这个包不发布到 npm。
