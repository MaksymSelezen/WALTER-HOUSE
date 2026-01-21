import { initBurgerMenu } from "./modules/burger.js";
import { initRequestCallModal } from "./modules/modal.js";
import { initI18n } from "./i18n.js";
import { initScreenPager } from "./modules/pager.js";

document.addEventListener("DOMContentLoaded", async () => {
  await initI18n();
  initBurgerMenu();
  initRequestCallModal();
  initScreenPager();
});
