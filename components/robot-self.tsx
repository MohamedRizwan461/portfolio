"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* materials, shared */
function useMaterials(accent: string) {
  return useMemo(
    () => ({
      shell: new THREE.MeshPhysicalMaterial({ color: "#e8ecf1", roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12 }),
      graphite: new THREE.MeshStandardMaterial({ color: "#1a1e24", roughness: 0.38, metalness: 0.65 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#07090c", roughness: 0.08, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 }),
      glow: new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 2.2, toneMapped: false }),
    }),
    [accent],
  );
}
type Mats = ReturnType<typeof useMaterials>;

/** The headshot with its straight-cut chin faded out, so it sits in the collar cleanly. */
function useFace(src: string) {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      ctx.globalCompositeOperation = "destination-in";
      const g = ctx.createLinearGradient(0, img.height * 0.8, 0, img.height);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, img.width, img.height);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setTex(t);
    };
  }, [src]);
  return tex;
}

/** A plane bent slightly around the head, so turning never looks like a cardboard cutout. */
function useCurvedPlane(w: number, h: number, radius: number) {
  return useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h, 32, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setZ(i, -(x * x) / (2 * radius));
    }
    g.computeVertexNormals();
    return g;
  }, [w, h, radius]);
}

function Head({ m, reduce }: { m: Mats; reduce: boolean }) {
  const face = useFace("/images/riz/headshot-cut.png");
  const W = 0.9;
  const H = (0.9 * 766) / 720;
  const plane = useCurvedPlane(W, H, 0.85);
  const g = useRef<THREE.Group>(null);

  useFrame(({ pointer, clock }, dt) => {
    if (!g.current) return;
    const k = 1 - Math.exp(-dt * 3);
    const t = clock.getElapsedTime();
    // looks toward the cursor, with a little idle life when it is still
    const ty = reduce ? 0 : THREE.MathUtils.clamp(pointer.x * 0.45, -0.4, 0.4) + Math.sin(t * 0.5) * 0.04;
    const tx = reduce ? 0 : THREE.MathUtils.clamp(-pointer.y * 0.25, -0.2, 0.2) + Math.sin(t * 0.7) * 0.02;
    g.current.rotation.y += (ty - g.current.rotation.y) * k;
    g.current.rotation.x += (tx - g.current.rotation.x) * k;
  });

  return (
    <group ref={g} position={[0, 2.42, 0]} scale={1.1}>
      {/* back of the head, so there is volume when it turns */}
      <mesh position={[0, 0.0, -0.22]} scale={[0.3, 0.38, 0.24]} material={m.graphite}>
        <sphereGeometry args={[1, 40, 40]} />
      </mesh>

      {face && (
        <mesh geometry={plane} position={[0, 0, 0.12]} renderOrder={2}>
          <meshBasicMaterial map={face} transparent alphaTest={0.02} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* headset band over the hair */}
      <mesh position={[0, -0.1, 0.12]} material={m.shell}>
        <torusGeometry args={[0.43, 0.028, 16, 64, Math.PI]} />
      </mesh>
      {/* ear sensors */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.41, -0.13, 0.08]} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={m.shell}>
            <cylinderGeometry args={[0.105, 0.115, 0.13, 40]} />
          </mesh>
          <mesh position={[0, s * 0.068, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.glow}>
            <torusGeometry args={[0.07, 0.009, 10, 40]} />
          </mesh>
          <mesh position={[0, s * 0.07, 0]} material={m.graphite}>
            <cylinderGeometry args={[0.06, 0.06, 0.01, 32]} />
          </mesh>
        </group>
      ))}
      {/* a small sensor on the crown */}
      <mesh position={[0, 0.34, 0.12]} material={m.graphite}>
        <boxGeometry args={[0.12, 0.035, 0.07]} />
      </mesh>
      <mesh position={[0, 0.34, 0.16]} material={m.glow}>
        <boxGeometry args={[0.06, 0.012, 0.005]} />
      </mesh>
    </group>
  );
}

