export function initPackagesAccordion() {
  //! Старт: пошук кореня і елементів
  //Якщо на сторінці немає акордеону — функція не робить нічого.

  const root = document.querySelector("[data-packages-accordion]");
  if (!root) return;

  // items — всі картки всередині акордеону
  // triggers — всі заголовки/кнопки, по яких відкривати/закривати

  const items = Array.from(root.querySelectorAll(".packages__item"));
  const triggers = items
    .map((item) => item.querySelector(".packages__summary"))
    .filter(Boolean);

  //! Таймери й “захист від гонок” (важлива частина)
  // Навіщо WeakMap’и:
  // Коли користувач швидко клікає туди-сюди, можуть залишитись:
  // setTimeout на закриття
  // requestAnimationFrame на відкриття
  // WeakMap зберігає таймери прив’язано до конкретного item, щоб їх можна було:
  // -скасувати
  // -і не отримати “закрився не той блок” через старий таймер

  const closeTimers = new WeakMap();
  const rafTimers = new WeakMap();
  const transitionDuration = 220;

  //! clearTimers(item) — чистить таймери для конкретної картки
  // якщо був запланований setTimeout на закриття → скасовує
  // якщо був requestAnimationFrame → скасовує
  // таким чином кожна нова дія “обнуляє” хвости від попередньої

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

  //! setExpanded(item, expanded) — універсальна установка стану
  // Ця функція:
  // ставить aria-expanded на тригер
  // ставить aria-hidden на панель
  // показує/ховає панель через hidden + display
  // додає/прибирає клас is-open на item
  //* Сенс: один метод, який приводить DOM до правильного стану.

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

  //! Ініціалізація стану з HTML
  // Тобто початковий стан береться з твоєї верстки:
  // якщо в HTML у summary стоїть aria-expanded="true" → картка стартує відкрита
  // якщо "false" або нема → закрита

  items.forEach((item) => {
    const trigger = item.querySelector(".packages__summary");
    const panel = item.querySelector(".packages__body");
    if (!trigger || !panel) return;

    const expanded = trigger.getAttribute("aria-expanded") === "true";
    setExpanded(item, expanded);
  });

  //! openItem(item) — відкрити картку

  // Що робить:
  // чистить таймери
  // виставляє доступність:
  // aria-expanded="true"
  // aria-hidden="false"
  // робить панель видимою:
  // hidden = false
  // display = "block"
  // на наступному кадрі додає is - open

  const openItem = (item) => {
    const trigger = item.querySelector(".packages__summary");
    const panel = item.querySelector(".packages__body");
    if (!trigger || !panel) return;

    clearTimers(item);
    trigger.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    panel.hidden = false;
    panel.style.display = "block";

    //! Навіщо requestAnimationFrame тут:
    // Це часто потрібно, щоб CSS-анімації/transition нормально стартували:
    // спочатку елемент “з’явився”
    // потім на наступному кадрі додався клас → і transition пішов плавно

    const rafId = requestAnimationFrame(() => {
      item.classList.add("is-open");
      rafTimers.delete(item);
    });
    rafTimers.set(item, rafId);
  };

  //!loseItem(item) — закрити картку
  // Що робить:
  // чистить таймери
  // ставить:
  // aria-expanded="false"
  // aria-hidden="true"
  // одразу прибирає is-open (щоб CSS запустив анімацію “закриття”)
  // Потім є finalizeClose() — фінальний крок:
  // реально ховає панель:
  // panel.hidden = true
  // display = "none"
  // але тільки якщо item не встиг знову відкритися (перевірка is-open)

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

//* Головні “за що відповідає” (коротко)
// root/items/triggers — знаходить акордеон, картки й кнопки
// WeakMap таймери — щоб не було багів при швидких кліках
// setExpanded/init loop — приводить стартовий стан до HTML (aria-expanded)
// openItem/closeItem — відкриття/закриття з анімаціями + accessibility
// trigger click handler — правило “відкритий один”
// root click handler — робить всю картку клікабельною без конфліктів з кнопками/лінками/виділенням
