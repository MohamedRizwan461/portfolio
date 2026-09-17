"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SHELL = "#20242b";
const METAL = "#aab4bf";
const YELLOW = "#f2c230";

function Arm({ side, accent, reduce }: { side: 1 | -1; accent: string; reduce: boolean }) {
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const fingerA = useRef<THREE.Mesh>(null);
  const fingerB = useRef<THREE.Mesh>(null);
  const waving = side === -1;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!shoulder.current || !elbow.current) return;
    if (reduce) {
      shoulder.current.rotation.z = side * (waving ? 2.3 : 0.5);
      elbow.current.rotation.z = side * (waving ? 0.5 : 0.9);
      return;
    }
    if (waving) {
      // a friendly wave
      shoulder.current.rotation.z = side * (2.25 + Math.sin(t * 1.3) * 0.08);
      elbow.current.rotation.z = side * (0.45 + Math.sin(t * 5) * 0.35);
    } else {
      // holding the board up to show it, gripper opening and closing
      shoulder.current.rotation.z = side * (0.55 + Math.sin(t * 0.9) * 0.1);
      shoulder.current.rotation.x = -0.6 + Math.sin(t * 0.9) * 0.1;
      elbow.current.rotation.z = side * (0.95 + Math.sin(t * 0.9 + 1) * 0.12);
    }
    const open = 0.05 + (Math.sin(t * 2.2) + 1) * 0.03;
    if (fingerA.current) fingerA.current.position.x = open;
    if (fingerB.current) fingerB.current.position.x = -open;
  });

  return (
    <group position={[side * 0.62, 1.55, 0]}>
      {/* shoulder actuator */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.17, 0.17, 0.16, 24]} />
        <meshStandardMaterial color={accent} metalness={0.3} roughness={0.4} />
      </mesh>
      <group ref={shoulder}>
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.6, 16]} />
          <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.25} />
        </mesh>
        <group ref={elbow} position={[0, -0.64, 0]}>
          <mesh>
            <sphereGeometry args={[0.11, 20, 20]} />
            <meshStandardMaterial color={SHELL} metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.28, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.52, 16]} />
            <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.25} />
          </mesh>
          {/* gripper */}
          <group position={[0, -0.58, 0]}>
            <mesh>
              <boxGeometry args={[0.2, 0.06, 0.12]} />
              <meshStandardMaterial color={SHELL} />
            </mesh>
            <mesh ref={fingerA} position={[0.06, -0.09, 0]}>
              <boxGeometry args={[0.035, 0.16, 0.08]} />
              <meshStandardMaterial color={accent} />
            </mesh>
            <mesh ref={fingerB} position={[-0.06, -0.09, 0]}>
              <boxGeometry args={[0.035, 0.16, 0.08]} />
              <meshStandardMaterial color={accent} />
            </mesh>
            {!waving && (
              <group position={[0, -0.2, 0]} rotation={[0.3, 0, 0]}>
                {/* the little green board it's proud of */}
                <mesh>
                  <boxGeometry args={[0.34, 0.02, 0.24]} />
                  <meshStandardMaterial color="#0f5a31" roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.03, 0]}>
                  <boxGeometry args={[0.1, 0.04, 0.1]} />
                  <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[0.12, 0.03, 0.07]}>
                  <sphereGeometry args={[0.02, 10, 10]} />
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

