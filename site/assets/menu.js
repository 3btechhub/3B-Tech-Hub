(() => {
  const button = document.querySelector(".menu-trigger");
  const menu = document.querySelector("#site-menu");
  const regionSelect = document.querySelector("#region-select");
  if (regionSelect) {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const routeIndex = pathParts.indexOf("3btechhub");
    const pathRegion = routeIndex >= 0 ? pathParts[routeIndex + 1] : null;
    const activeRegion = window.siteCountry?.region || (["bd", "saudi", "global"].includes(pathRegion) ? pathRegion : "global");
    regionSelect.value = activeRegion;
    const goToRegion = () => {
      const region = regionSelect.value;
      if (!["bd", "saudi", "global"].includes(region) || region === activeRegion) return;
      window.location.href = "/3btechhub/" + region + "/";
    };
    regionSelect.addEventListener("change", goToRegion);
    regionSelect.addEventListener("input", goToRegion);
  }
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
