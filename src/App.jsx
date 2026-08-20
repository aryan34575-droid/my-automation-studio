import { useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./App.css";

export default function App() {
  const [prompt, setPrompt] = useState(
    "Explain this workflow in simple words."
  );

  const [result, setResult] = useState("");

  const nodes = [
    {
      id: "start",
      position: { x: 50, y: 180 },
      data: { label: "▶ START" },
      type: "input"
    },
    {
      id: "ai",
      position: { x: 350, y: 180 },
      data: { label: "🤖 Llama 3.1 AI" }
    },
    {
      id: "output",
      position: { x: 680, y: 180 },
      data: { label: "📤 OUTPUT" },
      type: "output"
    }
  ];

  const edges = [
    {
      id: "start-ai",
      source: "start",
      target: "ai",
      animated: true
    },
    {
      id: "ai-output",
      source: "ai",
      target: "output",
      animated: true
    }
  ];

  async function runFlow() {
    setResult("Running Llama 3.1...");

    try {
      const response = await fetch("http://localhost:3001/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (data.error) {
        setResult("Error: " + data.error);
      } else {
        setResult(data.response);
      }
    } catch (error) {
      setResult(
        "Backend connect nahi hua. Check karo ki server chal raha hai."
      );
    }
  }

  return (
    <div className="app">

      <header className="topbar">
        <div>
          <h1>⚡ My Automation Studio</h1>
          <p>Local AI Workflow Builder</p>
        </div>

        <button onClick={runFlow}>
          ▶ Run Flow
        </button>
      </header>

      <main>

        <section className="canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </section>

        <section className="panel">

          <h2>🤖 AI Node</h2>

          <label>
            Instruction
          </label>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Tell Llama what to do..."
          />

          <button
            className="run"
            onClick={runFlow}
          >
            Run Automation
          </button>

          <h2>📤 Result</h2>

          <div className="result">
            {result || "Result yahan dikhega..."}
          </div>

        </section>

      </main>

    </div>
  );
}
