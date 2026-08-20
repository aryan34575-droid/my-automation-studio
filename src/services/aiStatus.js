export async function getAIStackStatus() {
  const result = {
    pythonApi: "offline",
    ollama: "offline"
  };

  try {
    const apiResponse = await fetch("http://127.0.0.1:8001/health");
    result.pythonApi = apiResponse.ok ? "online" : "error";
  } catch {
    result.pythonApi = "offline";
  }

  try {
    const ollamaResponse = await fetch("http://127.0.0.1:11434/api/tags");
    result.ollama = ollamaResponse.ok ? "online" : "error";
  } catch {
    result.ollama = "offline";
  }

  return result;
}

