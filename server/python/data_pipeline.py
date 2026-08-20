import json
from pathlib import Path
import pandas as pd

DATA_DIR = Path("automation-workspace/data")
DATA_DIR.mkdir(parents=True, exist_ok=True)

def analyze_file(path):
    path = Path(path)

    if path.suffix.lower() == ".csv":
        df = pd.read_csv(path)
    elif path.suffix.lower() in [".xlsx", ".xls"]:
        df = pd.read_excel(path)
    else:
        raise ValueError("Only CSV and Excel files are supported.")

    numeric = df.select_dtypes(include="number")

    result = {
        "file": path.name,
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": list(df.columns),
        "missing_values": int(df.isna().sum().sum()),
        "numeric_columns": list(numeric.columns),
        "summary": {}
    }

    for col in numeric.columns:
        result["summary"][col] = {
            "sum": float(numeric[col].sum()),
            "mean": float(numeric[col].mean()),
            "min": float(numeric[col].min()),
            "max": float(numeric[col].max())
        }

    return result

if __name__ == "__main__":
    result = analyze_file(DATA_DIR / "demo.csv")
    print(json.dumps(result, indent=2))
