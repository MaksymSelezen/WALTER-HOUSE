export function initPackagesAccordion() {
  const root = document.querySelector("[data-packages-accordion]");
  if (!root) return;

  const items = Array.from(root.querySelectorAll(".packages__item"));

  const setState = (item, isOpen) => {
    const trigger = item.querySelector(".packages__trigger");
    const panel = item.querySelector(".packages__panel");
    if (!trigger || !panel) return;

    trigger.setAttribute("aria-expanded", String(isOpen));
    panel.setAttribute("aria-hidden", String(!isOpen));
    panel.hidden = !isOpen;
    item.classList.toggle("is-active", isOpen);
  };

  items.forEach((item) => {
    const trigger = item.querySelector(".packages__trigger");
    const isOpen = trigger?.getAttribute("aria-expanded") === "true";
    setState(item, isOpen);
  });

  root.addEventListener("click", (event) => {
    const item = event.target.closest(".packages__item");
    if (!item || !root.contains(item)) return;

    if (event.target.closest("a")) return;

    const trigger = item.querySelector(".packages__trigger");
    if (!trigger) return;

    const isOpen = trigger.getAttribute("aria-expanded") === "true";

    items.forEach((entry) => {
      if (entry !== item) setState(entry, false);
    });

    setState(item, !isOpen);
  });
}
