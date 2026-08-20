(function () {
  const KEY = "automation-studio-theme";

  function systemTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(mode) {
    const actual = mode === "system" ? systemTheme() : mode;

    document.documentElement.setAttribute("data-theme", actual);
    document.documentElement.setAttribute("data-theme-mode", mode);

    localStorage.setItem(KEY, mode);

    document.querySelectorAll(
      "#automation-theme-switcher button"
    ).forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.theme === mode
      );
    });
  }

  function createSwitcher() {
    if (document.getElementById("automation-theme-switcher")) return;

    const box = document.createElement("div");
    box.id = "automation-theme-switcher";
    box.setAttribute("aria-label", "Theme selector");

    const themes = [
      ["light", "☀ Light"],
      ["dark", "☾ Dark"],
      ["system", "◐ System"]
    ];

    themes.forEach(([mode, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.theme = mode;
      button.textContent = label;

      button.addEventListener("click", () => {
        applyTheme(mode);
      });

      box.appendChild(button);
    });

    document.body.appendChild(box);

    const saved = localStorage.getItem(KEY) || "light";
    applyTheme(saved);
  }

  // IMPORTANT: default is LIGHT.
  applyTheme(localStorage.getItem(KEY) || "light");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createSwitcher);
  } else {
    createSwitcher();
  }

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (localStorage.getItem(KEY) === "system") {
          applyTheme("system");
        }
      });
  }
})();

