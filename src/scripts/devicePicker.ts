/* ============================================================
   Searchable device combobox controller.
   Renders the (large) grouped device list with live filtering
   and keyboard support. On selection it calls onPick(index)
   and reflects the chosen label in the trigger.
   ============================================================ */
import { searchDevices, DEVICE_DB } from "./devices";

export function initDevicePicker(root: HTMLElement, onPick: (index: number) => void): void {
  const trigger = root.querySelector<HTMLButtonElement>(".dp-trigger");
  const panel = root.querySelector<HTMLElement>(".dp-panel");
  const search = root.querySelector<HTMLInputElement>(".dp-search");
  const list = root.querySelector<HTMLUListElement>(".dp-list");
  const empty = root.querySelector<HTMLElement>(".dp-empty");
  const valueEl = root.querySelector<HTMLElement>(".dp-value");
  if (!trigger || !panel || !search || !list || !valueEl) return;

  let activeIndex = -1; // index into the flat rendered option list
  let rendered: number[] = []; // device indices currently shown

  function render(query: string): void {
    const groups = searchDevices(query);
    list!.innerHTML = "";
    rendered = [];
    activeIndex = -1;
    let any = false;
    for (const g of groups) {
      if (g.items.length === 0) continue;
      any = true;
      const head = document.createElement("li");
      head.className = "dp-group";
      head.textContent = g.cat;
      head.setAttribute("aria-hidden", "true");
      list!.appendChild(head);
      for (const it of g.items) {
        const li = document.createElement("li");
        li.className = "dp-option";
        li.setAttribute("role", "option");
        li.dataset.index = String(it.index);
        li.textContent = it.label;
        li.addEventListener("click", () => choose(it.index));
        list!.appendChild(li);
        rendered.push(it.index);
      }
    }
    if (empty) empty.hidden = any;
  }

  function options(): HTMLElement[] {
    return Array.from(list!.querySelectorAll<HTMLElement>(".dp-option"));
  }

  function setActive(i: number): void {
    const opts = options();
    if (opts.length === 0) return;
    activeIndex = (i + opts.length) % opts.length;
    opts.forEach((o, idx) => o.classList.toggle("is-active", idx === activeIndex));
    opts[activeIndex].scrollIntoView({ block: "nearest" });
  }

  function open(): void {
    panel!.hidden = false;
    trigger!.setAttribute("aria-expanded", "true");
    render(search!.value);
    setTimeout(() => search!.focus(), 0);
  }
  function close(): void {
    panel!.hidden = true;
    trigger!.setAttribute("aria-expanded", "false");
  }
  function toggle(): void {
    if (panel!.hidden) open();
    else close();
  }

  function choose(deviceIndex: number): void {
    const d = DEVICE_DB[deviceIndex];
    if (d) valueEl!.textContent = d.label;
    onPick(deviceIndex);
    close();
  }

  trigger.addEventListener("click", toggle);
  search.addEventListener("input", () => render(search.value));
  search.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(activeIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(activeIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opts = options();
      if (activeIndex >= 0 && opts[activeIndex]) {
        choose(parseInt(opts[activeIndex].dataset.index!, 10));
      } else if (rendered.length === 1) {
        choose(rendered[0]);
      }
    } else if (e.key === "Escape") {
      close();
      trigger.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target as Node)) close();
  });

  // Reflect the chosen device label when calibration changes elsewhere.
  window.addEventListener("ror:device-label", (e) => {
    const label = (e as CustomEvent<string>).detail;
    if (label) valueEl.textContent = label;
  });
}
