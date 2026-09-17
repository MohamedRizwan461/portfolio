"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { beats } from "@/lib/story";
import { useCurvedPlane, useFace } from "@/components/robot-self";

/* ------------------------------------------------------------------ shared */

export const CP0 = 26;
export const GAP = 64;
export const cpX = (k: number) => CP0 + k * GAP;
export const END = cpX(beats.length - 1) + 60;
export const MAX_V = 15;
const LANE = 1.4;

export type Sim = {
  s: number;
  v: number;
  dir: number;
  auto: boolean;
  started: boolean;
  talking: boolean;
  speaking: boolean;
  next: number;
  near: number;
  reduce: boolean;
};

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/* ------------------------------------------------------------------ car */

function useCarMaterials(accent: string) {
  return useMemo(
    () => ({
      // deep metallic paint in the operator colour, not the raw accent
      paint: new THREE.MeshPhysicalMaterial({ color: new THREE.Color(accent).multiplyScalar(0.5), metalness: 0.75, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 }),
      dark: new THREE.MeshStandardMaterial({ color: "#101318", metalness: 0.4, roughness: 0.45 }),
      leather: new THREE.MeshStandardMaterial({ color: "#1b1512", roughness: 0.7 }),
      stitch: new THREE.MeshStandardMaterial({ color: "#3b2a22", roughness: 0.6 }),
      chrome: new THREE.MeshStandardMaterial({ color: "#9aa3ad", metalness: 1, roughness: 0.28 }),
      rubber: new THREE.MeshStandardMaterial({ color: "#0b0c0e", roughness: 0.92 }),
      glass: new THREE.MeshStandardMaterial({ color: "#a9c1d6", metalness: 0, roughness: 0.1, transparent: true, opacity: 0.14, depthWrite: false }),
      head: new THREE.MeshStandardMaterial({ color: "#fff6dc", emissive: "#fff6dc", emissiveIntensity: 3, toneMapped: false }),
      tail: new THREE.MeshStandardMaterial({ color: "#ff2a2a", emissive: "#ff2a2a", emissiveIntensity: 2.4, toneMapped: false }),
      drl: new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 2.4, toneMapped: false }),
      shirt: new THREE.MeshStandardMaterial({ color: "#1c2330", roughness: 0.8 }),
      skin: new THREE.MeshStandardMaterial({ color: "#8a5a3c", roughness: 0.6 }),
      hair: new THREE.MeshStandardMaterial({ color: "#15110e", roughness: 0.85 }),
    }),
    [accent],
  );
}
type CarMats = ReturnType<typeof useCarMaterials>;

/** the side profile of a low roadster, with both wheel arches cut out */
function useSidePanel() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.3, 0.3);
    s.lineTo(-1.92, 0.3);
    s.absarc(-1.45, 0.3, 0.47, Math.PI, 0, true);
    s.lineTo(0.98, 0.3);
    s.absarc(1.45, 0.3, 0.47, Math.PI, 0, true);
    s.lineTo(2.3, 0.3);
    s.quadraticCurveTo(2.46, 0.36, 2.43, 0.52);
    s.quadraticCurveTo(2.36, 0.68, 2.0, 0.71);
    s.lineTo(0.62, 0.84);
    s.lineTo(-1.75, 0.87);
    s.quadraticCurveTo(-2.3, 0.86, -2.37, 0.6);
    s.lineTo(-2.3, 0.3);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.035, bevelSegments: 4, curveSegments: 24 });
    g.translate(0, 0, -0.06);
    return g;
  }, []);
}

function Wheel({ m, position, spin }: { m: CarMats; position: [number, number, number]; spin: RefObject<THREE.Group[]> }) {
  return (
    <group position={position}>
      <group
        ref={(el) => {
          if (el && spin.current && !spin.current.includes(el)) spin.current.push(el);
        }}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.rubber}>
          <cylinderGeometry args={[0.41, 0.41, 0.3, 48]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
          <cylinderGeometry args={[0.29, 0.29, 0.31, 40]} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 5]} position={[0, 0, position[2] > 0 ? 0.16 : -0.16]} material={m.dark}>
            <boxGeometry args={[0.07, 0.52, 0.03]} />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, position[2] > 0 ? 0.165 : -0.165]} material={m.dark}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 20]} />
        </mesh>
      </group>
      {/* brake caliper, does not spin */}
      <mesh position={[0.16, 0.12, position[2] > 0 ? 0.06 : -0.06]} material={m.drl}>
        <boxGeometry args={[0.12, 0.18, 0.06]} />
      </mesh>
    </group>
  );
}

