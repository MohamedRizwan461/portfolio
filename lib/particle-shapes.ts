import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

/**
 * Point clouds the intro particles morph between. Every shape is built from
 * simple meshes and sampled on their surfaces, so each cloud has exactly n points.
 */
export type Cloud = Float32Array;
type V3 = [number, number, number];
type Part = { geo: THREE.BufferGeometry; pos?: V3; rot?: V3; w: number };

export function rng(seed = 7) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function sample(parts: Part[], n: number, rand: () => number, groupRot: V3 = [0, 0, 0]): Cloud {
  const out = new Float32Array(n * 3);
  const total = parts.reduce((s, p) => s + p.w, 0);
  const v = new THREE.Vector3();
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const one = new THREE.Vector3(1, 1, 1);
  const g = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...groupRot));
  let i = 0;
  parts.forEach((p, idx) => {
    const count = idx === parts.length - 1 ? n - i : Math.min(n - i, Math.round((n * p.w) / total));
    if (count > 0) {
      const sampler = new MeshSurfaceSampler(new THREE.Mesh(p.geo));
      (sampler as unknown as { randomFunction: () => number }).randomFunction = rand;
      sampler.build();
      m.compose(new THREE.Vector3(...(p.pos ?? [0, 0, 0])), q.setFromEuler(new THREE.Euler(...(p.rot ?? [0, 0, 0]))), one).premultiply(g);
      for (let k = 0; k < count; k++, i++) {
        sampler.sample(v);
        v.applyMatrix4(m);
        out[i * 3] = v.x;
        out[i * 3 + 1] = v.y;
        out[i * 3 + 2] = v.z;
      }
    }
    p.geo.dispose();
  });
  return out;
}

/** Centre a cloud and scale it to fit a box. */
export function fit(c: Cloud, maxW: number, maxH: number, yOffset = 0): Cloud {
  const box = new THREE.Box3().setFromArray(c);
  const size = box.getSize(new THREE.Vector3());
  const mid = box.getCenter(new THREE.Vector3());
  const s = Math.min(maxW / size.x, maxH / size.y);
  for (let i = 0; i < c.length; i += 3) {
    c[i] = (c[i] - mid.x) * s;
    c[i + 1] = (c[i + 1] - mid.y) * s + yOffset;
    c[i + 2] = (c[i + 2] - mid.z) * s;
  }
  return c;
}

