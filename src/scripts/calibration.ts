/* ============================================================
   Shared calibration storage — used by the ruler tool and the
   standalone PPI calculator so calibration persists across the
   multi-page site (set it on one page, read it on another).
   ============================================================ */

export const STORAGE_KEY = "ror.calibration.v1";
export const IN_PER_CM = 1 / 2.54;
export const CARD_LONG_IN = 85.6 / 25.4; // ISO/IEC 7810 ID-1 long edge

export type Method = "auto" | "diagonal" | "card" | "calc" | "preset" | "shared" | "default";

export interface Calibration {
  pxPerInch: number;
  method: Method;
  label: string;
  confident: boolean;
}

export function loadCalibration(): Calibration {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Calibration;
      if (parsed && typeof parsed.pxPerInch === "number" && parsed.pxPerInch > 20) return parsed;
    }
  } catch {
    /* ignore */
  }
  return { pxPerInch: 96, method: "default", label: "Default 96 PPI", confident: false };
}

export function saveCalibration(c: Calibration): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("ror:calibration", { detail: c }));
}
