const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function initBurgerMenu() {
  const menu = document.querySelector("[data-menu]");
  if (!menu) return;
  const body = document.body;
  const openers = document.querySelectorAll("[data-menu-open]");
  const panel = menu.querySelector(".burger-menu__panel") || menu;
  let isOpen = false;
  let lastActive = null;
  let keyHandler = null;

  const setAria = (value) =>
    openers.forEach((btn) => btn.setAttribute("aria-expanded", String(value)));

  const lockScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    body.dataset.scrollY = String(scrollY);
    body.classList.add("is-menu-open");
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
  };

  const unlockScroll = () => {
    const scrollY = Number(body.dataset.scrollY || 0);
    body.classList.remove("is-menu-open");
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    delete body.dataset.scrollY;
    window.scrollTo(0, scrollY);
  };

  const addKeyHandler = () => {
    const focusables = Array.from(menu.querySelectorAll(FOCUSABLE)).filter(
      (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    keyHandler = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;
      if (!focusables.length) {
        event.preventDefault();
        panel.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keyHandler);
    (first || panel).focus();
  };

  const removeKeyHandler = () => {
    if (keyHandler) document.removeEventListener("keydown", keyHandler);
    keyHandler = null;
  };

  const openMenu = (opener) => {
    if (isOpen) return;
    isOpen = true;
    lastActive = opener || document.activeElement;
    menu.setAttribute("aria-hidden", "false");
    setAria(true);
    lockScroll();
    if (!panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");
    addKeyHandler();
  };

  const closeMenu = () => {
    if (!isOpen) return;
    isOpen = false;
    menu.setAttribute("aria-hidden", "true");
    setAria(false);
    removeKeyHandler();
    unlockScroll();
    if (lastActive && typeof lastActive.focus === "function")
      lastActive.focus();
    lastActive = null;
  };

  const toggleMenu = (opener) => (isOpen ? closeMenu() : openMenu(opener));
  openers.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      toggleMenu(btn);
    });
  });
  menu.addEventListener("click", (event) => {
    const closeEl = event.target.closest("[data-menu-close]");
    if (!closeEl) return;
    event.preventDefault();
    closeMenu();
  });
  const mq = window.matchMedia("(min-width: 768px)");
  const onMqChange = (event) => event.matches && closeMenu();
  mq.addEventListener?.("change", onMqChange);
  mq.addListener?.(onMqChange);
}
