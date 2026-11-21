/**
 * Escenas isométricas animadas de la sección de servicios del home.
 *
 * Cada escena dibuja dentro de un <svg viewBox="0 0 320 180"> creando sus
 * elementos una sola vez y devolviendo `render(f, t)`, que solo actualiza
 * atributos. `f` es la fracción del ciclo (0..1) y `t` los segundos dentro del
 * ciclo. Los colores y trazos viven en globals.css (clases .iso-*).
 *
 * Código solo de navegador: lo importa ServiceScene.tsx, que se carga con
 * next/dynamic sin SSR.
 */
import {
  TAU, armIK, circlePoints, gearOutline, isoProjector, lerp, lin, poseAt, seg, tri,
  type Point, type Projector,
} from "./iso-math";

export type SceneId = "auto" | "robot" | "ctrl" | "vision" | "print" | "data";
export interface Scene {
  /** Duración del ciclo en segundos. */
  dur: number;
  /** Fracción del ciclo que se muestra fija (movimiento reducido y antes de entrar en pantalla). */
  rest: number;
  render: (f: number, t: number) => void;
}

/* ---------- Ayudas de SVG ---------- */
const NS = "http://www.w3.org/2000/svg";
type Attrs = Record<string, string | number>;

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs, parent?: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(e);
  return e;
}
function set(e: Element, attrs: Attrs): void {
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
}
const fx = (n: number) => n.toFixed(1);
const xy = (p: Point) => `${fx(p[0])} ${fx(p[1])}`;
const pts = (P: Projector, a: [number, number, number][]) => a.map(([x, y, z]) => P(x, y, z).map(fx).join(",")).join(" ");
const polyPath = (P: Projector, polys: Point[][], z: number) =>
  polys.map((pl) => "M" + pl.map(([x, y]) => xy(P(x, y, z))).join("L") + "Z").join("");

interface Cube { g: SVGGElement; r: SVGPolygonElement; l: SVGPolygonElement; t: SVGPolygonElement }
/** Caja con tres caras visibles. tone "n" = neutra, "g" = lima. */
function cube(parent: Element, tone: "n" | "g"): Cube {
  const g = el("g", {}, parent);
  return {
    g,
    r: el("polygon", { class: `iso-${tone}-r` }, g),
    l: el("polygon", { class: `iso-${tone}-l` }, g),
    t: el("polygon", { class: `iso-${tone}-t` }, g),
  };
}
function setCube(c: Cube, P: Projector, x: number, y: number, z: number, w: number, d: number, h: number): Cube {
  set(c.r, { points: pts(P, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]) });
  set(c.l, { points: pts(P, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]) });
  set(c.t, { points: pts(P, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]) });
  return c;
}
/** Círculo horizontal (en el plano del suelo) proyectado: una elipse. */
function isoEllipse(P: Projector, s: number, x: number, y: number, z: number, r: number): Attrs {
  const [cx, cy] = P(x, y, z);
  return { cx: fx(cx), cy: fx(cy), rx: fx(r * 1.2247 * s), ry: fx(r * 0.7071 * s) };
}
/** Base cilíndrica de robot. */
function cylinder(svg: Element, P: Projector, s: number, r: number, h: number): void {
  const e0 = isoEllipse(P, s, 0, 0, 0, r), e1 = isoEllipse(P, s, 0, 0, h, r);
  const [cx0, cy0, rx] = [Number(e0.cx), Number(e0.cy), Number(e0.rx)];
  const [cx1, cy1] = [Number(e1.cx), Number(e1.cy)];
  el("path", { d: `M${fx(cx1 - rx)} ${fx(cy1)}L${fx(cx0 - rx)} ${fx(cy0)}A${e0.rx} ${e0.ry} 0 0 0 ${fx(cx0 + rx)} ${fx(cy0)}L${fx(cx1 + rx)} ${fx(cy1)}Z`, class: "iso-n-r iso-edge" }, svg);
  el("ellipse", { ...e1, class: "iso-n-t iso-edge" }, svg);
}
function line(parent: Element, a: Point, b: Point, cls: string): SVGLineElement {
  return el("line", { x1: fx(a[0]), y1: fx(a[1]), x2: fx(b[0]), y2: fx(b[1]), class: cls }, parent);
}
function setLine(l: SVGLineElement, a: Point, b: Point): void {
  set(l, { x1: fx(a[0]), y1: fx(a[1]), x2: fx(b[0]), y2: fx(b[1]) });
}
/** Pictograma de persona con los pies en y=148 y el centro en x=0. */
function pictogram(parent: Element, vest: boolean): SVGGElement {
  const g = el("g", {}, parent);
  el("path", { d: "M-6 104L-7 148M6 104L7 148", class: "iso-limb", "stroke-width": 6 }, g);
  el("path", { d: "M-13 74L-18 102M13 74L18 102", class: "iso-limb", "stroke-width": 5 }, g);
  el("rect", { x: -13, y: 68, width: 26, height: 37, rx: 6, class: "iso-body" }, g);
  if (vest) {
    el("path", { d: "M-13 74Q-13 68 -7 68H-3L-1.5 99H-13ZM13 74Q13 68 7 68H3L1.5 99H13Z", class: "iso-vest" }, g);
    el("path", { d: "M-13 84H-1.9M1.9 84H13M-13 92H-1.6M1.6 92H13", class: "iso-reflect" }, g);
  }
  el("circle", { cx: 0, cy: 57, r: 8.5, class: "iso-body" }, g);
  return g;
}

