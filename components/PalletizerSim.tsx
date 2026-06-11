"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "motion/react";

type Pattern = "2x2" | "1x4" | "2x3";

interface Readouts {
  state: string;
  boxes: number;
  pallets: number;
}

interface PalletizerSimProps {
  /** Extra className for the outer wrapper */
  className?: string;
}

export default function PalletizerSim({ className = "" }: PalletizerSimProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const simRef = useRef<SimState | null>(null);

  const [pattern, setPattern] = useState<Pattern>("2x2");
  const [speed, setSpeed] = useState(100);
  const [paused, setPaused] = useState(false);
  const [readouts, setReadouts] = useState<Readouts>({ state: "ESPERA", boxes: 0, pallets: 0 });

  const prefersReduced = useReducedMotion() ?? false;

  /* ------------------------------------------------------------------ */
  /* Simulation engine — mirrors palletizer.js geometry exactly          */
  /* ------------------------------------------------------------------ */
  const initSim = useCallback(
    (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d")!;

      /* ISO camera */
      const KX = Math.cos(Math.PI / 6),
        KY = 0.5;
      let W = 0,
        H = 0,
        SC = 1.8,
        OX = 0,
        OY = 0;

      const FITPTS: [number, number, number][] = [
        [-200, -80, 48], [-200, -40, 0], [240, 50, 0], [240, 92, 36],
        [0, 0, 120], [-55, 90, 0], [75, 100, 0], [-40, -60, 95],
      ];

      function fit() {
        const r = canvas.parentElement!.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        W = r.width;
        H = r.height;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        for (const [px, py, pz] of FITPTS) {
          const sx = (px - py) * KX,
            sy = (px + py) * KY - pz;
          x0 = Math.min(x0, sx); x1 = Math.max(x1, sx);
          y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
        }
        SC = Math.min((W - 60) / (x1 - x0), (H - 50) / (y1 - y0));
        OX = W / 2 - SC * (x0 + x1) / 2;
        OY = H / 2 - SC * (y0 + y1) / 2;
      }

      const ro = new ResizeObserver(fit);
      ro.observe(canvas.parentElement!);
      fit();

      const P = (x: number, y: number, z: number): [number, number] => [
        (x - y) * KX * SC + OX,
        (x + y) * KY * SC - z * SC + OY,
      ];

      /* World constants */
      const BS = 24, BH = 22, PITCH = 28;
      const IN_Y = -60, IN_X0 = -195, PICK_X = -40, IN_TOP = 16;
      const OUT_Y = 70, OUT_X0 = -55, OUT_X1 = 235, OUT_TOP = 9;
      const PC = { x: 12, y: OUT_Y };
      const PAL_H = 7, PAL_TOP = OUT_TOP + PAL_H;
      const SH = { x: 0, y: 0, z: 34 };
      const L1 = 70, L2 = 58, WRIST = 14;

      const PATTERNS: Record<Pattern, { cols: number; rows: number }> = {
        "2x2": { cols: 2, rows: 2 },
        "1x4": { cols: 4, rows: 1 },
        "2x3": { cols: 3, rows: 2 },
      };

      /* Mutable sim state held in a ref object */
      type Slot = { x: number; y: number };
      type ToolPos = { x: number; y: number; z: number };
      type SeqStep = { p: ToolPos; d: number; on?: () => void };
      type Seg = { a: ToolPos; b: ToolPos; d: number; t: number; on?: () => void };

      const sim = {
        pattern: "2x2" as Pattern,
        speed: 1,
        paused: false,
        tool: { x: -10, y: 16, z: 92 } as ToolPos,
        seq: [] as SeqStep[],
        seg: null as Seg | null,
        carrying: false,
        placed: [] as Slot[],
        nextIdx: 0,
        queue: [] as number[],
        beltOff: 0,
        outOff: 0,
        transfer: null as { phase: "out" | "in"; t: number } | null,
        shift: 0,
        boxesTotal: 0,
        palletsDone: 0,
        state: "ESPERA",
        onReadout: (_r: Readouts) => {},
        cleanup: ro.disconnect.bind(ro),
      };

      simRef.current = sim as unknown as SimState;

      function setState(s: string) {
        sim.state = s;
        sim.onReadout({ state: s, boxes: sim.boxesTotal, pallets: sim.palletsDone });
      }

      function slots(): Slot[] {
        const { cols, rows } = PATTERNS[sim.pattern];
        const out: Slot[] = [];
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++)
            out.push({
              x: PC.x + (c - (cols - 1) / 2) * PITCH,
              y: PC.y + (r - (rows - 1) / 2) * PITCH,
            });
        return out;
      }

      const ease = (t: number) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      function go(pts: SeqStep[]) {
        sim.seq = sim.seq.concat(pts);
      }

      function stepArm(dt: number): boolean {
        if (!sim.seg) {
          const n = sim.seq.shift();
          if (!n) return true;
          sim.seg = { a: { ...sim.tool }, b: n.p, d: n.d, t: 0, on: n.on };
        }
        sim.seg.t += (dt * sim.speed) / sim.seg.d;
        const t = Math.min(1, sim.seg.t),
          e = ease(t);
        sim.tool.x = sim.seg.a.x + (sim.seg.b.x - sim.seg.a.x) * e;
        sim.tool.y = sim.seg.a.y + (sim.seg.b.y - sim.seg.a.y) * e;
        sim.tool.z = sim.seg.a.z + (sim.seg.b.z - sim.seg.a.z) * e;
        if (t >= 1) {
          const f = sim.seg.on;
          sim.seg = null;
          if (f) f();
        }
        return false;
      }

      function plan() {
        if (sim.transfer) { setState("TRANSFERENCIA"); return; }
        if (!sim.carrying) {
          const ready = sim.queue.length && Math.abs(sim.queue[0] - PICK_X) < 0.8;
          if (!ready) { setState("ESPERA"); return; }
          setState("RECOGIENDO");
          go([
            { p: { x: PICK_X, y: IN_Y, z: 88 }, d: 0.85 },
            {
              p: { x: PICK_X, y: IN_Y, z: IN_TOP + BH }, d: 0.5,
              on: () => { sim.queue.shift(); sim.carrying = true; },
            },
            { p: { x: PICK_X, y: IN_Y, z: 88 }, d: 0.45, on: () => setState("TRASLADO") },
          ]);
        } else {
          const sl = slots()[sim.nextIdx];
          go([
            { p: { x: sl.x, y: sl.y, z: 88 }, d: 1.05, on: () => setState("COLOCANDO") },
            {
              p: { x: sl.x, y: sl.y, z: PAL_TOP + BH }, d: 0.55,
              on: () => {
                sim.carrying = false;
                sim.placed.push(sl);
                sim.nextIdx++;
                sim.boxesTotal++;
                if (sim.nextIdx >= slots().length)
                  sim.transfer = { phase: "out", t: 0 };
                sim.onReadout({ state: sim.state, boxes: sim.boxesTotal, pallets: sim.palletsDone });
              },
            },
            { p: { x: sl.x, y: sl.y, z: 88 }, d: 0.45 },
          ]);
        }
      }

      function update(dt: number) {
        const sp = 32 * sim.speed;
        for (let i = 0; i < sim.queue.length; i++) {
          const stop = i === 0 ? PICK_X : sim.queue[i - 1] - (BS + 7);
          sim.queue[i] = Math.min(sim.queue[i] + sp * dt, stop);
        }
        if (!sim.queue.length || sim.queue[sim.queue.length - 1] > IN_X0 + 34)
          sim.queue.push(IN_X0);
        sim.beltOff = (sim.beltOff + sp * dt) % 16;

        if (sim.transfer) {
          sim.transfer.t += dt * sim.speed / (sim.transfer.phase === "out" ? 2.3 : 1.4);
          const e = ease(Math.min(1, sim.transfer.t));
          if (sim.transfer.phase === "out") {
            sim.shift = e * 250;
            sim.outOff = (sim.outOff + sp * dt) % 16;
            if (sim.transfer.t >= 1) {
              sim.palletsDone++;
              sim.placed = []; sim.nextIdx = 0;
              sim.transfer = { phase: "in", t: 0 };
              sim.onReadout({ state: sim.state, boxes: sim.boxesTotal, pallets: sim.palletsDone });
            }
          } else {
            sim.shift = -140 * (1 - e);
            sim.outOff = (sim.outOff + sp * dt) % 16;
            if (sim.transfer.t >= 1) { sim.transfer = null; sim.shift = 0; }
          }
        }
        if (stepArm(dt)) plan();
      }

      /* Drawing helpers */
      function poly(
        pts: [number, number][],
        fill?: string,
        stroke?: string
      ) {
        ctx.beginPath();
        pts.forEach((p, i) =>
          i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])
        );
        ctx.closePath();
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
      }

      function box(
        x: number, y: number, zb: number,
        w: number, d: number, h: number,
        top: string, right: string, left: string, edge: string
      ) {
        const zt = zb + h;
        const A = P(x - w / 2, y - d / 2, zt), B = P(x + w / 2, y - d / 2, zt);
        const C = P(x + w / 2, y + d / 2, zt), D = P(x - w / 2, y + d / 2, zt);
        const B2 = P(x + w / 2, y - d / 2, zb), C2 = P(x + w / 2, y + d / 2, zb);
        const D2 = P(x - w / 2, y + d / 2, zb);
        poly([A, B, C, D], top, edge);
        poly([B, C, C2, B2], right, edge);
        poly([C, D, D2, C2], left, edge);
      }

      function shadow(x: number, y: number, rx: number, alpha: number) {
        const [sx, sy] = P(x, y, 0);
        ctx.beginPath();
        ctx.ellipse(sx, sy, rx * KX * SC, rx * KY * SC, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fill();
      }

      const CARTON = ["#c9a96e", "#b08f55", "#977a47", "rgba(20,14,4,.25)"];
      function carton(x: number, y: number, zb: number) {
        box(x, y, zb, BS, BS, BH, CARTON[0], CARTON[1], CARTON[2], CARTON[3]);
        const m = 3.2;
        poly(
          [P(x - m, y - BS / 2, zb + BH + 0.1), P(x + m, y - BS / 2, zb + BH + 0.1),
           P(x + m, y + BS / 2, zb + BH + 0.1), P(x - m, y + BS / 2, zb + BH + 0.1)],
          "rgba(120,95,50,.5)"
        );
      }

      function conveyorX(
        xa: number, xb: number, y: number, top: number,
        wd: number, off: number, withStripes: boolean
      ) {
        for (let lx = xa + 16; lx < xb - 6; lx += 56)
          box(lx, y, 0, 5, wd - 8, top - 9, "#1c2026", "#14181e", "#11141a", "rgba(0,0,0,.4)");
        box((xa + xb) / 2, y, top - 9, xb - xa, wd, 9, "#22262d", "#181c22", "#14181d", "rgba(0,0,0,.45)");
        poly(
          [P(xa, y - wd / 2 + 3, top + 0.1), P(xb, y - wd / 2 + 3, top + 0.1),
           P(xb, y + wd / 2 - 3, top + 0.1), P(xa, y + wd / 2 - 3, top + 0.1)],
          "#101319"
        );
        if (withStripes) {
          ctx.save(); ctx.globalAlpha = 0.5;
          for (let sx = xa + (off % 16); sx < xb - 2; sx += 16)
            poly(
              [P(sx, y - wd / 2 + 4, top + 0.2), P(sx + 2, y - wd / 2 + 4, top + 0.2),
               P(sx + 2, y + wd / 2 - 4, top + 0.2), P(sx, y + wd / 2 - 4, top + 0.2)],
              "#262c35"
            );
          ctx.restore();
        }
        poly(
          [P(xa, y - wd / 2, top + 0.15), P(xb, y - wd / 2, top + 0.15),
           P(xb, y - wd / 2 + 1.6, top + 0.15), P(xa, y - wd / 2 + 1.6, top + 0.15)],
          "rgba(170,217,0,.35)"
        );
      }

      function pallet(cx: number, cy: number) {
        const { cols, rows } = PATTERNS[sim.pattern];
        const pw = cols * PITCH + 12, pd = rows * PITCH + 12;
        box(cx, cy, OUT_TOP, pw, pd, PAL_H, "#6e5c40", "#5b4b33", "#4c3f2b", "rgba(0,0,0,.35)");
        for (let i = 1; i < 3; i++) {
          const gx = cx - pw / 2 + (pw / 3) * i;
          poly(
            [P(gx - 0.8, cy - pd / 2, OUT_TOP + PAL_H + 0.1), P(gx + 0.8, cy - pd / 2, OUT_TOP + PAL_H + 0.1),
             P(gx + 0.8, cy + pd / 2, OUT_TOP + PAL_H + 0.1), P(gx - 0.8, cy + pd / 2, OUT_TOP + PAL_H + 0.1)],
            "rgba(0,0,0,.3)"
          );
        }
      }

      /* Robot IK */
      function ik() {
        const wx = sim.tool.x, wy = sim.tool.y, wz = sim.tool.z + WRIST;
        const r = Math.max(8, Math.hypot(wx, wy));
        const dz = wz - SH.z;
        let D = Math.hypot(r, dz);
        D = Math.max(Math.abs(L1 - L2) + 2, Math.min(D, L1 + L2 - 2));
        const a = Math.atan2(dz, r);
        const cosA = (L1 * L1 + D * D - L2 * L2) / (2 * L1 * D);
        const ang1 = a + Math.acos(Math.max(-1, Math.min(1, cosA)));
        const er = L1 * Math.cos(ang1), ez = SH.z + L1 * Math.sin(ang1);
        const ux = wx / r, uy = wy / r;
        return {
          sh: P(SH.x, SH.y, SH.z),
          el: P(ux * er, uy * er, ez),
          wr: P(wx, wy, wz),
          tl: P(sim.tool.x, sim.tool.y, sim.tool.z),
        };
      }

      function thickLine(
        a: [number, number], b: [number, number],
        w: number, fill: string, edge: string
      ) {
        ctx.lineCap = "round";
        ctx.strokeStyle = edge; ctx.lineWidth = w + 2.5;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        ctx.strokeStyle = fill; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }

      function joint(p: [number, number], r: number) {
        ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
        ctx.fillStyle = "#f1f2f4"; ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = "#ff6a2b"; ctx.stroke();
      }

      function drawRobot() {
        const sf = SC / 1.8;
        shadow(0, 0, 26, 0.28);
        box(0, 0, 0, 30, 30, 6, "#31353c", "#262a31", "#1c2026", "rgba(0,0,0,.4)");
        const [bx0, by0] = P(0, 0, 6), [bx1, by1] = P(0, 0, 31);
        const cr = 12 * KX * SC, cry = 12 * KY * SC;
        ctx.beginPath();
        ctx.ellipse(bx0, by0, cr, cry, 0, 0, Math.PI);
        ctx.lineTo(bx1 - cr, by1);
        ctx.ellipse(bx1, by1, cr, cry, 0, Math.PI, 0, true);
        ctx.closePath();
        ctx.fillStyle = "#dfe2e7"; ctx.fill();
        ctx.beginPath(); ctx.ellipse(bx1, by1, cr, cry, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#f1f2f4"; ctx.fill();
        ctx.lineWidth = 2.2; ctx.strokeStyle = "#ff6a2b"; ctx.stroke();
        const j = ik();
        if (sim.carrying) { shadow(sim.tool.x, sim.tool.y, 15, 0.14); carton(sim.tool.x, sim.tool.y, sim.tool.z - BH); }
        thickLine(j.sh, j.el, 11 * sf, "#eef0f3", "#b9bdc6");
        thickLine(j.el, j.wr, 9 * sf, "#e6e8ec", "#b2b6bf");
        thickLine(j.wr, j.tl, 4.5 * sf, "#3a3d42", "#26282c");
        box(sim.tool.x, sim.tool.y, sim.tool.z, 15, 15, 2.6, "#31353c", "#26292f", "#1f2227", "rgba(0,0,0,.4)");
        joint(j.sh, 8.5 * sf); joint(j.el, 7 * sf); joint(j.wr, 5.5 * sf);
      }

      function drawFloor() {
        ctx.save(); ctx.globalAlpha = 0.35;
        ctx.strokeStyle = "rgba(255,255,255,.05)"; ctx.lineWidth = 1;
        for (let i = -6; i <= 8; i++) {
          let a = P(i * 40 - 80, -160, 0), b = P(i * 40 - 80, 320, 0);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          a = P(-280, i * 40 - 40, 0); b = P(280, i * 40 - 40, 0);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
        ctx.restore();
        const [cx, cy] = P(0, 0, 0);
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, 105 * KX * SC, 105 * KY * SC, 0, 0, Math.PI * 2);
        ctx.setLineDash([6, 7]); ctx.strokeStyle = "rgba(170,217,0,.22)"; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.restore();
      }

      function draw() {
        ctx.clearRect(0, 0, W, H);
        drawFloor();
        conveyorX(OUT_X0, OUT_X1, OUT_Y, OUT_TOP, 12 + 2 * PITCH + 14, sim.outOff, true);
        const vis = sim.shift > -139;
        if (vis) {
          pallet(PC.x + sim.shift, PC.y);
          [...sim.placed]
            .sort((a, b) => (a.x + a.y) - (b.x + b.y))
            .forEach((s) => carton(s.x + sim.shift, s.y, PAL_TOP));
        }
        conveyorX(IN_X0 - 10, PICK_X + 22, IN_Y, IN_TOP, 36, sim.beltOff, true);
        sim.queue.forEach((x) => carton(x, IN_Y, IN_TOP));
        drawRobot();
      }

      /* rAF loop */
      let last = performance.now();
      function frame(now: number) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!sim.paused) update(dt);
        draw();
        rafRef.current = requestAnimationFrame(frame);
      }

      // Don't auto-animate if user prefers reduced motion
      if (!prefersReduced) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        draw(); // static single frame
      }

      return sim;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prefersReduced]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sim = initSim(canvas);
    sim.onReadout = setReadouts;

    return () => {
      cancelAnimationFrame(rafRef.current);
      (sim as unknown as { cleanup: () => void }).cleanup?.();
      simRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Sync React state → sim mutable state */
  useEffect(() => {
    if (!simRef.current) return;
    const sim = simRef.current as unknown as {
      pattern: Pattern; speed: number; paused: boolean;
      placed: unknown[]; nextIdx: number; transfer: null; shift: number;
    };
    const prevPattern = sim.pattern;
    sim.pattern = pattern;
    sim.speed = speed / 100;
    sim.paused = paused;
    if (prevPattern !== pattern) {
      sim.placed = []; sim.nextIdx = 0; sim.transfer = null; sim.shift = 0;
    }
  }, [pattern, speed, paused]);

  const togglePause = () => setPaused((v) => !v);

  return (
    <div className={`sim-wrap ${className}`}>
      {/* Stage */}
      <div className="sim-stage" style={{ position: "relative", minHeight: 580 }}>
        <div className="sim-hint">
          Sim 01 · <b>paletizado</b> · vista isométrica
        </div>

        <div className={`sim-live${paused ? " is-paused" : ""}`} aria-live="polite">
          <span className="led" />
          {paused ? "En pausa" : "En ciclo"}
        </div>

        <button
          type="button"
          id="sim-play-toggle"
          className={`sim-play${paused ? " is-paused" : ""}`}
          aria-pressed={!paused}
          aria-label={paused ? "Reanudar ciclo" : "Pausar ciclo"}
          onClick={togglePause}
        >
          {/* Pause icon */}
          <svg className="ic-pause" viewBox="0 0 24 24" aria-hidden="true" style={{ display: paused ? "none" : "block" }}>
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
          {/* Play icon */}
          <svg className="ic-play" viewBox="0 0 24 24" aria-hidden="true" style={{ display: paused ? "block" : "none" }}>
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="lbl">{paused ? "Reanudar" : "Pausar"}</span>
        </button>

        <canvas
          ref={canvasRef}
          aria-label="Simulación isométrica de celda robótica de paletizado"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        />
      </div>

      {/* Control panel */}
      <aside className="sim-panel">
        <h3>Configuración</h3>

        <div className="sim-sec">
          <span className="lab">Arreglo por capa</span>
          <div className="seg">
            {(["2x2", "1x4", "2x3"] as Pattern[]).map((p) => (
              <button
                key={p}
                type="button"
                className={pattern === p ? "on" : ""}
                onClick={() => setPattern(p)}
              >
                {p.replace("x", "×")}
              </button>
            ))}
          </div>
        </div>

        <div className="ctrl">
          <label htmlFor="sim-speed-slider">Velocidad de ciclo</label>
          <input
            id="sim-speed-slider"
            type="range"
            min={40}
            max={200}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </div>

        <div className="readout">
          <div className="readrow">
            <span className="lab">Estado</span>
            <span className="val state">{readouts.state}</span>
          </div>
          <div className="readrow">
            <span className="lab">Cajas colocadas</span>
            <span className="val">{readouts.boxes}</span>
          </div>
          <div className="readrow">
            <span className="lab">Parihuelas</span>
            <span className="val">{readouts.pallets}</span>
          </div>
        </div>

        <p className="sim-note">
          <b>Así lo hacemos en planta:</b> definimos el patrón de mosaico según
          tu producto, validamos el ciclo en simulación y recién entonces
          integramos el robot, la faja y la seguridad de la celda.
        </p>
      </aside>
    </div>
  );
}

/* Type alias used by the ref — avoids exporting internal shape */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SimState = any;
