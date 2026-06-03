/* ============================================================
   Ace Online Ruler — ruler surface engine
   Edge rulers + free movable/rotatable ruler + measure/angle.
   Calibration is owned by the shared store (calibration.ts) so
   it can be set from the calibrate page or the PPI calculator.
   ============================================================ */
import { loadCalibration, saveCalibration, IN_PER_CM, type Calibration } from "./calibration";
import { DEVICE_DB, OBJECTS, devicePresetsGrouped } from "./devices";

type Unit = "cm" | "inch";
type Mode = "measure" | "angle";
type Orientation = "h" | "v" | "d";

interface Edges {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

function tr(key: string, fallback: string): string {
  const fn = (window as Window & { __t?: (k: string) => string | undefined }).__t;
  return (fn && fn(key)) || fallback;
}

const INK = "#171717";
const STRIP_FILL = "rgba(255,255,255,0.82)";
const STRIP_LINE = "#ebebeb";
const ACCENT = "#0070f3";
const STRIP = 60;
const FREE_W = 58;

interface Pt {
  x: number;
  y: number;
}
interface FreeRuler {
  on: boolean;
  sx: number;
  sy: number;
  angle: number;
  length: number;
}
interface State {
  unit: Unit;
  edges: Edges;
  cal: Calibration;
  dark: boolean;
  mode: Mode;
  object: string | null;
  measure: { x1: number; y1: number; x2: number; y2: number } | null;
  anglePts: Pt[];
  free: FreeRuler;
}

export interface RulerApi {
  setUnit(u: Unit): void;
  toggleEdge(edge: keyof Edges, on: boolean): void;
  setMode(m: Mode): void;
  setObject(id: string | null): void;
  clearMeasure(): void;
  toggleFree(on: boolean): void;
  setFreeOrientation(o: Orientation): void;
  applyDevicePreset(index: number): Calibration | null;
  devicePresetsGrouped(): { cat: string; items: { index: number; label: string }[] }[];
  refObjects(): { id: string; name: string }[];
  shareLink(): string;
  getCal(): Calibration;
}

export function initRuler(opts: { defaultUnit?: Unit } = {}): void {
  const canvas = document.getElementById("ruler-canvas") as HTMLCanvasElement | null;
  const surface = document.getElementById("ruler-surface");
  if (!canvas || !surface) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let initialCal = loadCalibration();
  const urlPpi = parseFloat(new URLSearchParams(window.location.search).get("ppi") || "");
  if (!Number.isNaN(urlPpi) && urlPpi > 20 && urlPpi < 1000) {
    initialCal = { pxPerInch: urlPpi, method: "shared", label: "Shared calibration link", confident: true };
    saveCalibration(initialCal);
  }

  const state: State = {
    unit: opts.defaultUnit ?? "cm",
    edges: { top: true, right: false, bottom: false, left: true },
    cal: initialCal,
    dark: false,
    mode: "measure",
    object: null,
    measure: null,
    anglePts: [],
    free: { on: false, sx: 60, sy: 200, angle: 0, length: 400 },
  };

  function resize(): void {
    const rect = surface!.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas!.width = Math.round(rect.width * dpr);
    canvas!.height = Math.round(rect.height * dpr);
    canvas!.style.width = rect.width + "px";
    canvas!.style.height = rect.height + "px";
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  const pxPerCm = () => state.cal.pxPerInch * IN_PER_CM;
  const pxPerMm = () => pxPerCm() / 10;

  function tickParams() {
    const isCm = state.unit === "cm";
    return {
      isCm,
      step: isCm ? pxPerMm() : state.cal.pxPerInch / 16,
      major: isCm ? 10 : 16,
      mid: isCm ? 5 : 8,
      label: isCm ? "cm" : "in",
    };
  }

  function drawHorizontal(side: "top" | "bottom", len: number): void {
    const c = ctx!;
    const baseY = side === "top" ? 0 : surface!.clientHeight;
    const dir = side === "top" ? 1 : -1;
    const labelColor = state.dark ? "#fafafa" : INK;
    const { isCm, step, major, mid, label } = tickParams();

    c.fillStyle = state.dark ? "rgba(23,23,23,0.86)" : STRIP_FILL;
    c.fillRect(0, side === "top" ? 0 : baseY - STRIP, len, STRIP);
    c.strokeStyle = STRIP_LINE;
    c.lineWidth = 1;
    const edgeLine = side === "top" ? STRIP : baseY - STRIP;
    c.beginPath();
    c.moveTo(0, edgeLine);
    c.lineTo(len, edgeLine);
    c.stroke();

    c.strokeStyle = state.dark ? "#d4d4d4" : INK;
    c.fillStyle = labelColor;
    c.font = "11px 'Geist Mono', ui-monospace, monospace";
    c.textBaseline = side === "top" ? "top" : "bottom";
    c.textAlign = "left";

    for (let i = 0; i * step <= len; i++) {
      const pos = i * step;
      let h = isCm ? 8 : 7;
      if (i % major === 0) h = 26;
      else if (i % mid === 0) h = isCm ? 16 : 18;
      else if (!isCm && i % 4 === 0) h = 13;
      else if (!isCm && i % 2 === 0) h = 10;
      c.lineWidth = i % major === 0 ? 1.4 : 1;
      c.beginPath();
      c.moveTo(pos + 0.5, baseY);
      c.lineTo(pos + 0.5, baseY + dir * h);
      c.stroke();
      if (i % major === 0 && i > 0) c.fillText(String(i / major), pos + 3, baseY + dir * (h - 2));
    }
    c.save();
    c.font = "600 11px 'Geist Mono', ui-monospace, monospace";
    c.fillText(label, 4, baseY + dir * 40);
    c.restore();
  }

  function drawVertical(side: "left" | "right", len: number): void {
    const c = ctx!;
    const baseX = side === "left" ? 0 : surface!.clientWidth;
    const dir = side === "left" ? 1 : -1;
    const labelColor = state.dark ? "#fafafa" : INK;
    const { isCm, step, major, mid } = tickParams();

    c.fillStyle = state.dark ? "rgba(23,23,23,0.86)" : STRIP_FILL;
    c.fillRect(side === "left" ? 0 : baseX - STRIP, 0, STRIP, len);
    c.strokeStyle = STRIP_LINE;
    c.lineWidth = 1;
    const edgeLine = side === "left" ? STRIP : baseX - STRIP;
    c.beginPath();
    c.moveTo(edgeLine, 0);
    c.lineTo(edgeLine, len);
    c.stroke();

    c.strokeStyle = state.dark ? "#d4d4d4" : INK;
    c.fillStyle = labelColor;
    c.font = "11px 'Geist Mono', ui-monospace, monospace";

    for (let i = 0; i * step <= len; i++) {
      const pos = i * step;
      let h = isCm ? 8 : 7;
      if (i % major === 0) h = 26;
      else if (i % mid === 0) h = isCm ? 16 : 18;
      else if (!isCm && i % 4 === 0) h = 13;
      else if (!isCm && i % 2 === 0) h = 10;
      c.lineWidth = i % major === 0 ? 1.4 : 1;
      c.beginPath();
      c.moveTo(baseX, pos + 0.5);
      c.lineTo(baseX + dir * h, pos + 0.5);
      c.stroke();
      if (i % major === 0 && i > 0) {
        c.save();
        c.translate(baseX + dir * (h - 2), pos + 3);
        c.rotate(Math.PI / 2);
        c.textAlign = "left";
        c.textBaseline = side === "left" ? "top" : "bottom";
        c.fillText(String(i / major), 0, 0);
        c.restore();
      }
    }
  }

  function drawFree(): void {
    if (!state.free.on) return;
    const c = ctx!;
    const { sx, sy, angle, length } = state.free;
    const { isCm, step, major, mid, label } = tickParams();

    c.save();
    c.translate(sx, sy);
    c.rotate(angle);

    c.fillStyle = state.dark ? "rgba(23,23,23,0.92)" : "rgba(255,255,255,0.94)";
    c.strokeStyle = ACCENT;
    c.lineWidth = 1.5;
    roundRect(c, 0, 0, length, FREE_W, 8);
    c.fill();
    c.stroke();

    c.strokeStyle = state.dark ? "#e5e5e5" : INK;
    c.fillStyle = state.dark ? "#fafafa" : INK;
    c.font = "11px 'Geist Mono', ui-monospace, monospace";
    c.textBaseline = "top";
    c.textAlign = "left";
    for (let i = 0; i * step <= length; i++) {
      const pos = i * step;
      let h = isCm ? 8 : 7;
      if (i % major === 0) h = 26;
      else if (i % mid === 0) h = isCm ? 16 : 18;
      else if (!isCm && i % 4 === 0) h = 13;
      else if (!isCm && i % 2 === 0) h = 10;
      c.lineWidth = i % major === 0 ? 1.4 : 1;
      c.beginPath();
      c.moveTo(pos + 0.5, 0);
      c.lineTo(pos + 0.5, h);
      c.stroke();
      if (i % major === 0 && i > 0) c.fillText(String(i / major), pos + 3, 4);
    }
    c.save();
    c.font = "600 11px 'Geist Mono', ui-monospace, monospace";
    c.fillStyle = ACCENT;
    c.fillText(label, 6, FREE_W - 18);
    c.restore();

    c.fillStyle = ACCENT;
    c.beginPath();
    c.arc(0, 0, 4, 0, Math.PI * 2);
    c.fill();

    c.beginPath();
    c.arc(length, FREE_W / 2, 9, 0, Math.PI * 2);
    c.fillStyle = ACCENT;
    c.fill();
    c.fillStyle = "#fff";
    c.font = "12px 'Geist', system-ui, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("↻", length, FREE_W / 2);
    c.restore();
  }

  function freeLocal(p: Pt): Pt {
    const { sx, sy, angle } = state.free;
    const dx = p.x - sx;
    const dy = p.y - sy;
    return { x: dx * Math.cos(angle) + dy * Math.sin(angle), y: -dx * Math.sin(angle) + dy * Math.cos(angle) };
  }
  function hitFreeHandle(p: Pt): boolean {
    if (!state.free.on) return false;
    const l = freeLocal(p);
    return Math.hypot(l.x - state.free.length, l.y - FREE_W / 2) <= 16;
  }
  function hitFreeBody(p: Pt): boolean {
    if (!state.free.on) return false;
    const l = freeLocal(p);
    return l.x >= -6 && l.x <= state.free.length + 6 && l.y >= -6 && l.y <= FREE_W + 6;
  }
  function initFree(o: Orientation): void {
    const w = surface!.clientWidth;
    const h = surface!.clientHeight;
    if (o === "h") state.free = { on: true, sx: 40, sy: (h - FREE_W) / 2, angle: 0, length: w - 80 };
    else if (o === "v") state.free = { on: true, sx: FREE_W + 20, sy: 40, angle: Math.PI / 2, length: h - 80 };
    else {
      const lw = w - 100;
      const lh = h - 100;
      state.free = { on: true, sx: 50, sy: 50, angle: Math.atan2(lh, lw), length: Math.hypot(lw, lh) };
    }
  }

  function drawObject(): void {
    if (!state.object) return;
    const obj = OBJECTS.find((o) => o.id === state.object);
    if (!obj) return;
    const c = ctx!;
    const cx = surface!.clientWidth / 2;
    const cy = surface!.clientHeight / 2;
    const mm = pxPerMm();
    c.save();
    c.strokeStyle = ACCENT;
    c.fillStyle = "rgba(0,112,243,0.06)";
    c.lineWidth = 2;
    if (obj.shape === "rect" && obj.w && obj.h) {
      const w = obj.w * mm;
      const h = obj.h * mm;
      roundRect(c, cx - w / 2, cy - h / 2, w, h, 8);
      c.fill();
      c.stroke();
    } else if (obj.shape === "circle" && obj.d) {
      const r = (obj.d * mm) / 2;
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }
    c.fillStyle = ACCENT;
    c.font = "600 12px 'Geist', system-ui, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "bottom";
    c.fillText(obj.name, cx, cy - 8);
    c.restore();
  }

  function drawMeasure(): void {
    if (!state.measure) return;
    const c = ctx!;
    const { x1, y1, x2, y2 } = state.measure;
    const distPx = Math.hypot(x2 - x1, y2 - y1);
    const inches = distPx / state.cal.pxPerInch;
    const val = state.unit === "cm" ? `${(inches / IN_PER_CM).toFixed(2)} cm` : `${inches.toFixed(2)} in`;
    c.save();
    c.strokeStyle = ACCENT;
    c.fillStyle = ACCENT;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    for (const [px, py] of [[x1, y1], [x2, y2]] as const) {
      c.beginPath();
      c.arc(px, py, 4, 0, Math.PI * 2);
      c.fill();
    }
    drawTag(c, val, (x1 + x2) / 2, (y1 + y2) / 2 - 17);
    c.restore();
  }

  function drawAngle(): void {
    const c = ctx!;
    const pts = state.anglePts;
    c.save();
    c.fillStyle = ACCENT;
    c.strokeStyle = ACCENT;
    c.lineWidth = 2;
    for (const p of pts) {
      c.beginPath();
      c.arc(p.x, p.y, 4, 0, Math.PI * 2);
      c.fill();
    }
    if (pts.length >= 2) {
      c.beginPath();
      c.moveTo(pts[0].x, pts[0].y);
      c.lineTo(pts[1].x, pts[1].y);
      c.stroke();
    }
    if (pts.length === 3) {
      const [v, a, b] = pts;
      c.beginPath();
      c.moveTo(v.x, v.y);
      c.lineTo(b.x, b.y);
      c.stroke();
      const a1 = Math.atan2(a.y - v.y, a.x - v.x);
      const a2 = Math.atan2(b.y - v.y, b.x - v.x);
      let deg = (Math.abs(a1 - a2) * 180) / Math.PI;
      if (deg > 180) deg = 360 - deg;
      c.beginPath();
      c.arc(v.x, v.y, 34, Math.min(a1, a2), Math.max(a1, a2));
      c.strokeStyle = "rgba(0,112,243,0.5)";
      c.stroke();
      drawTag(c, `${deg.toFixed(1)}°`, v.x, v.y - 44);
    }
    c.restore();
  }

  function drawTag(c: CanvasRenderingContext2D, text: string, x: number, y: number): void {
    c.save();
    c.font = "600 13px 'Geist', system-ui, sans-serif";
    const w = c.measureText(text).width + 16;
    c.fillStyle = ACCENT;
    roundRect(c, x - w / 2, y - 11, w, 22, 6);
    c.fill();
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, x, y);
    c.restore();
  }

  function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    c.beginPath();
    c.moveTo(x + rr, y);
    c.arcTo(x + w, y, x + w, y + h, rr);
    c.arcTo(x + w, y + h, x, y + h, rr);
    c.arcTo(x, y + h, x, y, rr);
    c.arcTo(x, y, x + w, y, rr);
    c.closePath();
  }