/* ---------- 01 · Cajas por la cinta que se apilan en el pallet ---------- */
function auto(svg: SVGSVGElement): Scene {
  const P = isoProjector(85, 43, 1.15);
  setCube(cube(svg, "n"), P, 140, 4, 0, 52, 44, 6);
  setCube(cube(svg, "n"), P, 0, 12, 0, 124, 26, 12);
  const stripes = Array.from({ length: 8 }, () => el("line", { class: "iso-thin" }, svg));
  const slots: Point[] = [[144, 6], [166, 6], [144, 26], [166, 26]];
  const boxes = slots.map(() => cube(svg, "g"));
  return {
    dur: 6, rest: 0.8,
    render(f, t) {
      stripes.forEach((l, k) => {
        const x = (k * 16 + t * 45) % 128;
        setLine(l, P(x, 12, 12), P(x, 38, 12));
        set(l, { opacity: x > 3 && x < 121 ? 1 : 0 });
      });
      const order: [number, number, SVGGElement][] = [];
      boxes.forEach((c, i) => {
        const s = 0.04 + i * 0.16;
        let x = -2, y = 16, z = 12, o = 0;
        if (f >= s) {
          o = lin(f, s, s + 0.02) * (1 - lin(f, 0.9, 0.96));
          x = lerp(-2, 100, lin(f, s, s + 0.12));
          const q = seg(f, s + 0.12, s + 0.2);
          if (q > 0) {
            x = lerp(100, slots[i][0], q);
            y = lerp(16, slots[i][1], q);
            z = lerp(12, 6, q) + Math.sin(Math.PI * q) * 16;
          }
        }
        setCube(c, P, x, y, z, 18, 18, 16);
        set(c.g, { opacity: o.toFixed(2) });
        order.push([x + y, z, c.g]);
      });
      // Orden de pintado: primero lo más lejano (menor x + y) y lo más bajo.
      order.sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach((o) => svg.appendChild(o[2]));
    },
  };
}

