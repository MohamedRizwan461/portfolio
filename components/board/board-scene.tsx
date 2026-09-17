"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { BUS_Z, groupColor, stations, type Station } from "@/lib/stations";
import { RobotModel, type Accessory } from "./robot-model";
import { DEFAULT_THEME, type Finish, type Tokens } from "@/lib/themes";

/** board colours come from the palette being tried on */
const PaletteCtx = createContext<Tokens & { finish: Finish }>({ ...DEFAULT_THEME.dark, finish: DEFAULT_THEME.finish });
const BOARD_W = 24;
const BOARD_D = 13;

export type SceneProps = {
  driveTo: string | null;
  hovered: string | null;
  active: string | null;
  visited: Set<string>;
  dimmed: Set<string>;
  accent: string;
  accessory: Accessory;
  palette: Tokens & { finish: Finish };
  reduce: boolean;
  compact: boolean;
  onHover: (id: string | null) => void;
  onPick: (id: string) => void;
  onArrive: (id: string) => void;
};

/* ------------------------------------------------------------------ board */

function Trace({
  from,
  to,
  width = 0.1,
  glow = 0.15,
}: {
  from: [number, number];
  to: [number, number];
  width?: number;
  glow?: number;
}) {
  const COPPER = useContext(PaletteCtx).copper;
  const [x1, z1] = from;
  const [x2, z2] = to;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const angle = Math.atan2(z2 - z1, x2 - x1);
  return (
    <mesh
      position={[(x1 + x2) / 2, 0.012, (z1 + z2) / 2]}
      rotation={[0, -angle, 0]}
    >
      <boxGeometry args={[len + width, 0.02, width]} />
      <meshStandardMaterial
        color={COPPER}
        emissive={COPPER}
        emissiveIntensity={glow}
        metalness={0.6}
        roughness={0.35}
      />
    </mesh>
  );
}

function Via({ x, z }: { x: number; z: number }) {
  const COPPER = useContext(PaletteCtx).copper;
  return (
    <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.07, 0.15, 20]} />
      <meshStandardMaterial
        color={COPPER}
        metalness={0.7}
        roughness={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Decorative routing, seeded so the board looks the same on every visit. */
function useDecorTraces() {
  return useMemo(() => {
    let seed = 7;
    const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const lines: { from: [number, number]; to: [number, number] }[] = [];
    for (let i = 0; i < 26; i++) {
      const x = -11 + rand() * 22;
      const z = (rand() > 0.5 ? 1 : -1) * (1.2 + rand() * 4.8);
      const len = 0.8 + rand() * 2.4;
      const horizontal = rand() > 0.5;
      const bend = rand() > 0.5 ? 0.7 : -0.7;
      const mid: [number, number] = horizontal
        ? [x + len, z]
        : [x, z + (z > 0 ? len : -len) * 0.5];
      lines.push({ from: [x, z], to: mid });
      lines.push({
        from: mid,
        to: horizontal ? [mid[0], mid[1] + bend] : [mid[0] + bend, mid[1]],
      });
    }
    return lines;
  }, []);
}

function Board() {
  const { board: MASK, boardEdge, copper: COPPER } = useContext(PaletteCtx);
  const decor = useDecorTraces();
  return (
    <group>
      {/* fibreglass and solder mask */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[BOARD_W, 0.22, BOARD_D]} />
        <meshStandardMaterial color={MASK} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* board edge highlight */}
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[BOARD_W - 0.3, BOARD_D - 0.3]} />
        <meshBasicMaterial color={boardEdge} transparent opacity={0.55} />
      </mesh>

      {/* mounting holes */}
      {[
        [-BOARD_W / 2 + 0.7, -BOARD_D / 2 + 0.7],
        [BOARD_W / 2 - 0.7, -BOARD_D / 2 + 0.7],
        [-BOARD_W / 2 + 0.7, BOARD_D / 2 - 0.7],
        [BOARD_W / 2 - 0.7, BOARD_D / 2 - 0.7],
      ].map(([x, z]) => (
        <mesh
          key={`${x}${z}`}
          position={[x, 0.01, z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.22, 0.38, 28]} />
          <meshStandardMaterial
            color={COPPER}
            metalness={0.8}
            roughness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {decor.map((t, i) => (
        <Trace key={i} from={t.from} to={t.to} width={0.05} glow={0.05} />
      ))}

      {/* the data bus: time runs left to right */}
      <Trace
        from={[-10.8, BUS_Z - 0.18]}
        to={[10.8, BUS_Z - 0.18]}
        width={0.12}
        glow={0.3}
      />
      <Trace
        from={[-10.8, BUS_Z + 0.18]}
        to={[10.8, BUS_Z + 0.18]}
        width={0.12}
        glow={0.3}
      />

      {stations.map((s) => (
        <group key={s.id}>
          <Trace
            from={[s.x, BUS_Z]}
            to={[s.x, s.z - Math.sign(s.z) * 0.9]}
            width={0.1}
            glow={0.22}
          />
          <Via x={s.x} z={BUS_Z} />
        </group>
      ))}
    </group>
  );
}

/* ----------------------------------------------------------- signal flow */

function Pulse({
  path,
  speed,
  offset,
  color,
  reduce,
}: {
  path: THREE.Vector3[];
  speed: number;
  offset: number;
  color: string;
  reduce: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(path, false, "catmullrom", 0),
    [path],
  );
  useFrame(({ clock }) => {
    if (!ref.current || reduce) return;
    const t = (clock.getElapsedTime() * speed + offset) % 1;
    ref.current.position.copy(curve.getPointAt(t));
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = Math.sin(t * Math.PI);
  });
  if (reduce) return null;
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 12, 12]} />
      <meshBasicMaterial color={color} transparent toneMapped={false} />
    </mesh>
  );
}

