export function initScreenPager() {
  const BREAKPOINT = 1440;

  const page = document.querySelector("#page");
  const screens = page
    ? Array.from(page.querySelectorAll(".screen[data-screen]"))
    : Array.from(document.querySelectorAll(".screen[data-screen]"));

  if (!screens.length) return;

  const pagerEl = document.querySelector("[data-pager]");
  const dotsHost =
    pagerEl?.querySelector("[data-pager-dots]") || pagerEl || null;

  const mql = window.matchMedia(`(min-width: ${BREAKPOINT}px)`);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  let enabled = false;
  let animating = false;

  let activeNum =
    Number(document.body.dataset.activeScreen) ||
    Number(
      screens.find((s) => s.classList.contains("is-active"))?.dataset.screen,
    ) ||
    1;

  activeNum = clamp(activeNum, 1, screens.length);

  function isTypingTarget(target) {
    if (!target) return false;
    const el = target.closest?.(
      "input, textarea, select, button, [contenteditable='true']",
    );
    return Boolean(el);
  }

  function clearAnimClasses(el) {
    el.classList.remove(
      "is-exit-to-prev",
      "is-exit-to-next",
      "is-enter-from-prev",
      "is-enter-from-next",
    );
  }

  function setAriaForMobile() {
    screens.forEach((s) => s.removeAttribute("aria-hidden"));
  }

  function updateBodyActive(num) {
    document.body.dataset.activeScreen = String(num);
  }

  function updateDotsActive(num) {
    if (!dotsHost) return;
    const btns = Array.from(dotsHost.querySelectorAll("[data-pager-btn]"));
    btns.forEach((b) => {
      const n = Number(b.dataset.pagerBtn);
      const isActive = n === num;

      b.classList.toggle("is-active", isActive);

      if (isActive) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
  }

  function setActiveInstant(next) {
    const nextNum = clamp(Number(next), 1, screens.length);
    activeNum = nextNum;

    screens.forEach((s) => {
      const n = Number(s.dataset.screen);
      const isActive = n === nextNum;

      s.classList.toggle("is-active", isActive);
      clearAnimClasses(s);

      if (enabled) s.setAttribute("aria-hidden", String(!isActive));
      else s.removeAttribute("aria-hidden");
    });

    updateDotsActive(nextNum);
    updateBodyActive(nextNum);
  }

  function goTo(next) {
    if (!enabled) return;
    if (animating) return;

    const nextNum = clamp(Number(next), 1, screens.length);
    if (nextNum === activeNum) return;

    if (reducedMotion.matches) {
      setActiveInstant(nextNum);
      return;
    }

    animating = true;

    const fromNum = activeNum;
    const toNum = nextNum;
    const forward = toNum > fromNum;

    const current = screens.find((s) => Number(s.dataset.screen) === fromNum);
    const nextEl = screens.find((s) => Number(s.dataset.screen) === toNum);

    if (!current || !nextEl) {
      animating = false;
      return;
    }

    clearAnimClasses(current);
    clearAnimClasses(nextEl);

    // prepare next
    nextEl.classList.add(forward ? "is-enter-from-next" : "is-enter-from-prev");
    nextEl.classList.add("is-active");
    nextEl.setAttribute("aria-hidden", "false");
    current.setAttribute("aria-hidden", "true");

    requestAnimationFrame(() => {
      current.classList.add(forward ? "is-exit-to-prev" : "is-exit-to-next");
      nextEl.classList.remove(
        forward ? "is-enter-from-next" : "is-enter-from-prev",
      );
    });

    const finish = () => {
      current.classList.remove("is-active");
      clearAnimClasses(current);
      clearAnimClasses(nextEl);

      activeNum = toNum;
      updateDotsActive(toNum);
      updateBodyActive(toNum);

      animating = false;
    };

    const fallback = window.setTimeout(finish, 900);

    current.addEventListener(
      "transitionend",
      () => {
        window.clearTimeout(fallback);
        finish();
      },
      { once: true },
    );
  }

  function buildDotsIfMissing() {
    if (!dotsHost) return;

    const existing = dotsHost.querySelectorAll("[data-pager-btn]");
    if (existing.length) return;

    const frag = document.createDocumentFragment();

    screens.forEach((s) => {
      const n = Number(s.dataset.screen);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pager__dot";
      btn.dataset.pagerBtn = String(n);
      btn.setAttribute("aria-label", `Go to screen ${n}`);

      frag.appendChild(btn);
    });

    dotsHost.appendChild(frag);
  }

  function onPagerClick(e) {
    const btn = e.target.closest?.("[data-pager-btn]");
    if (!btn) return;
    goTo(btn.dataset.pagerBtn);
  }

  function next() {
    goTo(activeNum + 1);
  }

  function prev() {
    goTo(activeNum - 1);
  }

  function getScrollableParent(startEl) {
    let el = startEl;
    while (el && el !== document.body) {
      if (!(el instanceof HTMLElement)) break;
      const style = window.getComputedStyle(el);
      const canScroll =
        (style.overflowY === "auto" || style.overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight;
      if (canScroll) return el;
      el = el.parentElement;
    }
    return null;
  }

  function onWheel(e) {
    if (!enabled) return;
    if (animating) return;

    const scrollParent = getScrollableParent(e.target);
    if (scrollParent) {
      // якщо елемент реально може скролитись в напрямку — не перемикаємо секції
      const dy = e.deltaY;
      const atTop = scrollParent.scrollTop <= 0;
      const atBottom =
        scrollParent.scrollTop + scrollParent.clientHeight >=
        scrollParent.scrollHeight - 1;

      if ((dy < 0 && !atTop) || (dy > 0 && !atBottom)) return;
    }

    e.preventDefault();

    if (Math.abs(e.deltaY) < 12) return;
    if (e.deltaY > 0) next();
    else prev();
  }

  function onKeydown(e) {
    if (!enabled) return;
    if (animating) return;
    if (isTypingTarget(e.target)) return;

    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      next();
    }

    if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      prev();
    }

    if (e.key === "Home") {
      e.preventDefault();
      goTo(1);
    }

    if (e.key === "End") {
      e.preventDefault();
      goTo(screens.length);
    }
  }

  function enable() {
    if (enabled) return;
    enabled = true;

    document.body.classList.add("is-screen-slider"); // CSS режим 1440+
    if (pagerEl) pagerEl.hidden = false;

    buildDotsIfMissing();
    setActiveInstant(activeNum);

    if (pagerEl) pagerEl.addEventListener("click", onPagerClick);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeydown);
  }

  function disable() {
    if (!enabled) return;
    enabled = false;

    if (pagerEl) pagerEl.removeEventListener("click", onPagerClick);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeydown);

    document.body.classList.remove("is-screen-slider");
    if (pagerEl) pagerEl.hidden = true;

    // на мобілці/планшеті не ховаємо секції aria-hidden
    setAriaForMobile();

    // прибираємо анімаційні класи (is-active можна лишити — не заважає)
    screens.forEach((s) => clearAnimClasses(s));

    animating = false;
  }

  function sync() {
    if (mql.matches) enable();
    else disable();
  }

  // init
  updateBodyActive(activeNum);
  sync();

  if (mql.addEventListener) mql.addEventListener("change", sync);
  else mql.addListener(sync);
}