/** A microcontroller on a board, traces fanning out from every pin. */
export function chipBoard(n: number, rand: () => number): Cloud {
  const parts: Part[] = [];
  const box = (w: number, h: number, d: number, pos: V3, wt: number, rot?: V3) => parts.push({ geo: new THREE.BoxGeometry(w, h, d), pos, rot, w: wt });

  box(9, 0.02, 6, [0, -0.14, 0], 3);
  for (const [x, z, w, d] of [
    [0, -3, 9, 0.05],
    [0, 3, 9, 0.05],
    [-4.5, 0, 0.05, 6],
    [4.5, 0, 0.05, 6],
  ])
    box(w, 0.08, d, [x, -0.1, z], 2.4);

  box(2.1, 0.34, 2.1, [0, 0.08, 0], 10);
  // the package top reads as a solid square, with the pin-1 dot
  parts.push({ geo: new THREE.PlaneGeometry(2.1, 2.1), pos: [0, 0.26, 0], rot: [-Math.PI / 2, 0, 0], w: 5 });
  parts.push({ geo: new THREE.TorusGeometry(0.14, 0.035, 6, 24), pos: [-0.72, 0.27, -0.72], rot: [Math.PI / 2, 0, 0], w: 0.6 });

  const rotate = (x: number, z: number, a: number): [number, number] => [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
  const seg = (ax: number, az: number, bx: number, bz: number, a: number) => {
    const [x1, z1] = rotate(ax, az, a);
    const [x2, z2] = rotate(bx, bz, a);
    const len = Math.hypot(x2 - x1, z2 - z1);
    box(len, 0.025, 0.05, [(x1 + x2) / 2, -0.08, (z1 + z2) / 2], len * 0.6, [0, Math.atan2(-(z2 - z1), x2 - x1), 0]);
  };

  const pins = 12;
  for (let side = 0; side < 4; side++) {
    const a = (side * Math.PI) / 2;
    const edge = side % 2 === 0 ? 4.25 : 2.75;
    for (let k = 0; k < pins; k++) {
      const t = -0.85 + (1.7 * k) / (pins - 1);
      const [px, pz] = rotate(1.2, t, a);
      box(0.3, 0.05, 0.07, [px, -0.02, pz], 0.3, [0, -a, 0]);
      const x1 = 1.35 + 0.25 + Math.abs(t) * 0.35;
      const dz = t * (side % 2 === 0 ? 0.75 : 0.35);
      const x2 = x1 + Math.abs(dz) * 0.8 + 0.2;
      const end = x2 + (edge - x2) * (0.45 + rand() * 0.55);
      seg(1.35, t, x1, t, a);
      seg(x1, t, x2, t + dz, a);
      seg(x2, t + dz, end, t + dz, a);
      const [vx, vz] = rotate(end, t + dz, a);
      parts.push({ geo: new THREE.TorusGeometry(0.08, 0.025, 6, 16), pos: [vx, -0.08, vz], rot: [Math.PI / 2, 0, 0], w: 0.35 });
    }
  }

  for (const [x, z] of [
    [-3.2, -2.2],
    [3.3, 2.1],
    [-2.9, 2.2],
  ])
    parts.push({ geo: new THREE.CylinderGeometry(0.26, 0.26, 0.5, 20), pos: [x, 0.12, z], w: 1.3 });
  for (let k = 0; k < 10; k++) box(0.18, 0.18, 0.18, [-1.6 + k * 0.36, 0, 2.55], 0.25);
  box(0.6, 0.22, 0.28, [2.6, 0, -2.3], 0.7);

  return sample(parts, n, rand, [0.95, 0, 0]);
}

/** A six-axis style arm reaching forward, on a base with floor rings. */
export function roboticArm(n: number, rand: () => number): Cloud {
  const parts: Part[] = [];
  const cyl = (r: number, h: number, pos: V3, wt: number, rot?: V3) => parts.push({ geo: new THREE.CylinderGeometry(r, r, h, 32), pos, rot, w: wt });
  const link = (w: number, len: number, d: number, from: [number, number], angle: number, wt: number) => {
    const dir: [number, number] = [Math.sin(angle), Math.cos(angle)];
    parts.push({ geo: new THREE.BoxGeometry(w, len, d), pos: [from[0] + (dir[0] * len) / 2, from[1] + (dir[1] * len) / 2, 0], rot: [0, 0, -angle], w: wt });
    return [from[0] + dir[0] * len, from[1] + dir[1] * len] as [number, number];
  };

  parts.push({ geo: new THREE.TorusGeometry(1.7, 0.012, 4, 120), pos: [0, -2.25, 0], rot: [Math.PI / 2, 0, 0], w: 3 });
  parts.push({ geo: new THREE.TorusGeometry(2.6, 0.012, 4, 160), pos: [0, -2.25, 0], rot: [Math.PI / 2, 0, 0], w: 3 });
  parts.push({ geo: new THREE.CylinderGeometry(0.9, 1.02, 0.35, 40), pos: [0, -2.05, 0], w: 8 });
  cyl(0.62, 0.35, [0, -1.7, 0], 5);

  const S: [number, number] = [0, -1.3];
  cyl(0.42, 0.95, [S[0], S[1], 0], 5, [Math.PI / 2, 0, 0]);
  const E = link(0.46, 2.2, 0.5, S, -0.38, 9);
  cyl(0.34, 0.8, [E[0], E[1], 0], 4, [Math.PI / 2, 0, 0]);
  const W = link(0.36, 1.9, 0.4, E, 1.22, 7);
  cyl(0.24, 0.6, [W[0], W[1], 0], 2.5, [Math.PI / 2, 0, 0]);
  const P = link(0.5, 0.35, 0.42, W, 2.1, 2);
  const tip = [Math.sin(2.1), Math.cos(2.1)];
  const side = [tip[1], -tip[0]];
  for (const o of [-0.17, 0.17]) link(0.07, 0.5, 0.16, [P[0] + side[0] * o, P[1] + side[1] * o], 2.1, 1);

  return sample(parts, n, rand, [0.16, -0.55, 0]);
}

/** A low electric car with its lidar painting arcs on the road ahead. */
export function vehicle(n: number, rand: () => number): Cloud {
  const parts: Part[] = [];
  const shape = new THREE.Shape();
  shape.moveTo(-2.25, -0.55);
  shape.lineTo(2.2, -0.55);
  shape.quadraticCurveTo(2.48, -0.5, 2.4, -0.1);
  shape.lineTo(1.45, 0.12);
  shape.quadraticCurveTo(0.7, 0.74, -0.2, 0.76);
  shape.quadraticCurveTo(-1.5, 0.72, -2.1, 0.25);
  shape.quadraticCurveTo(-2.36, 0, -2.25, -0.55);
  const body = new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 3, curveSegments: 18 });
  body.translate(0, 0, -1);
  parts.push({ geo: body, w: 18 });

  for (const x of [-1.45, 1.45])
    for (const z of [-1.1, 1.1]) {
      parts.push({ geo: new THREE.TorusGeometry(0.42, 0.14, 12, 48), pos: [x, -0.62, z], w: 4.2 });
      parts.push({ geo: new THREE.CylinderGeometry(0.28, 0.28, 0.05, 24), pos: [x, -0.62, z], rot: [Math.PI / 2, 0, 0], w: 0.8 });
    }
  parts.push({ geo: new THREE.CylinderGeometry(0.2, 0.25, 0.22, 24), pos: [0.1, 0.92, 0], w: 1.4 });

  const arc = 2.3;
  for (const r of [2.8, 3.5, 4.2]) parts.push({ geo: new THREE.TorusGeometry(r, 0.014, 4, 160, arc), pos: [0, -1.06, 0], rot: [Math.PI / 2, 0, 0.25 - arc / 2], w: 2.6 });

  return sample(parts, n, rand, [0.3, -0.62, 0]);
}

