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
}
