from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import duckdb
import requests
import json
import math

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

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
DEFAULT_MODEL = "llama3.1:latest"


class DatasetRequest(BaseModel):
    rows: list[dict]


class AskRequest(BaseModel):
    question: str
    rows: list[dict] = []


class SQLRequest(BaseModel):
    query: str
    rows: list[dict]


def clean_value(value):
    if value is None:
        return None

    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None

    return value


def dataframe_profile(df: pd.DataFrame):
    profile = []

    for column in df.columns:
        series = df[column]

        numeric = pd.to_numeric(series, errors="coerce")

        profile.append({
            "column": str(column),
            "dtype": str(series.dtype),
            "missing": int(series.isna().sum()),
            "unique": int(series.nunique(dropna=True)),
            "numeric": bool(numeric.notna().sum() >= max(1, len(series) * 0.7)),
        })

    return profile


@app.get("/health")
def health():
    ollama = False

    try:
        response = requests.get(
            "http://127.0.0.1:11434/api/tags",
            timeout=3
        )
        ollama = response.ok
    except Exception:
        ollama = False

    return {
        "status": "ok",
        "service": "Automation Studio Data Analyst API",
        "python": True,
        "pandas": pd.__version__,
        "duckdb": duckdb.__version__,
        "ollama": ollama,
        "model": DEFAULT_MODEL
    }


@app.post("/analyze")
def analyze_dataset(request: DatasetRequest):

    if not request.rows:
        return {
            "status": "error",
            "message": "No dataset rows received."
        }

    df = pd.DataFrame(request.rows)

    result = {
        "status": "success",
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": [str(c) for c in df.columns],
        "missing_values": int(df.isna().sum().sum()),
        "duplicates": int(df.duplicated().sum()),
        "profile": dataframe_profile(df),
        "numeric_summary": {}
    }

    for column in df.columns:

        numeric = pd.to_numeric(
            df[column],
            errors="coerce"
        ).dropna()

        if len(numeric) >= max(1, len(df) * 0.7):

            result["numeric_summary"][str(column)] = {
                "count": int(len(numeric)),
                "sum": clean_value(float(numeric.sum())),
                "average": clean_value(float(numeric.mean())),
                "minimum": clean_value(float(numeric.min())),
                "maximum": clean_value(float(numeric.max())),
                "median": clean_value(float(numeric.median()))
            }

    return result


@app.post("/sql")
def execute_sql(request: SQLRequest):

    if not request.rows:
        return {
            "status": "error",
            "message": "No dataset supplied."
        }

    try:

        df = pd.DataFrame(request.rows)

        con = duckdb.connect(":memory:")

        con.register("dataset", df)

        result = con.execute(
            request.query
        ).fetchdf()

        con.close()

        return {
            "status": "success",
            "columns": [str(c) for c in result.columns],
            "rows": [
                {
                    str(k): clean_value(v)
                    for k, v in row.items()
                }
                for row in result.to_dict(orient="records")
            ]
        }

    except Exception as error:

        return {
            "status": "error",
            "message": str(error)
        }


@app.post("/ask")
def ask_ai(request: AskRequest):

    if not request.question.strip():
        return {
            "status": "error",
            "message": "Question is required."
        }

    dataset_context = "No dataset supplied."

    if request.rows:

        df = pd.DataFrame(request.rows)

        profile = dataframe_profile(df)

        dataset_context = json.dumps(
            {
                "rows": len(df),
                "columns": list(df.columns),
                "profile": profile,
            },
            indent=2,
            default=str
        )

    prompt = f"""
You are the AI Data Analyst inside Automation Studio.

Your job is to help a data analyst understand datasets.

Use simple professional language.

You can:
- explain data
- identify trends
- suggest SQL
- explain SQL
- find data-quality issues
- suggest useful KPIs
- suggest charts
- summarize business insights

Dataset context:

{dataset_context}

User question:

{request.question}

Give a practical answer.
Do not invent numbers that are not present in the supplied context.
If information is missing, clearly say what is missing.
"""

    try:

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": DEFAULT_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        response.raise_for_status()

        data = response.json()

        return {
            "status": "success",
            "model": DEFAULT_MODEL,
            "answer": data.get("response", "")
        }

    except Exception as error:

        return {
            "status": "error",
            "message": (
                "Ollama connection failed. "
                "Make sure Ollama is running. "
                f"Details: {error}"
            )
        }


@app.get("/models")
def models():

    try:

        response = requests.get(
            "http://127.0.0.1:11434/api/tags",
            timeout=5
        )

        response.raise_for_status()

        data = response.json()

        return {
            "status": "success",
            "models": [
                model.get("name")
                for model in data.get("models", [])
            ]
        }

    except Exception as error:

        return {
            "status": "error",
            "message": str(error)
        }


if __name__ == "__main__":

    import uvicorn

    print("")
    print("=" * 60)
    print(" AUTOMATION STUDIO DATA ANALYST AI ENGINE")
    print("=" * 60)
    print(" API:     http://127.0.0.1:8001")
    print(" DOCS:    http://127.0.0.1:8001/docs")
    print(" HEALTH:  http://127.0.0.1:8001/health")
    print(" OLLAMA:  http://127.0.0.1:11434")
    print("=" * 60)
    print("")

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8001
    )
