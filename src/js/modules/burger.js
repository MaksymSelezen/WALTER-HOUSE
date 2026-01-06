const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function initBurgerMenu() {
  const menu = document.querySelector("[data-menu]");
  if (!menu) return;

  const openers = document.querySelectorAll("[data-menu-open]");
  const menuBody = menu.querySelector(".burger-menu__body") || menu;

  let isOpen = false;
  let lastActiveElement = null;

  let removeTrap = null;
  let removeEsc = null;

  // ---------- Scroll lock (+ body class for header fixed in CSS) ----------
  const lockScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    document.body.dataset.scrollY = String(scrollY);

    document.body.classList.add("menu-open");

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  };

  const unlockScroll = () => {
    const scrollY = Number(document.body.dataset.scrollY || 0);

    document.body.classList.remove("menu-open");

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    delete document.body.dataset.scrollY;
    window.scrollTo(0, scrollY);
  };

  // ---------- Focus trap ----------
  const trapFocus = () => {
    const focusables = Array.from(menu.querySelectorAll(FOCUSABLE)).filter(
      (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
    );

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;

      if (!focusables.length) {
        e.preventDefault();
        menuBody.focus();
        return;
      }

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    (first || menuBody).focus();

    return () => document.removeEventListener("keydown", onKeyDown);
  };

  // ---------- ESC close ----------
  const bindEscClose = () => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  };

  // ---------- Helpers ----------
  const setAriaExpanded = (value) => {
    openers.forEach((btn) => btn.setAttribute("aria-expanded", String(value)));
  };

  const openMenu = (opener = null) => {
    if (isOpen) return;

    isOpen = true;
    lastActiveElement = opener || document.activeElement;

    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");

    setAriaExpanded(true);
    lockScroll();

    if (!menuBody.hasAttribute("tabindex")) {
      menuBody.setAttribute("tabindex", "-1");
    }

    removeTrap = trapFocus();
    removeEsc = bindEscClose();
  };

  const closeMenu = () => {
    if (!isOpen) return;

    isOpen = false;

    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");

    setAriaExpanded(false);
    unlockScroll();

    if (removeTrap) removeTrap();
    if (removeEsc) removeEsc();
    removeTrap = null;
    removeEsc = null;

    if (lastActiveElement && typeof lastActiveElement.focus === "function") {
      lastActiveElement.focus();
    }
    lastActiveElement = null;
  };

  const toggleMenu = (opener) => {
    if (isOpen) closeMenu();
    else openMenu(opener);
  };

  // ---------- Events ----------
  openers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleMenu(btn);
    });
  });

  menu.addEventListener("click", (e) => {
    const closeEl = e.target.closest("[data-menu-close]");
    if (!closeEl) return;
    e.preventDefault();
    closeMenu();
  });

  const mq = window.matchMedia("(min-width: 768px)");
  const onMqChange = (e) => {
    if (e.matches) closeMenu();
  };

  mq.addEventListener?.("change", onMqChange);
  mq.addListener?.(onMqChange);
}