  function draw(): void {
    const c = ctx!;
    const w = surface!.clientWidth;
    const h = surface!.clientHeight;
    c.clearRect(0, 0, w, h);
    drawObject();
    if (state.edges.top) drawHorizontal("top", w);
    if (state.edges.bottom) drawHorizontal("bottom", w);
    if (state.edges.left) drawVertical("left", h);
    if (state.edges.right) drawVertical("right", h);
    drawFree();
    if (state.mode === "measure") drawMeasure();
    else drawAngle();
  }

  /* ---------- pointer interaction ---------- */
  let dragging = false;
  let frAction: "none" | "move" | "resize" = "none";
  let moveOff: Pt = { x: 0, y: 0 };

  function pointerPos(e: PointerEvent): Pt {
    const rect = canvas!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener("pointerdown", (e) => {
    const p = pointerPos(e);
    if (hitFreeHandle(p)) {
      frAction = "resize";
      canvas.setPointerCapture(e.pointerId);
      return;
    }
    if (hitFreeBody(p)) {
      frAction = "move";
      moveOff = { x: p.x - state.free.sx, y: p.y - state.free.sy };
      canvas.setPointerCapture(e.pointerId);
      return;
    }
    if (state.mode === "measure") {
      state.measure = { x1: p.x, y1: p.y, x2: p.x, y2: p.y };
      dragging = true;
      canvas.setPointerCapture(e.pointerId);
    } else {
      if (state.anglePts.length >= 3) state.anglePts = [];
      state.anglePts.push(p);
    }
    draw();
  });

  canvas.addEventListener("pointermove", (e) => {
    const p = pointerPos(e);
    if (frAction === "move") {
      state.free.sx = p.x - moveOff.x;
      state.free.sy = p.y - moveOff.y;
      draw();
      return;
    }
    if (frAction === "resize") {
      const dx = p.x - state.free.sx;
      const dy = p.y - state.free.sy;
      state.free.angle = Math.atan2(dy, dx);
      state.free.length = Math.max(120, Math.min(8000, Math.hypot(dx, dy)));
      draw();
      return;
    }
    if (state.mode === "measure" && dragging && state.measure) {
      state.measure.x2 = p.x;
      state.measure.y2 = p.y;
      draw();
    }
  });

  function endPointer(): void {
    if (frAction !== "none") {
      frAction = "none";
      return;
    }
    if (state.mode !== "measure") return;
    dragging = false;
    if (state.measure && Math.hypot(state.measure.x2 - state.measure.x1, state.measure.y2 - state.measure.y1) < 4) {
      state.measure = null;
      draw();
    }
  }
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);

