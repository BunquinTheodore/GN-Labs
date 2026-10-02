import {
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";
import { MAX_RIPPLES, fragmentShader, vertexShader } from "./shaders";
import type { FieldCapabilities } from "./capabilities";

const MAX_PIXEL_RATIO = 1.5;
// Frame budgets. Active = pointer recently moved or a touch/click burst is
// still travelling; idle = gentle undulation at a low rate while visible.
const ACTIVE_FRAME_MS = { mobile: 1000 / 30, desktop: 1000 / 60 };
const IDLE_FRAME_MS = { mobile: 1000 / 15, desktop: 1000 / 24 };
// Ripples last 4.5 s; stay in the active budget a little longer than that.
const ACTIVE_TAIL_S = 5;
const RIPPLE_MIN_DISTANCE = 0.7;
const RIPPLE_MIN_INTERVAL_S = 0.26;
const BURST_STRENGTH = 1.4;
const MOVE_RIPPLE_STRENGTH = 1.0;
const CAMERA_Z = 10;
const TILT = -0.95;
const STILL_FRAME_TIME_S = 6;

export type FieldHandle = { dispose: () => void };
/** Client coordinates of the input that triggered loading (so it is not lost). */
export type PointerSeed = { x: number; y: number };

function readColor(name: string, fallback: string): Color {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const color = new Color();
  try {
    color.set(raw || fallback);
  } catch {
    color.set(fallback);
  }
  return color;
}

function buildGeometry(cols: number, rows: number): BufferGeometry {
  const positions = new Float32Array(cols * rows * 3);
  let i = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      positions[i++] = x / (cols - 1) - 0.5;
      positions[i++] = y / (rows - 1) - 0.5;
      positions[i++] = 0;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  return geometry;
}

export function startNeuralField(
  host: HTMLElement,
  caps: FieldCapabilities,
  seed: PointerSeed | null = null,
): FieldHandle | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  // Coarse pointers / small screens get a lighter field.
  const cols = caps.isMobile ? 56 : 110;
  const rows = caps.isMobile ? 40 : 64;
  const geometry = buildGeometry(cols, rows);

  const ripples = Array.from({ length: MAX_RIPPLES }, () => new Vector4(0, 0, -100, 0));
  const uniforms = {
    uTime: { value: 0 },
    uSize: { value: new Vector2(16, 20) },
    uPointer: { value: new Vector2(999, 999) },
    uPointerStrength: { value: 0 },
    uRipples: { value: ripples },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uPointSize: { value: caps.isMobile ? 3.6 : 3.3 },
    // Brand tokens: quiet mist for the idle grid, cyan ripples, lime glow.
    uBase: { value: readColor("--mist-dim", "#9aa59a") },
    uAccent: { value: readColor("--cyan", "#17c9e2") },
    uWarm: { value: readColor("--lime", "#caf14a") },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const points = new Points(geometry, material);
  points.rotation.x = TILT;
  points.frustumCulled = false;

  const scene = new Scene();
  scene.add(points);
  const camera = new PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visibleH = 2 * CAMERA_Z * Math.tan((camera.fov * Math.PI) / 360);
    uniforms.uSize.value.set(visibleH * camera.aspect * 1.7, visibleH * 2.3);
    points.updateMatrixWorld(true);
  };
  resize();

  // Pointer: target in NDC, smoothed each frame, then projected onto the plane.
  const target = new Vector2(0, 0);
  const smooth = new Vector2(0, 0);
  let hasPointer = false;
  let lastActivity = -10;
  let lastRippleAt = -10;
  const lastRipplePoint = new Vector2(999, 999);
  let rippleIndex = 0;
  const ray = new Vector3();
  const origin = new Vector3();
  const localOrigin = new Vector3();
  const localDir = new Vector3();
  const planePoint = new Vector2();

  let running = false;
  let rafId = 0;
  let lastFrame = 0;
  let lastTick = 0;
  let inView = true;
  let reduced = caps.reducedMotion;
  const profile = caps.isMobile ? "mobile" : "desktop";

  // Intersect the view ray with the plane in its own (tilted) local space.
  const projectToPlane = (ndc: Vector2, out: Vector2) => {
    origin.copy(camera.position);
    ray.set(ndc.x, ndc.y, 0.5).unproject(camera).sub(origin).normalize();
    points.worldToLocal(localOrigin.copy(origin));
    points.worldToLocal(localDir.copy(origin).add(ray)).sub(localOrigin);
    if (Math.abs(localDir.z) < 1e-5) return false;
    const t = -localOrigin.z / localDir.z;
    if (t < 0) return false;
    out.set(localOrigin.x + localDir.x * t, localOrigin.y + localDir.y * t);
    return true;
  };

  const addRipple = (point: Vector2, time: number, strength: number) => {
    ripples[rippleIndex].set(point.x, point.y, time, strength);
    rippleIndex = (rippleIndex + 1) % MAX_RIPPLES;
    lastRippleAt = time;
    lastRipplePoint.copy(point);
  };

  const dropTrailRipple = (time: number) => {
    if (!projectToPlane(smooth, planePoint)) return;
    uniforms.uPointer.value.copy(planePoint);
    const moved = planePoint.distanceTo(lastRipplePoint);
    if (moved < RIPPLE_MIN_DISTANCE || time - lastRippleAt < RIPPLE_MIN_INTERVAL_S) return;
    addRipple(planePoint, time, MOVE_RIPPLE_STRENGTH);
  };

  const toNdc = (clientX: number, clientY: number) => {
    target.set(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1,
    );
    if (!hasPointer) smooth.copy(target);
    hasPointer = true;
    lastActivity = uniforms.uTime.value;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (reduced) return;
    toNdc(event.clientX, event.clientY);
  };

  // Click / tap: an immediate, stronger ripple at the exact point.
  const onPointerDown = (event: PointerEvent) => {
    if (reduced) return;
    toNdc(event.clientX, event.clientY);
    smooth.copy(target);
    if (projectToPlane(smooth, planePoint)) {
      uniforms.uPointer.value.copy(planePoint);
      addRipple(planePoint, uniforms.uTime.value, BURST_STRENGTH);
    }
  };

  const isActive = () => hasPointer && uniforms.uTime.value - lastActivity < ACTIVE_TAIL_S;

  const frame = (now: number) => {
    rafId = requestAnimationFrame(frame);
    const budget = isActive() ? ACTIVE_FRAME_MS[profile] : IDLE_FRAME_MS[profile];
    // Small tolerance so a 60 Hz display does not skip every other tick at 30 fps.
    if (now - lastFrame < budget - 2) return;
    const dt = Math.min((now - (lastTick || now)) / 1000, 0.1);
    lastFrame = now;
    lastTick = now;
    uniforms.uTime.value += dt;
    const time = uniforms.uTime.value;

    if (hasPointer) {
      smooth.lerp(target, 1 - Math.exp(-dt * 7));
      dropTrailRipple(time);
      const idle = time - lastActivity;
      const wanted = idle < 0.4 ? 1 : Math.max(0, 1 - (idle - 0.4) / 1.8);
      const current = uniforms.uPointerStrength.value;
      uniforms.uPointerStrength.value += (wanted - current) * (1 - Math.exp(-dt * 6));
    }
    renderer.render(scene, camera);
  };

  const start = () => {
    if (running || reduced) return;
    running = true;
    lastTick = 0;
    rafId = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(rafId);
  };
  const sync = () => {
    if (document.visibilityState === "visible" && inView && !reduced) start();
    else stop();
  };

  const onResize = () => {
    resize();
    if (!running) renderer.render(scene, camera);
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    stop();
    host.dataset.ready = "false";
  };
  const onContextRestored = () => {
    host.dataset.ready = "true";
    sync();
  };

  const canvas = renderer.domElement;
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  window.addEventListener("resize", onResize, { passive: true });

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onMotionChange = () => {
    reduced = motionQuery.matches;
    if (reduced) {
      stop();
      uniforms.uPointerStrength.value = 0;
      for (const r of ripples) r.set(0, 0, -100, 0);
      renderer.render(scene, camera);
    } else {
      sync();
    }
  };
  motionQuery.addEventListener("change", onMotionChange);

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.addEventListener("visibilitychange", sync);
  const observer = new IntersectionObserver((entries) => {
    inView = entries[entries.length - 1]?.isIntersecting ?? true;
    sync();
  });
  observer.observe(host);

  if (reduced) uniforms.uTime.value = STILL_FRAME_TIME_S;
  if (seed && !reduced) toNdc(seed.x, seed.y);
  renderer.render(scene, camera);
  host.dataset.ready = "true";
  sync();

  return {
    dispose: () => {
      stop();
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
      host.dataset.ready = "false";
    },
  };
}
