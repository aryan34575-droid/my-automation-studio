import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import "./ExcelStudio.css";

function evaluateFormula(value, rows) {
  if (typeof value !== "string" || !value.startsWith("=")) {
    return value;
  }

  const formula = value.trim().toUpperCase();

  const match = formula.match(
    /^(SUM|AVERAGE|MIN|MAX|COUNT)\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)$/
  );

  if (!match) return value;

  function columnIndex(letters) {
    let result = 0;

    for (const letter of letters) {
      result =
        result * 26 +
        letter.charCodeAt(0) -
        64;
    }

    return result - 1;
  }

  const operation = match[1];
  const column = columnIndex(match[2]);
  const start = Number(match[3]) - 1;
  const end = Number(match[5]) - 1;

  const values = [];

  for (let row = start; row <= end; row++) {
    const number = Number(rows[row]?.[column]);

    if (!Number.isNaN(number)) {
      values.push(number);
    }
  }

  if (!values.length) return 0;

  if (operation === "SUM") {
    return values.reduce((a, b) => a + b, 0);
  }

  if (operation === "AVERAGE") {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  if (operation === "MIN") {
    return Math.min(...values);
  }

  if (operation === "MAX") {
    return Math.max(...values);
  }

  if (operation === "COUNT") {
    return values.length;
  }

  return value;
}

