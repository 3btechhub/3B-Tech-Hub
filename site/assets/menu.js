(() => {
  "use strict";
  const button = document.querySelector(".menu-trigger");
  const menu = document.querySelector("#site-menu");
  const regionSelect = document.querySelector("#region-select");
  const languageSelect = document.querySelector("#language-select");
  const BASE = "/3btechhub/";
  const normalizeRegion = (value) => value === "saudi" ? "ksa" : value;
  const menuLabels = {
    en: { language:"Language", country:"Country", en:"English", bn:"Bengali", ar:"Arabic", global:"Global", bd:"Bangladesh", ksa:"Saudi Arabia" },
    bn: { language:"ভাষা", country:"দেশ", en:"ইংরেজি", bn:"বাংলা", ar:"আরবি", global:"গ্লোবাল", bd:"বাংলাদেশ", ksa:"সৌদি আরব" },
    ar: { language:"اللغة", country:"الدولة", en:"الإنجليزية", bn:"البنغالية", ar:"العربية", global:"عالمي", bd:"بنغلاديش", ksa:"السعودية" }
  };
  const currentLabels = () => menuLabels[document.documentElement.lang] || menuLabels.en;

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const routeIndex = pathParts.indexOf("3btechhub");
  const pathRegion = routeIndex >= 0 ? normalizeRegion(pathParts[routeIndex + 1]) : null;
  let activeRegion = normalizeRegion(window.siteCountry?.region || pathRegion || "global");

  const makeDropdown = (select, title) => {
    if (!select || select.dataset.customDropdown === "true") return;
    select.dataset.customDropdown = "true";
    Array.from(select.options).forEach((option) => {
      option.value = normalizeRegion(option.value);
      if (option.value === "ksa") option.textContent = "Country: Saudi Arabia";
    });

    const wrapper = document.createElement("div");
    wrapper.className = "menu-dropdown";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "menu-tool menu-dropdown-trigger";
    trigger.setAttribute("aria-expanded", "false");
    const panel = document.createElement("div");
    panel.className = "menu-dropdown-options";
    panel.hidden = true;

    const update = () => {
      const selected = select.options[select.selectedIndex];
      const labels = currentLabels();
      trigger.textContent = (labels[title.toLowerCase()] || title) + ": " + (selected ? labels[selected.value] || selected.textContent : "");
      panel.querySelectorAll("button").forEach((option) => {
        const active = option.dataset.value === select.value;
        option.textContent = labels[option.dataset.value] || option.dataset.value;
        option.setAttribute("aria-pressed", String(active));
        option.classList.toggle("is-selected", active);
      });
    };

    Array.from(select.options).forEach((option) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "menu-dropdown-option";
      item.textContent = currentLabels()[option.value] || option.textContent;
      item.dataset.value = option.value;
      item.addEventListener("click", () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        update();
        panel.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
      });
      panel.appendChild(item);
    });

    trigger.addEventListener("click", () => {
      const opening = panel.hidden;
      panel.hidden = !opening;
      trigger.setAttribute("aria-expanded", String(opening));
    });
    select.insertAdjacentElement("afterend", wrapper);
    wrapper.append(trigger, panel);
    select.hidden = true;
    select.addEventListener("change", update);
    select.addEventListener("dropdownrefresh", update);
    update();
  };

  if (regionSelect) {
    regionSelect.value = activeRegion;
    const goToRegion = () => {
      const region = normalizeRegion(regionSelect.value);
      if (!["bd", "ksa", "global"].includes(region) || region === activeRegion) return;
      try {
        localStorage.setItem("3b-country-manual", region);
        localStorage.setItem("3b-country-context", JSON.stringify({ region, source: "manual" }));
      } catch (_) {}
      window.location.href = BASE + region + "/";
    };
    regionSelect.addEventListener("change", goToRegion);
  }

  if (languageSelect) {
    const defaultLanguage = activeRegion === "bd" ? "bn" : activeRegion === "ksa" ? "ar" : "en";
    try {
      languageSelect.value = localStorage.getItem("3b-language-" + activeRegion) || defaultLanguage;
    } catch (_) {
      languageSelect.value = defaultLanguage;
    }
  }
  makeDropdown(languageSelect, "Language");
  makeDropdown(regionSelect, "Country");

  window.addEventListener("site-language-changed", () => {
    languageSelect?.dispatchEvent(new Event("dropdownrefresh"));
    regionSelect?.dispatchEvent(new Event("dropdownrefresh"));
  });

  window.addEventListener("countrycontextready", (event) => {
    const region = normalizeRegion(event.detail?.region);
    if (!["bd", "ksa", "global"].includes(region)) return;
    activeRegion = region;
    if (regionSelect) {
      regionSelect.value = region;
      regionSelect.dispatchEvent(new Event("dropdownrefresh"));
    }
    if (languageSelect) {
      const defaultLanguage = region === "bd" ? "bn" : region === "ksa" ? "ar" : "en";
      try { languageSelect.value = localStorage.getItem("3b-language-" + region) || defaultLanguage; }
      catch (_) { languageSelect.value = defaultLanguage; }
      languageSelect.dispatchEvent(new Event("dropdownrefresh"));
    }
  });

  if (!button || !menu) return;
  const closeMenu = () => {
    menu.hidden = true;
    button.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open menu");
  };
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const opening = menu.hidden;
    menu.hidden = !opening;
    button.classList.toggle("is-open", opening);
    button.setAttribute("aria-expanded", String(opening));
    button.setAttribute("aria-label", opening ? "Close menu" : "Open menu");
  });
  menu.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
})();