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

const pad2 = (n) => String(n).padStart(2, "0");

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

  const required = [
    els.stage,
    els.swiper,
    els.wrapper,
    els.current,
    els.total,
    els.prev,
    els.next,
    els.hotspots,
    els.annotation,
    els.annotationText,
  ];

  if (!required.every(Boolean)) return;

  const hotspotTitle = els.hotspotModal?.querySelector("[data-hotspot-title]");
  const tabletMedia = window.matchMedia("(min-width: 768px)");

  let swiper = null;
  let slides = [];
  let currentPackage = "elite";

  const setOpen = (node, open) => {
    if (!node) return;
    node.classList.toggle("is-open", open);
    node.setAttribute("aria-hidden", String(!open));
  };

  const closeHotspotModal = () => setOpen(els.hotspotModal, false);

  const resetInlineHotspot = () => {
    els.hotspots
      .querySelectorAll(".gallery-modal__hotspot.is-active")
      .forEach((btn) => btn.classList.remove("is-active"));

    els.annotation.classList.remove("is-visible");
    els.annotation.setAttribute("aria-hidden", "true");
  };

  const updateInlineHotspot = (hotspotBtn) => {
    if (!hotspotBtn) return;

    resetInlineHotspot();
    hotspotBtn.classList.add("is-active");

    const hostRect = els.hotspots.getBoundingClientRect();
    const btnRect = hotspotBtn.getBoundingClientRect();

    const centerX = btnRect.left + btnRect.width / 2;
    const centerY = btnRect.top + btnRect.height / 2;

    const x = ((centerX - hostRect.left) / hostRect.width) * 100;
    const y = ((centerY - hostRect.top) / hostRect.height) * 100;

    const text = hotspotBtn.dataset.hotspotText || fallbackHotspotText;

    els.annotation.style.setProperty("--hotspot-x", `${x}%`);
    els.annotation.style.setProperty("--hotspot-y", `${y}%`);
    els.annotationText.textContent = text;

    els.annotation.classList.add("is-visible");
    els.annotation.setAttribute("aria-hidden", "false");
  };

  const sync = () => {
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

  const openGallery = (pack) => {
    slides = (slidesByPackage[pack] || []).filter(Boolean);
    if (!slides.length) return;

    currentPackage = pack;

    els.wrapper.innerHTML = slides
      .map(() => `<div class="swiper-slide"></div>`)
      .join("");

    setOpen(modal, true);
    resetInlineHotspot();
    document.documentElement.classList.add("is-modal-open");
    document.body.classList.add("is-modal-open");

    if (!swiper) {
      swiper = new Swiper(els.swiper, {
        modules: [Navigation],
        slidesPerView: 1,
        rewind: true,
        navigation: { prevEl: els.prev, nextEl: els.next },
        on: {
          init: sync,
          slideChange: () => {
            closeHotspotModal();
            resetInlineHotspot();
            sync();
          },
        },
      });
      return;
    }

    swiper.updateSlides();
    swiper.update();
    swiper.slideTo(0, 0);
    sync();
  };

  document.addEventListener("click", (event) => {
    const galleryClose = event.target.closest("[data-gallery-close]");
    if (galleryClose && modal.classList.contains("is-open")) {
      event.preventDefault();
      closeGallery();
      return;
    }

    const trigger = event.target.closest(".packages__btn[data-package]");
    if (trigger) {
      event.preventDefault();
      openGallery(trigger.dataset.package || "elite");
      return;
    }

    const hotspotModalClose = event.target.closest(
      "[data-hotspot-modal-close]",
    );
    if (hotspotModalClose) {
      event.preventDefault();
      closeHotspotModal();
      return;
    }

    const hotspotBtn = event.target.closest(".gallery-modal__hotspot");
    if (!hotspotBtn) return;

    event.preventDefault();

    if (tabletMedia.matches) {
      closeHotspotModal();
      updateInlineHotspot(hotspotBtn);
      return;
    }

    if (!els.hotspotModal) return;

    if (hotspotTitle) {
      hotspotTitle.textContent =
        packageTitles[currentPackage] || packageTitles.elite;
    }

    setOpen(els.hotspotModal, true);
  });

  const onMediaChange = ({ matches }) => {
    if (matches) {
      closeHotspotModal();
      return;
    }
    resetInlineHotspot();
  };

  if (typeof tabletMedia.addEventListener === "function") {
    tabletMedia.addEventListener("change", onMediaChange);
  } else {
    tabletMedia.addListener(onMediaChange);
  }

  document.addEventListener("keydown", ({ key }) => {
    if (key !== "Escape") return;

    if (els.hotspotModal?.classList.contains("is-open")) {
      closeHotspotModal();
      return;
    }

    if (modal.classList.contains("is-open")) {
      closeGallery();
    }
  });
}