export default function ExcelStudio() {
  const [workbook, setWorkbook] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState("");
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [status, setStatus] = useState("Ready");

  const rows = workbook?.[activeSheet] || [];
  const headers = rows[0] || [];
  const bodyRows = rows.slice(1);

  const visibleRows = useMemo(() => {
    let result = bodyRows.filter((row) => {
      if (!search.trim()) return true;

      const query = search.toLowerCase();

      return row.some((cell) =>
        String(cell ?? "")
          .toLowerCase()
          .includes(query)
      );
    });

    if (sortColumn !== null) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortColumn] ?? "";
        const bValue = b[sortColumn] ?? "";

        const aNumber = Number(aValue);
        const bNumber = Number(bValue);

        let comparison;

        if (
          !Number.isNaN(aNumber) &&
          !Number.isNaN(bNumber)
        ) {
          comparison = aNumber - bNumber;
        } else {
          comparison = String(aValue).localeCompare(
            String(bValue)
          );
        }

        return sortDirection === "asc"
          ? comparison
          : -comparison;
      });
    }

    return result;
  }, [
    bodyRows,
    search,
    sortColumn,
    sortDirection
  ]);

  async function openWorkbook(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setStatus("Reading workbook...");

      const buffer = await file.arrayBuffer();

      const workbookObject = XLSX.read(buffer, {
        type: "array",
        cellDates: true
      });

      const parsedWorkbook = {};

      workbookObject.SheetNames.forEach(
        (sheetName) => {
          parsedWorkbook[sheetName] =
            XLSX.utils.sheet_to_json(
              workbookObject.Sheets[sheetName],
              {
                header: 1,
                defval: ""
              }
            );
        }
      );

      setWorkbook(parsedWorkbook);
      setSheets(workbookObject.SheetNames);
      setActiveSheet(
        workbookObject.SheetNames[0] || ""
      );

      setStatus(
        `Loaded ${workbookObject.SheetNames.length} sheet(s)`
      );
    } catch (error) {
      console.error(error);
      setStatus(
        "Unable to read this workbook."
      );
    }

    event.target.value = "";
  }

  function updateCell(
    visibleRowIndex,
    columnIndex,
    value
  ) {
    setWorkbook((previous) => {
      if (!previous) return previous;

      const nextRows =
        previous[activeSheet].map(
          (row) => [...row]
        );

      const actualRow =
        visibleRowIndex + 1;

      if (!nextRows[actualRow]) {
        nextRows[actualRow] = [];
      }

      nextRows[actualRow][columnIndex] =
        value;

      return {
        ...previous,
        [activeSheet]: nextRows
      };
    });

    setStatus("Cell updated");
  }

  function addRow() {
    setWorkbook((previous) => {
      if (!previous) return previous;

      const nextRows =
        previous[activeSheet].map(
          (row) => [...row]
        );

      nextRows.push(
        Array(
          Math.max(headers.length, 1)
        ).fill("")
      );

      return {
        ...previous,
        [activeSheet]: nextRows
      };
    });

    setStatus("Row added");
  }

  function addColumn() {
    setWorkbook((previous) => {
      if (!previous) return previous;

      const nextRows =
        previous[activeSheet].map(
          (row) => [...row, ""]
        );

      if (!nextRows.length) {
        nextRows.push([""]);
      }

      return {
        ...previous,
        [activeSheet]: nextRows
      };
    });

    setStatus("Column added");
  }

  function removeLastRow() {
    setWorkbook((previous) => {
      if (!previous) return previous;

      const nextRows =
        previous[activeSheet].map(
          (row) => [...row]
        );

      if (nextRows.length > 1) {
        nextRows.pop();
      }

      return {
        ...previous,
        [activeSheet]: nextRows
      };
    });

    setStatus("Last row removed");
  }

  function removeLastColumn() {
    setWorkbook((previous) => {
      if (!previous) return previous;

      const nextRows =
        previous[activeSheet].map(
          (row) => {
            const copy = [...row];

            if (copy.length) {
              copy.pop();
            }

            return copy;
          }
        );

      return {
        ...previous,
        [activeSheet]: nextRows
      };
    });

    setStatus("Last column removed");
  }

  function sortColumnBy(index) {
    if (sortColumn === index) {
      setSortDirection(
        (direction) =>
          direction === "asc"
            ? "desc"
            : "asc"
      );
    } else {
      setSortColumn(index);
      setSortDirection("asc");
    }
  }

  function exportXLSX() {
    if (!workbook) return;

    const outputWorkbook =
      XLSX.utils.book_new();

    Object.entries(workbook).forEach(
      ([sheetName, data]) => {
        const worksheet =
          XLSX.utils.aoa_to_sheet(data);

        XLSX.utils.book_append_sheet(
          outputWorkbook,
          worksheet,
          sheetName.slice(0, 31)
        );
      }
    );

    XLSX.writeFile(
      outputWorkbook,
      "automation-studio.xlsx"
    );

    setStatus("XLSX exported");
  }

  function exportCSV() {
    if (!workbook || !activeSheet) {
      return;
    }

    const worksheet =
      XLSX.utils.aoa_to_sheet(
        workbook[activeSheet]
      );

    const csv =
      XLSX.utils.sheet_to_csv(
        worksheet
      );

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      `${activeSheet}.csv`;

    link.click();

    URL.revokeObjectURL(url);

    setStatus("CSV exported");
  }

  if (!workbook) {
    return (
      <div className="excel-studio">
        <div className="excel-hero">
          <div>
            <span className="excel-kicker">
              OFFICE WORKSPACE
            </span>

            <h1>Excel Studio</h1>

            <p>
              Import, inspect, edit and
              export spreadsheets from
              one professional workspace.
            </p>
          </div>

          <label className="excel-button primary">
            Open Excel / CSV

            <input
              hidden
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={openWorkbook}
            />
          </label>
        </div>

        <div className="excel-empty">
          <div className="excel-empty-icon">
            📊
          </div>

          <h2>
            Start a workbook
          </h2>

          <p>
            Upload XLSX, XLS or CSV
            to begin working.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="excel-studio">

      <div className="excel-hero">

        <div>
          <span className="excel-kicker">
            EXCEL WORKSPACE
          </span>

          <h1>{activeSheet}</h1>

          <p>
            {rows.length} rows ·{" "}
            {headers.length} columns
          </p>
        </div>

        <div className="excel-actions">

          <label className="excel-button primary">
            Replace File

            <input
              hidden
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={openWorkbook}
            />
          </label>

          <button
            className="excel-button"
            onClick={exportCSV}
          >
            Export CSV
          </button>

          <button
            className="excel-button"
            onClick={exportXLSX}
          >
            Export XLSX
          </button>

        </div>
      </div>

      <div className="excel-toolbar">

        <div className="excel-search">
          🔎

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search workbook..."
          />
        </div>

        <span className="excel-status">
          {status}
        </span>

      </div>

      <div className="excel-tools">

        <button onClick={addRow}>
          + Row
        </button>

        <button onClick={addColumn}>
          + Column
        </button>

        <button onClick={removeLastRow}>
          − Last Row
        </button>

        <button onClick={removeLastColumn}>
          − Last Column
        </button>

        <span className="excel-formula-help">
          Formula: =SUM(A2:A10)
        </span>

      </div>

      <div className="excel-workspace">

        <aside className="excel-sheets">

          <div className="excel-section-title">
            WORKBOOK
          </div>

          {sheets.map((sheet) => (
            <button
              key={sheet}
              className={
                sheet === activeSheet
                  ? "sheet active"
                  : "sheet"
              }
              onClick={() =>
                setActiveSheet(sheet)
              }
            >
              📄 {sheet}
            </button>
          ))}

        </aside>

        <section className="excel-grid">

          <div className="excel-grid-scroll">

            <table>

              <thead>

                <tr>

                  <th>#</th>

                  {headers.map(
                    (header, index) => (
                      <th
                        key={index}
                        onClick={() =>
                          sortColumnBy(index)
                        }
                      >
                        {String(
                          header ||
                          `Column ${index + 1}`
                        )}

                        {sortColumn === index
                          ? sortDirection ===
                            "asc"
                            ? " ↑"
                            : " ↓"
                          : " ↕"}
                      </th>
                    )
                  )}

                </tr>

              </thead>

              <tbody>

                {visibleRows.map(
                  (row, rowIndex) => (
                    <tr key={rowIndex}>

                      <td className="row-number">
                        {rowIndex + 1}
                      </td>

                      {headers.map(
                        (_, columnIndex) => {

                          const value =
                            row[columnIndex] ??
                            "";

                          return (
                            <td
                              key={columnIndex}
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(event) =>
                                updateCell(
                                  rowIndex,
                                  columnIndex,
                                  event
                                    .currentTarget
                                    .textContent
                                )
                              }
                            >
                              {String(
                                evaluateFormula(
                                  value,
                                  rows
                                )
                              )}
                            </td>
                          );
                        }
                      )}

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>

    </div>
  );
}