function Driver({ m, sim, camRef }: { m: CarMats; sim: RefObject<Sim>; camRef: RefObject<THREE.Vector3> }) {
  const face = useFace("/images/riz/headshot-cut.png");
  const plane = useCurvedPlane(0.34, (0.34 * 766) / 720, 0.24);
  const head = useRef<THREE.Group>(null);
  const world = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, dt) => {
    const h = head.current;
    const sm = sim.current;
    if (!h || !sm) return;
    const t = clock.getElapsedTime();
    const k = 1 - Math.exp(-dt * 3.2);
    h.getWorldPosition(world);
    const cam = camRef.current;
    // on the road he watches it; when he talks he turns to you
    let yaw = Math.PI / 2 + Math.sin(t * 0.45) * 0.12;
    let pitch = Math.sin(t * 1.7) * 0.015;
    if (sm.talking && cam) {
      yaw = Math.atan2(cam.x - world.x, cam.z - world.z);
      pitch = sm.speaking && !sm.reduce ? Math.sin(t * 7) * 0.035 - 0.03 : -0.03;
    }
    h.rotation.y += (yaw - h.rotation.y) * k;
    h.rotation.x += (pitch - h.rotation.x) * k;
  });

  return (
    <group position={[-0.42, 0, 0.44]}>
      {/* torso and arms to the wheel */}
      <mesh position={[-0.02, 1.02, 0]} rotation={[0, 0, 0.18]} material={m.shirt}>
        <capsuleGeometry args={[0.19, 0.3, 8, 20]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[0.27, 1.07, s * 0.16]} rotation={[0, 0, -1.2]} material={m.shirt}>
            <capsuleGeometry args={[0.055, 0.4, 6, 12]} />
          </mesh>
          <mesh position={[0.62, 0.99, s * 0.12]} material={m.skin}>
            <sphereGeometry args={[0.05, 16, 16]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.02, 1.33, 0]} material={m.skin}>
        <cylinderGeometry args={[0.055, 0.065, 0.14, 16]} />
      </mesh>
      <group ref={head} position={[0.02, 1.53, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.01, -0.07]} scale={[0.145, 0.175, 0.11]} material={m.hair}>
          <sphereGeometry args={[1, 32, 32]} />
        </mesh>
        {face && (
          <mesh geometry={plane} position={[0, 0.0, 0.13]} renderOrder={2}>
            <meshBasicMaterial map={face} transparent alphaTest={0.02} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function Car({ accent, sim, camRef }: { accent: string; sim: RefObject<Sim>; camRef: RefObject<THREE.Vector3> }) {
  const m = useCarMaterials(accent);
  const side = useSidePanel();
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group[]>([]);
  const pool = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(40, 64, 4, 90, 64, 150);
    g.addColorStop(0, "rgba(255,240,205,0.55)");
    g.addColorStop(0.5, "rgba(255,240,205,0.16)");
    g.addColorStop(1, "rgba(255,240,205,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  const glass = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.62, 1.74);
    return g;
  }, []);

  useFrame(({ clock }, dt) => {
    const sm = sim.current;
    if (!root.current || !sm) return;
    root.current.position.x = sm.s;
    const t = clock.getElapsedTime();
    const speed = Math.abs(sm.v) / MAX_V;
    if (body.current) {
      body.current.position.y = sm.reduce ? 0 : Math.sin(t * 13) * 0.006 * speed + Math.sin(t * 2.1) * 0.003;
      body.current.rotation.z += ((-sm.v * 0.0016) - body.current.rotation.z) * (1 - Math.exp(-dt * 4));
    }
    wheels.current.forEach((w) => (w.rotation.z -= (sm.v * dt) / 0.41));
  });

  return (
    <group ref={root} position={[0, 0, LANE]}>
      <group ref={body}>
        {/* shell */}
        <mesh geometry={side} position={[0, 0, 0.9]} material={m.paint} />
        <mesh geometry={side} position={[0, 0, -0.9]} material={m.paint} />
        <RoundedBox args={[1.5, 0.07, 1.84]} radius={0.03} smoothness={4} position={[1.34, 0.77, 0]} rotation={[0, 0, -0.095]} material={m.paint} />
        <RoundedBox args={[0.34, 0.42, 1.9]} radius={0.12} smoothness={4} position={[2.25, 0.5, 0]} material={m.paint} />
        <RoundedBox args={[1.15, 0.07, 1.84]} radius={0.03} smoothness={4} position={[-1.72, 0.86, 0]} material={m.paint} />
        <RoundedBox args={[0.3, 0.5, 1.9]} radius={0.12} smoothness={4} position={[-2.22, 0.58, 0]} material={m.paint} />
        <mesh position={[0, 0.34, 0]} material={m.dark}>
          <boxGeometry args={[4.3, 0.06, 1.8]} />
        </mesh>
        {/* chrome beltline */}
        {[-0.97, 0.97].map((z) => (
          <mesh key={z} position={[-0.55, 0.9, z]} material={m.chrome}>
            <boxGeometry args={[2.5, 0.018, 0.02]} />
          </mesh>
        ))}
        {/* grille, lights */}
        <RoundedBox args={[0.05, 0.14, 1.1]} radius={0.02} position={[2.43, 0.4, 0]} material={m.dark} />
        {[-0.62, 0.62].map((z) => (
          <RoundedBox key={z} args={[0.06, 0.07, 0.44]} radius={0.02} position={[2.4, 0.6, z]} rotation={[0, z > 0 ? 0.2 : -0.2, 0]} material={m.head} />
        ))}
        <mesh position={[2.38, 0.53, 0]} material={m.drl}>
          <boxGeometry args={[0.04, 0.012, 1.5]} />
        </mesh>
        <mesh position={[-2.38, 0.74, 0]} material={m.tail}>
          <boxGeometry args={[0.05, 0.05, 1.6]} />
        </mesh>
        {/* cockpit: inner doors, dash, windshield, seats, wheel */}
        {[-0.8, 0.8].map((z) => (
          <mesh key={z} position={[-0.35, 0.6, z]} material={m.leather}>
            <boxGeometry args={[2.3, 0.44, 0.04]} />
          </mesh>
        ))}
        <RoundedBox args={[0.36, 0.2, 1.72]} radius={0.06} smoothness={4} position={[0.5, 0.8, 0]} material={m.dark} />
        <group position={[0.45, 1.1, 0]} rotation={[0, 0, 0.62]}>
          <mesh geometry={glass} rotation={[0, Math.PI / 2, 0]} material={m.glass} />
          <mesh position={[0, 0.31, 0]} material={m.chrome}>
            <boxGeometry args={[0.03, 0.03, 1.76]} />
          </mesh>
          {[-0.87, 0.87].map((z) => (
            <mesh key={z} position={[0, 0, z]} material={m.chrome}>
              <boxGeometry args={[0.03, 0.64, 0.03]} />
            </mesh>
          ))}
        </group>
        {[-0.44, 0.44].map((z) => (
          <group key={z}>
            <RoundedBox args={[0.56, 0.15, 0.54]} radius={0.06} smoothness={4} position={[-0.38, 0.5, z]} material={m.leather} />
            <RoundedBox args={[0.16, 0.66, 0.52]} radius={0.07} smoothness={4} position={[-0.72, 0.84, z]} rotation={[0, 0, 0.16]} material={m.leather} />
            <mesh position={[-1.25, 0.93, z]} rotation={[0, 0, Math.PI / 2 - 0.12]} scale={[0.8, 1, 0.7]} material={m.paint}>
              <capsuleGeometry args={[0.14, 0.55, 8, 24]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0.24, 0.98, 0.44]} rotation={[0, Math.PI / 2, 0.5]} material={m.dark}>
          <torusGeometry args={[0.16, 0.025, 12, 40]} />
        </mesh>
        {/* mirrors */}
        {[-1, 1].map((s) => (
          <RoundedBox key={s} args={[0.16, 0.1, 0.1]} radius={0.03} position={[0.55, 0.98, s * 1.02]} material={m.paint} />
        ))}
        <Driver m={m} sim={sim} camRef={camRef} />
      </group>
      <Wheel m={m} position={[1.45, 0.41, 0.86]} spin={wheels} />
      <Wheel m={m} position={[1.45, 0.41, -0.86]} spin={wheels} />
      <Wheel m={m} position={[-1.45, 0.41, 0.86]} spin={wheels} />
      <Wheel m={m} position={[-1.45, 0.41, -0.86]} spin={wheels} />
      {/* headlight throw on the road, faked with a soft pool so it costs nothing */}
      <mesh position={[7.2, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 4.2]} />
        <meshBasicMaterial map={pool} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ world */

function Road() {
  const dashes = useMemo(() => {
    const g = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 0.01, 0.14), new THREE.MeshStandardMaterial({ color: "#c9cfd6", emissive: "#c9cfd6", emissiveIntensity: 0.15 }), Math.ceil((END + 80) / 5));
    const mtx = new THREE.Matrix4();
    for (let i = 0; i < g.count; i++) {
      mtx.setPosition(-40 + i * 5, 0.012, 0);
      g.setMatrixAt(i, mtx);
    }
    return g;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[END / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[END + 200, 8.5]} />
        <meshStandardMaterial color="#101318" roughness={0.78} metalness={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[END / 2, -0.01, 0]}>
        <planeGeometry args={[END + 400, 400]} />
        <meshStandardMaterial color="#07090d" roughness={1} />
      </mesh>
      {[-4.25, 4.25].map((z) => (
        <mesh key={z} position={[END / 2, 0.05, z]}>
          <boxGeometry args={[END + 200, 0.1, 0.12]} />
          <meshStandardMaterial color="#2a313b" />
        </mesh>
      ))}
      <primitive object={dashes} />
    </group>
  );
}

function Lamps() {
  const n = Math.ceil((END + 80) / 16);
  const poles = useMemo(() => {
    const g = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.08, 6, 8), new THREE.MeshStandardMaterial({ color: "#1c222b", metalness: 0.6, roughness: 0.4 }), n);
    const mtx = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      mtx.setPosition(-30 + i * 16, 3, -5.2);
      g.setMatrixAt(i, mtx);
    }
    return g;
  }, [n]);
  const heads = useMemo(() => {
    const g = new THREE.InstancedMesh(new THREE.BoxGeometry(1.1, 0.08, 0.26), new THREE.MeshStandardMaterial({ color: "#ffe6ad", emissive: "#ffe6ad", emissiveIntensity: 3, toneMapped: false }), n);
    const mtx = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      mtx.setPosition(-30 + i * 16 + 0.4, 6, -4.7);
      g.setMatrixAt(i, mtx);
    }
    return g;
  }, [n]);
  return (
    <group>
      <primitive object={poles} />
      <primitive object={heads} />
    </group>
  );
}

