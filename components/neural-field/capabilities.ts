type NavigatorHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

export type FieldCapabilities = {
  canRender: boolean;
  reducedMotion: boolean;
  isMobile: boolean;
};

const LOW_END_LIMIT = 2;

/** Resolved only after mount; never called during SSR. */
export function detectCapabilities(): FieldCapabilities {
  const nav = navigator as NavigatorHints;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile =
    window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;

  const saveData = nav.connection?.saveData === true;
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= LOW_END_LIMIT;
  const lowCores =
    typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= LOW_END_LIMIT;

  return {
    canRender: !saveData && !lowMemory && !lowCores,
    reducedMotion,
    isMobile,
  };
}