/* ---------- 02 · Robot soldando una unión en T ---------- */
function robot(svg: SVGSVGElement): Scene {
  // Encuadre calculado para que el brazo quepa en todo el ciclo (codo incluido).
  const s = 1.05, P = isoProjector(137, 92, s);
  el("polygon", { points: pts(P, [[-40, -30, 0], [95, -30, 0], [95, 45, 0], [-40, 45, 0]]), class: "iso-floor" }, svg);
  cylinder(svg, P, s, 13, 12);
  // Máquina de soldar con su pantalla, a la izquierda de la base.
  setCube(cube(svg, "n"), P, -36, 22, 0, 16, 14, 20);
  el("polygon", { points: pts(P, [[-33, 36, 11], [-25, 36, 11], [-25, 36, 16], [-33, 36, 16]]), class: "iso-screen-face" }, svg);
  el("polygon", { points: pts(P, [[-33, 36, 4], [-29, 36, 4], [-29, 36, 7], [-33, 36, 7]]), class: "iso-g-l" }, svg);
  setCube(cube(svg, "n"), P, 32, -16, 0, 54, 30, 10);
  setCube(cube(svg, "n"), P, 36, -12, 10, 46, 22, 4);
  setCube(cube(svg, "n"), P, 36, -6, 14, 46, 6, 14);
  const X0 = 40, X1 = 78, SEAM: [number, number] = [1, 14.6];
  const bead = el("line", { class: "iso-bead" }, svg);
  const hot = el("line", { class: "iso-hot" }, svg);
  const hose = el("path", { class: "iso-hose" }, svg);
  const hoseFrom = P(-28, 29, 20);
  const l1 = el("line", { class: "iso-arm" }, svg), l2 = el("line", { class: "iso-arm" }, svg);
  // Antorcha MIG de cuello de cisne: cuerpo recto, cuello curvo y boquilla metálica.
  const body = el("line", { class: "iso-torch" }, svg);
  const neck = el("path", { class: "iso-neck" }, svg);
  const nozzleO = el("line", { class: "iso-nozzle-o" }, svg), nozzle = el("line", { class: "iso-nozzle" }, svg);
  const pS = P(0, 0, 18);
  el("circle", { cx: fx(pS[0]), cy: fx(pS[1]), r: 5.5, class: "iso-joint" }, svg);
  const jE = el("circle", { r: 5, class: "iso-joint" }, svg), jW = el("circle", { r: 4.2, class: "iso-joint" }, svg);
  const halo = el("circle", { r: 7, class: "iso-halo" }, svg), core = el("circle", { r: 2.6, class: "iso-core" }, svg);
  // Chispas: dirección, velocidad y desfase fijos para que el ciclo se repita igual.
  const sparks = Array.from({ length: 10 }, (_, i) => ({
    a: 0.35 + (i * 0.61) % 2.4, v: 0.6 + ((i * 0.37) % 0.5), ph: (i * 0.29) % 1,
    l: el("line", { class: "iso-spark" }, svg),
  }));
  const Sz = 18, L1 = 44, L2 = 40;
  // Punta de la antorcha: [fracción, x, y, z]. Entre 0.24 y 0.74 avanza soldando (velocidad constante).
  // Reposo con la antorcha adelantada: si la muñeca queda detrás del hombro en la vista
  // isométrica, el brazo parece plegado sobre la base.
  const poses = [[0, 22, -8, 36], [0.16, X0, 1.5, 30], [0.24, X0, 1.5, 15.5], [0.74, X1, 1.5, 15.5], [0.84, X1, 1.5, 32], [1, 22, -8, 36]];
  return {
    dur: 6, rest: 0.6,
    render(f, t) {
      const welding = f >= 0.24 && f <= 0.74;
      const [, tx, ty, tz] = welding ? [f, lerp(X0, X1, lin(f, 0.24, 0.74)), 1.5, 15.5] : poseAt(poses, f);
      // La muñeca queda detrás y por encima de la punta: antorcha inclinada.
      const wx = tx - 4, wy = ty + 8, wz = tz + 16;
      const yaw = Math.atan2(wy, wx), rho = Math.hypot(wx, wy);
      const [er, ez] = armIK(rho, wz - Sz, L1, L2);
      const c = Math.cos(yaw), sn = Math.sin(yaw);
      const pE = P(er * c, er * sn, Sz + ez), pW = P(wx, wy, wz), pT = P(tx, ty, tz);
      setLine(l1, pS, pE); setLine(l2, pE, pW);
      set(jE, { cx: fx(pE[0]), cy: fx(pE[1]) }); set(jW, { cx: fx(pW[0]), cy: fx(pW[1]) });
      // Antorcha: cuerpo hacia abajo desde la muñeca, cuello curvo y boquilla alineada con la punta.
      const pB = P(wx, wy, wz - 5);
      const pN = P(tx - 4 * 0.27, ty + 8 * 0.27, tz + 16 * 0.27);
      const pC = P(wx - 0.5, wy + 1, wz - 11);
      setLine(body, pW, pB);
      set(neck, { d: `M${xy(pB)}Q${xy(pC)} ${xy(pN)}` });
      setLine(nozzleO, pN, pT); setLine(nozzle, pN, pT);
      const mid = P(wx * 0.4 - 14, wy * 0.4 + 14, 34);
      set(hose, { d: `M${xy(hoseFrom)}Q${xy(mid)} ${xy(pW)}` });
      // Cordón: crece mientras suelda y se queda hasta el final del ciclo.
      const reach = lerp(X0, X1, lin(f, 0.24, 0.74)), out = 1 - lin(f, 0.92, 0.98);
      setLine(bead, P(X0, SEAM[0], SEAM[1]), P(reach, SEAM[0], SEAM[1]));
      set(bead, { opacity: f > 0.245 ? out.toFixed(2) : 0 });
      setLine(hot, P(Math.max(X0, reach - 6), SEAM[0], SEAM[1]), P(reach, SEAM[0], SEAM[1]));
      set(hot, { opacity: welding ? 1 : 0 });
      const flick = 0.55 + 0.45 * Math.sin(t * 47);
      set(halo, { cx: fx(pT[0]), cy: fx(pT[1]), opacity: welding ? (0.5 * flick).toFixed(2) : 0 });
      set(core, { cx: fx(pT[0]), cy: fx(pT[1]), opacity: welding ? 1 : 0 });
      for (const sp of sparks) {
        const age = (t / 0.4 + sp.ph) % 1, d = 26 * sp.v * age;
        const x = pT[0] + Math.cos(sp.a) * d, y = pT[1] - Math.sin(sp.a) * d + 30 * age * age;
        const x0 = x - Math.cos(sp.a) * 3, y0 = y + Math.sin(sp.a) * 3 - 2 * age;
        setLine(sp.l, [x0, y0], [x, y]);
        set(sp.l, { opacity: welding ? (1 - age).toFixed(2) : 0 });
      }
    },
  };
}