function City() {
  const mesh = useMemo(() => {
    const r = rng(11);
    const count = (typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? 8 : 8) <= 4 ? 180 : 420;
    const g = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: "#0d1119", roughness: 0.9 }), count);
    const mtx = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < count; i++) {
      const h = 6 + r() * 34;
      const w = 3 + r() * 7;
      mtx.compose(new THREE.Vector3(-60 + r() * (END + 160), h / 2, -55 - r() * 50), q, new THREE.Vector3(w, h, 3 + r() * 6));
      g.setMatrixAt(i, mtx);
    }
    return g;
  }, []);
  const windows = useMemo(() => {
    const r = rng(23);
    const count = (typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? 8 : 8) <= 4 ? 350 : 900;
    const g = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.5, 0.7), new THREE.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false }), count);
    const mtx = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      mtx.setPosition(-60 + r() * (END + 160), 2 + r() * 26, -52);
      g.setMatrixAt(i, mtx);
    }
    return g;
  }, []);
  return (
    <group>
      <primitive object={mesh} />
      <primitive object={windows} />
    </group>
  );
}

function Stars() {
  const geo = useMemo(() => {
    const r = rng(3);
    const n = 1400;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = -100 + r() * (END + 250);
      arr[i * 3 + 1] = 25 + r() * 90;
      arr[i * 3 + 2] = -60 - r() * 120;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#cfd8e3" size={0.35} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

/** one landmark per chapter, standing behind the road */
function Landmark({ k, accent, done }: { k: number; accent: string; done: boolean }) {
  const x = cpX(k) + 6;
  const glow = useMemo(() => new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 2, toneMapped: false }), [accent]);
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a202a", roughness: 0.8, metalness: 0.1 }), []);
  const light = useMemo(() => new THREE.MeshStandardMaterial({ color: "#dfe7ef", emissive: "#dfe7ef", emissiveIntensity: 1.4, toneMapped: false }), []);
  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.35;
  });
  const b = beats[k];

  const model = (() => {
    switch (b.id) {
      case "biology":
        return (
          <group ref={spin} position={[0, 1, 0]}>
            {Array.from({ length: 44 }, (_, i) => {
              const y = i * 0.32;
              const a = i * 0.42;
              return (
                <group key={i} position={[0, y, 0]} rotation={[0, a, 0]}>
                  <mesh position={[1.3, 0, 0]} material={glow}>
                    <sphereGeometry args={[0.16, 16, 16]} />
                  </mesh>
                  <mesh position={[-1.3, 0, 0]} material={light}>
                    <sphereGeometry args={[0.16, 16, 16]} />
                  </mesh>
                  {i % 2 === 0 && (
                    <mesh rotation={[0, 0, Math.PI / 2]} material={stone}>
                      <cylinderGeometry args={[0.04, 0.04, 2.6, 8]} />
                    </mesh>
                  )}
                </group>
              );
            })}
          </group>
        );
      case "electronics":
        return (
          <group>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <mesh key={i} position={[-3, 0.9 + i * 1.7, 0]} material={i % 2 ? stone : glow}>
                <boxGeometry args={[5 - i * 0.6, i % 2 ? 1.7 : 0.12, 3 - i * 0.3]} />
              </mesh>
            ))}
            <mesh position={[5, 3, 0]} material={stone}>
              <boxGeometry args={[9, 6, 4]} />
            </mesh>
            {Array.from({ length: 16 }, (_, i) => (
              <mesh key={i} position={[1.4 + (i % 8) * 1, 1.6 + Math.floor(i / 8) * 2.4, 2.02]} material={i % 3 === 0 ? glow : light}>
                <planeGeometry args={[0.5, 0.9]} />
              </mesh>
            ))}
          </group>
        );
      case "assistive":
        return (
          <group position={[0, 0, 0]} scale={2.2}>
            <mesh position={[0, 3.1, 0]} rotation={[0, 0, 0.08]} material={light}>
              <capsuleGeometry args={[0.42, 1.8, 8, 20]} />
            </mesh>
            <mesh position={[0.25, 0.9, 0]} rotation={[0, 0, -0.18]} material={light}>
              <capsuleGeometry args={[0.3, 1.8, 8, 20]} />
            </mesh>
            <mesh position={[0.1, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={glow}>
              <cylinderGeometry args={[0.26, 0.26, 1.1, 24]} />
            </mesh>
            {[3.6, 2.6, 1.4, 0.4].map((y) => (
              <mesh key={y} position={[y > 2 ? 0.02 : 0.2, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={glow}>
                <torusGeometry args={[y > 2 ? 0.5 : 0.38, 0.05, 8, 32]} />
              </mesh>
            ))}
            <mesh position={[0.72, 2.3, 0.3]} rotation={[0, 0, 0.2]} material={stone}>
              <cylinderGeometry args={[0.1, 0.1, 1.6, 16]} />
            </mesh>
          </group>
        );
      case "recognition":
        return (
          <group>
            <mesh position={[-2, 4.5, 0]} rotation={[0, Math.PI / 4, 0]} material={stone}>
              <coneGeometry args={[6.4, 9, 4]} />
            </mesh>
            <mesh position={[7, 3, -4]} rotation={[0, Math.PI / 4, 0]} material={stone}>
              <coneGeometry args={[4.2, 6, 4]} />
            </mesh>
            <group position={[-2, 10.6, 0]} ref={spin}>
              <mesh material={glow}>
                <cylinderGeometry args={[0.9, 0.35, 1.3, 32, 1, true]} />
              </mesh>
              <mesh position={[0, -1, 0]} material={glow}>
                <cylinderGeometry args={[0.12, 0.12, 0.9, 12]} />
              </mesh>
              <mesh position={[0, -1.5, 0]} material={glow}>
                <cylinderGeometry args={[0.5, 0.5, 0.15, 24]} />
              </mesh>
            </group>
          </group>
        );
      case "pivot":
        return (
          <group>
            <group position={[0, 12, 6]} rotation={[0, 0, 0.1]}>
              <mesh rotation={[0, 0, Math.PI / 2]} material={light}>
                <capsuleGeometry args={[0.5, 5, 8, 20]} />
              </mesh>
              <mesh position={[0.3, 0, 0]} material={light}>
                <boxGeometry args={[1.2, 0.08, 7]} />
              </mesh>
              <mesh position={[-2.6, 0.8, 0]} material={glow}>
                <boxGeometry args={[0.8, 1.4, 0.08]} />
              </mesh>
            </group>
            {/* the rover and its obstacle */}
            <group position={[-1, 0, 2]}>
              <RoundedBox args={[1.6, 0.5, 1.2]} radius={0.12} position={[0, 0.45, 0]} material={light} />
              <mesh position={[0, 0.8, 0]} material={glow}>
                <cylinderGeometry args={[0.2, 0.2, 0.18, 20]} />
              </mesh>
              <mesh position={[2.4, 0.6, 0.3]} material={stone}>
                <cylinderGeometry args={[0.18, 0.18, 1.2, 20]} />
              </mesh>
            </group>
          </group>
        );
      case "vehicles":
        return (
          <group>
            <mesh position={[0, 14, -4]} material={stone}>
              <boxGeometry args={[4, 28, 4]} />
            </mesh>
            <mesh position={[0, 29.5, -4]} material={stone}>
              <boxGeometry args={[2.6, 3, 2.6]} />
            </mesh>
            {[-0.8, 0.8].map((dx) => (
              <mesh key={dx} position={[dx, 33, -4]} material={glow}>
                <cylinderGeometry args={[0.06, 0.06, 5, 8]} />
              </mesh>
            ))}
            <mesh position={[6, 9, -2]} material={stone}>
              <boxGeometry args={[5, 18, 4]} />
            </mesh>
            <mesh position={[-6, 11, -1]} material={stone}>
              <boxGeometry args={[4, 22, 4]} />
            </mesh>
            {Array.from({ length: 30 }, (_, i) => (
              <mesh key={i} position={[-1.2 + (i % 3) * 1.2, 3 + Math.floor(i / 3) * 2.6, -1.98]} material={i % 5 === 0 ? glow : light}>
                <planeGeometry args={[0.6, 1]} />
              </mesh>
            ))}
          </group>
        );
      default:
        return (
          <group>
            <mesh position={[4, 2, -20]} material={glow}>
              <sphereGeometry args={[9, 48, 48]} />
            </mesh>
          </group>
        );
    }
  })();

  return (
    <group position={[x, 0, -13]}>
      {model}
      <group position={[-6, 0, 8.6]}>
        <mesh position={[0, 2.4, 0]}>
          <boxGeometry args={[0.12, 4.8, 0.12]} />
          <meshStandardMaterial color={done ? "#22c55e" : accent} emissive={done ? "#22c55e" : accent} emissiveIntensity={2} toneMapped={false} />
        </mesh>
        <Html position={[0, 5.4, 0]} center distanceFactor={14} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div className="text-center whitespace-nowrap select-none">
            <div className="font-mono text-[13px] tracking-[0.2em]" style={{ color: done ? "#22c55e" : accent }}>
              {done ? "✓ " : ""}
              {b.n}
            </div>
            <div className="text-[18px] font-light tracking-tight text-white">{b.label}</div>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ rig */

function Rig({ sim, camRef, onCheckpoint, onNear }: { sim: RefObject<Sim>; camRef: RefObject<THREE.Vector3>; onCheckpoint: (k: number) => void; onNear: (k: number) => void }) {
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(0, 1, LANE), []);
  const want = useMemo(() => new THREE.Vector3(), []);
  const wantLook = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.position.set(8, 3, LANE + 9);
  }, [camera]);

  useFrame((_, rawDt) => {
    const sm = sim.current;
    if (!sm) return;
    const dt = Math.min(0.1, rawDt);

    // drive: ease toward the target speed, brake smoothly into the next stop
    const target = sm.talking || !sm.started ? 0 : sm.auto ? MAX_V * 0.72 : sm.dir * MAX_V;
    sm.v += (target - sm.v) * (1 - Math.exp(-dt * (Math.abs(target) < Math.abs(sm.v) ? 2.6 : 1.4)));
    const k = sm.next;
    if (k < beats.length && sm.v > 0) {
      const d = cpX(k) - sm.s;
      const cap = Math.sqrt(Math.max(0, 2 * 9 * d));
      if (sm.v > cap) sm.v = cap;
      if (d < 0.04) {
        sm.s = cpX(k);
        sm.v = 0;
        sm.next = k + 1;
        onCheckpoint(k);
      }
    }
    sm.s = Math.max(0, Math.min(END, sm.s + sm.v * dt));

    const near = Math.max(0, Math.min(beats.length - 1, Math.round((sm.s - CP0) / GAP)));
    if (near !== sm.near) {
      sm.near = near;
      onNear(near);
    }

    // camera: a front three-quarter chase, and a close two-shot when he talks
    const narrow = size.width < size.height;
    if (sm.talking) {
      want.set(sm.s + (narrow ? 3.4 : 2.9), 1.85, LANE + (narrow ? 5.2 : 3.9));
      wantLook.set(sm.s - 0.25, narrow ? 1.25 : 1.35, LANE + 0.1);
    } else {
      const lead = sm.v * 0.12;
      want.set(sm.s + 6.8 + lead, 2.9, LANE + (narrow ? 11 : 8.2));
      wantLook.set(sm.s + 0.6 + lead * 0.5, 0.9, LANE - 0.4);
    }
    const kc = 1 - Math.exp(-dt * (sm.talking ? 1.8 : 2.4));
    camera.position.lerp(want, sm.reduce ? 1 : kc);
    look.lerp(wantLook, sm.reduce ? 1 : kc);
    camera.lookAt(look);
    camRef.current?.copy(camera.position);
  });
  return null;
}

