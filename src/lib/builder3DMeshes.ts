/**
 * Realistic mesh factory for the 3D experiment builder.
 *
 * Each component id gets a hand-built group of primitives with believable
 * materials (glass, brushed steel, matte plastic, hot metal, emissive glass)
 * instead of a single coloured block. Detail scales with the render budget so
 * low-end phones stay smooth.
 */

import * as THREE from "three";
import type { RenderBudget } from "@/lib/renderBudget";
import { segments } from "@/lib/renderBudget";

/* ------------------------------------------------------------------ materials */

export function glassMaterial(tint = 0xdfeffa, budget?: RenderBudget) {
  const highTier = !budget || budget.tier !== "low";
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    transparent: true,
    opacity: highTier ? 0.28 : 0.45,
    roughness: 0.05,
    metalness: 0,
    transmission: highTier ? 0.9 : 0,
    thickness: 0.35,
    ior: 1.5,
    clearcoat: highTier ? 1 : 0,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide,
  });
}

export function liquidMaterial(color: string | number) {
  return new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: 0.85,
    roughness: 0.15,
    metalness: 0,
    transmission: 0.4,
    thickness: 0.6,
  });
}

export function steelMaterial(color: number = 0xb9c0c8) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.95 });
}

export function plasticMaterial(color: string | number, roughness = 0.65) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05 });
}

export function rubberMaterial(color: string | number = 0x22262b) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 });
}

export function emissiveMaterial(color: string | number, intensity = 1.6) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    roughness: 0.3,
    metalness: 0,
  });
}

/* ------------------------------------------------------------------ helpers */

function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number] = [0, 0, 0],
  rotation: [number, number, number] = [0, 0, 0],
): THREE.Mesh {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...position);
  m.rotation.set(...rotation);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Lathe profile helper — builds a revolved wall from 2D points (x = radius). */
function lathe(points: [number, number][], radial: number, material: THREE.Material) {
  const vec = points.map(([x, y]) => new THREE.Vector2(x, y));
  return mesh(new THREE.LatheGeometry(vec, radial), material);
}

function liquidCylinder(radius: number, height: number, radial: number, color: string | number) {
  return mesh(new THREE.CylinderGeometry(radius, radius, height, radial), liquidMaterial(color), [
    0,
    height / 2,
    0,
  ]);
}

export interface MeshBuildOptions {
  budget: RenderBudget;
  properties?: Record<string, unknown>;
}

type Builder = (o: MeshBuildOptions) => THREE.Group;

function num(props: Record<string, unknown> | undefined, key: string, fallback: number): number {
  const v = props?.[key];
  return typeof v === "number" ? v : fallback;
}

function str(props: Record<string, unknown> | undefined, key: string, fallback: string): string {
  const v = props?.[key];
  return typeof v === "string" ? v : fallback;
}

/* ------------------------------------------------------------------ builders */

const buildBeaker: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const radial = segments(48, budget);
  const fill = num(properties, "fillLevel", 0) / 100;
  const glass = glassMaterial(0xdff1ff, budget);

  // Tapered wall with a rolled lip and a spout ring.
  g.add(
    lathe(
      [
        [0, 0],
        [0.52, 0],
        [0.52, 0.06],
        [0.5, 0.08],
        [0.5, 1.34],
        [0.56, 1.42],
        [0.54, 1.46],
      ],
      radial,
      glass,
    ),
  );
  g.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.04, radial), glass, [0, 0.02, 0]));

  if (fill > 0) {
    g.add(liquidCylinder(0.47, 1.25 * fill, radial, str(properties, "liquidColor", "#4488ff")));
  }

  // Graduation marks
  const markMat = plasticMaterial(0xf2f7ff, 0.4);
  for (let i = 1; i <= 4; i++) {
    const mark = mesh(new THREE.BoxGeometry(0.18, 0.012, 0.01), markMat, [0, i * 0.26, 0.505]);
    g.add(mark);
  }
  return g;
};

const buildFlask: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const radial = segments(48, budget);
  const glass = glassMaterial(0xdff1ff, budget);
  const fill = num(properties, "fillLevel", 0) / 100;

  g.add(
    lathe(
      [
        [0, 0],
        [0.78, 0],
        [0.76, 0.06],
        [0.24, 1.15],
        [0.22, 1.5],
        [0.28, 1.58],
        [0.26, 1.62],
      ],
      radial,
      glass,
    ),
  );
  g.add(mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.04, radial), glass, [0, 0.02, 0]));

  if (fill > 0) {
    const h = 1.05 * fill;
    const rBottom = 0.74;
    const rTop = Math.max(0.2, 0.74 - 0.5 * fill);
    g.add(
      mesh(
        new THREE.CylinderGeometry(rTop, rBottom, h, radial),
        liquidMaterial(str(properties, "liquidColor", "#44ff88")),
        [0, h / 2 + 0.03, 0],
      ),
    );
  }
  return g;
};

