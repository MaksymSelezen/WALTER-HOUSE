export function initBurgerMenu() {
  const menu = document.querySelector("[data-menu]");
  if (!menu) return;

  const body = document.body;
  const openers = document.querySelectorAll("[data-menu-open]");

  const setOpen = (isOpen) => {
    body.classList.toggle("is-menu-open", isOpen);
    menu.setAttribute("aria-hidden", String(!isOpen));
    openers.forEach((btn) => btn.setAttribute("aria-expanded", String(isOpen)));
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-menu-open], [data-menu-close]");
    if (!trigger) return;

    if (trigger.matches("[data-menu-open]")) {
      event.preventDefault();
      setOpen(!body.classList.contains("is-menu-open"));
      return;
    }

    if (!menu.contains(trigger)) return;
    event.preventDefault();
    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("is-menu-open")) {
      event.preventDefault();
      setOpen(false);
    }
  });
}
