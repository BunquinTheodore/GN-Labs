"use client";

import { useEffect } from "react";

const FIRST_INPUT_EVENTS = ["pointermove", "pointerdown", "touchstart", "scroll", "wheel", "keydown"] as const;

/**
 * Toggles two classes on <html>:
 * - `.tab-hidden`: pauses every .glass/.button-glass glow+shine animation while
 *   this tab isn't visible, instead of burning GPU/battery in the background.
 * - `.gn-live`: added on the first real user input. Until then the glass shine
 *   and glow hold their resting frame (see globals.css), so nothing animates
 *   during load.
 */
export function AmbientVisibilityController() {
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      root.classList.toggle("tab-hidden", document.visibilityState === "hidden");
    };

    const goLive = () => {
      root.classList.add("gn-live");
      for (const name of FIRST_INPUT_EVENTS) window.removeEventListener(name, goLive);
    };

    sync();
    document.addEventListener("visibilitychange", sync);
    for (const name of FIRST_INPUT_EVENTS) window.addEventListener(name, goLive, { passive: true });
    return () => {
      document.removeEventListener("visibilitychange", sync);
      for (const name of FIRST_INPUT_EVENTS) window.removeEventListener(name, goLive);
    };
  }, []);

  return null;
}
