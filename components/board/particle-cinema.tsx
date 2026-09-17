"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { chipBoard, core, dust, fit, halo, rng, roboticArm, textCloud, vehicle, type Cloud } from "@/lib/particle-shapes";

export type Cue = "idle" | "core" | "chip" | "arm" | "car" | "name" | "dust";

type Look = { dur: number; turb: number; fade: number; pulse: number; spin: number; drift: number };
const LOOK: Record<Cue, Look> = {
  idle: { dur: 0.001, turb: 0, fade: 0.75, pulse: 0.15, spin: 1, drift: 0.05 },
  core: { dur: 0.75, turb: 0.5, fade: 1, pulse: 0, spin: 0.3, drift: 0 },
  chip: { dur: 1.15, turb: 1.6, fade: 1, pulse: 1, spin: 1, drift: 0.008 },
  arm: { dur: 1.05, turb: 1.3, fade: 1, pulse: 0.45, spin: 1, drift: 0.008 },
  car: { dur: 1.05, turb: 1.3, fade: 1, pulse: 0.6, spin: 1, drift: 0.008 },
  name: { dur: 1.2, turb: 0.9, fade: 1, pulse: 0, spin: 0, drift: 0 },
  dust: { dur: 1.7, turb: 1.8, fade: 0.3, pulse: 0.1, spin: 0.25, drift: 0.05 },
};

const vertex = /* glsl */ `
uniform float uTime, uMix, uSize, uDpr, uSpin, uTurb, uPulse, uFade, uDrift;
uniform vec3 uColorA, uColorB;
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec4 aRand;
varying float vAlpha;
varying vec3 vColor;
float ease(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }
void main() {
  float p = clamp(uMix * 1.35 - aRand.x * 0.35, 0.0, 1.0);
  vec3 pos = mix(aFrom, aTo, ease(p));
  float mid = sin(p * 3.14159);
  vec3 swirl = vec3(
    sin(uTime * 1.3 + aRand.y * 20.0 + pos.y * 1.7),
    cos(uTime * 1.1 + aRand.z * 20.0 + pos.x * 1.3),
    sin(uTime * 0.9 + aRand.w * 20.0 + pos.z * 1.5));
  pos += swirl * (mid * uTurb * (0.4 + aRand.y) + uDrift * (0.5 + aRand.z) * 6.0);
  float c = cos(uSpin), s = sin(uSpin);
  pos = vec3(c * pos.x + s * pos.z, pos.y, -s * pos.x + c * pos.z);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float wave = pow(0.5 + 0.5 * sin(length(pos.xy) * 2.2 - uTime * 4.5 + aRand.x * 0.6), 10.0) * uPulse;
  gl_PointSize = uSize * (0.55 + aRand.z * 0.9) * (1.0 + wave * 0.9) * uDpr * (14.0 / -mv.z);
  float twinkle = 0.8 + 0.2 * sin(uTime * 3.0 + aRand.w * 40.0);
  vColor = mix(uColorA, uColorB, clamp(aRand.y * 0.55 + wave, 0.0, 1.0));
  vAlpha = uFade * twinkle * (0.5 + wave * 1.4);
}`;

