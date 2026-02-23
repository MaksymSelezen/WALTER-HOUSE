import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import elite01 from "../../assets/images/slides/packages-modals/elite/1.jpg";
import elite02 from "../../assets/images/slides/packages-modals/elite/2.jpg";
import elite03 from "../../assets/images/slides/packages-modals/elite/3.jpg";
import elite04 from "../../assets/images/slides/packages-modals/elite/4.jpg";
import elite05 from "../../assets/images/slides/packages-modals/elite/5.jpg";

import vip01 from "../../assets/images/slides/packages-modals/vip/1.jpg";
import vip02 from "../../assets/images/slides/packages-modals/vip/2.jpg";
import vip03 from "../../assets/images/slides/packages-modals/vip/3.jpg";
import vip04 from "../../assets/images/slides/packages-modals/vip/4.jpg";
import vip05 from "../../assets/images/slides/packages-modals/vip/5.jpg";
import vip06 from "../../assets/images/slides/packages-modals/vip/6.jpg";
import vip07 from "../../assets/images/slides/packages-modals/vip/7.jpg";

import extra01 from "../../assets/images/slides/packages-modals/extra/1.jpg";
import extra02 from "../../assets/images/slides/packages-modals/extra/2.jpg";
import extra03 from "../../assets/images/slides/packages-modals/extra/3.jpg";
import extra04 from "../../assets/images/slides/packages-modals/extra/4.jpg";
import extra05 from "../../assets/images/slides/packages-modals/extra/5.jpg";
import extra06 from "../../assets/images/slides/packages-modals/extra/6.jpg";
import extra07 from "../../assets/images/slides/packages-modals/extra/7.jpg";
import extra08 from "../../assets/images/slides/packages-modals/extra/8.jpg";
import extra09 from "../../assets/images/slides/packages-modals/extra/9.jpg";

const slidesByStyle = {
  elite: [elite01, elite02, elite03, elite04, elite05],
  vip: [vip01, vip02, vip03, vip04, vip05, vip06, vip07],
  extra: [
    extra01,
    extra02,
    extra03,
    extra04,
    extra05,
    extra06,
    extra07,
    extra08,
    extra09,
  ],
};

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

  const elCurrent = modal.querySelector(
    "[data-counter-current], [data-gallery-current]",
  );
  const elTotal = modal.querySelector(
    "[data-counter-total], [data-gallery-total]",
  );

  if (
    !stage ||
    !swiperEl ||
    !wrapper ||
    !btnPrev ||
    !btnNext ||
    !elCurrent ||
    !elTotal
  ) {
    return;
  }

  let swiper = null;
  let currentSlides = [];

  const setScrollLock = (isLocked) => {
    document.documentElement.classList.toggle("is-modal-open", isLocked);
    document.body.classList.toggle("is-modal-open", isLocked);
  };

  const getStyleFromTrigger = (trigger) => {
    const card = trigger.closest(".packages__item");
    if (!card) return "elite";

    const cardClass = Object.keys(STYLE_BY_CARD_CLASS).find((className) =>
      card.classList.contains(className),
    );

    return cardClass ? STYLE_BY_CARD_CLASS[cardClass] : "elite";
  };

  const isGalleryButton = (target) => {
    const btn = target.closest(".packages__btn");
    if (!btn) return false;

    return Boolean(btn.querySelector('[data-i18n="gallery.text"]'));
  };

  const setCounter = (index) => {
    elCurrent.textContent = pad2(index + 1);
    elTotal.textContent = pad2(currentSlides.length);
  };

  const setStageBackground = (index) => {
    const nextSlide = currentSlides[index];
    if (!nextSlide) return;

    stage.style.setProperty("--slide", `url(${nextSlide})`);
  };

  const updateUiByIndex = (index) => {
    setCounter(index);
    setStageBackground(index);
  };

  const rebuildSlides = () => {
    wrapper.innerHTML = currentSlides
      .map((src) => `<div class="swiper-slide" data-bg="${src}"></div>`)
      .join("");
  };

  const openModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    setScrollLock(true);
  };

  const closeModal = () => {
    if (!modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    setScrollLock(false);
  };

  const initOrUpdateSwiper = () => {
    if (!swiper) {
      swiper = new Swiper(swiperEl, {
        modules: [Navigation],
        slidesPerView: 1,
        rewind: true,
        navigation: {
          prevEl: btnPrev,
          nextEl: btnNext,
        },
        on: {
          init(instance) {
            updateUiByIndex(instance.activeIndex);
          },
          slideChange(instance) {
            updateUiByIndex(instance.activeIndex);
          },
        },
      });

      return;
    }

    swiper.update();
    swiper.slideTo(0, 0);
    updateUiByIndex(swiper.activeIndex);
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".packages__btn");
    if (!trigger || !isGalleryButton(event.target)) return;

    event.preventDefault();

    const style = getStyleFromTrigger(trigger);
    currentSlides = slidesByStyle[style] || [];

    if (currentSlides.length === 0) return;

    rebuildSlides();
    openModal();
    initOrUpdateSwiper();
    swiper?.update();
  });

  document.addEventListener("click", (event) => {
    if (!modal.classList.contains("is-open")) return;

    if (event.target.closest("[data-gallery-close]")) {
      event.preventDefault();
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !modal.classList.contains("is-open")) return;

    event.preventDefault();
    closeModal();
  });
}
