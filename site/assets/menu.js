(() => {
  const button = document.querySelector(".menu-trigger");
  const menu = document.querySelector("#site-menu");
  const regionSelect = document.querySelector("#region-select");
  const languageSelect = document.querySelector("#language-select");

  // Keep the real selects for the existing app logic, but expose compact
  // custom dropdowns that expand only when the user taps their heading.
  const makeDropdown = (select, title) => {
    if (!select || select.dataset.customDropdown === "true") return;
    select.dataset.customDropdown = "true";
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
      trigger.textContent = title + ": " + (selected ? selected.textContent.replace(/^(Language|Country):\\s*/, "") : "");
      panel.querySelectorAll("button").forEach((option) => {
        const active = option.dataset.value === select.value;
        option.setAttribute("aria-pressed", String(active));
        option.classList.toggle("is-selected", active);
      });
    };
    Array.from(select.options).forEach((option) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "menu-dropdown-option";
      item.textContent = option.textContent.replace(/^(Language|Country):\\s*/, "");
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
    update();
  };

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const routeIndex = pathParts.indexOf("3btechhub");
  const pathRegion = routeIndex >= 0 ? pathParts[routeIndex + 1] : null;
  const activeRegion = window.siteCountry?.region || (["bd", "saudi", "global"].includes(pathRegion) ? pathRegion : "global");
  if (regionSelect) {
    regionSelect.value = activeRegion;
    const goToRegion = () => {
      const region = regionSelect.value;
      if (!["bd", "saudi", "global"].includes(region) || region === activeRegion) return;
      try { localStorage.setItem("3b-country-manual", region); } catch (_) {}
      window.location.href = "/3btechhub/" + region + "/";
    };
    regionSelect.addEventListener("change", goToRegion);
    regionSelect.addEventListener("input", goToRegion);
  }
  if (languageSelect) {\n    const defaultLanguage = activeRegion === "bd" ? "bn" : activeRegion === "saudi" ? "ar" : "en";\n    try { languageSelect.value = localStorage.getItem("3b-language-" + activeRegion) || defaultLanguage; } catch (_) { languageSelect.value = defaultLanguage; }\n  }\n  makeDropdown(languageSelect, "Language");
  makeDropdown(regionSelect, "Country");

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