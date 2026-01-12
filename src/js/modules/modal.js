// src/js/modules/modal.js
export function initRequestCallModal() {
  let activeModal = null;
  let lastActiveEl = null;

  const isOpen = () => activeModal && activeModal.classList.contains("is-open");

  const getFocusable = (root) => {
    if (!root) return [];
    return Array.from(
      root.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
    );
  };

  const setScrollLock = (locked) => {
    document.documentElement.classList.toggle("is-modal-open", locked);
    document.body.classList.toggle("is-modal-open", locked);
  };

  const getModalById = (id) => {
    if (!id) return null;

    // If ids are accidentally duplicated (because of partials),
    // pick the one that is NOT inside burger-menu.
    const safeId =
      window.CSS && typeof window.CSS.escape === "function"
        ? window.CSS.escape(id)
        : id;

    const candidates = Array.from(document.querySelectorAll(`#${safeId}`));
    if (candidates.length === 0) return null;

    return (
      candidates.find((el) => !el.closest(".burger-menu")) || candidates[0]
    );
  };

  const openModal = (modalEl, triggerEl) => {
    if (!modalEl) return;

    activeModal = modalEl;
    lastActiveEl = triggerEl || document.activeElement;

    activeModal.classList.add("is-open");
    activeModal.setAttribute("aria-hidden", "false");
    setScrollLock(true);

    const panel = activeModal.querySelector(".call-modal__panel");
    const firstInput = activeModal.querySelector(".call-modal__input");

    (firstInput || panel || activeModal).focus?.();
  };

  const closeModal = () => {
    if (!activeModal) return;

    activeModal.classList.remove("is-open");
    activeModal.setAttribute("aria-hidden", "true");
    setScrollLock(false);

    if (lastActiveEl && typeof lastActiveEl.focus === "function") {
      lastActiveEl.focus();
    }

    lastActiveEl = null;
    activeModal = null;
  };

  // Delegation: open/close from ANY place in DOM
  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest("[data-call-open]");
    if (openBtn) {
      e.preventDefault();

      const targetId =
        openBtn.getAttribute("aria-controls") || openBtn.dataset.callTarget;

      const modalEl = targetId
        ? getModalById(targetId)
        : document.querySelector("[data-call-modal]");

      openModal(modalEl, openBtn);
      return;
    }

    // Close only when modal is open and click is inside it
    if (!isOpen()) return;

    const closeBtn = e.target.closest("[data-call-close]");
    if (closeBtn && activeModal.contains(closeBtn)) {
      e.preventDefault();
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key !== "Tab") return;

    const focusable = getFocusable(activeModal);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || !activeModal.contains(active)) {
        e.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Form (поки без API)
  document.addEventListener("submit", (e) => {
    const form = e.target.closest("[data-call-form]");
    if (!form) return;

    e.preventDefault();
    // TODO: підключиш API
    // const data = Object.fromEntries(new FormData(form).entries());

    form.reset();
    closeModal();
  });
}
