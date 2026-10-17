import "./index.css";
import { mountGradientASCII } from "./GradientASCII";

const TITLE = "PURPLEDR.INK";
const SCRAMBLE_PAUSE_MS = 1400;

const root = document.getElementById("root")!;
root.insertAdjacentHTML("afterbegin", '<div class="backdrop"></div><h1 class="hero"></h1>');

const backdrop = root.querySelector<HTMLElement>(".backdrop")!;
const hero = root.querySelector<HTMLElement>(".hero")!;

// The scramble engine and its katakana glyph set are only needed when motion is
// welcome, so they load after the first paint instead of blocking it.
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  hero.textContent = TITLE;
} else {
  void import("./scramble").then(({ startScramble }) => {
    startScramble(hero, TITLE, SCRAMBLE_PAUSE_MS);
  });
}

mountGradientASCII(backdrop, {
  colors: ["#120b1f", "#8b5cf6", "#c4b5fd", "#050408"],
  scale: 1.6,
  density: 1,
  cellSize: 20,
  glow: 0.35,
});
