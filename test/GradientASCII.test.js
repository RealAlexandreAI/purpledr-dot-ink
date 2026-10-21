import assert from "node:assert/strict";
import { test } from "node:test";
// Built from source by the test script; node has no .jsx loader.
import { mountGradientASCII, normalizeSettings } from "./.build/GradientASCII.mjs";

/**
 * The shader pipeline needs a real WebGL2 context, so these cover the layer
 * above it: the option clamps that decide what reaches a uniform, and the
 * dispose contract the browser actually relies on.
 */

test("clamps keep an out-of-range option from reaching a uniform", () => {
  const s = normalizeSettings({
    cellSize: 1,
    density: 5,
    glyphOpacity: -1,
    glow: 99,
    scale: 0,
    speed: -10,
    scrambleRadius: 9,
    grain: 5,
  });

  assert.equal(s.cellSize, 6, "cellSize has a 6px floor");
  assert.equal(s.density, 1);
  assert.equal(s.glyphOpacity, 0);
  assert.equal(s.glow, 2);
  assert.equal(s.scale, 0.4);
  assert.equal(s.speed, 0, "speed may not go negative");
  assert.equal(s.scrambleRadius, 0.4);
  assert.equal(s.grain, 0.4);
});

test("an unknown shape or click effect degrades to the first entry, not NaN", () => {
  const s = normalizeSettings({ shape: "nope", clickEffect: "nope" });
  assert.equal(s.shape, 0);
  assert.equal(s.clickEffect, 1);
});

test("the palette is never shorter than two stops", () => {
  assert.equal(normalizeSettings({ colors: ["#fff"] }).colors.length, 2);
  assert.deepEqual(normalizeSettings({ colors: ["#fff"] }).colors, ["#fff", "#fff"]);
  // A shader samples uRamp[0..uCount-1]; an empty array would be uCount 0.
  assert.deepEqual(normalizeSettings({ colors: [] }).colors, normalizeSettings({}).colors);
});

test("the palette is capped at the shader's eight slots", () => {
  const many = Array.from({ length: 20 }, (_, i) => `#00000${(i % 10)}`);
  assert.equal(normalizeSettings({ colors: many }).colors.length, 8);
});

test("mounting without WebGL2 still returns a callable, idempotent disposer", () => {
  const appended = [];
  const canvas = {
    className: "",
    setAttribute() {},
    getContext: () => null,
    remove() {
      appended.pop();
    },
  };
  const container = { appendChild: (c) => appended.push(c) };
  const original = globalThis.document;
  globalThis.document = { createElement: () => canvas };

  try {
    const dispose = mountGradientASCII(container, {});
    assert.equal(typeof dispose, "function", "a page with no WebGL2 must still get a disposer");
    assert.equal(appended.length, 1, "the canvas is attached");

    // Calling it twice is what an unmount path does when a route changes twice.
    dispose();
    assert.equal(appended.length, 0, "the canvas is detached");
    dispose();
    assert.equal(appended.length, 0);
  } finally {
    globalThis.document = original;
  }
});

test("the canvas is hidden from assistive tech", () => {
  const seen = {};
  const canvas = {
    className: "",
    setAttribute: (k, v) => {
      seen[k] = v;
    },
    getContext: () => null,
    remove() {},
  };
  const original = globalThis.document;
  globalThis.document = { createElement: () => canvas };
  try {
    mountGradientASCII({ appendChild() {} }, {});
    assert.equal(seen["aria-hidden"], "true");
    assert.equal(canvas.className, "gradient-ascii-canvas");
  } finally {
    globalThis.document = original;
  }
});