/** An orbit of light around the Enter button, with dust around it. */
export function halo(n: number, rand: () => number, radius: number, vw: number, vh: number): Cloud {
  const out = new Float32Array(n * 3);
  const ringCount = Math.floor(n * 0.68);
  const tilt = 1.18;
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (i < ringCount) {
      const a = rand() * Math.PI * 2;
      const spread = (rand() - 0.5) * (rand() - 0.5) * radius * 0.35;
      const r = radius + spread;
      const lx = Math.cos(a) * r;
      const lz = Math.sin(a) * r;
      const ly = (rand() - 0.5) * (rand() - 0.5) * 0.3;
      x = lx;
      y = ly * Math.cos(tilt) - lz * Math.sin(tilt);
      z = ly * Math.sin(tilt) + lz * Math.cos(tilt);
    } else {
      x = (rand() - 0.5) * vw * 1.4;
      y = (rand() - 0.5) * vh * 1.4;
      z = -9 + rand() * 11;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

export function core(n: number, rand: () => number): Cloud {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const r = Math.cbrt(rand()) * 0.12;
    const s = Math.sqrt(1 - u * u);
    out[i * 3] = Math.cos(a) * s * r;
    out[i * 3 + 1] = Math.sin(a) * s * r;
    out[i * 3 + 2] = u * r;
  }
  return out;
}

export function dust(n: number, rand: () => number, vw: number, vh: number): Cloud {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    out[i * 3] = (rand() - 0.5) * vw * 1.5;
    out[i * 3 + 1] = (rand() - 0.5) * vh * 1.5;
    out[i * 3 + 2] = -12 + rand() * 14;
  }
  return out;
}

/** Text drawn to a canvas and sampled pixel by pixel; the bottom edge sits at y = 0. */
export function textCloud(n: number, rand: () => number, lines: string[], family: string, maxW: number, maxH: number): Cloud {
  const fs = 200;
  const lh = 230;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d", { willReadFrequently: true });
  const out = new Float32Array(n * 3);
  if (!ctx) return out;
  const font = `700 ${fs}px ${family}`;
  ctx.font = font;
  const W = Math.ceil(Math.max(...lines.map((l) => ctx.measureText(l).width))) + 24;
  const H = lines.length * lh;
  c.width = W;
  c.height = H;
  ctx.font = font;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((l, i) => ctx.fillText(l, W / 2, lh * (i + 0.5)));
  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: number[] = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (data[(y * W + x) * 4 + 3] > 140) pts.push(x, y);
  const count = pts.length / 2;
  if (!count) return out;
  const s = Math.min(maxW / W, maxH / H);
  for (let i = 0; i < n; i++) {
    const k = Math.floor(rand() * count) * 2;
    out[i * 3] = (pts[k] + rand() * 2 - W / 2) * s;
    out[i * 3 + 1] = (H - pts[k + 1] - rand() * 2) * s;
    out[i * 3 + 2] = (rand() - 0.5) * 0.1;
  }
  return out;
}

