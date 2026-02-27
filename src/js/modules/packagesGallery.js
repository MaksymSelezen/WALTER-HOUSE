import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import { t } from "../i18n.js";
import "swiper/css";
import "swiper/css/navigation";

const slidesByPackage = Object.entries(
  import.meta.glob("../../assets/images/slides/packages-modals/*/*.jpg", {
    eager: true,
    import: "default",
  }),
).reduce((map, [path, src]) => {
  const m = path.match(/packages-modals\/([^/]+)\/(\d+)\.jpg$/);
  if (m) (map[m[1]] ||= [])[m[2] - 1] = src;
  return map;
}, {});

const titles = { elite: "Elite Style", vip: "VIP Style", extra: "Extra Style" };
const fallbackText = "Service information";
const cfg = { safe: 20, gap: 52, minW: 220, maxW: 360 };
const mqTablet = window.matchMedia("(min-width: 768px)");
const pad = (n) => String(n).padStart(2, "0");
const setOpen = (el, open) =>
  el &&
  (el.classList.toggle("is-open", open),
  el.setAttribute("aria-hidden", String(!open)));

const getHotspotIndex = (btn) => {
  if (btn.classList.contains("gallery-modal__hotspot--1")) return 1;
  if (btn.classList.contains("gallery-modal__hotspot--2")) return 2;
  return 3;
};