const buildTestTube: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const radial = segments(32, budget);
  const glass = glassMaterial(0xe6f6ff, budget);
  const fill = num(properties, "fillLevel", 0) / 100;

  g.add(mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.2, radial, 1, true), glass, [0, 0.7, 0]));
  g.add(mesh(new THREE.SphereGeometry(0.18, radial, segments(16, budget), 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), glass, [0, 0.1, 0]));
  g.add(mesh(new THREE.TorusGeometry(0.185, 0.02, 8, radial), glass, [0, 1.3, 0], [Math.PI / 2, 0, 0]));

  if (fill > 0) {
    const h = 1.05 * fill;
    g.add(
      mesh(
        new THREE.CylinderGeometry(0.16, 0.16, h, radial),
        liquidMaterial(str(properties, "liquidColor", "#ff6688")),
        [0, 0.12 + h / 2, 0],
      ),
    );
  }

  // Wooden-style rack peg base so it stands up
  g.add(mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.08, radial), plasticMaterial(0x8a6a44), [0, 0.04, 0]));
  return g;
};

const buildBurner: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const radial = segments(32, budget);
  const metal = steelMaterial(0x8f979f);

  g.add(mesh(new THREE.CylinderGeometry(0.55, 0.62, 0.1, radial), metal, [0, 0.05, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.0, radial), metal, [0, 0.6, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.16, radial), steelMaterial(0x5f676e), [0, 0.34, 0]));
  g.add(mesh(new THREE.TorusGeometry(0.17, 0.035, 8, radial), steelMaterial(0x6d757c), [0, 1.06, 0], [Math.PI / 2, 0, 0]));
  // Gas hose stub
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, segments(16, budget)), rubberMaterial(), [0.3, 0.16, 0], [0, 0, Math.PI / 2]));

  const flameOn = properties?.["flameOn"] === true || properties?.["active"] === true;
  if (flameOn) {
    const inner = mesh(
      new THREE.ConeGeometry(0.12, 0.5, segments(20, budget)),
      new THREE.MeshBasicMaterial({ color: 0x6fc3ff, transparent: true, opacity: 0.85 }),
      [0, 1.35, 0],
    );
    inner.name = "flame-inner";
    const outer = mesh(
      new THREE.ConeGeometry(0.2, 0.85, segments(20, budget)),
      new THREE.MeshBasicMaterial({ color: 0x2f6dff, transparent: true, opacity: 0.35 }),
      [0, 1.5, 0],
    );
    outer.name = "flame-outer";
    g.add(inner, outer);
    if (budget.tier !== "low") {
      const light = new THREE.PointLight(0x66aaff, 1.4, 6);
      light.position.set(0, 1.5, 0);
      light.name = "flame-light";
      g.add(light);
    }
  }
  return g;
};

const buildHotPlate: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const radial = segments(48, budget);
  g.add(mesh(new THREE.BoxGeometry(1.6, 0.22, 1.3), plasticMaterial(0xdfe3e8, 0.5), [0, 0.11, 0]));
  const hot = num(properties, "temperature", 20) > 60;
  const plate = mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.06, radial),
    hot ? emissiveMaterial(0xff5522, 0.8) : steelMaterial(0x3d444b),
    [-0.15, 0.25, 0],
  );
  g.add(plate);
  g.add(mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, radial), plasticMaterial(0x2b2f34), [0.6, 0.27, 0.35]));
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.02, 0.1), plasticMaterial(0x111417), [0.6, 0.33, 0.35]));
  return g;
};

const buildTripod: Builder = ({ budget }) => {
  const g = new THREE.Group();
  const radial = segments(16, budget);
  const metal = steelMaterial(0x99a1a9);
  g.add(mesh(new THREE.TorusGeometry(0.6, 0.05, 10, segments(40, budget)), metal, [0, 1.0, 0], [Math.PI / 2, 0, 0]));
  // Wire gauze
  const gauze = mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.02, radial * 2), steelMaterial(0x707880), [0, 1.02, 0]);
  g.add(gauze);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.05, radial), metal, [
      Math.cos(a) * 0.52,
      0.5,
      Math.sin(a) * 0.52,
    ]);
    leg.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12);
    g.add(leg);
  }
  return g;
};

