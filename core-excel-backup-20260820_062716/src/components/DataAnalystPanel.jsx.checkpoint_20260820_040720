import { useState } from "react";
import "./DataAnalystPanel.css";

const API_URL = "http://127.0.0.1:8002";

export default function DataAnalystPanel() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function analyzeFile() {
    if (!file) {
      setError("Please select a CSV or Excel file first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(data.message || "Analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="data-analyst-panel">
      <div className="analyst-header">
        <div>
          <span className="eyebrow">AI DATA ANALYST</span>
          <h2>Analyze your dataset</h2>
          <p>
            Upload CSV or Excel data and get automated analysis with AI insights.
          </p>
        </div>

        <div className="status-pill">
          ● API Connected
        </div>
      </div>

      <div className="upload-box">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setResult(null);
            setError("");
          }}
        />

        <button onClick={analyzeFile} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Dataset"}
        </button>

        {file && (
          <div className="selected-file">
            Selected: <strong>{file.name}</strong>
          </div>
        )}
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {result && (
        <div className="analysis-results">

          <div className="metric-grid">
            <div className="metric-card">
              <span>Rows</span>
              <strong>{result.analysis.rows}</strong>
            </div>

            <div className="metric-card">
              <span>Columns</span>
              <strong>{result.analysis.columns}</strong>
            </div>

            <div className="metric-card">
              <span>Missing Values</span>
              <strong>{result.analysis.missing_values}</strong>
            </div>
          </div>

          <div className="result-card">
            <h3>Numeric Summary</h3>

            {Object.entries(result.analysis.numeric_summary).map(
              ([column, stats]) => (
                <div className="summary-row" key={column}>
                  <strong>{column}</strong>
                  <span>
                    Sum: {stats.sum} · Avg: {stats.mean.toFixed(2)} ·
                    Min: {stats.min} · Max: {stats.max}
                  </span>
                </div>
              )
            )}
          </div>

          <div className="result-card ai-card">
            <div className="ai-title">
              <span>🤖</span>
              <h3>AI Analyst Insights</h3>
            </div>

            {result.ai?.summary ? (
              <p>{result.ai.summary}</p>
            ) : (
              <p>AI analysis was not available.</p>
            )}
          </div>

        </div>
      )}
    </section>
  );
}
