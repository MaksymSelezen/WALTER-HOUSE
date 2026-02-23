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

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function initPackagesGallery() {
  const modal = document.querySelector("[data-gallery-modal]");
  if (!modal) return;

  const stage = modal.querySelector("[data-gallery-stage]");
  const swiperEl = modal.querySelector("[data-gallery-swiper]");
  const wrapper = modal.querySelector("[data-gallery-wrapper]");

  const btnPrev = modal.querySelector("[data-gallery-prev]");
  const btnNext = modal.querySelector("[data-gallery-next]");

  const elCurrent = modal.querySelector("[data-gallery-current]");
  const elTotal = modal.querySelector("[data-gallery-total]");

  if (
    !stage ||
    !swiperEl ||
    !wrapper ||
    !btnPrev ||
    !btnNext ||
    !elCurrent ||
    !elTotal
  )
    return;

  let swiper = null;
  let slides = [];

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function render(index) {
    stage.style.setProperty("--slide", `url(${slides[index]})`);
    elCurrent.textContent = pad2(index + 1);
    elTotal.textContent = pad2(slides.length);
  }

  function buildSlides(count) {
    wrapper.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      wrapper.appendChild(slide);
    }
  }

  function initSwiper() {
    if (swiper) {
      swiper.destroy(true, true);
      swiper = null;
    }

    swiper = new Swiper(swiperEl, {
      modules: [Navigation],
      slidesPerView: 1,
      rewind: true,
      navigation: {
        prevEl: btnPrev,
        nextEl: btnNext,
      },
      on: {
        init() {
          render(this.activeIndex);
        },
        slideChange() {
          render(this.activeIndex);
        },
      },
    });
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest('[data-pkg-open="gallery"]');
    if (!trigger) return;

    e.preventDefault();

    const style = trigger.dataset.pkgStyle || "elite";
    slides = slidesByStyle[style] || [];

    if (slides.length === 0) return;

    buildSlides(slides.length);
    openModal();
    initSwiper();
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-gallery-close]")) {
      e.preventDefault();
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}
