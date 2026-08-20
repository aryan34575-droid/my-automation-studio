const API_BASE = "http://127.0.0.1:8001";
const OLLAMA_BASE = "http://127.0.0.1:11434";

export async function checkPythonAPI() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error("Python API health check failed");
  }
  return response.json();
}

export async function checkOllama() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error("Ollama health check failed");
  }
  return response.json();
}

export async function askOllama(prompt, model) {
  const response = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  return response.json();
}
export async function discoverAPI() {
  const response = await fetch(`${API_BASE}/health`);

  if (!response.ok) {
    throw new Error("Unable to read Python API contract");
  }

  return response.json();
}