/* ---------- 03 · Tablero que recibe la medida de un sensor ---------- */
function ctrl(svg: SVGSVGElement): Scene {
  const s = 1.05, ox = 138, oy = 82, P = isoProjector(ox, oy, s);
  const cable = el("path", { d: "M" + [P(60, 38, 0), P(60, 11, 0), P(36, 11, 0)].map(xy).join("L"), class: "iso-cable" }, svg);
  setCube(cube(svg, "n"), P, 0, 0, 0, 36, 22, 64);
  // Cara frontal del tablero (plano y = 22) con coordenadas locales: u a lo largo de x, v hacia abajo.
  const face = el("g", { transform: `matrix(${0.866 * s} ${0.5 * s} 0 ${s} ${ox - 22 * 0.866 * s} ${oy + (11 - 64) * s})` }, svg);
  el("rect", { x: 3, y: 3, width: 30, height: 58, rx: 1.5, class: "iso-door" }, face);
  el("rect", { x: 7, y: 9, width: 22, height: 11, rx: 1, class: "iso-screen" }, face);
  const read = el("text", { x: 18, y: 16.6, class: "iso-read" }, face);
  const leds = [11, 18, 25].map((x) => el("circle", { cx: x, cy: 28, r: 2.3, class: "iso-led" }, face));
  el("path", { d: "M28 35V45M8 51H20M8 54H20M8 57H20", class: "iso-detail" }, face);
  setCube(cube(svg, "n"), P, 48, 38, 0, 66, 9, 9);
  line(svg, P(80, 42.5, 9), P(80, 42.5, 22), "iso-ink");
  const rings = [0, 1].map(() => el("ellipse", { class: "iso-ring" }, svg));
  el("ellipse", { ...isoEllipse(P, s, 80, 42.5, 22, 5), class: "iso-g-t iso-edge" }, svg);
  const val = (f: number) => 0.52 + 0.26 * Math.sin(TAU * f) + 0.06 * Math.sin(3 * TAU * f + 1);
  return {
    dur: 6, rest: 0.4,
    render(f, t) {
      read.textContent = (60 + val(f) * 30).toFixed(1).replace(".", ",") + " °C";
      const on = Math.floor(t * 2.5) % 3;
      leds.forEach((l, i) => set(l, { class: i === on ? "iso-led on" : "iso-led" }));
      rings.forEach((r, i) => {
        const p = (f * 4 + i / 2) % 1;
        set(r, { ...isoEllipse(P, s, 80, 42.5, 22, 5 + 11 * p), opacity: (1 - p).toFixed(2) });
      });
      set(cable, { "stroke-dashoffset": ((t * 14) % 8).toFixed(2) });
    },
  };
}

