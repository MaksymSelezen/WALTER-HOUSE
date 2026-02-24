import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const slidesByStyle = Object.entries(
  import.meta.glob("../../assets/images/slides/packages-modals/*/*.jpg", {
    eager: true,
    import: "default",
  }),
).reduce((acc, [path, src]) => {
  const [, style, order] =
    path.match(/packages-modals\/([^/]+)\/(\d+)\.jpg$/) || [];
  if (style) (acc[style] ||= [])[order - 1] = src;
  return acc;
}, {});

export function initPackagesGallery() {
  const modal = document.querySelector("[data-gallery-modal]");
  if (!modal) return;

  const stage = modal.querySelector("[data-gallery-stage]");
  const hotspotInfoModal = document.querySelector("[data-hotspot-modal]");
  const swiperEl = modal.querySelector("[data-gallery-swiper]");
  const wrapper = modal.querySelector("[data-gallery-wrapper]");
  const current = modal.querySelector("[data-gallery-current]");
  const total = modal.querySelector("[data-gallery-total]");
  const prev = modal.querySelector("[data-gallery-prev]");
  const next = modal.querySelector("[data-gallery-next]");
  const hotspotButtons = modal.querySelectorAll(".gallery-modal__hotspot");
  const hotspotCloseButtons = hotspotInfoModal?.querySelectorAll(
    "[data-hotspot-modal-close]",
  );

  if (![stage, swiperEl, wrapper, current, total, prev, next].every(Boolean))
    return;

  let swiper;
  let slides = [];

  const openHotspotInfoModal = () => {
    if (!hotspotInfoModal) return;

    hotspotInfoModal.classList.add("is-open");
    hotspotInfoModal.setAttribute("aria-hidden", "false");
  };

  const closeHotspotInfoModal = () => {
    if (!hotspotInfoModal) return;

    hotspotInfoModal.classList.remove("is-open");
    hotspotInfoModal.setAttribute("aria-hidden", "true");
  };

  const bindHotspotInfoEvents = () => {
    if (!hotspotInfoModal || !hotspotButtons.length) return;

    hotspotButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        openHotspotInfoModal();
      });
    });

    hotspotCloseButtons?.forEach((button) => {
      button.addEventListener("click", () => {
        closeHotspotInfoModal();
      });
    });
  };

  const sync = () => {
    const i = swiper?.activeIndex || 0;
    current.textContent = `${i + 1}`.padStart(2, "0");
    total.textContent = `${slides.length}`.padStart(2, "0");
    stage.style.setProperty("--slide", `url(${slides[i] || slides[0]})`);
  };

  const toggle = (open) => {
    if (!open) closeHotspotInfoModal();

    modal.classList.toggle("is-open", open);
    modal.setAttribute("aria-hidden", String(!open));
    document.documentElement.classList.toggle("is-modal-open", open);
    document.body.classList.toggle("is-modal-open", open);
  };

  document.addEventListener("click", (e) => {
    if (
      e.target.closest("[data-gallery-close]") &&
      modal.classList.contains("is-open")
    )
      return (e.preventDefault(), toggle(false));

    const trigger = e.target.closest(
      ".packages__btn:not(.packages__btn--services)",
    );
    if (!trigger) return;

    const [, style = "elite"] =
      (trigger.closest(".packages__item")?.className || "").match(
        /packages__item--(elite|vip|extra)/,
      ) || [];
    slides = (slidesByStyle[style] || []).filter(Boolean);
    if (!slides.length) return;

    e.preventDefault();
    wrapper.innerHTML = slides
      .map((src) => `<div class="swiper-slide" data-bg="${src}"></div>`)
      .join("");
    toggle(true);

    if (!swiper) {
      swiper = new Swiper(swiperEl, {
        modules: [Navigation],
        slidesPerView: 1,
        rewind: true,
        navigation: { prevEl: prev, nextEl: next },
        on: {
          init: sync,
          slideChange: () => {
            closeHotspotInfoModal();
            sync();
          },
        },
      });
      return;
    }

    swiper.update();
    swiper.slideTo(0, 0);
    sync();
  });

  bindHotspotInfoEvents();

  document.addEventListener("keydown", ({ key }) => {
    if (key !== "Escape") return;

    if (hotspotInfoModal?.classList.contains("is-open")) {
      closeHotspotInfoModal();
      return;
    }

    if (modal.classList.contains("is-open")) toggle(false);
  });
}
