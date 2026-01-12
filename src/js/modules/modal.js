export function initRequestCallModal() {
  const modal = document.querySelector("[data-call-modal]");
  const openButtons = document.querySelectorAll("[data-call-open]");

  if (!modal || openButtons.length === 0) return;

  const closeButtons = modal.querySelectorAll("[data-call-close]");
  const dialog = modal.querySelector(".call-modal__dialog");
  const form = modal.querySelector("[data-call-form]");

  let lastActiveEl = null;

  const getFocusable = () => {
    return Array.from(
      modal.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
    );
  };

  const setOpenState = (isOpen) => {
    modal.classList.toggle("is-open", isOpen);
    modal.setAttribute("aria-hidden", String(!isOpen));

    document.documentElement.classList.toggle("is-modal-open", isOpen);
    document.body.classList.toggle("is-modal-open", isOpen);
  };

  const openModal = (triggerEl) => {
    lastActiveEl = triggerEl || document.activeElement;

    setOpenState(true);

    // focus first input
    const firstInput = modal.querySelector(".call-modal__input");
    (firstInput || dialog || modal).focus?.();
  };

  const closeModal = () => {
    setOpenState(false);

    if (lastActiveEl && typeof lastActiveEl.focus === "function") {
      lastActiveEl.focus();
    }
    lastActiveEl = null;
  };

  const onBackdropOrCloseClick = (e) => {
    const target = e.target;
    const isClose =
      target && target.closest && target.closest("[data-call-close]");
    if (isClose) closeModal();
  };

  const onKeyDown = (e) => {
    if (modal.getAttribute("aria-hidden") === "true") return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key !== "Tab") return;

    const focusable = getFocusable();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || !modal.contains(active)) {
        e.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn));
  });

  modal.addEventListener("click", onBackdropOrCloseClick);
  document.addEventListener("keydown", onKeyDown);

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      form.reset();
      closeModal();
    });
  }
}
