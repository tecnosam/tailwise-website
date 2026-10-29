"use client";

import { useEffect, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  RingGeometry,
  Scene,
  ShaderMaterial,
  Sphere,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

/*
 * The sieve: every particle is a trace. They fall in a slow spiral onto a
 * filter plane. Most are dropped there and dissolve; the few worth keeping
 * pass through, take on the accent colour and gather into a narrow stream.
 *
 * Plain three.js with named imports, so only what is used ships, and the
 * render loop sleeps whenever the canvas is off screen or the tab is hidden.
 */

const TOP = 3.8;
const BOTTOM = -3.6;
const FILTER = 0.55;
const KEEP_SHARE = 0.13;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec2 uMouse;
  attribute vec3 aStart;   // theta, radius (0..1), phase
  attribute vec3 aMotion;  // offset, speed, keep
  varying float vAlpha;
  varying float vKept;
  varying float vFlash;

  const float TOP = ${TOP.toFixed(2)};
  const float BOTTOM = ${BOTTOM.toFixed(2)};
  const float FILTER = ${FILTER.toFixed(2)};

  // smoothstep with edge0 > edge1 is undefined in GLSL; this is the safe form.
  float fall(float e0, float e1, float x) { return 1.0 - smoothstep(e1, e0, x); }

  void main() {
    float keep = aMotion.z;
    float p = fract(aMotion.x + uTime * aMotion.y);
    float y = mix(TOP, BOTTOM, p);

    float below = fall(FILTER, FILTER - 0.25, y);
    float depth = clamp((FILTER - y) / (FILTER - BOTTOM), 0.0, 1.0);
    float approach = fall(TOP, FILTER, y);

    float theta = aStart.x + uTime * 0.07 + sin(uTime * 0.6 + aStart.z * 6.283) * 0.04;
    float r = aStart.y * 2.7 * mix(1.0, 0.9, approach);

    // Kept traces funnel into a tight stream; dropped ones splay out as they die.
    float keptR = mix(r, 0.12 + aStart.y * 0.32, smoothstep(0.0, 0.45, depth));
    float dropR = r * (1.0 + depth * 1.4);
    r = mix(r, mix(dropR, keptR, keep), below);
    theta += below * keep * depth * 2.2;

    vec3 pos = vec3(cos(theta) * r, y, sin(theta) * r);
    pos.y += below * (1.0 - keep) * depth * 0.6; // dropped ones linger, lose momentum

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Part around the cursor.
    vec2 ndc = gl_Position.xy / gl_Position.w;
    vec2 d = ndc - uMouse;
    float push = fall(0.32, 0.0, length(d)) * 0.07;
    gl_Position.xy += normalize(d + 1e-4) * push * gl_Position.w;

    float kept = keep * below;
    float flash = keep * exp(-((y - FILTER) * (y - FILTER)) * 25.0);
    float size = uSize * (0.55 + aStart.z * 0.9) * mix(1.0, 2.1, kept) * (1.0 + flash * 1.6);
    gl_PointSize = size * uPixelRatio * (7.0 / -mv.z);

    float fadeTop = fall(TOP, TOP - 1.0, y);
    float fadeBottom = smoothstep(BOTTOM, BOTTOM + 1.6, y);
    float dropFade = 1.0 - below * (1.0 - keep) * smoothstep(0.0, 0.2, depth);
    vAlpha = fadeTop * fadeBottom * dropFade;
    vKept = kept;
    vFlash = flash;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uIdle;
  uniform vec3 uKeep;
  uniform float uIdleAlpha;
  varying float vAlpha;
  varying float vKept;
  varying float vFlash;

  // smoothstep with edge0 > edge1 is undefined in GLSL; this is the safe form.
  float fall(float e0, float e1, float x) { return 1.0 - smoothstep(e1, e0, x); }

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = fall(0.5, 0.28, d);
    float glow = fall(0.5, 0.0, d);
    vec3 color = mix(uIdle, uKeep, max(vKept, vFlash));
    float shape = mix(core, glow * 1.25, max(vKept, vFlash));
    float alpha = shape * vAlpha * mix(uIdleAlpha, 1.0, max(vKept, vFlash));
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

function cssColor(name: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(value || "#888");
}

function makeTraceGeometry(count: number) {
  const start = new Float32Array(count * 3);
  const motion = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    start[i * 3] = Math.random() * Math.PI * 2;
    start[i * 3 + 1] = Math.sqrt(Math.random());
    start[i * 3 + 2] = Math.random();
    motion[i * 3] = Math.random();
    motion[i * 3 + 1] = 0.035 + Math.random() * 0.03;
    motion[i * 3 + 2] = Math.random() < KEEP_SHARE ? 1 : 0;
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
  g.setAttribute("aStart", new BufferAttribute(start, 3));
  g.setAttribute("aMotion", new BufferAttribute(motion, 3));
  g.boundingSphere = new Sphere(new Vector3(), 10);
  return g;
}

// The filter itself: concentric rings and spokes, like a fine mesh seen at an angle.
function makeMeshGeometry() {
  const points: number[] = [];
  const seg = 128;
  for (const r of [0.9, 1.6, 2.3, 2.95]) {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2;
      const a1 = ((i + 1) / seg) * Math.PI * 2;
      points.push(Math.cos(a0) * r, 0, Math.sin(a0) * r, Math.cos(a1) * r, 0, Math.sin(a1) * r);
    }
  }
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    points.push(Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35, Math.cos(a) * 2.95, 0, Math.sin(a) * 2.95);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(points, 3));
  return g;
}

