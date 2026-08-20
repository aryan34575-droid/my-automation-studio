import React from "react";
import "./app-shell.css";

export default function AppShell({
  children,
  active = "home",
  onNavigate
}) {

  const navigation = [
    ["home", "⌂", "Home"],
    ["analyst", "▦", "Analyst"],
    ["ai", "✦", "AI"],
    ["reports", "▤", "Reports"],
    ["settings", "⚙", "Settings"]
  ];

  const secondary = [
    ["cleaning", "⌁", "Cleaning"],
    ["charts", "◒", "Charts"],
    ["insights", "✧", "Insights"]
  ];

  const go = (id) => {

    if (typeof onNavigate === "function") {
      onNavigate(id);
    }
  };

  return (
    <div className="as-ui-shell">

      <aside className="as-ui-sidebar">

        <div className="as-ui-brand">
          ✦ Automation Studio
        </div>

        <div className="as-ui-nav-title">
          MAIN
        </div>

        {navigation.map(
          ([id, icon, label]) => (

            <button
              key={id}
              className={
                "as-ui-nav-item " +
                (active === id ? "active" : "")
              }
              onClick={() => go(id)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>

          )
        )}

        <div className="as-ui-nav-title">
          ANALYSIS
        </div>

        {secondary.map(
          ([id, icon, label]) => (

            <button
              key={id}
              className={
                "as-ui-nav-item " +
                (active === id ? "active" : "")
              }
              onClick={() => go(id)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>

          )
        )}

        <div className="as-ui-nav-title">
          SYSTEM
        </div>

        <button
          className={
            "as-ui-nav-item " +
            (active === "settings"
              ? "active"
              : "")
          }
          onClick={() => go("settings")}
        >
          <span>⚙</span>
          <span>Settings</span>
        </button>

      </aside>


      <section className="as-ui-content">

        <div className="as-ui-topbar">

          <strong>
            Automation Studio
          </strong>

          <div className="as-ui-theme">

            <button
              data-automation-theme="light"
              data-automation-theme
            >
              ☀ Light
            </button>

            <button
              data-automation-theme="dark"
              data-automation-theme
            >
              ☾ Dark
            </button>

            <button
              data-automation-theme="system"
              data-automation-theme
            >
              ◐ System
            </button>

          </div>

        </div>

        {children}

      </section>


      <nav className="as-ui-bottom-nav">

        {navigation.map(
          ([id, icon, label]) => (

            <button
              key={id}
              className={
                active === id
                  ? "active"
                  : ""
              }
              onClick={() => go(id)}
            >
              <div>{icon}</div>
              <div>{label}</div>
            </button>

          )
        )}

      </nav>

    </div>
  );
}

