// screen-pager.js — пейджер/слайдер для перемикання секцій .screen на 1440px+

export function initScreenPager() {
  const BREAKPOINT = 1440; // з цього брейкпоінта вмикаємо режим "екранного слайдера"

  // Контейнер сторінки (якщо є) — щоб шукати screens локально, інакше шукаємо по всьому документу
  const page = document.querySelector("#page");
  const screens = page
    ? Array.from(page.querySelectorAll(".screen[data-screen]"))
    : Array.from(document.querySelectorAll(".screen[data-screen]"));

  // Якщо секцій немає — нічого ініціалізувати
  if (!screens.length) return;

  // Кореневий елемент пейджера та хост для "крапок" (може бути окремий контейнер або сам pagerEl)
  const pagerEl = document.querySelector("[data-pager]");
  const dotsHost =
    pagerEl?.querySelector("[data-pager-dots]") || pagerEl || null;

  // Умови: 1440+ і системна опція "зменшити анімації"
  const mql = window.matchMedia(`(min-width: ${BREAKPOINT}px)`);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Обмеження значення в діапазоні (щоб не вийти за 1..screens.length)
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  let enabled = false; // чи активний режим слайдера зараз
  let animating = false; // чи триває перехід (блок повторних перемикань)

  // Стартовий активний екран: body[data-active-screen] -> .screen.is-active -> 1
  let activeNum =
    Number(document.body.dataset.activeScreen) ||
    Number(
      screens.find((s) => s.classList.contains("is-active"))?.dataset.screen,
    ) ||
    1;

  activeNum = clamp(activeNum, 1, screens.length);

  // Перевірка: якщо фокус/клік у полях вводу — не перемикаємо екрани з клавіатури
  function isTypingTarget(target) {
    if (!target) return false;
    const el = target.closest?.(
      "input, textarea, select, button, [contenteditable='true']",
    );
    return Boolean(el);
  }

  // Очищає CSS-класи, які керують анімацією входу/виходу екрану
  function clearAnimClasses(el) {
    el.classList.remove(
      "is-exit-to-prev",
      "is-exit-to-next",
      "is-enter-from-prev",
      "is-enter-from-next",
    );
  }

  // На мобільних/планшетах не ховаємо секції через aria-hidden (звичайний скрол)
  function setAriaForMobile() {
    screens.forEach((s) => s.removeAttribute("aria-hidden"));
  }

  // Тримає актуальний номер екрану в body[data-active-screen] для CSS/стану
  function updateBodyActive(num) {
    document.body.dataset.activeScreen = String(num);
  }

  // Оновлює активну "крапку" пейджера + aria-current для accessibility
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

  // Миттєво робить екран активним без анімації (також керує aria-hidden у режимі enabled)
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

  // Перехід на інший екран: перевірки -> reduced motion -> CSS-анімація -> фіналізація стану
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

    // Готуємо наступний екран у стартовому стані "входу"
    nextEl.classList.add(forward ? "is-enter-from-next" : "is-enter-from-prev");
    nextEl.classList.add("is-active");
    nextEl.setAttribute("aria-hidden", "false");
    current.setAttribute("aria-hidden", "true");

    // На наступному кадрі запускаємо transition: поточний виходить, наступний "заїжджає" у фінальний стан
    requestAnimationFrame(() => {
      current.classList.add(forward ? "is-exit-to-prev" : "is-exit-to-next");
      nextEl.classList.remove(
        forward ? "is-enter-from-next" : "is-enter-from-prev",
      );
    });

    // Завершення: прибрати активність зі старого, очистити класи, зафіксувати activeNum і UI
    const finish = () => {
      current.classList.remove("is-active");
      clearAnimClasses(current);
      clearAnimClasses(nextEl);

      activeNum = toNum;
      updateDotsActive(toNum);
      updateBodyActive(toNum);

      animating = false;
    };

    // Страховка, якщо transitionend не спрацює (наприклад, CSS змінився)
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

  // Генерує кнопки-крапки автоматично, якщо їх немає в розмітці
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

  // Делегований клік по пейджеру: визначаємо кнопку і переходимо на її екран
  function onPagerClick(e) {
    const btn = e.target.closest?.("[data-pager-btn]");
    if (!btn) return;
    goTo(btn.dataset.pagerBtn);
  }

  // Сервісні переходи на сусідні екрани
  function next() {
    goTo(activeNum + 1);
  }

  function prev() {
    goTo(activeNum - 1);
  }

  // Шукає найближчого батька, який реально скролиться по Y (щоб не ламати скрол у внутрішніх блоках)
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

  // Колесо миші: якщо можна скролити внутрішній блок — даємо скрол; інакше перемикаємо секції
  function onWheel(e) {
    if (!enabled) return;
    if (animating) return;

    const scrollParent = getScrollableParent(e.target);
    if (scrollParent) {
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

  // Клавіатура: підтримка Arrow/Page/Home/End (без втручання під час введення тексту)
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

  // Вмикає режим: показує пейджер, синхронізує активний екран і підключає події керування
  function enable() {
    if (enabled) return;
    enabled = true;

    document.body.classList.add("is-screen-slider", "is-screen-slider--init");
    if (pagerEl) pagerEl.hidden = false;

    buildDotsIfMissing();
    setActiveInstant(activeNum);

    if (pagerEl) pagerEl.addEventListener("click", onPagerClick);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeydown);

    requestAnimationFrame(() => {
      document.body.classList.remove("is-screen-slider--init");
    });
  }

  // Вимикає режим: прибирає події, ховає пейджер і повертає звичайний доступ до всіх секцій
  function disable() {
    if (!enabled) return;
    enabled = false;

    if (pagerEl) pagerEl.removeEventListener("click", onPagerClick);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeydown);

    document.body.classList.remove(
      "is-screen-slider",
      "is-screen-slider--init",
    );
    if (pagerEl) pagerEl.hidden = true;

    setAriaForMobile();
    screens.forEach((s) => clearAnimClasses(s));

    animating = false;
  }

  // Перемикає enable/disable відповідно до поточної ширини екрана
  function sync() {
    if (mql.matches) enable();
    else disable();
  }

  // Початкова ініціалізація стану і підписка на зміну брейкпоінта
  updateBodyActive(activeNum);
  sync();

  if (mql.addEventListener) mql.addEventListener("change", sync);
  else mql.addListener(sync);
}
