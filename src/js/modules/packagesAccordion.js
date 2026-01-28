// import Accordion from "accordion-js";

// export function initPackagesAccordion() {
//   const root = document.querySelector("[data-packages-accordion]");
//   if (!root) return;

//   new Accordion(root, {
//     duration: 520,
//     showMultiple: false,
//     collapse: true,
//     elementClass: "packages__item",
//     triggerClass: "packages__summary",
//     panelClass: "packages__body",
//     activeClass: "is-open",
//   });

//   //! клікабельність по всій області

//   const interactiveSelector = [
//     "a",
//     "button",
//     "input",
//     "textarea",
//     "select",
//     "label",
//     "summary",
//     "[role='button']",
//     "[role='link']",
//   ].join(",");

//   root.addEventListener("click", (event) => {
//     if (event.defaultPrevented) return;

//     const item = event.target.closest(".packages__item");
//     if (!item || !root.contains(item)) return;

//     const interactiveAncestor = event.target.closest(interactiveSelector);
//     if (interactiveAncestor) return;

//     const selection = window.getSelection?.();
//     if (selection && !selection.isCollapsed) return;

//     const trigger = item.querySelector(".packages__summary");
//     if (!trigger) return;

//     trigger.click();
//   });
// }

export function initPackagesAccordion() {
  const root = document.querySelector("[data-packages-accordion]");
  if (!root) return;

  const items = Array.from(root.querySelectorAll(".packages__item"));
  const triggers = items
    .map((item) => item.querySelector(".packages__summary"))
    .filter(Boolean);

  const setExpanded = (item, expanded) => {
    const trigger = item.querySelector(".packages__summary");
    const panel = item.querySelector(".packages__body");
    if (!trigger || !panel) return;

    trigger.setAttribute("aria-expanded", String(expanded));
    panel.hidden = !expanded;
    panel.setAttribute("aria-hidden", String(!expanded));
    panel.style.display = expanded ? "block" : "none";
    panel.style.height = expanded ? "auto" : "0px";

    item.classList.toggle("is-open", expanded);
  };

  items.forEach((item) => {
    const trigger = item.querySelector(".packages__summary");
    const panel = item.querySelector(".packages__body");
    if (!trigger || !panel) return;

    const expanded = trigger.getAttribute("aria-expanded") === "true";
    setExpanded(item, expanded);
  });

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const item = trigger.closest(".packages__item");
      if (!item) return;

      const isExpanded = trigger.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        setExpanded(item, false);
        return;
      }

      items.forEach((otherItem) => {
        if (otherItem !== item) {
          setExpanded(otherItem, false);
        }
      });

      setExpanded(item, true);
    });
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