export function CruiseScene({
  sim,
  accent,
  visited,
  onCheckpoint,
  onNear,
}: {
  sim: RefObject<Sim>;
  accent: string;
  visited: number[];
  onCheckpoint: (k: number) => void;
  onNear: (k: number) => void;
}) {
  const camRef = useRef(new THREE.Vector3());
  return (
    <Canvas dpr={[1, 1.6]} camera={{ fov: 38, near: 0.1, far: 400 }} gl={{ antialias: true, powerPreference: "high-performance" }} onCreated={({ gl }) => gl.setClearColor("#05070b")}>
      <fog attach="fog" args={["#05070b", 28, 120]} />
      {/* a cool night: neutral key, a soft blue rim, city reflections in the paint */}
      <hemisphereLight args={["#9fb4cc", "#06080b", 0.45]} />
      <directionalLight position={[18, 26, 22]} intensity={1.5} color="#e6eef8" />
      <directionalLight position={[-14, 6, -18]} intensity={0.8} color="#7f9dff" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[0, 7, 4]} scale={[16, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-9, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[12, 1.5, 1]} color="#cfe0ff" />
        <Lightformer form="rect" intensity={0.8} position={[9, 3, -4]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 3, 1]} color="#ffd9a8" />
      </Environment>
      <Stars />
      <City />
      <Road />
      <Lamps />
      {beats.map((_, k) => (
        <Landmark key={k} k={k} accent={accent} done={visited.includes(k)} />
      ))}
      <Car accent={accent} sim={sim} camRef={camRef} />
      <Rig sim={sim} camRef={camRef} onCheckpoint={onCheckpoint} onNear={onNear} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.92} luminanceSmoothing={0.12} radius={0.65} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  );
}