function Signals({ reduce, accent }: { reduce: boolean; accent: string }) {
  const busA = useMemo(
    () => [
      new THREE.Vector3(-10.8, 0.08, BUS_Z - 0.18),
      new THREE.Vector3(10.8, 0.08, BUS_Z - 0.18),
    ],
    [],
  );
  const busB = useMemo(
    () => [
      new THREE.Vector3(10.8, 0.08, BUS_Z + 0.18),
      new THREE.Vector3(-10.8, 0.08, BUS_Z + 0.18),
    ],
    [],
  );
  const stubs = useMemo(
    () =>
      stations.map((s) => ({
        id: s.id,
        color: groupColor[s.group],
        path: [
          new THREE.Vector3(s.x, 0.08, BUS_Z),
          new THREE.Vector3(s.x, 0.08, s.z - Math.sign(s.z) * 0.9),
        ],
      })),
    [],
  );
  return (
    <group>
      {[0, 0.33, 0.66].map((o) => (
        <Pulse
          key={`a${o}`}
          path={busA}
          speed={0.09}
          offset={o}
          color={accent}
          reduce={reduce}
        />
      ))}
      {[0.15, 0.5, 0.85].map((o) => (
        <Pulse
          key={`b${o}`}
          path={busB}
          speed={0.07}
          offset={o}
          color="#27e0c4"
          reduce={reduce}
        />
      ))}
      {stubs.map((s, i) => (
        <Pulse
          key={s.id}
          path={s.path}
          speed={0.35}
          offset={i * 0.17}
          color={s.color}
          reduce={reduce}
        />
      ))}
    </group>
  );
}

/* ----------------------------------------------------------------- chips */

