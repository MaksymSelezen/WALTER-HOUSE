export function initPackagesAccordion() {
  const root = document.querySelector("[data-packages-accordion]");
  if (!root) return;

  const items = [...root.querySelectorAll(".packages__item")]
    .map((item) => ({
      item,
      trigger: item.querySelector(".packages__trigger"),
      panel: item.querySelector(".packages__panel"),
    }))
    .filter((data) => data.trigger && data.panel);

  const setState = (data, open) => {
    data.trigger.setAttribute("aria-expanded", String(open));
    data.panel.setAttribute("aria-hidden", String(!open));
    data.item.classList.toggle("is-active", open);
    data.panel.style.maxHeight = open ? `${data.panel.scrollHeight}px` : null;
  };

  const sync = () => {
    root.classList.toggle(
      "has-active",
      items.some((data) => data.item.classList.contains("is-active")),
    );
  };

  items.forEach((data) =>
    setState(data, data.trigger.getAttribute("aria-expanded") === "true"),
  );
  sync();

  root.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    const item = event.target.closest(".packages__item");
    const current = items.find((data) => data.item === item);
    if (!current) return;

    const isOpen = current.trigger.getAttribute("aria-expanded") === "true";
    items.forEach((data) => data !== current && setState(data, false));
    setState(current, !isOpen);
    sync();
  });
}
