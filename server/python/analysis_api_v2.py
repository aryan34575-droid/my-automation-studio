from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import pandas as pd
import requests
import json
import tempfile

app = FastAPI(
    title="Automation Studio AI Data Analyst",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "llama3.2:3b"

def analyze_dataframe(df):
    numeric = df.select_dtypes(include="number")

    result = {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": list(df.columns),
        "missing_values": int(df.isna().sum().sum()),
        "numeric_summary": {}
    }

    for col in numeric.columns:
        result["numeric_summary"][col] = {
            "sum": float(numeric[col].sum()),
            "mean": float(numeric[col].mean()),
            "min": float(numeric[col].min()),
            "max": float(numeric[col].max())
        }

    return result


def ask_ollama(analysis):
    prompt = f"""
You are an expert data analyst.

Analyze this dataset summary:

{json.dumps(analysis, indent=2)}

Give a concise business-style explanation containing:
1. Main findings
2. Important numbers
3. Possible data-quality issues
4. Useful recommendations

Do not invent numbers that are not present in the dataset.
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False
        },
        timeout=120
    )

    response.raise_for_status()
    return response.json().get("response", "")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "Automation Studio Data Analyst API",
        "ollama": MODEL
    }


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix.lower()

    if suffix not in [".csv", ".xlsx", ".xls"]:
        return {
            "status": "error",
            "message": "Only CSV and Excel files are supported."
        }

    content = await file.read()

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp:
        temp.write(content)
        temp_path = temp.name

    try:
        if suffix == ".csv":
            df = pd.read_csv(temp_path)
        else:
            df = pd.read_excel(temp_path)

        analysis = analyze_dataframe(df)

        try:
            ai_summary = ask_ollama(analysis)
            ai_status = "success"
        except Exception as e:
            ai_summary = ""
            ai_status = f"ollama_error: {str(e)}"

        return {
            "status": "success",
            "filename": file.filename,
            "analysis": analysis,
            "ai": {
                "status": ai_status,
                "summary": ai_summary
            }
        }

    finally:
        Path(temp_path).unlink(missing_ok=True)