function Chip({
  station,
  hovered,
  active,
  visited,
  dim,
  compact,
  onHover,
  onPick,
}: {
  station: Station;
  hovered: boolean;
  active: boolean;
  visited: boolean;
  dim: boolean;
  compact: boolean;
  onHover: (id: string | null) => void;
  onPick: (id: string) => void;
}) {
  const { boardInk, finish, board } = useContext(PaletteCtx);
  const matte = finish === "matte";
  const pad = useRef<THREE.MeshBasicMaterial>(null);
  const body = useRef<THREE.Group>(null);
  const color = groupColor[station.group];
  const lit = hovered || active;

  useFrame(({ clock }, delta) => {
    if (pad.current) {
      const base = matte ? (lit ? 0.7 : dim ? 0.04 : 0.32) : lit ? 0.55 : dim ? 0.03 : visited ? 0.28 : 0.14;
      pad.current.opacity =
        base + (matte ? 0 : Math.sin(clock.getElapsedTime() * 2 + station.x) * 0.05);
    }
    if (body.current) {
      const targetY = lit ? 0.22 : 0.17;
      body.current.position.y +=
        (targetY - body.current.position.y) * Math.min(1, delta * 10);
    }
  });

  const pins = [-0.72, -0.43, -0.14, 0.14, 0.43, 0.72];

  return (
    <group position={[station.x, 0, station.z]}>
      {/* footprint glow */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.9, 2.2]} />
        <meshBasicMaterial
          ref={pad}
          color={color}
          transparent
          opacity={0.15}
          toneMapped={false}
        />
      </mesh>

      <group
        ref={body}
        position={[0, 0.17, 0]}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(station.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onPick(station.id);
        }}
      >
        <mesh>
          <boxGeometry args={[2, 0.3, 1.45]} />
          <meshStandardMaterial
            color="#12161c"
            roughness={0.55}
            metalness={0.2}
            emissive={color}
            emissiveIntensity={lit && !matte ? 0.12 : 0}
          />
        </mesh>
        {/* pin 1 dot */}
        <mesh position={[-0.75, 0.152, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.07, 16]} />
          <meshBasicMaterial color="#2a2f36" />
        </mesh>
        {pins.map((px) => (
          <group key={px}>
            <mesh position={[px, -0.1, 0.8]}>
              <boxGeometry args={[0.12, 0.05, 0.2]} />
              <meshStandardMaterial
                color="#b9c0c8"
                metalness={0.9}
                roughness={0.25}
              />
            </mesh>
            <mesh position={[px, -0.1, -0.8]}>
              <boxGeometry args={[0.12, 0.05, 0.2]} />
              <meshStandardMaterial
                color="#b9c0c8"
                metalness={0.9}
                roughness={0.25}
              />
            </mesh>
          </group>
        ))}

        <Html
          center
          position={[0, 0.2, 0]}
          distanceFactor={compact ? 16 : 11}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="flex flex-col items-center whitespace-nowrap select-none">
            <span className={`font-mono font-bold tracking-wider text-white ${compact ? "text-[10px]" : "text-[12px]"}`}>
              {station.chip}
            </span>
          </div>
        </Html>
      </group>

      {/* silkscreen label beside the part; phones get the panel instead */}
      {!compact && (
        <Html
          center
          position={[0, 0.05, Math.sign(station.z) * 2.0]}
          distanceFactor={compact ? 16 : 11}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`whitespace-nowrap text-center font-sans transition-all duration-300 select-none ${lit ? "scale-110" : ""}`}
            style={{
              color: lit ? color : boardInk,
              opacity: dim && !lit ? 0.4 : 1,
              background: `${board}d9`,
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(4px)",
              padding: "3px 10px 4px",
            }}
          >
            <div className="text-[13.5px] font-medium tracking-tight">
              {station.short}
            </div>
            <div className="font-mono text-[9px] tracking-[0.18em] uppercase opacity-70">
              {station.year}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ----------------------------------------------------------------- robot */

function Robot({
  driveTo,
  reduce,
  plate,
  accessory,
  onArrive,
}: {
  driveTo: string | null;
  reduce: boolean;
  plate: string;
  accessory: Accessory;
  onArrive: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const cone = useRef<THREE.Mesh>(null);
  const wheels = useRef<THREE.Mesh[]>([]);
  const path = useRef<THREE.Vector3[]>([]);
  const goal = useRef<string | null>(null);
  const start = stations[0];
  const pos = useRef(new THREE.Vector3(start.x, 0, BUS_Z));
  const heading = useRef(0);

  // plan a route along the copper: down the stub, along the bus, up the next stub
  useEffect(() => {
    if (!driveTo || driveTo === goal.current) return;
    const target = stations.find((s) => s.id === driveTo);
    if (!target) return;
    goal.current = driveTo;
    const stop = target.z - Math.sign(target.z) * 2.05;
    const p = pos.current;
    path.current = [
      new THREE.Vector3(p.x, 0, BUS_Z),
      new THREE.Vector3(target.x, 0, BUS_Z),
      new THREE.Vector3(target.x, 0, stop),
    ];
  }, [driveTo]);

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const speed = reduce ? 1000 : 5.2;
    let moving = false;

    if (path.current.length) {
      const next = path.current[0];
      const to = next.clone().sub(pos.current);
      const dist = to.length();
      const step = speed * Math.min(delta, 0.1);
      if (dist <= step || dist < 0.001) {
        pos.current.copy(next);
        path.current.shift();
        if (!path.current.length && goal.current) onArrive(goal.current);
      } else {
        moving = true;
        to.normalize();
        pos.current.addScaledVector(to, step);
        const want = Math.atan2(to.x, to.z);
        let diff = want - heading.current;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        heading.current += diff * Math.min(1, delta * (reduce ? 100 : 9));
      }
    }

    g.position.set(pos.current.x, 0, pos.current.z);
    g.rotation.y = heading.current;
    // a little suspension bob while it drives
    g.position.y =
      moving && !reduce
        ? Math.abs(Math.sin(clock.getElapsedTime() * 18)) * 0.025
        : 0;
    wheels.current.forEach(
      (w) => w && (w.rotation.x += moving ? delta * 12 : 0),
    );
    if (cone.current) {
      const m = cone.current.material as THREE.MeshBasicMaterial;
      m.opacity = reduce
        ? 0.14
        : 0.1 + Math.abs(Math.sin(clock.getElapsedTime() * 3)) * 0.12;
    }
  });

  return (
    <group ref={group}>
      <RobotModel
        plate={plate}
        accessory={accessory}
        coneColor={plate}
        coneRef={cone}
        wheelRef={(i, m) => {
          if (m) wheels.current[i] = m;
        }}
      />
    </group>
  );
}