export function initPackagesGallery() {
  const modal = document.querySelector("[data-gallery-modal]");
  if (!modal) return;

  const $ = {
    modal,
    stage: modal.querySelector("[data-gallery-stage]"),
    swiper: modal.querySelector("[data-gallery-swiper]"),
    wrapper: modal.querySelector("[data-gallery-wrapper]"),
    current: modal.querySelector("[data-gallery-current]"),
    total: modal.querySelector("[data-gallery-total]"),
    prev: modal.querySelector("[data-gallery-prev]"),
    next: modal.querySelector("[data-gallery-next]"),
    hotspots: modal.querySelector("[data-gallery-hotspots]"),
    note: modal.querySelector("[data-gallery-annotation]"),
    noteText: modal.querySelector("[data-gallery-annotation-text]"),
    hotspotModal: document.querySelector("[data-hotspot-modal]"),
    hotspotTitle: document.querySelector("[data-hotspot-title]"),
    hotspotText: document.querySelector("[data-hotspot-modal-text]"),
  };
  if (
    Object.values($)
      .slice(1, 10)
      .some((el) => !el)
  )
    return;

  let swiper,
    slides = [],
    currentPack = "elite";

  const getHotspotText = (btn) => {
    const slideIndex = (swiper?.activeIndex ?? 0) + 1;
    const hotspotIndex = getHotspotIndex(btn);
    const key = `packages.gallery.${currentPack}.slide${pad(slideIndex)}.hotspot${hotspotIndex}.text`;
    return t(key, fallbackText);
  };

  const resetHotspots = () => {
    $.hotspots
      .querySelectorAll(".gallery-modal__hotspot.is-active")
      .forEach((b) => b.classList.remove("is-active"));
    $.note.classList.remove("is-visible", "gallery-modal__annotation--left");
    $.note.setAttribute("aria-hidden", "true");
  };
  const syncCounter = () => {
    const i = swiper?.activeIndex ?? 0;
    $.current.textContent = pad(i + 1);
    $.total.textContent = pad(slides.length);
    $.stage.style.setProperty("--slide", `url(${slides[i] || slides[0]})`);
  };

  const showInlineHotspot = (btn) => {
    resetHotspots();
    btn.classList.add("is-active");
    $.noteText.textContent = getHotspotText(btn);

    const host = $.hotspots.getBoundingClientRect(),
      dot = btn.getBoundingClientRect();
    const x = dot.left + dot.width / 2 - host.left,
      y = dot.top + dot.height / 2 - host.top;
    const maxTextW = Math.min(cfg.maxW, host.width - cfg.safe * 2);
    $.noteText.style.maxWidth = `${maxTextW}px`;

    const textRect = $.noteText.getBoundingClientRect();
    const textW = Math.ceil(
        Math.min(maxTextW, Math.max(cfg.minW, textRect.width)),
      ),
      textH = Math.ceil(textRect.height);
    const right = host.width - x - cfg.safe,
      left = x - cfg.safe;
    const openLeft =
      right < Math.min(textW + cfg.gap, cfg.maxW) && left > right;
    const top = y - cfg.safe,
      bottom = host.height - y - cfg.safe;
    const openBottom = top < textH + cfg.gap && bottom > top;

    const textLeft = Math.min(
      Math.max(openLeft ? x - cfg.gap - textW : x + cfg.gap, cfg.safe),
      host.width - cfg.safe - textW,
    );
    const textTop = Math.min(
      Math.max(openBottom ? y + cfg.gap : y - cfg.gap - textH, cfg.safe),
      host.height - cfg.safe - textH,
    );
    const lineWidth = Math.max(
      72,
      Math.abs((openLeft ? textLeft + textW : textLeft) - x) - 28,
    );

    $.note.dataset.x = openLeft ? "left" : "right";
    $.note.dataset.y = openBottom ? "bottom" : "top";
    $.note.classList.toggle(
      "gallery-modal__annotation--left",
      btn.classList.contains("gallery-modal__hotspot--1"),
    );
    $.note.style.setProperty("--anchor-x", `${x}px`);
    $.note.style.setProperty("--anchor-y", `${y}px`);
    $.note.style.setProperty("--line-width", `${lineWidth}px`);
    $.note.style.setProperty("--text-left", `${textLeft}px`);
    $.note.style.setProperty("--text-top", `${textTop}px`);
    $.note.style.setProperty("--text-height", `${textH}px`);
    $.note.classList.remove("is-visible");
    void $.note.offsetWidth;
    $.note.classList.add("is-visible");
    $.note.setAttribute("aria-hidden", "false");
  };

  const closeHotspotModal = () => setOpen($.hotspotModal, false);
  const closeGallery = () => {
    closeHotspotModal();
    resetHotspots();
    setOpen($.modal, false);
    document.documentElement.classList.remove("is-modal-open");
    document.body.classList.remove("is-modal-open");
  };
  const openGallery = (pack = "elite") => {
    slides = (slidesByPackage[pack] || []).filter(Boolean);
    if (!slides.length) return;
    currentPack = pack;
    $.wrapper.innerHTML = slides
      .map(() => '<div class="swiper-slide"></div>')
      .join("");
    setOpen($.modal, true);
    resetHotspots();
    document.documentElement.classList.add("is-modal-open");
    document.body.classList.add("is-modal-open");

    if (!swiper) {
      swiper = new Swiper($.swiper, {
        modules: [Navigation],
        slidesPerView: 1,
        rewind: true,
        navigation: { prevEl: $.prev, nextEl: $.next },
        on: {
          init: syncCounter,
          slideChange: () => (
            closeHotspotModal(),
            resetHotspots(),
            syncCounter()
          ),
        },
      });
      return;
    }
    swiper.updateSlides();
    swiper.update();
    swiper.slideTo(0, 0);
    syncCounter();
  };

  document.addEventListener("click", (e) => {
    const t = e.target,
      trigger = t.closest(".packages__btn[data-package]"),
      hotspot = t.closest(".gallery-modal__hotspot");
    if (trigger)
      return (e.preventDefault(), openGallery(trigger.dataset.package));
    if (
      t.closest("[data-gallery-close]") &&
      $.modal.classList.contains("is-open")
    )
      return (e.preventDefault(), closeGallery());
    if (t.closest("[data-hotspot-modal-close]"))
      return (e.preventDefault(), closeHotspotModal());
    if (!hotspot) return;
    e.preventDefault();
    if (mqTablet.matches)
      return (closeHotspotModal(), showInlineHotspot(hotspot));
    if ($.hotspotTitle)
      $.hotspotTitle.textContent = titles[currentPack] || titles.elite;
    if ($.hotspotText) $.hotspotText.textContent = getHotspotText(hotspot);
    setOpen($.hotspotModal, true);
  });

  document.addEventListener(
    "keydown",
    ({ key }) =>
      key === "Escape" &&
      ($.hotspotModal?.classList.contains("is-open")
        ? closeHotspotModal()
        : $.modal.classList.contains("is-open") && closeGallery()),
  );
  const onMedia = ({ matches }) =>
    matches ? closeHotspotModal() : resetHotspots();
  mqTablet.addEventListener
    ? mqTablet.addEventListener("change", onMedia)
    : mqTablet.addListener(onMedia);
}
