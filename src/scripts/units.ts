/* ============================================================
   Shared measurement / conversion helpers.
   All length math goes through millimeters as the base unit.
   Pixel conversions use the calibrated pixels-per-inch so the
   px ↔ real-world results are accurate for the user's screen.
   ============================================================ */
import { loadCalibration } from "./calibration";

export type Unit = "mm" | "cm" | "m" | "in" | "ft" | "pt" | "px";

export const UNIT_LABELS: Record<Unit, string> = {
  mm: "Millimeters (mm)",
  cm: "Centimeters (cm)",
  m: "Meters (m)",
  in: "Inches (in)",
  ft: "Feet (ft)",
  pt: "Points (pt)",
  px: "Pixels (px)",
};

const MM_PER_IN = 25.4;
const MM_PER_PT = 25.4 / 72; // 1pt = 1/72 inch

/* mm per unit. px is dynamic (depends on calibration), handled separately. */
function mmPerUnit(u: Unit, pxPerInch: number): number {
  switch (u) {
    case "mm":
      return 1;
    case "cm":
      return 10;
    case "m":
      return 1000;
    case "in":
      return MM_PER_IN;
    case "ft":
      return MM_PER_IN * 12;
    case "pt":
      return MM_PER_PT;
    case "px":
      return MM_PER_IN / pxPerInch; // mm represented by one CSS pixel
  }
}

export function currentPpi(): number {
  return loadCalibration().pxPerInch;
}

export function toMm(value: number, from: Unit, pxPerInch = currentPpi()): number {
  return value * mmPerUnit(from, pxPerInch);
}

export function fromMm(mm: number, to: Unit, pxPerInch = currentPpi()): number {
  return mm / mmPerUnit(to, pxPerInch);
}

export function convert(value: number, from: Unit, to: Unit, pxPerInch = currentPpi()): number {
  return fromMm(toMm(value, from, pxPerInch), to, pxPerInch);
}

/* Pretty number: trims trailing zeros, sensible precision per magnitude. */
export function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  let s: string;
  if (abs === 0) s = "0";
  else if (abs >= 1000) s = n.toFixed(0);
  else if (abs >= 100) s = n.toFixed(1);
  else if (abs >= 1) s = n.toFixed(2);
  else s = n.toFixed(3);
  return s.replace(/\.?0+$/, "");
}

/* ---- "How big is it really?" relatable references ---- */
export interface SizeRef {
  name: string;
  mm: number; // characteristic length in mm
}

const LENGTH_REFS: SizeRef[] = [
  { name: "a grain of rice", mm: 6 },
  { name: "an aspirin tablet", mm: 10 },
  { name: "a pencil's width", mm: 7 },
  { name: "a fingernail", mm: 12 },
  { name: "a US quarter", mm: 24.26 },
  { name: "a credit card's long side", mm: 85.6 },
  { name: "a ballpoint pen", mm: 145 },
  { name: "a US dollar bill", mm: 156 },
  { name: "the long side of A4 paper", mm: 297 },
  { name: "a school ruler", mm: 300 },
  { name: "a sheet of Letter paper (tall)", mm: 279 },
  { name: "a standard keyboard", mm: 450 },
  { name: "a baseball bat", mm: 1067 },
  { name: "a kitchen counter's height", mm: 914 },
  { name: "a doorway's width", mm: 815 },
  { name: "an interior door's height", mm: 2032 },
  { name: "an average adult's height", mm: 1700 },
  { name: "a king-size bed (wide)", mm: 1930 },
  { name: "a compact car's length", mm: 4200 },
  { name: "a school bus", mm: 10700 },
  { name: "a tennis court (long)", mm: 23770 },
  { name: "an American football field", mm: 91440 },
];

/* Find the closest relatable comparison for a length in mm. */
export function relatableLength(mm: number): { text: string; ratio: number } | null {
  if (!isFinite(mm) || mm <= 0) return null;
  let best = LENGTH_REFS[0];
  let bestErr = Infinity;
  for (const r of LENGTH_REFS) {
    const err = Math.abs(Math.log(mm / r.mm));
    if (err < bestErr) {
      bestErr = err;
      best = r;
    }
  }
  const ratio = mm / best.mm;
  let text: string;
  if (ratio >= 0.92 && ratio <= 1.08) text = `about the size of ${best.name}`;
  else if (ratio > 1.08) text = `about ${fmt(ratio)}× ${best.name}`;
  else text = `about ${fmt(ratio)}× ${best.name}`;
  return { text, ratio };
}
