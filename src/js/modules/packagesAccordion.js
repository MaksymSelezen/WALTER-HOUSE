//! пошук класу "data-packages-accordion" і вихід якщо його немає

export function initPackagesAccordion() {
  const root = document.querySelector("[data-packages-accordion]");
  if (!root) return;

  //! пошук елементів -> ...root (spread оператор) перетворення NodeList на масив ->
  //! -> перебираємо масив через map() і перетворюємо li на об'єкт ->
  //! -> методом filter() залишаємо елементи, для яких умова true

  const items = [...root.querySelectorAll(".packages__item")]
    .map((item) => ({
      item,
      trigger: item.querySelector(".packages__trigger"),
      panel: item.querySelector(".packages__panel"),
    }))
    .filter((x) => x.trigger && x.panel);

  //! функція вмикання / вимикання item
  //! 1) Деструктуризація параметра - перший аргумент об'єкт дістає item, trigger, panel. Open - буль (true / false)
  //! 2) setAttribute(name, value) — ставить атрибут в HTML. Атрибути в HTML - це текст, тому String(open)
  //! 3) classList.toggle("is-active", open) - ставить / знімає клас "is-active"
  //! 4) panel.style.maxHeight - ставить висоту в px.

  const setState = ({ item, trigger, panel }, open) => {
    trigger.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    item.classList.toggle("is-active", open);
    panel.style.maxHeight = open ? panel.scrollHeight + "px" : null;
  };

  //! Синхронізація стану. Метод проходиться по кожному елементу і якщо true - відкриває item,
  //! якщо false - закриває ---- щоб не було відкрито декілька карток

  items.forEach((x) =>
    setState(x, x.trigger.getAttribute("aria-expanded") === "true"),
  );

  //! Синхронізація класу на ul для керування ширинами в CSS (1920)
  //! Додає клас .has-active

  const syncHasActive = () => {
    const anyOpen = items.some((x) => x.item.classList.contains("is-active"));
    root.classList.toggle("has-active", anyOpen);
  };
  syncHasActive();

  //! Обробник кліків: addEventListener
  //! При кліку в будь яке місце створюється об'єкт події "е"
  //! e.target - елемент по якому був клік. closest() піднімається вгору по DOM i повертає елемент, який підходить під селектор
  //! if (e.target.closest("a")) return; - не чіпає посилання

  root.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;

    const li = e.target.closest(".packages__item");
    const current = items.find((x) => x.item === li);
    if (!current) return;

    //! Дізнається чи відкритий стан / закритий
    const isOpen = current.trigger.getAttribute("aria-expanded") === "true";

    //! Закриває інші панелі і перемикає на поточну
    items.forEach((x) => x !== current && setState(x, false));
    setState(current, !isOpen);

    // після будь-якої зміни стану оновлюємо клас .has-active на <ul>
    syncHasActive();
  });
}