const buildBall: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const r = 0.5;
  const ball = mesh(
    new THREE.SphereGeometry(r, segments(48, budget), segments(32, budget)),
    new THREE.MeshStandardMaterial({
      color: str(properties, "color", "#ff5533"),
      roughness: 0.45,
      metalness: 0.15,
    }),
    [0, r, 0],
  );
  g.add(ball);
  // seam ring for readable rotation
  g.add(
    mesh(new THREE.TorusGeometry(r * 0.99, 0.012, 6, segments(40, budget)), rubberMaterial(0x1a1d21), [0, r, 0], [Math.PI / 2, 0, 0]),
  );
  return g;
};

const buildCube: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const mat = plasticMaterial(str(properties, "color", "#4488ff"), 0.55);
  const box = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
  g.add(mesh(box, mat, [0, 0.5, 0]));
  // chamfer illusion: thin darker edge frame
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(box),
    new THREE.LineBasicMaterial({ color: 0x101317 }),
  );
  edge.position.y = 0.5;
  g.add(edge);
  void budget;
  return g;
};

const buildRamp: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const angle = (num(properties, "angle", 30) * Math.PI) / 180;
  const len = 2.4;
  const surface = mesh(new THREE.BoxGeometry(len, 0.08, 1.1), plasticMaterial(0x6f7a86, 0.7), [0, 0, 0]);
  surface.rotation.z = -angle;
  surface.position.set(0, (Math.sin(angle) * len) / 2, 0);
  g.add(surface);
  // support wedge
  const wedgeShape = new THREE.Shape();
  wedgeShape.moveTo(-len / 2, 0);
  wedgeShape.lineTo(len / 2, 0);
  wedgeShape.lineTo(-len / 2, Math.sin(angle) * len);
  wedgeShape.closePath();
  const wedge = mesh(
    new THREE.ExtrudeGeometry(wedgeShape, { depth: 1, bevelEnabled: false }),
    plasticMaterial(0x8a6a44, 0.85),
    [0, 0, -0.5],
  );
  g.add(wedge);
  void budget;
  return g;
};

const buildPendulum: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const radial = segments(20, budget);
  const metal = steelMaterial();
  // stand
  g.add(mesh(new THREE.BoxGeometry(1.1, 0.09, 0.7), steelMaterial(0x555c63), [0, 0.045, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, radial), metal, [-0.4, 1.1, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, radial), metal, [0.0, 2.15, 0], [0, 0, Math.PI / 2]));
  const arm = new THREE.Group();
  arm.name = "pivot";
  arm.position.set(0.4, 2.15, 0);
  const len = Math.max(0.6, num(properties, "length", 1.2));
  arm.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 8), rubberMaterial(0xdad5c8), [0, -len / 2, 0]));
  const bob = mesh(new THREE.SphereGeometry(0.16, segments(32, budget), segments(20, budget)), steelMaterial(0xd8dde2), [0, -len - 0.14, 0]);
  bob.name = "bob";
  arm.add(bob);
  g.add(arm);
  return g;
};

const buildSpring: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const coils = 9;
  const height = 1.3;
  const radius = 0.22;
  const pts: THREE.Vector3[] = [];
  const stepsPerCoil = budget.tier === "low" ? 10 : 22;
  const total = coils * stepsPerCoil;
  for (let i = 0; i <= total; i++) {
    const t = i / total;
    const a = t * coils * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0.25 + t * height, Math.sin(a) * radius));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const coil = mesh(
    new THREE.TubeGeometry(curve, segments(160, budget), 0.035, segments(10, budget), false),
    steelMaterial(0xc4cad0),
  );
  coil.name = "coil";
  g.add(coil);
  g.add(mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, segments(24, budget)), steelMaterial(0x6b7278), [0, 0.03, 0]));
  const mass = num(properties, "mass", 1);
  const bobR = 0.18 + Math.min(0.22, mass * 0.06);
  g.add(mesh(new THREE.CylinderGeometry(bobR, bobR, 0.28, segments(28, budget)), steelMaterial(0x9aa2aa), [0, 0.25 + height + 0.14, 0]));
  return g;
};