function Arm({ side, m, reduce }: { side: 1 | -1; m: Mats; reduce: boolean }) {
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const fingers = useRef<THREE.Mesh[]>([]);
  const waving = side === -1;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!shoulder.current || !elbow.current) return;
    if (waving) {
      shoulder.current.rotation.z = side * (reduce ? 2.4 : 2.4 + Math.sin(t * 1.1) * 0.06);
      elbow.current.rotation.z = side * (reduce ? 0.35 : 0.35 + Math.sin(t * 4.2) * 0.3);
    } else {
      // forearm raised toward you, holding the board up to the camera
      shoulder.current.rotation.z = side * 0.22;
      shoulder.current.rotation.x = reduce ? -0.2 : -0.2 + Math.sin(t * 0.8) * 0.04;
      elbow.current.rotation.x = reduce ? -1.9 : -1.9 + Math.sin(t * 0.8 + 0.6) * 0.05;
      elbow.current.rotation.z = side * -0.25;
    }
    const open = reduce ? 0.05 : 0.045 + (Math.sin(t * 1.8) + 1) * 0.012;
    fingers.current.forEach((f, i) => f && (f.position.x = (i ? -1 : 1) * open));
  });

  return (
    <group position={[side * 0.66, 1.62, 0]}>
      <mesh material={m.graphite}>
        <sphereGeometry args={[0.13, 32, 32]} />
      </mesh>
      <group ref={shoulder}>
        <mesh position={[0, -0.3, 0]} material={m.shell}>
          <capsuleGeometry args={[0.085, 0.4, 8, 24]} />
        </mesh>
        <group ref={elbow} position={[0, -0.6, 0]}>
          <mesh material={m.graphite}>
            <sphereGeometry args={[0.09, 28, 28]} />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.glow}>
            <torusGeometry args={[0.092, 0.006, 8, 32]} />
          </mesh>
          <mesh position={[0, -0.27, 0]} material={m.shell}>
            <capsuleGeometry args={[0.07, 0.36, 8, 24]} />
          </mesh>
          {/* gripper */}
          <group position={[0, -0.56, 0]}>
            <mesh material={m.graphite}>
              <cylinderGeometry args={[0.07, 0.08, 0.08, 24]} />
            </mesh>
            {[0, 1].map((i) => (
              <mesh
                key={i}
                ref={(el) => {
                  if (el) fingers.current[i] = el;
                }}
                position={[(i ? -1 : 1) * 0.05, -0.1, 0]}
                material={m.graphite}
              >
                <boxGeometry args={[0.025, 0.13, 0.06]} />
              </mesh>
            ))}
            {!waving && (
              <group position={[0, -0.22, 0]} rotation={[3.67, 0, 0]}>
                {/* the board it is showing you */}
                <RoundedBox args={[0.42, 0.022, 0.3]} radius={0.008} smoothness={2}>
                  <meshStandardMaterial color="#0b3b24" roughness={0.55} />
                </RoundedBox>
                <mesh position={[0, 0.02, 0]}>
                  <boxGeometry args={[0.1, 0.02, 0.1]} />
                  <meshStandardMaterial color="#111317" roughness={0.4} />
                </mesh>
                {[-0.12, 0.12].map((x) => (
                  <mesh key={x} position={[x, 0.014, -0.08]}>
                    <boxGeometry args={[0.05, 0.006, 0.012]} />
                    <meshStandardMaterial color="#c9a45c" metalness={0.9} roughness={0.3} />
                  </mesh>
                ))}
                <mesh position={[0.13, 0.018, 0.09]}>
                  <sphereGeometry args={[0.012, 10, 10]} />
                  <meshBasicMaterial color="#22c55e" toneMapped={false} />
                </mesh>
              </group>
            )}
          </group>
        </group>
      </group>
    </group>
  );
}

