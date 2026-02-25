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
  const [, pack, index] =
    path.match(/packages-modals\/([^/]+)\/(\d+)\.jpg$/) || [];
  if (pack) (map[pack] ||= [])[index - 1] = src;
  return map;
}, {});
const packageTitles = {
  elite: "Elite Style",
  vip: "Vip Style",
  extra: "Extra Style",
};
const pad = (n) => String(n).padStart(2, "0");
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
    hotspotModal: document.querySelector("[data-hotspot-modal]"),
  };
  if (
    ![
      els.stage,
      els.swiper,
      els.wrapper,
      els.current,
      els.total,
      els.prev,
      els.next,
    ].every(Boolean)
  )
    return;
  const hotspotTitle = els.hotspotModal?.querySelector("[data-hotspot-title]");
  let swiper;
  let slides = [];
  let currentPackage = "elite";
  const setOpen = (node, open) =>
    node &&
    (node.classList.toggle("is-open", open),
    node.setAttribute("aria-hidden", String(!open)));
  const closeHotspot = () => setOpen(els.hotspotModal, false);
  const closeGallery = () => {
    closeHotspot();
    setOpen(modal, false);
    document.documentElement.classList.remove("is-modal-open");
    document.body.classList.remove("is-modal-open");
  };
  const sync = () => {
    const index = swiper?.activeIndex || 0;
    els.current.textContent = pad(index + 1);
    els.total.textContent = pad(slides.length);
    els.stage.style.setProperty(
      "--slide",
      `url(${slides[index] || slides[0]})`,
    );
  };
  const openGallery = (pack) => {
    slides = (slidesByPackage[pack] || []).filter(Boolean);
    if (!slides.length) return;
    currentPackage = pack;
    els.wrapper.innerHTML = slides
      .map((src) => `<div class="swiper-slide" data-bg="${src}"></div>`)
      .join("");
    setOpen(modal, true);
    document.documentElement.classList.add("is-modal-open");
    document.body.classList.add("is-modal-open");
    if (!swiper) {
      swiper = new Swiper(els.swiper, {
        modules: [Navigation],
        slidesPerView: 1,
        rewind: true,
        navigation: { prevEl: els.prev, nextEl: els.next },
        on: { init: sync, slideChange: () => (closeHotspot(), sync()) },
      });
      return;
    }
    swiper.update();
    swiper.slideTo(0, 0);
    sync();
  };
  document.addEventListener("click", (event) => {
    if (
      event.target.closest("[data-gallery-close]") &&
      modal.classList.contains("is-open")
    )
      return (event.preventDefault(), closeGallery());
    const trigger = event.target.closest(".packages__btn[data-package]");
    if (trigger)
      return (
        event.preventDefault(),
        openGallery(trigger.dataset.package || "elite")
      );
    if (event.target.closest("[data-hotspot-modal-close]"))
      return (event.preventDefault(), closeHotspot());
    if (!event.target.closest(".gallery-modal__hotspot") || !els.hotspotModal)
      return;
    event.preventDefault();
    if (hotspotTitle)
      hotspotTitle.textContent =
        packageTitles[currentPackage] || packageTitles.elite;
    setOpen(els.hotspotModal, true);
  });
  document.addEventListener("keydown", ({ key }) => {
    if (key !== "Escape") return;
    if (els.hotspotModal?.classList.contains("is-open")) return closeHotspot();
    if (modal.classList.contains("is-open")) closeGallery();
  });
}
