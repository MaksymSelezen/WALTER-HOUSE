import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const slidesByPackage = Object.entries(
  import.meta.glob("../../assets/images/slides/packages-modals/*/*.jpg", {
    eager: true,
    import: "default",
  }),
).reduce((map, [path, src]) => {
  const match = path.match(/packages-modals\/([^/]+)\/(\d+)\.jpg$/);
  if (!match) return map;

  const [, pack, index] = match;
  (map[pack] ||= [])[Number(index) - 1] = src;
  return map;
}, {});

const packageTitles = {
  elite: "Elite Style",
  vip: "VIP Style",
  extra: "Extra Style",
};

const fallbackHotspotText =
  "Установка межкомнатных дверей без врезки фурнитуры и подрезки наличников";
const annotationSafePadding = 20;
const annotationGap = 52;
const annotationMinWidth = 220;
const annotationMaxWidth = 360;

const pad2 = (value) => String(value).padStart(2, "0");
const setOpen = (element, isOpen) => {
  if (!element) return;
  element.classList.toggle("is-open", isOpen);
  element.setAttribute("aria-hidden", String(!isOpen));
};

export function initPackagesGallery() {
  const modal = document.querySelector("[data-gallery-modal]");
  if (!modal) return;

  const els = {
    stage: modal.querySelector("[data-gallery-stage]"),
    swiper: modal.querySelector("[data-gallery-swiper]"),
    wrapper: modal.querySelector("[data-gallery-wrapper]"),
    current: modal.querySelector("[data-gallery-current]"),
    total: modal.querySelector("[data-gallery-total]"),
    prev: modal.querySelector("[data-gallery-prev]"),
    next: modal.querySelector("[data-gallery-next]"),
    hotspots: modal.querySelector("[data-gallery-hotspots]"),
    annotation: modal.querySelector("[data-gallery-annotation]"),
    annotationText: modal.querySelector("[data-gallery-annotation-text]"),
    hotspotModal: document.querySelector("[data-hotspot-modal]"),
  };

  if (
    Object.values(els)
      .slice(0, 10)
      .some((element) => !element)
  )
    return;

  const hotspotTitle = els.hotspotModal?.querySelector("[data-hotspot-title]");
  const tabletMedia = window.matchMedia("(min-width: 768px)");

  let swiper;
  let slides = [];
  let currentPackage = "elite";

  const resetInlineHotspot = () => {
    els.hotspots
      .querySelectorAll(".gallery-modal__hotspot.is-active")
      .forEach((btn) => btn.classList.remove("is-active"));

    els.annotation.classList.remove("is-visible");
    els.annotation.classList.remove("gallery-modal__annotation--left");
    els.annotation.setAttribute("aria-hidden", "true");
  };

  const closeHotspotModal = () => setOpen(els.hotspotModal, false);

  const updateInlineHotspot = (hotspotBtn) => {
    resetInlineHotspot();
    hotspotBtn.classList.add("is-active");

    const hostRect = els.hotspots.getBoundingClientRect();
    const btnRect = hotspotBtn.getBoundingClientRect();
    els.annotationText.textContent =
      hotspotBtn.dataset.hotspotText || fallbackHotspotText;

    const anchorX = btnRect.left + btnRect.width / 2 - hostRect.left;
    const anchorY = btnRect.top + btnRect.height / 2 - hostRect.top;
    const maxTextWidth = Math.min(
      annotationMaxWidth,
      hostRect.width - annotationSafePadding * 2,
    );

    els.annotationText.style.maxWidth = `${maxTextWidth}px`;

    const textRect = els.annotationText.getBoundingClientRect();
    const textWidth = Math.ceil(
      Math.min(maxTextWidth, Math.max(annotationMinWidth, textRect.width)),
    );
    const textHeight = Math.ceil(textRect.height);
    const isFirstHotspot = hotspotBtn.classList.contains(
      "gallery-modal__hotspot--1",
    );

    const spaceRight = hostRect.width - anchorX - annotationSafePadding;
    const spaceLeft = anchorX - annotationSafePadding;
    const openLeft =
      spaceRight < Math.min(textWidth + annotationGap, annotationMaxWidth) &&
      spaceLeft > spaceRight;

    const spaceTop = anchorY - annotationSafePadding;
    const spaceBottom = hostRect.height - anchorY - annotationSafePadding;
    const openBottom =
      spaceTop < textHeight + annotationGap && spaceBottom > spaceTop;

    let textLeft = openLeft
      ? anchorX - annotationGap - textWidth
      : anchorX + annotationGap;
    let textTop = openBottom
      ? anchorY + annotationGap
      : anchorY - annotationGap - textHeight;

    const maxLeft = hostRect.width - annotationSafePadding - textWidth;
    const maxTop = hostRect.height - annotationSafePadding - textHeight;

    textLeft = Math.min(Math.max(textLeft, annotationSafePadding), maxLeft);
    textTop = Math.min(Math.max(textTop, annotationSafePadding), maxTop);

    const lineTargetX = openLeft ? textLeft + textWidth : textLeft;
    const lineWidth = Math.max(72, Math.abs(lineTargetX - anchorX) - 28);

    els.annotation.dataset.x = openLeft ? "left" : "right";
    els.annotation.dataset.y = openBottom ? "bottom" : "top";
    els.annotation.style.setProperty("--anchor-x", `${anchorX}px`);
    els.annotation.style.setProperty("--anchor-y", `${anchorY}px`);
    els.annotation.style.setProperty("--line-width", `${lineWidth}px`);
    els.annotation.style.setProperty("--text-left", `${textLeft}px`);
    els.annotation.style.setProperty("--text-top", `${textTop}px`);
    els.annotation.style.setProperty("--text-height", `${textHeight}px`);
    els.annotation.classList.toggle(
      "gallery-modal__annotation--left",
      isFirstHotspot,
    );

    els.annotation.classList.remove("is-visible");
    void els.annotation.offsetWidth;
    els.annotation.classList.add("is-visible");
    els.annotation.setAttribute("aria-hidden", "false");
  };

  const syncCounterAndBackground = () => {
    const index = swiper?.activeIndex ?? 0;
    els.current.textContent = pad2(index + 1);
    els.total.textContent = pad2(slides.length);
    els.stage.style.setProperty(
      "--slide",
      `url(${slides[index] || slides[0]})`,
    );
  };

  const closeGallery = () => {
    closeHotspotModal();
    resetInlineHotspot();
    setOpen(modal, false);
    document.documentElement.classList.remove("is-modal-open");
    document.body.classList.remove("is-modal-open");
  };

  const createSwiper = () => {
    swiper = new Swiper(els.swiper, {
      modules: [Navigation],
      slidesPerView: 1,
      rewind: true,
      navigation: { prevEl: els.prev, nextEl: els.next },
      on: {
        init: syncCounterAndBackground,
        slideChange: () => {
          closeHotspotModal();
          resetInlineHotspot();
          syncCounterAndBackground();
        },
      },
    });
  };

  const openGallery = (pack) => {
    slides = (slidesByPackage[pack] || []).filter(Boolean);
    if (!slides.length) return;

    currentPackage = pack;
    els.wrapper.innerHTML = slides
      .map(() => '<div class="swiper-slide"></div>')
      .join("");

    setOpen(modal, true);
    resetInlineHotspot();
    document.documentElement.classList.add("is-modal-open");
    document.body.classList.add("is-modal-open");

    if (!swiper) {
      createSwiper();
      return;
    }

    swiper.updateSlides();
    swiper.update();
    swiper.slideTo(0, 0);
    syncCounterAndBackground();
  };

  const handleClick = (event) => {
    const { target } = event;

    if (
      target.closest("[data-gallery-close]") &&
      modal.classList.contains("is-open")
    ) {
      event.preventDefault();
      closeGallery();
      return;
    }

    const trigger = target.closest(".packages__btn[data-package]");
    if (trigger) {
      event.preventDefault();
      openGallery(trigger.dataset.package || "elite");
      return;
    }

    if (target.closest("[data-hotspot-modal-close]")) {
      event.preventDefault();
      closeHotspotModal();
      return;
    }

    const hotspotBtn = target.closest(".gallery-modal__hotspot");
    if (!hotspotBtn) return;

    event.preventDefault();

    if (tabletMedia.matches) {
      closeHotspotModal();
      updateInlineHotspot(hotspotBtn);
      return;
    }

    if (hotspotTitle) {
      hotspotTitle.textContent =
        packageTitles[currentPackage] || packageTitles.elite;
    }

    setOpen(els.hotspotModal, true);
  };

  const handleEsc = ({ key }) => {
    if (key !== "Escape") return;
    if (els.hotspotModal?.classList.contains("is-open"))
      return closeHotspotModal();
    if (modal.classList.contains("is-open")) closeGallery();
  };

  const handleMediaChange = ({ matches }) => {
    if (matches) return closeHotspotModal();
    resetInlineHotspot();
  };

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleEsc);

  if (typeof tabletMedia.addEventListener === "function") {
    tabletMedia.addEventListener("change", handleMediaChange);
  } else {
    tabletMedia.addListener(handleMediaChange);
  }
}
