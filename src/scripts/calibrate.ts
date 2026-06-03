/* ============================================================
   Calibration panel controller — the three calibration methods.
   Writes to the shared calibration store; the ruler (on this or
   any page) reacts via the ror:calibration event.
   ============================================================ */
import { saveCalibration, loadCalibration, CARD_LONG_IN } from "./calibration";
import { detectDevice, fromDiagonal, DEVICE_DB } from "./devices";
import { initDevicePicker } from "./devicePicker";

function tr(key: string, fallback: string): string {
  const fn = (window as Window & { __t?: (k: string) => string | undefined }).__t;
  return (fn && fn(key)) || fallback;
}

export function initCalibrate(): void {
  const root = document.getElementById("calibrate");
  if (!root) return;

  // Searchable device picker for manual selection.
  const pickerEl = document.getElementById("calibrate-device-picker");
  if (pickerEl) {
    initDevicePicker(pickerEl, (index) => {
      const d = DEVICE_DB[index];
      if (!d) return;
      saveCalibration({ pxPerInch: d.ppi, method: "preset", label: d.label, confident: true });
      showResult("auto-result", `${d.label} — ${d.ppi.toFixed(1)} px/in`, true);
    });
  }

  function showResult(id: string, msg: string, ok: boolean) {
    const out = document.getElementById(id);
    if (out) {
      out.textContent = msg;
      out.classList.toggle("ok", ok);
    }
  }

  // Method 1 — auto-detect
  document.getElementById("btn-auto")?.addEventListener("click", () => {
    const d = detectDevice();
    if (d) {
      saveCalibration({ pxPerInch: d.pxPerInch, method: "auto", label: d.label, confident: true });
      showResult("auto-result", `${d.label} — ${d.pxPerInch.toFixed(1)} px/in`, true);
      window.dispatchEvent(new CustomEvent("ror:device-label", { detail: d.label }));
    } else {
      showResult("auto-result", tr("cal.m1.fail", "Could not detect automatically. Search for your device or try another method."), false);
    }
  });

  // Method 2 — screen diagonal
  document.getElementById("btn-diag")?.addEventListener("click", () => {
    const input = document.getElementById("diag-input") as HTMLInputElement;
    const v = parseFloat(input.value);
    if (!v || v < 3 || v > 120) {
      showResult("diag-result", tr("cal.m2.range", "Enter a diagonal between 3 and 120 inches."), false);
      return;
    }
    saveCalibration({ pxPerInch: fromDiagonal(v), method: "diagonal", label: `${v}" screen diagonal`, confident: true });
    showResult("diag-result", tr("cal.result.applied", "Applied and saved."), true);
  });

  // Method 3 — credit card modal
  const modal = document.getElementById("card-modal");
  const box = document.getElementById("card-box");
  const slider = document.getElementById("card-slider") as HTMLInputElement | null;

  function sizeBox() {
    if (box && slider) {
      const w = parseInt(slider.value, 10);
      (box as HTMLElement).style.width = w + "px";
      (box as HTMLElement).style.height = w / 1.5858 + "px";
    }
  }
  function openModal() {
    if (!modal || !slider) return;
    slider.value = String(Math.round(loadCalibration().pxPerInch * CARD_LONG_IN));
    sizeBox();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  document.getElementById("btn-card-open")?.addEventListener("click", openModal);
  slider?.addEventListener("input", sizeBox);
  modal?.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
  });
  document.getElementById("btn-card-apply")?.addEventListener("click", () => {
    if (!slider) return;
    saveCalibration({ pxPerInch: parseInt(slider.value, 10) / CARD_LONG_IN, method: "card", label: "Credit-card calibrated", confident: true });
    closeModal();
  });
}
