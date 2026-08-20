const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Automation Studio",
    model: "llama3.1:latest"
  });
});

app.post("/api/ai", async (req, res) => {

  try {

    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required."
      });
    }

    const ollamaResponse = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          model: "llama3.1:latest",

          messages: [
            {
              role: "user",
              content: prompt
            }
          ],

          stream: false
        })
      }
    );

    const data = await ollamaResponse.json();

    if (!ollamaResponse.ok) {

      return res.status(500).json({
        error: data.error || "Ollama returned an error."
      });

    }

    res.json({
      response:
        data.message?.content ||
        "No response received."
    });

  } catch (error) {

    res.status(500).json({
      error:
        "Cannot connect to Ollama. Make sure Ollama is running."
    });

  }

});

app.listen(3001, () => {

  console.log(
    "======================================"
  );

  console.log(
    "Automation Studio Backend"
  );

  console.log(
    "http://localhost:3001"
  );

  console.log(
    "======================================"
  );

});