/* ---------- 04 · La cámara detecta a quien no lleva chaleco ---------- */
function vision(svg: SVGSVGElement): Scene {
  const s = 0.85, P = isoProjector(141, 69, s);
  el("polygon", { points: pts(P, [[0, 0, 0], [130, 0, 0], [130, 80, 0], [0, 80, 0]]), class: "iso-floor" }, svg);
  line(svg, P(4, 76, 0), P(4, 76, 54), "iso-ink");
  setCube(cube(svg, "n"), P, 0, 70, 54, 10, 10, 9);
  const lens = P(10, 75, 58);
  el("circle", { cx: fx(lens[0]), cy: fx(lens[1]), r: 3, class: "iso-joint" }, svg);
  const foot = el("polygon", { class: "iso-foot" }, svg);
  const ringA = el("ellipse", { ...isoEllipse(P, s, 40, 62, 0, 13), class: "iso-okring" }, svg);
  const ringB = el("ellipse", { ...isoEllipse(P, s, 105, 30, 0, 13), class: "iso-badring" }, svg);
  const fa = P(40, 62, 0), fb = P(105, 30, 0), k = 0.72;
  set(pictogram(svg, true), { transform: `translate(${fx(fa[0])} ${fx(fa[1] - 148 * k)}) scale(${k})` });
  set(pictogram(svg, false), { transform: `translate(${fx(fb[0])} ${fx(fb[1] - 148 * k)}) scale(${k})` });
  const cones = [0, 1, 2, 3].map(() => el("line", { class: "iso-cone" }, svg));
  const box = el("rect", { x: fx(fb[0] - 17), y: fx(fb[1] - 74), width: 34, height: 78, class: "iso-bad" }, svg);
  const tag = el("g", {}, svg);
  el("rect", { x: fx(fb[0] - 17), y: fx(fb[1] - 86), width: 66, height: 12, class: "iso-tagbg" }, tag);
  el("text", { x: fx(fb[0] - 13), y: fx(fb[1] - 77.4), class: "iso-tag" }, tag).textContent = "SIN CHALECO";
  return {
    dur: 6, rest: 0.7,
    render(f, t) {
      const p = lin(f, 0.05, 0.55), mx = lerp(24, 122, p), my = lerp(70, 22, p);
      const cs: Point[] = [[mx - 15, my - 15], [mx + 15, my - 15], [mx + 15, my + 15], [mx - 15, my + 15]];
      const of = (f > 0.05 ? 1 : 0) * (1 - lin(f, 0.55, 0.6));
      set(foot, { points: pts(P, cs.map(([x, y]) => [x, y, 0])), opacity: of.toFixed(2) });
      cones.forEach((l, i) => { setLine(l, lens, P(cs[i][0], cs[i][1], 0)); set(l, { opacity: of.toFixed(2) }); });
      const out = 1 - lin(f, 0.9, 0.95);
      set(ringA, { opacity: (lin(f, 0.12, 0.15) * out).toFixed(2) });
      const ob = lin(f, 0.45, 0.48) * out;
      set(ringB, { opacity: ob.toFixed(2) });
      set(box, { opacity: ob.toFixed(2), "stroke-opacity": (0.6 + 0.4 * Math.cos(t * 7)).toFixed(2) });
      set(tag, { opacity: ob.toFixed(2) });
    },
  };
}

