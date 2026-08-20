import sys
import json
from pathlib import Path

import pandas as pd
import duckdb


SUPPORTED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


def load_dataset(file_path: str) -> pd.DataFrame:
    """Load CSV or Excel data into a pandas DataFrame."""

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    extension = path.suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type: {extension}. "
            "Supported: CSV, XLSX, XLS."
        )

    if extension == ".csv":
        return pd.read_csv(path)

    return pd.read_excel(path)


def get_column_profile(df: pd.DataFrame) -> list:
    """Return useful information about every column."""

    profile = []

    for column in df.columns:
        series = df[column]

        profile.append({
            "name": str(column),
            "dtype": str(series.dtype),
            "rows": int(len(series)),
            "missing": int(series.isna().sum()),
            "missing_percent": round(
                float(series.isna().mean() * 100), 2
            ),
            "unique_values": int(
                series.nunique(dropna=True)
            )
        })

    return profile


def get_numeric_summary(df: pd.DataFrame) -> dict:
    """Generate statistics for numeric columns."""

    numeric = df.select_dtypes(include="number")

    if numeric.empty:
        return {}

    summary = {}

    for column in numeric.columns:
        series = numeric[column].dropna()

        if series.empty:
            continue

        summary[str(column)] = {
            "count": int(series.count()),
            "mean": round(float(series.mean()), 4),
            "median": round(float(series.median()), 4),
            "minimum": round(float(series.min()), 4),
            "maximum": round(float(series.max()), 4),
            "std": round(float(series.std()), 4)
            if len(series) > 1 else 0
        }

    return summary


def get_categorical_summary(df: pd.DataFrame) -> dict:
    """Summarize categorical columns."""

    categorical = df.select_dtypes(
        include=["object", "category", "bool"]
    )

    result = {}

    for column in categorical.columns:

        counts = (
            categorical[column]
            .value_counts(dropna=False)
            .head(10)
        )

        result[str(column)] = {
            str(key): int(value)
            for key, value in counts.items()
        }

    return result


def detect_duplicates(df: pd.DataFrame) -> dict:
    """Detect duplicate records."""

    duplicate_mask = df.duplicated()

    return {
        "duplicate_rows": int(duplicate_mask.sum()),
        "has_duplicates": bool(duplicate_mask.any())
    }


def detect_outliers(df: pd.DataFrame) -> dict:
    """Detect possible numeric outliers using the IQR method."""

    numeric = df.select_dtypes(include="number")

    result = {}

    for column in numeric.columns:

        series = numeric[column].dropna()

        if len(series) < 4:
            continue

        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)

        iqr = q3 - q1

        lower = q1 - (1.5 * iqr)
        upper = q3 + (1.5 * iqr)

        mask = (series < lower) | (series > upper)

        result[str(column)] = {
            "outliers": int(mask.sum()),
            "lower_bound": round(float(lower), 4),
            "upper_bound": round(float(upper), 4)
        }

    return result


def run_sql_profile(df: pd.DataFrame) -> dict:
    """Run basic SQL analysis using DuckDB."""

    connection = duckdb.connect()

    try:

        connection.register("dataset", df)

        total_rows = connection.execute(
            "SELECT COUNT(*) FROM dataset"
        ).fetchone()[0]

        total_columns = len(df.columns)

        null_cells = connection.execute(
            """
            SELECT
                COUNT(*) 
            FROM dataset
            WHERE FALSE
            """
        ).fetchone()[0]

        return {
            "engine": "DuckDB",
            "table": "dataset",
            "total_rows": int(total_rows),
            "total_columns": int(total_columns),
            "query_engine_ready": True,
            "null_query_test": int(null_cells)
        }

    finally:
        connection.close()


def generate_data_quality(df: pd.DataFrame) -> dict:
    """Generate an overall data-quality summary."""

    total_cells = df.shape[0] * df.shape[1]

    missing_cells = int(df.isna().sum().sum())

    duplicate_rows = int(df.duplicated().sum())

    if total_cells:
        completeness = (
            1 - (missing_cells / total_cells)
        ) * 100
    else:
        completeness = 100

    return {
        "total_cells": int(total_cells),
        "missing_cells": missing_cells,
        "duplicate_rows": duplicate_rows,
        "completeness_percent": round(
            completeness, 2
        )
    }


def analyze_dataset(file_path: str) -> dict:
    """Run the complete first-level data analysis."""

    path = Path(file_path)

    df = load_dataset(file_path)

    result = {
        "status": "success",
        "file": path.name,

        "dataset": {
            "rows": int(df.shape[0]),
            "columns": int(df.shape[1]),
            "column_names": [
                str(column)
                for column in df.columns
            ]
        },

        "data_quality": generate_data_quality(df),

        "columns": get_column_profile(df),

        "numeric_analysis": get_numeric_summary(df),

        "categorical_analysis":
            get_categorical_summary(df),

        "duplicates":
            detect_duplicates(df),

        "outliers":
            detect_outliers(df),

        "sql": run_sql_profile(df)
    }

    return result


def main():

    if len(sys.argv) < 2:

        print(
            json.dumps(
                {
                    "status": "error",
                    "message":
                        "Usage: python analyzer.py <file>"
                },
                indent=2
            )
        )

        sys.exit(1)

    file_path = sys.argv[1]

    try:

        result = analyze_dataset(file_path)

        print(
            json.dumps(
                result,
                indent=2,
                default=str
            )
        )

    except Exception as error:

        print(
            json.dumps(
                {
                    "status": "error",
                    "message": str(error)
                },
                indent=2
            )
        )

        sys.exit(1)


if __name__ == "__main__":
    main()