function Body({ accent, reduce }: { accent: string; reduce: boolean }) {
  const m = useMaterials(accent);
  const root = useRef<THREE.Group>(null);
  const bars = useRef<THREE.Mesh[]>([]);
  const lidar = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    if (root.current && !reduce) {
      root.current.rotation.y = Math.sin(t * 0.3) * 0.22;
      root.current.position.y = Math.sin(t * 1.4) * 0.012;
    }
    bars.current.forEach((b, i) => {
      if (!b) return;
      const h = reduce ? 0.5 : 0.25 + Math.abs(Math.sin(t * 3 + i * 0.7) * Math.cos(t * 1.3 + i)) * 0.75;
      b.scale.y = h;
      b.position.y = -0.09 + (0.18 * h) / 2;
    });
    if (lidar.current && !reduce) lidar.current.rotation.z += dt * 4;
  });

  return (
    <group ref={root}>
      {/* drive base, after the robot I built */}
      <mesh position={[0, 0.3, 0]} material={m.graphite}>
        <cylinderGeometry args={[0.78, 0.82, 0.2, 64]} />
      </mesh>
      <mesh position={[0, 0.41, 0]} material={m.shell}>
        <cylinderGeometry args={[0.72, 0.78, 0.04, 64]} />
      </mesh>
      <mesh position={[0, 0.33, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.glow}>
        <torusGeometry args={[0.822, 0.008, 8, 96]} />
      </mesh>
      <group position={[0, 0.3, 0.8]}>
        <mesh ref={lidar} rotation={[Math.PI / 2, 0, 0]} material={m.glass}>
          <cylinderGeometry args={[0.07, 0.07, 0.05, 6]} />
        </mesh>
        <mesh position={[0, 0, 0.03]} material={m.glow}>
          <boxGeometry args={[0.08, 0.008, 0.004]} />
        </mesh>
      </group>

      {/* hips and waist */}
      <mesh position={[0, 0.58, 0]} material={m.graphite}>
        <cylinderGeometry args={[0.2, 0.26, 0.3, 48]} />
      </mesh>
      <mesh position={[0, 0.76, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.glow}>
        <torusGeometry args={[0.25, 0.01, 8, 64]} />
      </mesh>

      {/* torso */}
      <mesh position={[0, 1.32, 0]} scale={[1.25, 1, 0.78]} material={m.shell}>
        <capsuleGeometry args={[0.42, 0.34, 16, 48]} />
      </mesh>
      <RoundedBox args={[0.6, 0.36, 0.06]} radius={0.04} smoothness={4} position={[0, 1.4, 0.31]} material={m.glass} />
      <group position={[0, 1.4, 0.345]}>
        {Array.from({ length: 11 }, (_, i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) bars.current[i] = el;
            }}
            position={[-0.225 + i * 0.045, 0, 0]}
            material={m.glow}
          >
            <boxGeometry args={[0.022, 0.18, 0.004]} />
          </mesh>
        ))}
      </group>

      {/* collar */}
      <mesh position={[0, 1.9, 0]} material={m.graphite}>
        <cylinderGeometry args={[0.2, 0.3, 0.12, 48]} />
      </mesh>
      <mesh position={[0, 1.96, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.glow}>
        <torusGeometry args={[0.2, 0.008, 8, 64]} />
      </mesh>

      <Arm side={-1} m={m} reduce={reduce} />
      <Arm side={1} m={m} reduce={reduce} />
      <Head m={m} reduce={reduce} />
    </group>
  );
}

/** Riz as a robot: his face in a headset, one hand waving, the other showing a board, on the base of the robot he built. */
export default function RobotSelf({ accent: requested = "#3fa9ff" }: { accent?: string }) {
  const reduce = useReducedMotion() ?? false;
  // three.js needs a real colour, so read the theme variable when one is passed
  const [accent, setAccent] = useState(requested.startsWith("var(") ? "#3fa9ff" : requested);
  useEffect(() => {
    if (!requested.startsWith("var(")) return setAccent(requested);
    const name = requested.slice(4, -1).trim();
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (v) setAccent(v);
  }, [requested]);

  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 1.8, 5.3], fov: 34 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 6, 5]} intensity={2.2} />
      <directionalLight position={[-4, 3, -3]} intensity={2.5} color={accent} />
      {/* studio reflections, built locally so nothing is fetched */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 3]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 2, 1]} rotation={[0, Math.PI / 2, 0]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={2} color={accent} position={[5, 1, -2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 2, 1]} />
      </Environment>
      <group position={[0, -1.45, 0]}>
        <Body accent={accent} reduce={reduce} />
        <ContactShadows position={[0, 0.2, 0]} opacity={0.7} scale={4} blur={2.4} far={1.2} />
      </group>
    </Canvas>
  );
}
