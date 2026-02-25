export function initPackagesAccordion() {
  const root = document.querySelector("[data-packages-accordion]");
  if (!root) return;

  const items = [...root.querySelectorAll(".packages__item")]
    .map((item) => ({
      item,
      trigger: item.querySelector(".packages__trigger"),
      panel: item.querySelector(".packages__panel"),
    }))
    .filter(({ trigger, panel }) => trigger && panel);

  const setItemState = ({ item, trigger, panel }, open) => {
    trigger.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    panel.style.maxHeight = open ? `${panel.scrollHeight}px` : "";
    item.classList.toggle("is-active", open);
  };

  const syncListState = () =>
    root.classList.toggle(
      "has-active",
      items.some(({ item }) => item.classList.contains("is-active")),
    );

  items.forEach((entry) =>
    setItemState(entry, entry.trigger.getAttribute("aria-expanded") === "true"),
  );
  syncListState();

  root.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;

    const current = items.find(
      ({ item }) => item === event.target.closest(".packages__item"),
    );
    if (!current) return;

    const shouldOpen = current.trigger.getAttribute("aria-expanded") !== "true";
    items.forEach((entry) =>
      setItemState(entry, entry === current && shouldOpen),
    );
    syncListState();
  });
}