  function updateStatus(): void {
    const banner = document.getElementById("cal-status");
    const ppiOut = document.getElementById("ppi-readout");
    if (ppiOut) ppiOut.textContent = `${state.cal.pxPerInch.toFixed(1)} px/in`;
    if (!banner) return;
    banner.className = "cal-status " + (state.cal.confident ? "ok" : "warn");
    banner.textContent = state.cal.confident
      ? `● ${tr("status.calibrated", "Calibrated")} — ${state.cal.label}`
      : `▲ ${state.cal.label}. ${tr("status.calhint", "Calibrate for pixel-perfect accuracy.")}`;
  }

  const api: RulerApi = {
    setUnit(u) {
      state.unit = u;
      draw();
    },
    toggleEdge(edge, on) {
      state.edges[edge] = on;
      draw();
    },
    setMode(m) {
      state.mode = m;
      state.measure = null;
      state.anglePts = [];
      draw();
    },
    setObject(id) {
      state.object = id;
      draw();
    },
    clearMeasure() {
      state.measure = null;
      state.anglePts = [];
      draw();
    },
    toggleFree(on) {
      if (on && !state.free.on) initFree("h");
      else state.free.on = on;
      draw();
    },
    setFreeOrientation(o) {
      initFree(o);
      draw();
    },
    applyDevicePreset(index) {
      const d = DEVICE_DB[index];
      if (!d) return null;
      const cal: Calibration = { pxPerInch: d.ppi, method: "preset", label: d.label, confident: true };
      saveCalibration(cal); // triggers ror:calibration → updates state below
      return cal;
    },
    devicePresetsGrouped,
    refObjects() {
      return OBJECTS.map((o) => ({ id: o.id, name: o.name }));
    },
    shareLink() {
      const u = new URL(window.location.href);
      u.searchParams.set("ppi", state.cal.pxPerInch.toFixed(2));
      return u.toString();
    },
    getCal() {
      return state.cal;
    },
  };

  (window as Window & { __ruler?: RulerApi }).__ruler = api;

  // React to calibration changes from anywhere (calibrate page, PPI calc, presets).
  window.addEventListener("ror:calibration", (e) => {
    const detail = (e as CustomEvent<Calibration>).detail;
    if (detail && typeof detail.pxPerInch === "number") {
      state.cal = detail;
      updateStatus();
      draw();
    }
  });

  function syncTheme(): void {
    state.dark = document.documentElement.getAttribute("data-theme") === "dark";
    draw();
  }
  syncTheme();
  window.addEventListener("ror:theme", syncTheme);
  window.addEventListener("resize", resize);
  window.addEventListener("ror:lang", updateStatus);
  document.addEventListener("fullscreenchange", () => setTimeout(resize, 60));
  updateStatus();
  resize();
}