function mount(container: HTMLDivElement, onReady: () => void) {
  const renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
  const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;pointer-events:none";
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 2.4, 8.2);
  camera.lookAt(0, 0.1, 0);

  const rig = new Group();
  scene.add(rig);

  const count = window.innerWidth < 768 ? 1300 : 2600;
  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uSize: { value: 2.4 },
    uMouse: { value: new Vector2(9, 9) },
    uIdle: { value: new Color("#222") },
    uKeep: { value: new Color("#8d1a6c") },
    uIdleAlpha: { value: 0.5 },
  };
  const particles = new Points(
    makeTraceGeometry(count),
    new ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false }),
  );

  const filter = new Group();
  filter.position.y = FILTER;
  const lineMaterial = new LineBasicMaterial({ transparent: true, depthWrite: false });
  const pulseMaterial = new MeshBasicMaterial({ transparent: true, depthWrite: false, side: DoubleSide });
  const pulse = new Mesh(new RingGeometry(0.97, 1, 96), pulseMaterial);
  pulse.rotation.x = -Math.PI / 2;
  filter.add(new LineSegments(makeMeshGeometry(), lineMaterial), pulse);
  rig.add(filter, particles);

  const paint = () => {
    const dark = document.documentElement.classList.contains("dark");
    uniforms.uIdle.value = cssColor("--particle-idle");
    uniforms.uKeep.value = cssColor("--accent");
    uniforms.uIdleAlpha.value = dark ? 0.42 : 0.55;
    lineMaterial.color = cssColor("--particle-idle");
    lineMaterial.opacity = dark ? 0.16 : 0.13;
    pulseMaterial.color = cssColor("--accent");
  };
  paint();
  const themeObserver = new MutationObserver(paint);
  themeObserver.observe(document.documentElement, { attributeFilter: ["class"] });

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  // Pointer in canvas NDC; (9, 9) means off canvas and eases the rig back to rest.
  const pointer = new Vector2(9, 9);
  const onMove = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  };
  const onLeave = () => pointer.set(9, 9);
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);

  let frame = 0;
  let last = 0;
  let clock = 0;
  let visible = true;
  let first = true;

  const render = (now: number) => {
    frame = requestAnimationFrame(render);
    const delta = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    clock += delta;

    uniforms.uTime.value += delta;
    uniforms.uMouse.value.lerp(pointer, 0.08);

    const x = Math.abs(pointer.x) > 2 ? 0 : pointer.x;
    const y = Math.abs(pointer.y) > 2 ? 0 : pointer.y;
    rig.rotation.y += (x * 0.25 - rig.rotation.y) * 0.03;
    rig.rotation.x += (-y * 0.06 - rig.rotation.x) * 0.03;

    const t = (clock * 0.28) % 1;
    const s = 0.35 + t * 2.7;
    pulse.scale.set(s, s, s);
    pulseMaterial.opacity = (1 - t) * 0.22;

    renderer.render(scene, camera);
    if (first) {
      first = false;
      onReady();
    }
  };

  const start = () => {
    if (frame || !visible || document.hidden) return;
    last = 0;
    frame = requestAnimationFrame(render);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const viewObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  viewObserver.observe(container);
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);

  start();

  return () => {
    stop();
    viewObserver.disconnect();
    resizeObserver.disconnect();
    themeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    scene.traverse((o) => {
      const obj = o as Partial<Mesh>;
      obj.geometry?.dispose();
      (obj.material as { dispose?: () => void } | undefined)?.dispose?.();
    });
    renderer.dispose();
    renderer.domElement.remove();
  };
}

export default function Sieve({ onReady }: { onReady?: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const ready = useRef(onReady);

  useEffect(() => {
    ready.current = onReady;
  }, [onReady]);

  useEffect(() => {
    if (!container.current) return;
    try {
      return mount(container.current, () => ready.current?.());
    } catch {
      // No WebGL: the hero reads fine without the sieve.
    }
  }, []);

  return <div ref={container} className="size-full" />;
}
