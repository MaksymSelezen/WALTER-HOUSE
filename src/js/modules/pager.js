export function initScreenPager() {
  const screens = Array.from(document.querySelectorAll("[data-screen]"));
  if (!screens.length) return;

  const pagerEl = document.querySelector("[data-pager]");
  const pagerBtns = pagerEl
    ? Array.from(pagerEl.querySelectorAll("[data-pager-btn]"))
    : [];

  const mql = window.matchMedia("(min-width: 1024px)");

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  function setActive(next) {
    const nextNum = clamp(Number(next), 1, screens.length);

    screens.forEach((s) => {
      const n = Number(s.dataset.screen);
      const isActive = n === nextNum;

      s.classList.toggle("is-active", isActive);
      s.setAttribute("aria-hidden", String(!isActive));
    });

    pagerBtns.forEach((b) => {
      const n = Number(b.dataset.pagerBtn);
      b.classList.toggle("is-active", n === nextNum);
      b.setAttribute("aria-current", n === nextNum ? "true" : "false");
    });

    document.body.dataset.activeScreen = String(nextNum);
  }

  function onPagerClick(e) {
    const btn = e.target.closest("[data-pager-btn]");
    if (!btn) return;
    setActive(btn.dataset.pagerBtn);
  }

  function onKeydown(e) {
    if (!mql.matches) return;

    const current = Number(document.body.dataset.activeScreen || "1");
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      setActive(current + 1);
    }
    if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      setActive(current - 1);
    }
  }

  // init
  setActive(document.body.dataset.activeScreen || "1");

  if (pagerEl) pagerEl.addEventListener("click", onPagerClick);
  window.addEventListener("keydown", onKeydown);

  // якщо з десктопа в мобайл — просто лишаємо .is-active (на мобайлі це не заважає)
  mql.addEventListener("change", () => {
    setActive(document.body.dataset.activeScreen || "1");
  });
}
