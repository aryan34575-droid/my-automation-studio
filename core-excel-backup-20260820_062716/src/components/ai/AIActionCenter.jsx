import './AIActionCenter.css';
import React, { useState } from "react";
import { askOllama, checkPythonAPI, checkOllama } from "../../services/aiBridge";

export default function AIActionCenter() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);

  async function runSystemCheck() {
    setStatus("Checking AI stack...");
    setResult("");

    try {
      const [python, ollama] = await Promise.all([
        checkPythonAPI(),
        checkOllama()
      ]);

      setStatus("AI stack online");
      setResult(
        JSON.stringify(
          {
            pythonApi: python,
            ollama: ollama
          },
          null,
          2
        )
      );
    } catch (error) {
      setStatus("Connection error");
      setResult(error.message);
    }
  }

  async function askAI() {
    if (!prompt.trim()) {
      setStatus("Enter a prompt first");
      return;
    }

    setLoading(true);
    setStatus("Ollama is thinking...");
    setResult("");

    try {
      const models = await checkOllama();
      const model = models?.models?.[0]?.name;

      if (!model) {
        throw new Error("No Ollama model is available.");
      }

      const response = await askOllama(prompt, model);

      setResult(response?.response || JSON.stringify(response, null, 2));
      setStatus(`Completed using ${model}`);
    } catch (error) {
      setStatus("AI request failed");
      setResult(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="ai-action-center">
      <div className="ai-action-header">
        <div>
          <h2>AI Action Center</h2>
          <p>Unified control for Data Analyst and Ollama.</p>
        </div>

        <span className="ai-status">{status}</span>
      </div>

      <div className="ai-actions">
        <button onClick={runSystemCheck}>
          Check AI Stack
        </button>

        <button onClick={askAI} disabled={loading}>
          {loading ? "Thinking..." : "Ask Ollama"}
        </button>
      </div>

      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Ask your AI assistant something..."
        rows={5}
      />

      {result && (
        <pre className="ai-result">
          {result}
        </pre>
      )}
    </section>
  );
}

