export function initPackagesAccordion() {
  const root = document.querySelector("[data-packages-accordion]");
  if (!root) return;

  const items = Array.from(root.querySelectorAll(".packages__item"));
  const triggers = items
    .map((item) => item.querySelector(".packages__summary"))
    .filter(Boolean);

  const closeTimers = new WeakMap();
  const rafTimers = new WeakMap();
  const transitionDuration = 220;

  const clearTimers = (item) => {
    const timer = closeTimers.get(item);
    if (timer) {
      clearTimeout(timer);
      closeTimers.delete(item);
    }

    const rafId = rafTimers.get(item);
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafTimers.delete(item);
    }
  };

  const setExpanded = (item, expanded) => {
    const trigger = item.querySelector(".packages__summary");
    const panel = item.querySelector(".packages__body");
    if (!trigger || !panel) return;

    trigger.setAttribute("aria-expanded", String(expanded));
    panel.setAttribute("aria-hidden", String(!expanded));

    if (expanded) {
      panel.hidden = false;
      panel.style.display = "block";
      item.classList.add("is-open");
    } else {
      panel.hidden = true;
      panel.style.display = "none";
      item.classList.remove("is-open");
    }
  };

  items.forEach((item) => {
    const trigger = item.querySelector(".packages__summary");
    const panel = item.querySelector(".packages__body");
    if (!trigger || !panel) return;

    const expanded = trigger.getAttribute("aria-expanded") === "true";
    setExpanded(item, expanded);
  });

  const openItem = (item) => {
    const trigger = item.querySelector(".packages__summary");
    const panel = item.querySelector(".packages__body");
    if (!trigger || !panel) return;

    clearTimers(item);
    trigger.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    panel.hidden = false;
    panel.style.display = "block";

    const rafId = requestAnimationFrame(() => {
      item.classList.add("is-open");
      rafTimers.delete(item);
    });
    rafTimers.set(item, rafId);
  };

  const closeItem = (item) => {
    const trigger = item.querySelector(".packages__summary");
    const panel = item.querySelector(".packages__body");
    const content = panel?.querySelector(".packages__content");
    if (!trigger || !panel) return;

    clearTimers(item);
    trigger.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    item.classList.remove("is-open");

    const finalizeClose = () => {
      if (item.classList.contains("is-open")) return;
      panel.hidden = true;
      panel.style.display = "none";
    };

    if (content) {
      const onTransitionEnd = (event) => {
        if (event.target !== content) return;
        finalizeClose();
      };
      content.addEventListener("transitionend", onTransitionEnd, {
        once: true,
      });
    }

    const timer = setTimeout(finalizeClose, transitionDuration);
    closeTimers.set(item, timer);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const item = trigger.closest(".packages__item");
      if (!item) return;

      const isExpanded = trigger.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        closeItem(item);
        return;
      }

      items.forEach((otherItem) => {
        if (otherItem !== item) {
          closeItem(otherItem);
        }
      });

      openItem(item);
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