function Head({ reduce }: { reduce: boolean }) {
  const face = useTexture("/images/riz/headshot-cut.png");
  face.colorSpace = THREE.SRGBColorSpace;
  const g = useRef<THREE.Group>(null);
  const led = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (g.current && !reduce) {
      g.current.rotation.z = Math.sin(t * 0.8) * 0.06;
      g.current.rotation.y = Math.sin(t * 0.5) * 0.18;
    }
    if (led.current) led.current.opacity = reduce ? 1 : 0.4 + (Math.sin(t * 4) + 1) * 0.3;
  });
  return (
    <group ref={g} position={[0, 2.25, 0]}>
      {/* neck */}
      <mesh position={[0, -0.36, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.2, 16]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* helmet shell behind the face */}
      <mesh position={[0, 0.02, -0.22]} scale={[1, 1.12, 0.7]}>
        <sphereGeometry args={[0.46, 36, 36]} />
        <meshStandardMaterial color={SHELL} metalness={0.35} roughness={0.35} />
      </mesh>
      {/* ear actuators */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.47, 0.02, -0.08]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 0.1, 24]} />
            <meshStandardMaterial color={YELLOW} roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* antenna */}
      <mesh position={[0, 0.62, -0.1]}>
        <cylinderGeometry args={[0.018, 0.018, 0.34, 8]} />
        <meshStandardMaterial color={METAL} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.82, -0.1]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial ref={led} color="#ff4d4f" transparent toneMapped={false} />
      </mesh>
      {/* the face */}
      <mesh position={[0, 0.02, 0.2]} renderOrder={2}>
        <planeGeometry args={[0.8, 0.85]} />
        <meshBasicMaterial map={face} transparent alphaTest={0.05} depthTest={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Body({ accent, reduce }: { accent: string; reduce: boolean }) {
  const root = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Mesh[]>([]);
  const lights = useRef<THREE.MeshBasicMaterial[]>([]);
  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    if (root.current && !reduce) {
      root.current.position.y = Math.sin(t * 1.6) * 0.03;
      root.current.rotation.y = Math.sin(t * 0.35) * 0.35;
    }
    if (!reduce) wheels.current.forEach((w) => w && (w.rotation.x += delta * 1.5));
    lights.current.forEach((m, i) => m && (m.opacity = reduce ? 1 : 0.35 + ((Math.sin(t * 3 - i) + 1) / 2) * 0.65));
  });
  return (
    <group ref={root}>
      {/* torso */}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[1.05, 0.9, 0.6]} />
        <meshStandardMaterial color={SHELL} metalness={0.35} roughness={0.35} />
      </mesh>
      {/* chest panel */}
      <mesh position={[0, 1.38, 0.305]}>
        <planeGeometry args={[0.72, 0.5]} />
        <meshStandardMaterial color="#0d0f12" roughness={0.3} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.24 + i * 0.16, 1.46, 0.31]}>
          <circleGeometry args={[0.035, 16]} />
          <meshBasicMaterial
            ref={(m) => {
              if (m) lights.current[i] = m;
            }}
            color={i === 3 ? "#22c55e" : accent}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.28, 0.31]}>
        <planeGeometry args={[0.5, 0.05]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      {/* waist */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.3, 0.38, 0.22, 24]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* drive base, like the robot I built */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.2, 0.28, 0.9]} />
        <meshStandardMaterial color={accent} roughness={0.5} metalness={0.2} />
      </mesh>
      {[
        [-0.66, 0.3, 0.32],
        [0.66, 0.3, 0.32],
        [-0.66, 0.3, -0.32],
        [0.66, 0.3, -0.32],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p as [number, number, number]}
          rotation={[0, 0, Math.PI / 2]}
          ref={(m) => {
            if (m) wheels.current[i] = m;
          }}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.18, 24]} />
          <meshStandardMaterial color={YELLOW} roughness={0.6} />
        </mesh>
      ))}
      {/* lidar puck */}
      <mesh position={[0, 0.74, 0.36]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 20]} />
        <meshStandardMaterial color="#111" metalness={0.5} />
      </mesh>
      <Arm side={-1} accent={accent} reduce={reduce} />
      <Arm side={1} accent={accent} reduce={reduce} />
      <Head reduce={reduce} />
    </group>
  );
}

/** Riz, as a robot: his face on a helmet, arms waving and holding a board, on the base of the robot he built. */
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
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 1.65, 4.6], fov: 38 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 4]} intensity={2.4} />
      <directionalLight position={[-4, 2, -2]} intensity={0.8} color={accent} />
      <Suspense fallback={null}>
        <group position={[0, -1.25, 0]}>
          <Body accent={accent} reduce={reduce} />
          <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.5, 48]} />
            <meshBasicMaterial color={accent} transparent opacity={0.16} toneMapped={false} />
          </mesh>
        </group>
      </Suspense>
    </Canvas>
  );
}