/* ----------------------------------------------------------------- scene */

export default function BoardScene(props: SceneProps) {
  const { compact } = props;
  const [ready, setReady] = useState(false);

  return (
    <Canvas
      className={`transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      camera={{
        position: compact ? [0, 20, 9] : [0, 15.5, 11.5],
        fov: compact ? 42 : 38,
      }}
      onCreated={() => setReady(true)}
      onPointerMissed={() => props.onHover(null)}
    >
      <fog attach="fog" args={[props.palette.ground, compact ? 40 : 34, compact ? 80 : 64]} />
      <ambientLight intensity={1.05} />
      <directionalLight position={[6, 14, 8]} intensity={2.1} />
      <hemisphereLight args={["#cfe0ff", props.palette.ground, 0.55]} />
      <pointLight position={[-8, 6, -4]} intensity={props.palette.finish === "matte" ? 10 : 30} color={props.palette.finish === "matte" ? "#ffffff" : props.accent} distance={26} />
      <pointLight position={[8, 6, 5]} intensity={props.palette.finish === "matte" ? 8 : 18} color={props.palette.finish === "matte" ? "#ffffff" : "#27e0c4"} distance={24} />

      <PaletteCtx.Provider value={props.palette}>
      <group>
        <Board />
        <Signals reduce={props.reduce} accent={props.accent} />
        {stations.map((s) => (
          <Chip
            key={s.id}
            station={s}
            hovered={props.hovered === s.id}
            active={props.active === s.id}
            visited={props.visited.has(s.id)}
            dim={props.dimmed.has(s.id)}
            compact={compact}
            onHover={props.onHover}
            onPick={props.onPick}
          />
        ))}
        <Robot
          driveTo={props.driveTo}
          reduce={props.reduce}
          plate={props.accent}
          accessory={props.accessory}
          onArrive={props.onArrive}
        />
      </group>
      </PaletteCtx.Provider>

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={compact ? 14 : 11}
        maxDistance={compact ? 40 : 34}
        minPolarAngle={0.35}
        maxPolarAngle={1.12}
        minAzimuthAngle={-0.7}
        maxAzimuthAngle={0.7}
        target={[0, 0, 0.6]}
      />
    </Canvas>
  );
}
