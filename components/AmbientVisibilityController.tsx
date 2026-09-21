"use client";

import { useEffect } from "react";

/**
 * Toggles `.tab-hidden` on <html> so the ambient background blobs and every
 * .glass/.button-glass glow+shine animation pause while this tab isn't
 * visible, instead of burning GPU/battery in the background for the
 * lifetime of the tab.
 */
export function AmbientVisibilityController() {
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      root.classList.toggle("tab-hidden", document.visibilityState === "hidden");
    };

    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return null;
}
