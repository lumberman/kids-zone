(function () {
  const screens = Array.from(document.querySelectorAll(".screen"));
  let routes = {};
  let defaultRoute = "/main";

  function parseRoute() {
    const hash = window.location.hash || "";
    const path = hash.replace(/^#/, "");
    if (!path || path === "/") return defaultRoute;
    return path.startsWith("/") ? path : `/${path}`;
  }

  function showScreen(route) {
    screens.forEach((screen) => {
      const match = screen.dataset.route === route;
      screen.classList.toggle("is-active", match);
    });
  }

  function renderRoute() {
    const route = parseRoute();
    if (!routes[route]) {
      window.location.hash = `#${defaultRoute}`;
      return;
    }
    showScreen(route);
    routes[route]();
  }

  function init(nextRoutes, fallbackRoute) {
    routes = nextRoutes;
    defaultRoute = fallbackRoute || defaultRoute;
    window.addEventListener("hashchange", renderRoute);
    if (!window.location.hash) {
      window.location.hash = `#${defaultRoute}`;
    } else {
      renderRoute();
    }
  }

  window.KidsZoneRouter = { init, renderRoute };
})();