/* ---------------------------------------------------------------- story shapes */

/** A DNA double helix lying across the frame, rungs and all. */
export function helix(n: number, rand: () => number): Cloud {
  const out = new Float32Array(n * 3);
  const len = 10;
  for (let i = 0; i < n; i++) {
    const t = (rand() - 0.5) * len;
    const a = t * 1.25;
    const kind = rand();
    let x = t;
    let y: number;
    let z: number;
    if (kind < 0.62) {
      const phase = kind < 0.31 ? 0 : Math.PI;
      y = Math.sin(a + phase) * 1.3;
      z = Math.cos(a + phase) * 1.3;
      const j = 0.07;
      x += (rand() - 0.5) * j;
      y += (rand() - 0.5) * j;
      z += (rand() - 0.5) * j;
    } else {
      // rungs every 0.42 units along the axis
      const r = Math.round(t / 0.42) * 0.42;
      const ra = r * 1.25;
      const s = rand() * 2 - 1;
      x = r + (rand() - 0.5) * 0.04;
      y = Math.sin(ra) * 1.3 * s;
      z = Math.cos(ra) * 1.3 * s;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** A leg in profile wearing the knee exoskeleton: braces, hinge and the pneumatic cylinder. */
export function kneeLeg(n: number, rand: () => number): Cloud {
  const parts: Part[] = [];
  const seg = (a: [number, number], b: [number, number], r: number, w: number, z = 0) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ang = Math.atan2(b[0] - a[0], b[1] - a[1]);
    parts.push({ geo: new THREE.CapsuleGeometry(r, len, 6, 20), pos: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z], rot: [0, 0, -ang], w });
  };
  const hip: [number, number] = [0, 2.3];
  const knee: [number, number] = [0.45, 0];
  const ankle: [number, number] = [-0.05, -2.3];
  seg(hip, knee, 0.42, 12);
  seg(knee, ankle, 0.3, 9);
  parts.push({ geo: new THREE.BoxGeometry(1.1, 0.22, 0.5), pos: [0.35, -2.55, 0], w: 3 });
  // braces around thigh and shin
  const braces: [[number, number], number][] = [
    [[0.18, 1.5], 0.5],
    [[0.34, 0.75], 0.47],
    [[0.32, -0.8], 0.37],
    [[0.12, -1.6], 0.34],
  ];
  for (const [p, r] of braces) parts.push({ geo: new THREE.TorusGeometry(r, 0.04, 8, 40), pos: [p[0], p[1], 0], rot: [Math.PI / 2, 0, 0], w: 2.2 });
  // hinge at the knee
  parts.push({ geo: new THREE.CylinderGeometry(0.22, 0.22, 1.05, 28), pos: [knee[0], knee[1], 0], rot: [Math.PI / 2, 0, 0], w: 3 });
  // pneumatic cylinder in front, body then rod
  seg([0.95, 1.4], [1.2, -0.1], 0.1, 3.5, 0.3);
  seg([1.2, -0.1], [0.85, -1.2], 0.035, 1.2, 0.3);
  // struts back to the braces
  seg([0.55, 1.4], [0.95, 1.4], 0.03, 0.6, 0.3);
  seg([0.4, -1.2], [0.85, -1.2], 0.03, 0.6, 0.3);
  return sample(parts, n, rand, [0, 0.35, 0]);
}

/** A globe with the route: Chennai, then Egypt for the Grand Finale, then Chicago. */
export function globeRoute(n: number, rand: () => number): Cloud {
  const out = new Float32Array(n * 3);
  const R = 2.4;
  const toVec = (lat: number, lon: number) => {
    const la = (lat * Math.PI) / 180;
    const lo = (lon * Math.PI) / 180;
    return new THREE.Vector3(R * Math.cos(la) * Math.sin(lo), R * Math.sin(la), R * Math.cos(la) * Math.cos(lo));
  };
  const cities = [toVec(13.08, 80.27), toVec(26.8, 30.8), toVec(41.88, -87.63)];
  const legs = [
    [cities[0], cities[1]],
    [cities[1], cities[2]],
  ];
  // turn the globe so the whole route faces the camera
  const spin = new THREE.Matrix4().makeRotationY(0.1).multiply(new THREE.Matrix4().makeRotationX(0.35));
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const k = rand();
    if (k < 0.5) {
      // sparse shell, denser along latitude lines
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      let lat = Math.asin(u);
      if (rand() < 0.45) lat = Math.round(lat / 0.35) * 0.35;
      v.set(R * Math.cos(lat) * Math.sin(a), R * Math.sin(lat), R * Math.cos(lat) * Math.cos(a));
    } else if (k < 0.85) {
      const [p, q] = legs[rand() < 0.5 ? 0 : 1];
      const t = rand();
      v.copy(p).lerp(q, t).normalize().multiplyScalar(R + Math.sin(t * Math.PI) * 0.9);
    } else {
      const c = cities[Math.floor(rand() * 3)];
      const r = Math.cbrt(rand()) * 0.16;
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      v.set(c.x + Math.cos(a) * s * r, c.y + Math.sin(a) * s * r, c.z + u * r);
    }
    v.applyMatrix4(spin);
    out[i * 3] = v.x;
    out[i * 3 + 1] = v.y;
    out[i * 3 + 2] = v.z;
  }
  return out;
}

