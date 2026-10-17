import { useCallback, useEffect, useRef } from "react";
import { useScramble } from "@scrambl/react";
import GradientASCII from "./GradientASCII";
import "./App.css";

const SCRAMBLE_PAUSE_MS = 1400;

const SCRAMBLE_OPTS = {
  text: "PURPLEDR.INK",
  chars: "katakanaFull" as const,
  from: "random" as const,
  duration: 1500,
  perturbation: 0,
  renderMode: "auto" as const,
  override: "",
  playOnMount: true,
};

export default function App() {
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replayRef = useRef<() => void>(() => {});

  const schedulePause = useCallback(() => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      replayRef.current();
    }, SCRAMBLE_PAUSE_MS);
  }, []);

  const { ref, replay } = useScramble({
    ...SCRAMBLE_OPTS,
    onComplete: schedulePause,
  });

  replayRef.current = replay;

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        replay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [replay]);

  return (
    <div className="page">
      <GradientASCII
        className="backdrop"
        colors={["#120b1f", "#8b5cf6", "#c4b5fd", "#050408"]}
        scale={1.6}
        density={1}
        cellSize={20}
        glow={0.35}
      />
      <h1 ref={ref} className="hero" />
    </div>
  );
}
