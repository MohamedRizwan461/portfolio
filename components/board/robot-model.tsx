"use client";

import type { Ref } from "react";
import * as THREE from "three";

export type Accessory = "tie" | "probe" | "eyes" | null;

type Props = {
  plate?: string;
  accessory?: Accessory;
  showCone?: boolean;
  coneColor?: string;
  wheelRef?: (index: number, mesh: THREE.Mesh | null) => void;
  coneRef?: Ref<THREE.Mesh>;
};

const WHEELS: [number, number, number][] = [
  [-0.42, 0.14, 0.3],
  [0.42, 0.14, 0.3],
  [-0.42, 0.14, -0.3],
  [0.42, 0.14, -0.3],
];

/** Riz's robot: dark chassis, a coloured battery plate, ultrasonic eyes and yellow wheels, like the real one. */
export function RobotModel({ plate = "#e25b2c", accessory = null, showCone = true, coneColor = "#27e0c4", wheelRef, coneRef }: Props) {
  return (
    <group>
      {/* chassis */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[0.66, 0.14, 0.95]} />
        <meshStandardMaterial color="#232a34" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* battery plate, coloured per operator */}
      <mesh position={[0, 0.39, -0.05]}>
        <boxGeometry args={[0.5, 0.1, 0.55]} />
        <meshStandardMaterial color={plate} roughness={0.55} emissive={plate} emissiveIntensity={0.18} />
      </mesh>
      {/* ultrasonic eyes */}
      {[-0.13, 0.13].map((x) => (
        <group key={x} position={[x, 0.32, 0.5]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.08, 20]} />
            <meshStandardMaterial color="#d7dde4" metalness={0.8} roughness={0.2} />
          </mesh>
          {accessory === "eyes" && (
            <>
              <mesh position={[0, 0, 0.05]}>
                <sphereGeometry args={[0.065, 16, 16]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} />
              </mesh>
              <mesh position={[0.01, 0.01, 0.105]}>
                <sphereGeometry args={[0.03, 12, 12]} />
                <meshStandardMaterial color="#0b0f14" roughness={0.2} />
              </mesh>
            </>
          )}
        </group>
      ))}
      {/* status led */}
      <mesh position={[0.2, 0.46, -0.25]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshBasicMaterial color="#27e0c4" toneMapped={false} />
      </mesh>

      {accessory === "tie" && (
        <group position={[0, 0.22, 0.49]}>
          {/* knot and blade, because recruiters deserve a robot that dressed up */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.08, 0.05, 0.03]} />
            <meshStandardMaterial color="#d8263a" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.09, 0.005]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.1, 0.1, 0.02]} />
            <meshStandardMaterial color="#d8263a" roughness={0.5} />
          </mesh>
        </group>
      )}

      {accessory === "probe" && (
        <group position={[-0.18, 0.44, -0.2]}>
          {/* an oscilloscope probe for an antenna */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.44, 10]} />
            <meshStandardMaterial color="#1c2128" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.46, 0]}>
            <sphereGeometry args={[0.055, 14, 14]} />
            <meshBasicMaterial color="#27e0c4" toneMapped={false} />
          </mesh>
        </group>
      )}

      {WHEELS.map((p, i) => (
        <mesh key={i} position={p} rotation={[0, 0, Math.PI / 2]} ref={(m) => wheelRef?.(i, m)}>
          <cylinderGeometry args={[0.14, 0.14, 0.12, 18]} />
          <meshStandardMaterial color="#f2c230" roughness={0.6} />
        </mesh>
      ))}

      {showCone && (
        <mesh ref={coneRef} position={[0, 0.2, 1.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.75, 1.7, 32, 1, true]} />
          <meshBasicMaterial color={coneColor} transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