/** The mobile robot on the floor, the bottle it has to avoid, and the goal marker. */
export function roverScene(n: number, rand: () => number): Cloud {
  const parts: Part[] = [];
  parts.push({ geo: new THREE.BoxGeometry(1.8, 0.45, 1.3), pos: [-1.2, 0.2, 0], w: 12 });
  parts.push({ geo: new THREE.BoxGeometry(1.4, 0.05, 1.1), pos: [-1.2, 0.55, 0], w: 3 });
  for (const x of [-1.8, -0.6])
    for (const z of [-0.72, 0.72]) parts.push({ geo: new THREE.CylinderGeometry(0.32, 0.32, 0.18, 28), pos: [x, -0.05, z], rot: [Math.PI / 2, 0, 0], w: 2.4 });
  parts.push({ geo: new THREE.CylinderGeometry(0.22, 0.24, 0.2, 28), pos: [-1.2, 0.72, 0], w: 2 });
  for (const z of [-0.3, 0.3]) parts.push({ geo: new THREE.CylinderGeometry(0.1, 0.1, 0.12, 20), pos: [-0.28, 0.25, z], rot: [0, 0, Math.PI / 2], w: 0.8 });
  // the bottle
  parts.push({ geo: new THREE.CylinderGeometry(0.22, 0.22, 1.1, 28), pos: [1.3, 0.2, -0.6], w: 3 });
  parts.push({ geo: new THREE.CylinderGeometry(0.08, 0.2, 0.3, 20), pos: [1.3, 0.9, -0.6], w: 1 });
  // the goal marker and the path around the bottle
  parts.push({ geo: new THREE.TorusGeometry(0.5, 0.03, 6, 48), pos: [3.3, -0.36, 0.2], rot: [Math.PI / 2, 0, 0], w: 1.6 });
  parts.push({ geo: new THREE.TorusGeometry(0.22, 0.03, 6, 32), pos: [3.3, -0.36, 0.2], rot: [Math.PI / 2, 0, 0], w: 0.8 });
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, -0.37, 0),
    new THREE.Vector3(1.0, -0.37, 0.7),
    new THREE.Vector3(2.2, -0.37, 0.6),
    new THREE.Vector3(3.3, -0.37, 0.2),
  ]);
  parts.push({ geo: new THREE.TubeGeometry(path, 60, 0.02, 4), w: 1.6 });
  // lidar rays fanning out
  for (let k = 0; k < 7; k++) {
    const a = -0.6 + k * 0.2;
    const len = 2.4;
    parts.push({ geo: new THREE.BoxGeometry(len, 0.01, 0.01), pos: [-1.2 + (Math.cos(a) * len) / 2, 0.75, (Math.sin(a) * len) / 2], rot: [0, -a, 0], w: 0.5 });
  }
  return sample(parts, n, rand, [0.45, -0.5, 0]);
}
