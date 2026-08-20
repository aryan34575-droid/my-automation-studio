import { useState } from "react";
import DataAnalystPanel from "./DataAnalystPanel";
import "./UnifiedWorkspace.css";

export default function UnifiedWorkspace() {
  const [activeModule, setActiveModule] = useState("analyst");

  return (
    <section className="unified-workspace">

      <div className="workspace-topbar">
        <div>
          <span className="workspace-eyebrow">
            AUTOMATION STUDIO
          </span>

          <h1>Unified AI Workspace</h1>

          <p>
            Personal Agent + AI Data Analyst + Ollama
          </p>
        </div>

        <div className="workspace-status">
          <span>●</span> Systems Online
        </div>
      </div>

      <div className="workspace-nav">

        <button
          className={activeModule === "analyst" ? "active" : ""}
          onClick={() => setActiveModule("analyst")}
        >
          📊 Data Analyst
        </button>

        <button
          className={activeModule === "agent" ? "active" : ""}
          onClick={() => setActiveModule("agent")}
        >
          🤖 Personal Agent
        </button>

        <button
          className={activeModule === "automation" ? "active" : ""}
          onClick={() => setActiveModule("automation")}
        >
          ⚡ Automations
        </button>

      </div>

      <div className="workspace-content">

        {activeModule === "analyst" && (
          <DataAnalystPanel />
        )}

        {activeModule === "agent" && (
          <div className="module-placeholder">
            <div className="placeholder-icon">🤖</div>
            <h2>Personal Agent</h2>
            <p>
              Your existing Personal Agent stays protected.
              The next integration phase will connect it here.
            </p>
          </div>
        )}

        {activeModule === "automation" && (
          <div className="module-placeholder">
            <div className="placeholder-icon">⚡</div>
            <h2>Automation Center</h2>
            <p>
              Workflow execution will be connected after
              the Data Analyst integration is verified.
            </p>
          </div>
        )}

      </div>

    </section>
  );
}

