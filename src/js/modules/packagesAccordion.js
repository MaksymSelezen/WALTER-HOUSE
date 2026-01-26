import Accordion from "accordion-js";

export function initPackagesAccordion() {
  const root = document.querySelector("[data-packages-accordion]");
  if (!root) return;

  new Accordion(root, {
    duration: 520,
    showMultiple: false,
    collapse: true,
    elementClass: "packages__item",
    triggerClass: "packages__summary",
    panelClass: "packages__body",
    activeClass: "is-open",
  });

  //! клікабельність по всій області

  const interactiveSelector = [
    "a",
    "button",
    "input",
    "textarea",
    "select",
    "label",
    "summary",
    "[role='button']",
    "[role='link']",
  ].join(",");

  root.addEventListener("click", (event) => {
    if (event.defaultPrevented) return;

    const item = event.target.closest(".packages__item");
    if (!item || !root.contains(item)) return;

    const interactiveAncestor = event.target.closest(interactiveSelector);
    if (interactiveAncestor) return;

    const selection = window.getSelection?.();
    if (selection && !selection.isCollapsed) return;

    const trigger = item.querySelector(".packages__summary");
    if (!trigger) return;

    trigger.click();
  });
}