/* ---------- 05 · Engranaje impreso capa a capa ---------- */
function print(svg: SVGSVGElement): Scene {
  const P = isoProjector(160, 92, 1.25);
  setCube(cube(svg, "n"), P, -46, -46, -4, 92, 92, 4);
  const polys: Point[][] = [gearOutline(12, 34, 28), circlePoints(0, 0, 8)];
  for (let i = 0; i < 4; i++) {
    const a = (i * TAU) / 4 + Math.PI / 4;
    polys.push(circlePoints(18 * Math.cos(a), 18 * Math.sin(a), 4.5, 14));
  }
  const N = 12, dz = 2.6;
  const layers = Array.from({ length: N }, (_, i) => el("path", { d: polyPath(P, polys, (i + 1) * dz), "fill-rule": "evenodd", class: "iso-layer" }, svg));
  const noz = cube(svg, "n");
  const tip = el("path", { class: "iso-g-t iso-edge" }, svg);
  return {
    dur: 5, rest: 0.8,
    render(f, t) {
      const pr = lin(f, 0.04, 0.6), k = Math.min(N, Math.floor(pr * N)), out = 1 - lin(f, 0.92, 0.98);
      layers.forEach((l, i) => {
        const vis = i < k || (i === k && pr > 0 && k < N);
        const on = (i === k && k < N) || (k === N && i === N - 1 && f > 0.62);
        set(l, { opacity: vis ? out.toFixed(2) : 0, class: on ? "iso-layer on" : "iso-layer" });
      });
      let nx = -26 + 52 * tri(t * 2.2), nz = (k + 1) * dz + 4;
      const park = seg(f, 0.6, 0.7);
      if (park > 0) { nx = lerp(nx, 36, park); nz = lerp(nz, 48, park); }
      if (f < 0.04) { nx = -26; nz = dz + 4; }
      setCube(noz, P, nx - 4, -4, nz + 4, 8, 8, 8);
      set(tip, { d: `M${xy(P(nx - 2, 0, nz + 4))}L${xy(P(nx + 2, 0, nz + 4))}L${xy(P(nx, 0, nz))}Z` });
    },
  };
}

/* ---------- 06 · Las líneas del documento se vuelven un gráfico ---------- */
function data(svg: SVGSVGElement): Scene {
  const P = isoProjector(135, 39, 1.3);
  el("polygon", { points: pts(P, [[0, 8, 0], [44, 8, 0], [44, 68, 0], [0, 68, 0]]), class: "iso-n-t" }, svg);
  const ys = [16, 28, 40, 52], lens = [30, 24, 32, 20], H = [20, 36, 28, 46];
  const lines = ys.map((y, i) => el("polygon", { points: pts(P, [[6, y, 0.3], [6 + lens[i], y, 0.3], [6 + lens[i], y + 3, 0.3], [6, y + 3, 0.3]]), class: "iso-line" }, svg));
  setCube(cube(svg, "n"), P, 62, 16, 0, 76, 24, 3);
  const arcs = ys.map((y, i) => {
    const a = P(6 + lens[i], y + 1.5, 0), b = P(74 + i * 17, 28, 3);
    const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 26;
    return el("path", { d: `M${xy(a)}Q${fx(mx)} ${fx(my)} ${xy(b)}`, class: "iso-dash" }, svg);
  });
  const bars = ys.map(() => cube(svg, "g"));
  const scan = el("line", { class: "iso-scan" }, svg);
  return {
    dur: 6, rest: 0.8,
    render(f) {
      const out = 1 - lin(f, 0.9, 0.96);
      const sy = lerp(9, 67, lin(f, 0.05, 0.45));
      setLine(scan, P(-2, sy, 0.5), P(46, sy, 0.5));
      set(scan, { opacity: f > 0.05 && f < 0.45 ? 1 : 0 });
      ys.forEach((y, i) => {
        const t0 = 0.05 + 0.4 * ((y + 1.5 - 9) / 58);
        set(lines[i], { class: f > t0 && f < 0.9 ? "iso-line on" : "iso-line" });
        set(arcs[i], { opacity: (lin(f, t0, t0 + 0.04) * out * 0.9).toFixed(2) });
        const h = Math.max(0.01, H[i] * seg(f, t0 + 0.04, t0 + 0.16));
        setCube(bars[i], P, 68 + i * 17, 22, 3, 12, 12, h);
        set(bars[i].g, { opacity: (f > t0 + 0.04 ? out : 0).toFixed(2) });
      });
    },
  };
}

const BUILDERS: Record<SceneId, (svg: SVGSVGElement) => Scene> = { auto, robot, ctrl, vision, print, data };

export function buildScene(id: SceneId, svg: SVGSVGElement): Scene {
  return BUILDERS[id](svg);
}

/* ---------- Reloj compartido: un solo requestAnimationFrame para todas las escenas ---------- */
type Tick = (dt: number) => void;
const ticks = new Set<Tick>();
let raf = 0;
let last = 0;
function loop(now: number): void {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  ticks.forEach((fn) => fn(dt));
  raf = ticks.size ? requestAnimationFrame(loop) : 0;
}
export function addTick(fn: Tick): void {
  ticks.add(fn);
  if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
}
export function removeTick(fn: Tick): void {
  ticks.delete(fn);
  if (!ticks.size && raf) { cancelAnimationFrame(raf); raf = 0; }
}
