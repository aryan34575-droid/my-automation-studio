from pathlib import Path
from typing import Any
import pandas as pd


def _clean_value(value: Any):
    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        try:
            return value.item()
        except Exception:
            pass

    return value


def analyze_dataframe(df: pd.DataFrame) -> dict:
    numeric = df.select_dtypes(include="number")

    missing = {
        str(column): int(value)
        for column, value in df.isna().sum().items()
        if int(value) > 0
    }

    numeric_summary = {}

    for column in numeric.columns:
        series = numeric[column].dropna()

        if len(series) == 0:
            continue

        numeric_summary[str(column)] = {
            "count": int(series.count()),
            "mean": _clean_value(series.mean()),
            "median": _clean_value(series.median()),
            "min": _clean_value(series.min()),
            "max": _clean_value(series.max()),
            "std": _clean_value(series.std()),
        }

    duplicate_rows = int(df.duplicated().sum())

    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": [str(column) for column in df.columns],
        "data_types": {
            str(column): str(dtype)
            for column, dtype in df.dtypes.items()
        },
        "missing_values": missing,
        "duplicate_rows": duplicate_rows,
        "numeric_summary": numeric_summary,
        "preview": [
            {
                str(column): _clean_value(value)
                for column, value in row.items()
            }
            for row in df.head(10).to_dict(orient="records")
        ],
    }


def analyze_file(file_path: str) -> dict:
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    suffix = path.suffix.lower()

    if suffix == ".csv":
        df = pd.read_csv(path)

    elif suffix in {".xlsx", ".xls"}:
        df = pd.read_excel(path)

    else:
        raise ValueError(
            "Unsupported file type. Use CSV, XLSX, or XLS."
        )

    return analyze_dataframe(df)