const fragment = /* glsl */ `
varying float vAlpha;
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vColor * 1.5, a * a * vAlpha);
}`;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function Particles({ cue, reduce, accent }: { cue: Cue; reduce: boolean; accent: string }) {
  const { viewport, size, clock, camera } = useThree();
  const n = size.width < 768 ? 15000 : 32000;
  const vw = viewport.width;
  const vh = viewport.height;

  // shapes are built once for this particle count; resizing mid-intro keeps them
  const shapes = useMemo(() => {
    const r = rng(3);
    const wide = vw / vh > 1;
    const maxW = vw * (wide ? 0.6 : 0.88);
    const maxH = vh * (wide ? 0.62 : 0.42);
    return {
      idle: halo(n, r, Math.min(vw, vh) * 0.3, vw, vh),
      core: core(n, r),
      chip: fit(chipBoard(n, r), maxW, maxH),
      arm: fit(roboticArm(n, r), maxW * 0.75, maxH),
      car: fit(vehicle(n, r), maxW, maxH),
      dust: dust(n, r, vw, vh),
    } satisfies Record<Exclude<Cue, "name">, Cloud>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const nameCloud = useRef<Cloud | null>(null);
  const buildName = () => {
    const narrow = vw < 7.5;
    const lines = narrow ? ["MOHAMED", "RIZWAN", "AMEER JOHN"] : ["MOHAMED RIZWAN", "AMEER JOHN"];
    const family = getComputedStyle(document.body).fontFamily || "sans-serif";
    return textCloud(n, rng(9), lines, family, vw * (narrow ? 0.84 : 0.74), vh * (narrow ? 0.3 : 0.34));
  };
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) nameCloud.current = buildName();
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const first = useRef(cue);
  const geo = useMemo(() => {
    const start = shapes[first.current === "name" ? "dust" : first.current];
    const g = new THREE.BufferGeometry();
    const rand = new Float32Array(n * 4);
    for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
    g.setAttribute("position", new THREE.BufferAttribute(start.slice(), 3));
    g.setAttribute("aFrom", new THREE.BufferAttribute(start.slice(), 3));
    g.setAttribute("aTo", new THREE.BufferAttribute(start.slice(), 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));
    return g;
  }, [shapes, n]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMix: { value: 1 },
          uSize: { value: n < 20000 ? 2.7 : 2.6 },
          uDpr: { value: 1 },
          uSpin: { value: 0 },
          uTurb: { value: 0 },
          uPulse: { value: LOOK[first.current].pulse },
          uFade: { value: 0 },
          uDrift: { value: LOOK[first.current].drift },
          uColorA: { value: new THREE.Color("#d9e6ff") },
          uColorB: { value: new THREE.Color(accent) },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n],
  );

  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);

  const morph = useRef({ start: -10, dur: 1 });
  const look = useRef<Look>(LOOK[first.current]);
  const spinAmp = useRef(LOOK[first.current].spin);
  const last = useRef<Cue>(first.current);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    if (cue === last.current) return;
    last.current = cue;
    const target = cue === "name" ? (nameCloud.current ??= buildName()) : shapes[cue];
    const from = geo.getAttribute("aFrom").array as Float32Array;
    const to = geo.getAttribute("aTo").array as Float32Array;
    const rand = geo.getAttribute("aRand").array as Float32Array;
    // start from wherever each particle is right now, so a skip never jumps
    const m = Math.min(1, (clock.elapsedTime - morph.current.start) / morph.current.dur);
    for (let i = 0; i < n; i++) {
      const e = ease(Math.min(1, Math.max(0, m * 1.35 - rand[i * 4] * 0.35)));
      for (let j = 0; j < 3; j++) from[i * 3 + j] += (to[i * 3 + j] - from[i * 3 + j]) * e;
    }
    to.set(target);
    geo.getAttribute("aFrom").needsUpdate = true;
    geo.getAttribute("aTo").needsUpdate = true;
    look.current = LOOK[cue];
    morph.current = { start: clock.elapsedTime, dur: reduce ? 0.001 : LOOK[cue].dur };
    mat.uniforms.uTurb.value = LOOK[cue].turb;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cue]);

  useFrame((state, dt) => {
    const u = mat.uniforms;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-dt * 2.6);
    u.uTime.value = reduce ? 0 : t;
    u.uDpr.value = state.viewport.dpr;
    u.uMix.value = Math.min(1, (t - morph.current.start) / morph.current.dur);
    u.uFade.value += (look.current.fade - u.uFade.value) * k;
    u.uPulse.value += (look.current.pulse - u.uPulse.value) * k;
    u.uDrift.value += (look.current.drift - u.uDrift.value) * k;
    spinAmp.current += (look.current.spin - spinAmp.current) * k;
    u.uSpin.value = reduce ? 0 : Math.sin(t * 0.42) * 0.5 * spinAmp.current;
    const px = reduce ? 0 : pointer.current.x * 0.7;
    const py = reduce ? 0 : pointer.current.y * 0.45;
    camera.position.x += (px - camera.position.x) * k;
    camera.position.y += (py - camera.position.y) * k;
    camera.lookAt(0, 0, 0);
  });

  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

/** Full-screen particle field: the intro's stage and the backdrop behind the operator picker. */
export function ParticleCinema({ cue, reduce, accent = "#3fa9ff" }: { cue: Cue; reduce: boolean; accent?: string }) {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 14], fov: 35 }}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor("#04060a")}
      >
        <Particles cue={cue} reduce={reduce} accent={accent} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.18} luminanceSmoothing={0.35} radius={0.72} />
          <Vignette offset={0.25} darkness={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
