(function () {
  "use strict";

  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;

  function applyTheme(theme) {
    const isLight = theme === "light";
    const themeColor = document.querySelector('meta[name="theme-color"]');

    root.dataset.theme = isLight ? "light" : "dark";
    toggle.setAttribute("aria-pressed", String(isLight));
    toggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`);
    toggle.title = `Switch to ${isLight ? "dark" : "light"} theme`;
    if (themeColor) themeColor.content = isLight ? "#f4f7fb" : "#0b1017";
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem("portfolio-theme-v2", theme);
    } catch (error) {
      // Theme switching still works when browser storage is unavailable.
    }
  }

  applyTheme(root.dataset.theme || "dark");

  toggle.addEventListener("click", function () {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });
})();
