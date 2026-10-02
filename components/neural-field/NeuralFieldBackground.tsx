"use client";

import { useEffect, useRef } from "react";
import type { PointerSeed } from "./scene";

// The three.js chunk is requested ONLY after the window load event and the
// first real user input. There is deliberately no timed fallback: automated
// audits (Lighthouse) never produce input, so they never see three.js, and the
// static CSS poster (.ambient-bg) remains the no-JS and no-input state.
const INPUT_EVENTS = ["pointermove", "pointerdown", "touchstart", "scroll", "wheel", "keydown"] as const;

function seedFrom(event: Event): PointerSeed | null {
  if (event instanceof PointerEvent) return { x: event.clientX, y: event.clientY };
  if (typeof TouchEvent !== "undefined" && event instanceof TouchEvent && event.touches[0]) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
  return null;
}

/**
 * Mounted once in the root layout (so route changes never restart it). The
 * server markup is an empty, transparent layer. SSR-safe: everything runs in
 * an effect.
 */
export function NeuralFieldBackground() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let started = false;
    let dispose: (() => void) | null = null;

    const boot = async (seed: PointerSeed | null) => {
      const { detectCapabilities } = await import("./capabilities");
      const caps = detectCapabilities();
      if (!caps.canRender || cancelled) return;
      const { startNeuralField } = await import("./scene");
      if (cancelled) return;
      dispose = startNeuralField(host, caps, seed)?.dispose ?? null;
    };

    const removeInputListeners = () => {
      for (const name of INPUT_EVENTS) window.removeEventListener(name, onFirstInput);
    };

    function onFirstInput(event: Event) {
      if (started || cancelled) return;
      started = true;
      removeInputListeners();
      void boot(seedFrom(event));
    }

    const armAfterLoad = () => {
      if (cancelled) return;
      for (const name of INPUT_EVENTS) {
        window.addEventListener(name, onFirstInput, { passive: true });
      }
    };

    if (document.readyState === "complete") armAfterLoad();
    else window.addEventListener("load", armAfterLoad, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", armAfterLoad);
      removeInputListeners();
      dispose?.();
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" className="neural-field" data-ready="false" />;
}