const buildThermometer: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const radial = segments(20, budget);
  const glass = glassMaterial(0xeaf6ff, budget);
  g.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.7, radial), glass, [0, 0.9, 0]));
  g.add(mesh(new THREE.SphereGeometry(0.11, radial, segments(14, budget)), glass, [0, 0.08, 0]));
  const t = num(properties, "temperature", 20);
  const frac = Math.min(1, Math.max(0.05, (t + 20) / 140));
  g.add(mesh(new THREE.SphereGeometry(0.085, radial, segments(14, budget)), plasticMaterial(0xd93025, 0.3), [0, 0.08, 0]));
  const col = mesh(
    new THREE.CylinderGeometry(0.028, 0.028, 1.55 * frac, radial),
    plasticMaterial(0xd93025, 0.3),
    [0, 0.12 + (1.55 * frac) / 2, 0],
  );
  col.name = "mercury";
  g.add(col);
  const scaleMat = plasticMaterial(0xf5f7fa, 0.5);
  for (let i = 1; i <= 8; i++) {
    g.add(mesh(new THREE.BoxGeometry(0.05, 0.008, 0.008), scaleMat, [0.05, 0.2 + i * 0.17, 0.06]));
  }
  return g;
};

const buildTimer: Builder = ({ budget }) => {
  const g = new THREE.Group();
  const radial = segments(40, budget);
  g.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.16, radial), plasticMaterial(0x2b3038, 0.5), [0, 0.5, 0], [Math.PI / 2, 0, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.02, radial), plasticMaterial(0xf3f5f7, 0.35), [0, 0.5, 0.09], [Math.PI / 2, 0, 0]));
  g.add(mesh(new THREE.BoxGeometry(0.02, 0.3, 0.01), plasticMaterial(0x11151a), [0, 0.62, 0.11]));
  g.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, radial), steelMaterial(0x8f979f), [0, 1.02, 0]));
  g.add(mesh(new THREE.BoxGeometry(0.5, 0.1, 0.3), plasticMaterial(0x2b3038, 0.6), [0, 0.05, 0]));
  return g;
};

function moleculeGroup(
  atoms: { el: string; pos: [number, number, number]; r: number; color: number }[],
  bonds: [number, number][],
  budget: RenderBudget,
): THREE.Group {
  const g = new THREE.Group();
  const wSeg = segments(32, budget);
  const hSeg = segments(24, budget);
  atoms.forEach((a) => {
    g.add(
      mesh(
        new THREE.SphereGeometry(a.r, wSeg, hSeg),
        new THREE.MeshPhysicalMaterial({ color: a.color, roughness: 0.25, metalness: 0.1, clearcoat: 0.6 }),
        a.pos,
      ),
    );
  });
  bonds.forEach(([i, j]) => {
    const a = new THREE.Vector3(...atoms[i].pos);
    const b = new THREE.Vector3(...atoms[j].pos);
    const dir = new THREE.Vector3().subVectors(b, a);
    const bond = mesh(
      new THREE.CylinderGeometry(0.06, 0.06, dir.length(), segments(16, budget)),
      plasticMaterial(0xd7dde3, 0.4),
    );
    bond.position.copy(a).add(dir.clone().multiplyScalar(0.5));
    bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    g.add(bond);
  });
  g.position.y = 0.9;
  return g;
}

const buildWater: Builder = ({ budget }) =>
  moleculeGroup(
    [
      { el: "O", pos: [0, 0, 0], r: 0.32, color: 0xe23b2e },
      { el: "H", pos: [0.5, 0.38, 0], r: 0.18, color: 0xf2f5f8 },
      { el: "H", pos: [-0.5, 0.38, 0], r: 0.18, color: 0xf2f5f8 },
    ],
    [
      [0, 1],
      [0, 2],
    ],
    budget,
  );

const buildCO2: Builder = ({ budget }) =>
  moleculeGroup(
    [
      { el: "C", pos: [0, 0, 0], r: 0.28, color: 0x2b2f34 },
      { el: "O", pos: [0.72, 0, 0], r: 0.32, color: 0xe23b2e },
      { el: "O", pos: [-0.72, 0, 0], r: 0.32, color: 0xe23b2e },
    ],
    [
      [0, 1],
      [0, 2],
    ],
    budget,
  );

