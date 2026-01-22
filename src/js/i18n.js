// i18n.js — перемикання мови (en/ru), завантаження словників і застосування перекладів до DOM

const STORAGE_KEY = "lang"; // ключ у localStorage для збереження вибраної мови
const SUPPORTED = ["en", "ru"]; // список підтримуваних мов
const DEFAULT_LANG = "en"; // мова за замовчуванням

let DICTS = {}; // кеш словників: { en: {...}, ru: {...} }
let currentLang = DEFAULT_LANG; // поточна активна мова

//! Безпечно дістає значення з об’єкта за шляхом типу "header.title"
// Як працює:
// path.split(".") робить масив ключів: "header.title" → ["header", "title"]
// reduce проходиться по вкладеності:
// спочатку бере obj["header"]
// потім obj["header"]["title"]
// якщо на якомусь кроці нема даних — повертає undefined, і код не падає.
// Плюс: це безпечніше, ніж писати dict.header.title, бо якщо header нема — не буде помилки.

function get(obj, path) {
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] != null ? acc[key] : undefined),
      obj,
    );
}

//! Виставляє активний стан кнопок перемикання мови (клас + aria-pressed)
// Що відбувається:
// знаходить всі елементи з [data-lang-switch]
// для кожного: порівнює його атрибут ("en"/"ru") з поточною мовою
// додає/знімає клас is-active
// ставить aria-pressed="true/false" (це accessibility: екранні читачі розуміють “кнопка натиснута/активна”).

function setActiveButtons(lang) {
  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    const isActive = btn.getAttribute("data-lang-switch") === lang;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

//! Перекладає текстовий вміст елементів з атрибутом data-i18n
//Логіка:
//бере ключ з атрибута
//шукає значення в словнику dict через get()
//якщо знайшло рядок — ставить в textContent
//Важливий нюанс: textContent вставляє як текст, а не HTML. Тобто <b> не буде працювати як тег — це плюс для безпеки (захист від ін’єкцій).

function applyTextTranslations(dict) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = get(dict, key);
    if (typeof value === "string") el.textContent = value;
  });
}

//! Перекладає placeholder у полях вводу/textarea з атрибутом data-i18n-placeholder

function applyPlaceholderTranslations(dict) {
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const value = get(dict, key);
    if (typeof value === "string") el.setAttribute("placeholder", value);
  });
}

// Перекладає aria-label для accessibility з атрибутом data-i18n-aria-label
function applyAriaLabelTranslations(dict) {
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    const value = get(dict, key);
    if (typeof value === "string") el.setAttribute("aria-label", value);
  });
}

// Застосовує переклади для вибраної мови та оновлює UI перемикача
function applyTranslations(lang) {
  const dict = DICTS[lang];
  if (!dict) return;

  applyTextTranslations(dict);
  applyPlaceholderTranslations(dict);
  applyAriaLabelTranslations(dict);
  setActiveButtons(lang);
}

// Завантажує JSON-словник для конкретної мови з папки ./i18n
async function loadDict(lang) {
  const res = await fetch(`./i18n/${lang}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Cannot load ${lang}.json`);
  return res.json();
}

// Гарантує, що всі потрібні словники завантажені (догружає тільки відсутні)
async function ensureDicts() {
  const missing = SUPPORTED.filter((l) => !DICTS[l]);
  if (!missing.length) return;

  const loaded = await Promise.all(missing.map((l) => loadDict(l)));
  missing.forEach((l, idx) => (DICTS[l] = loaded[idx]));
}

// Визначає стартову мову: з localStorage (якщо валідна) або DEFAULT_LANG
function getInitialLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED.includes(saved)) return saved;

  return DEFAULT_LANG;
}

// Встановлює мову: валідує, підвантажує словники, зберігає вибір і перекладає DOM
async function setLang(lang) {
  if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;

  await ensureDicts();
  currentLang = lang;

  document.documentElement.setAttribute("lang", lang);
  localStorage.setItem(STORAGE_KEY, lang);
  applyTranslations(lang);
}

// Підв’язує перемикач мови через делегування кліку на document
function bindLangSwitch() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang-switch]");
    if (!btn) return;

    const lang = btn.getAttribute("data-lang-switch");
    setLang(lang);
  });
}

// Публічна ініціалізація: підключає перемикач і застосовує стартову мову
export async function initI18n() {
  bindLangSwitch();
  await setLang(getInitialLang());
}

// Повертає поточну активну мову (корисно для логіки/форматування)
export function getCurrentLang() {
  return currentLang;
}
