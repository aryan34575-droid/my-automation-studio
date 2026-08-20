from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import duckdb
import tempfile
import os
import json
import urllib.request

app = FastAPI(
    title="Automation Studio Data Analyst API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "automation-workspace",
    "data"
)

os.makedirs(DATA_DIR, exist_ok=True)


class SQLRequest(BaseModel):
    sql: str


class AIRequest(BaseModel):
    prompt: str
    context: str = ""


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "Automation Studio Data Analyst API",
        "python_data_engine": "ready",
        "pandas": pd.__version__,
        "duckdb": duckdb.__version__
    }


@app.get("/api/data/status")
def data_status():
    files = []

    for name in os.listdir(DATA_DIR):
        path = os.path.join(DATA_DIR, name)

        if os.path.isfile(path):
            files.append({
                "name": name,
                "size": os.path.getsize(path)
            })

    return {
        "status": "ok",
        "data_directory": DATA_DIR,
        "files": files
    }


@app.post("/api/data/upload")
async def upload_file(file: UploadFile = File(...)):

    allowed = [".csv", ".xlsx", ".xls"]

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Only CSV, XLSX and XLS files are supported."
        )

    safe_name = os.path.basename(file.filename)

    path = os.path.join(DATA_DIR, safe_name)

    content = await file.read()

    with open(path, "wb") as f:
        f.write(content)

    try:

        if extension == ".csv":
            df = pd.read_csv(path)
        else:
            df = pd.read_excel(path)

        preview = df.head(10).fillna("").to_dict(orient="records")

        profile = []

        for column in df.columns:

            series = df[column]

            profile.append({
                "column": str(column),
                "dtype": str(series.dtype),
                "missing": int(series.isna().sum()),
                "unique": int(series.nunique()),
                "sample": str(series.dropna().iloc[0])
                if not series.dropna().empty else ""
            })

        return {
            "status": "ok",
            "filename": safe_name,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": [str(c) for c in df.columns],
            "profile": profile,
            "preview": preview
        }

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@app.post("/api/sql")
def run_sql(request: SQLRequest):

    try:

        con = duckdb.connect(
            os.path.join(DATA_DIR, "analytics.duckdb")
        )

        result = con.execute(request.sql).fetchdf()

        data = result.head(500).fillna("").to_dict(
            orient="records"
        )

        columns = [str(c) for c in result.columns]

        con.close()

        return {
            "status": "ok",
            "rows": len(result),
            "columns": columns,
            "data": data
        }

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@app.post("/api/ai")
def ai_analysis(request: AIRequest):

    system_prompt = """
You are the AI Data Analyst inside Automation Studio.

Your job is to help with:

- Excel analysis
- CSV analysis
- SQL
- Python data analysis
- Pandas
- DuckDB
- Data cleaning
- Missing values
- Outliers
- Trends
- KPIs
- Business insights
- Reports
- Presentation summaries

Give practical, accurate and simple answers.

When data is provided:
1. Understand the data.
2. Identify important patterns.
3. Point out data-quality problems.
4. Give useful business insights.
5. Suggest the next analysis step.

Do not invent numbers that are not present in the supplied data.
"""

    full_prompt = (
        system_prompt
        + "\n\nUSER REQUEST:\n"
        + request.prompt
        + "\n\nDATA CONTEXT:\n"
        + request.context
    )

    payload = json.dumps({
        "model": "llama3.1:latest",
        "prompt": full_prompt,
        "stream": False
    }).encode("utf-8")

    try:

        req = urllib.request.Request(
            "http://127.0.0.1:11434/api/generate",
            data=payload,
            headers={
                "Content-Type": "application/json"
            }
        )

        with urllib.request.urlopen(req, timeout=120) as response:

            result = json.loads(
                response.read().decode("utf-8")
            )

        return {
            "status": "ok",
            "response": result.get("response", "")
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail="Ollama connection failed: " + str(error)
        )


@app.get("/api/capabilities")
def capabilities():

    return {
        "status": "ok",
        "capabilities": [
            "CSV upload",
            "Excel upload",
            "Pandas analysis",
            "DuckDB SQL",
            "AI data analysis",
            "Data profiling",
            "Data preview",
            "Business insights",
            "Local Ollama AI"
        ]
    }


if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000
    )
