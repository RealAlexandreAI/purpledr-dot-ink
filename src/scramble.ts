import { scramble } from "@scrambl/core";

export function startScramble(hero: HTMLElement, text: string, pauseMs: number) {
  let pauseTimer: ReturnType<typeof setTimeout> | undefined;

  const instance = scramble(hero, {
    text,
    chars: "katakanaFull",
    from: "random",
    duration: 1500,
    perturbation: 0,
    renderMode: "auto",
    override: "",
    onComplete: () => {
      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => instance.restart(), pauseMs);
    },
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "r" || e.key === "R") {
      clearTimeout(pauseTimer);
      instance.restart();
    }
  });

  return instance;
}
