(function () {

  const KEY = "automation-studio-theme";

  function systemMode() {

    return window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
      ? "dark"
      : "light";
  }

  function apply(mode) {

    const actual =
      mode === "system"
        ? systemMode()
        : mode;

    document.documentElement
      .setAttribute("data-theme", actual);

    document.documentElement
      .setAttribute("data-theme-mode", mode);

    localStorage.setItem(KEY, mode);

    document
      .querySelectorAll(
        "[data-automation-theme]"
      )
      .forEach(button => {

        button.classList.toggle(
          "active",
          button.dataset.automationTheme === mode
        );
      });
  }

  function setup() {

    const saved =
      localStorage.getItem(KEY) || "light";

    apply(saved);

    document
      .querySelectorAll(
        "[data-automation-theme]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {
            apply(
              button.dataset.automationTheme
            );
          }
        );
      });
  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      setup
    );

  } else {

    setup();
  }

  if (window.matchMedia) {

    window
      .matchMedia(
        "(prefers-color-scheme: dark)"
      )
      .addEventListener(
        "change",
        () => {

          if (
            localStorage.getItem(KEY)
            === "system"
          ) {
            apply("system");
          }
        }
      );
  }

})();

