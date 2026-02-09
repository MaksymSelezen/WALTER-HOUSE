export function initBurgerMenu() {
  const menu = document.querySelector("[data-menu]");
  if (!menu) return;

  const body = document.body;
  const openers = document.querySelectorAll("[data-menu-open]");
  let isOpen = false;

  const syncState = (next) => {
    if (isOpen === next) return;
    isOpen = next;
    body.classList.toggle("is-menu-open", isOpen);
    menu.setAttribute("aria-hidden", String(!isOpen));
    openers.forEach((btn) => btn.setAttribute("aria-expanded", String(isOpen)));
  };

  const toggle = () => syncState(!isOpen);
  const close = () => syncState(false);

  openers.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      toggle();
    });
  });

  menu.addEventListener("click", (event) => {
    const target = event.target.closest("[data-menu-close]");
    if (!target) return;
    event.preventDefault();
    close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isOpen) return;
    event.preventDefault();
    close();
  });
}
