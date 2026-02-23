import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const slideModules = import.meta.glob(
  "../../assets/images/slides/packages-modals/*/*.jpg",
  { eager: true, import: "default" },
);

const slidesByStyle = Object.entries(slideModules).reduce(
  (acc, [path, src]) => {
    const match = path.match(/packages-modals\/([^/]+)\/(\d+)\.jpg$/);
    if (!match) return acc;

    const [, style, order] = match;
    (acc[style] ||= []).push({ order: Number(order), src });
    return acc;
  },
  {},
);

Object.keys(slidesByStyle).forEach((style) => {
  slidesByStyle[style] = slidesByStyle[style]
    .sort((a, b) => a.order - b.order)
    .map(({ src }) => src);
});

const STYLE_BY_CARD_CLASS = {
  "packages__item--elite": "elite",
  "packages__item--vip": "vip",
  "packages__item--extra": "extra",
};

const pad2 = (value) => String(value).padStart(2, "0");

export function initPackagesGallery() {
  const modal = document.querySelector("[data-gallery-modal]");
  if (!modal) return;

  const stage = modal.querySelector("[data-gallery-stage]");
  const swiperEl = modal.querySelector("[data-gallery-swiper]");
  const wrapper = modal.querySelector("[data-gallery-wrapper]");
  const btnPrev = modal.querySelector("[data-gallery-prev]");
  const btnNext = modal.querySelector("[data-gallery-next]");
  const currentEl = modal.querySelector("[data-gallery-current]");
  const totalEl = modal.querySelector("[data-gallery-total]");

  if (
    !stage ||
    !swiperEl ||
    !wrapper ||
    !btnPrev ||
    !btnNext ||
    !currentEl ||
    !totalEl
  )
    return;

  let swiper;
  let slides = [];

  const syncUi = (index = 0) => {
    currentEl.textContent = pad2(index + 1);
    totalEl.textContent = pad2(slides.length);
    if (slides[index])
      stage.style.setProperty("--slide", `url(${slides[index]})`);
  };

  const setModalState = (isOpen) => {
    modal.classList.toggle("is-open", isOpen);
    modal.setAttribute("aria-hidden", String(!isOpen));
    document.documentElement.classList.toggle("is-modal-open", isOpen);
    document.body.classList.toggle("is-modal-open", isOpen);
  };

  const closeModal = () => setModalState(false);

  const buildSlides = () => {
    wrapper.innerHTML = slides
      .map((src) => `<div class="swiper-slide" data-bg="${src}"></div>`)
      .join("");
  };

  const initSwiper = () => {
    if (swiper) return;

    swiper = new Swiper(swiperEl, {
      modules: [Navigation],
      slidesPerView: 1,
      rewind: true,
      navigation: { prevEl: btnPrev, nextEl: btnNext },
      on: {
        init: ({ activeIndex }) => syncUi(activeIndex),
        slideChange: ({ activeIndex }) => syncUi(activeIndex),
      },
    });
  };

  const getStyleFromTrigger = (trigger) => {
    const card = trigger.closest(".packages__item");
    if (!card) return "elite";

    const className = Object.keys(STYLE_BY_CARD_CLASS).find((name) =>
      card.classList.contains(name),
    );
    return STYLE_BY_CARD_CLASS[className] || "elite";
  };

  const openModal = (trigger) => {
    slides = slidesByStyle[getStyleFromTrigger(trigger)] || [];
    if (!slides.length) return;

    buildSlides();
    setModalState(true);
    initSwiper();
    swiper.update();
    swiper.slideTo(0, 0);
    syncUi(0);
  };

  document.addEventListener("click", (event) => {
    const closeBtn = event.target.closest("[data-gallery-close]");
    if (closeBtn && modal.classList.contains("is-open")) {
      event.preventDefault();
      closeModal();
      return;
    }

    const trigger = event.target.closest(".packages__btn");
    if (!trigger || trigger.classList.contains("packages__btn--services"))
      return;

    event.preventDefault();
    openModal(trigger);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      event.preventDefault();
      closeModal();
    }
  });
}
