(() => {
  "use strict";
  const routeName = document.currentScript?.dataset.route || "global";
  const base = "/3btechhub/";
  const route = base + routeName.replace(/^\/+|\/+$/g, "") + window.location.search + window.location.hash;
  const shell = new URL(base, window.location.origin);
  shell.searchParams.set("route", route);
  window.location.replace(shell.pathname + shell.search + shell.hash);
})();