const buildBattery: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const radial = segments(36, budget);
  g.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.0, radial), plasticMaterial(0x1d232b, 0.5), [0, 0.5, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.325, 0.325, 0.22, radial), plasticMaterial(0xc9a227, 0.35), [0, 0.72, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, radial), steelMaterial(0xd9dee3), [0, 1.05, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, radial), steelMaterial(0xa9b0b7), [0, 0.015, 0]));
  const volts = num(properties, "voltage", 1.5);
  g.add(mesh(new THREE.BoxGeometry(0.16, 0.05, 0.02), plasticMaterial(volts >= 9 ? 0xff4d4d : 0xf5f7fa, 0.4), [0, 0.5, 0.33]));
  return g;
};

const buildResistor: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const radial = segments(28, budget);
  const body = mesh(new THREE.CapsuleGeometry(0.16, 0.5, segments(8, budget), radial), plasticMaterial(0xc8a06a, 0.6), [0, 0.35, 0], [0, 0, Math.PI / 2]);
  g.add(body);
  const bandColors = [0x2b2f34, 0x8a5a2b, 0xd93025, 0xf1c232];
  const r = num(properties, "resistance", 100);
  bandColors.forEach((c, i) => {
    g.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.055, radial), plasticMaterial(c, 0.5), [-0.18 + i * 0.12, 0.35, 0], [0, 0, Math.PI / 2]));
  });
  void r;
  const wire = steelMaterial(0xd4d9de);
  g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 10), wire, [-0.55, 0.35, 0], [0, 0, Math.PI / 2]));
  g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 10), wire, [0.55, 0.35, 0], [0, 0, Math.PI / 2]));
  return g;
};

const buildLed: Builder = ({ budget, properties }) => {
  const g = new THREE.Group();
  const radial = segments(28, budget);
  const color = str(properties, "color", "#ff3344");
  const on = properties?.["on"] === true || properties?.["lit"] === true;
  const dome = mesh(
    new THREE.SphereGeometry(0.22, radial, segments(18, budget), 0, Math.PI * 2, 0, Math.PI / 2),
    on
      ? emissiveMaterial(color, 2.2)
      : new THREE.MeshPhysicalMaterial({ color, transparent: true, opacity: 0.6, roughness: 0.15, transmission: 0.6, thickness: 0.2 }),
    [0, 0.6, 0],
  );
  g.add(dome);
  g.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4, radial), on ? emissiveMaterial(color, 1.2) : plasticMaterial(color, 0.3), [0, 0.4, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.05, radial), plasticMaterial(color, 0.35), [0, 0.2, 0]));
  const wire = steelMaterial(0xcdd3d8);
  g.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.4, 10), wire, [0.07, 0, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28, 10), wire, [-0.07, 0.06, 0]));
  if (on && budget.tier !== "low") {
    const light = new THREE.PointLight(new THREE.Color(color), 1.2, 4);
    light.position.set(0, 0.7, 0);
    g.add(light);
  }
  return g;
};

const BUILDERS: Record<string, Builder> = {
  beaker: buildBeaker,
  flask: buildFlask,
  "test-tube": buildTestTube,
  "bunsen-burner": buildBurner,
  "hot-plate": buildHotPlate,
  tripod: buildTripod,
  ball: buildBall,
  cube: buildCube,
  ramp: buildRamp,
  pendulum: buildPendulum,
  spring: buildSpring,
  thermometer: buildThermometer,
  timer: buildTimer,
  "molecule-h2o": buildWater,
  "molecule-co2": buildCO2,
  battery: buildBattery,
  resistor: buildResistor,
  led: buildLed,
};

export function hasRealisticMesh(componentId: string): boolean {
  return componentId in BUILDERS;
}

/**
 * Build a realistic group for a component id. Falls back to a rounded
 * lab-block when the id is unknown so nothing ever renders empty.
 */
export function buildRealisticMesh(
  componentId: string,
  options: MeshBuildOptions,
  fallbackColor = "#7f8b98",
): THREE.Group {
  const builder = BUILDERS[componentId];
  if (builder) {
    const group = builder(options);
    group.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = options.budget.shadows;
        o.receiveShadow = options.budget.shadows;
      }
    });
    return group;
  }

  const g = new THREE.Group();
  g.add(
    mesh(
      new THREE.BoxGeometry(0.9, 0.9, 0.9, 1, 1, 1),
      plasticMaterial(fallbackColor, 0.55),
      [0, 0.45, 0],
    ),
  );
  return g;
}

/** Bounding height so dropped objects sit on the ground plane. */
export function groundOffsetFor(object: THREE.Object3D): number {
  const box = new THREE.Box3().setFromObject(object);
  return Number.isFinite(box.min.y) ? -box.min.y : 0;
}
