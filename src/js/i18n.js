const STORAGE_KEY = "lang";
const SUPPORTED = ["en", "ru"];
const DEFAULT_LANG = "en";

let DICTS = {};
let currentLang = DEFAULT_LANG;

function get(obj, path) {
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] != null ? acc[key] : undefined),
      obj
    );
}

function setActiveButtons(lang) {
  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    const isActive = btn.getAttribute("data-lang-switch") === lang;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

function applyTextTranslations(dict) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = get(dict, key);
    if (typeof value === "string") el.textContent = value;
  });
}

function applyPlaceholderTranslations(dict) {
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const value = get(dict, key);
    if (typeof value === "string") el.setAttribute("placeholder", value);
  });
}

function applyAriaLabelTranslations(dict) {
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    const value = get(dict, key);
    if (typeof value === "string") el.setAttribute("aria-label", value);
  });
}

function applyTranslations(lang) {
  const dict = DICTS[lang];
  if (!dict) return;

  applyTextTranslations(dict);
  applyPlaceholderTranslations(dict);
  applyAriaLabelTranslations(dict);
  setActiveButtons(lang);
}

async function loadDict(lang) {
  const res = await fetch(`./i18n/${lang}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Cannot load ${lang}.json`);
  return res.json();
}

async function ensureDicts() {
  const missing = SUPPORTED.filter((l) => !DICTS[l]);
  if (!missing.length) return;

  const loaded = await Promise.all(missing.map((l) => loadDict(l)));
  missing.forEach((l, idx) => (DICTS[l] = loaded[idx]));
}

function getInitialLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED.includes(saved)) return saved;

  return DEFAULT_LANG;
}

async function setLang(lang) {
  if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;

  await ensureDicts();
  currentLang = lang;

  localStorage.setItem(STORAGE_KEY, lang);
  applyTranslations(lang);
}

function bindLangSwitch() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang-switch]");
    if (!btn) return;

    const lang = btn.getAttribute("data-lang-switch");
    setLang(lang);
  });
}

export async function initI18n() {
  bindLangSwitch();
  await setLang(getInitialLang());
}

export function getCurrentLang() {
  return currentLang;
}
