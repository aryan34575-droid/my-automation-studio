import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import "./ExcelStudio.css";

function calculateFormula(value, rows) {
  if (typeof value !== "string" || !value.startsWith("=")) {
    return value;
  }

  const formula = value
    .trim()
    .toUpperCase();

  const match = formula.match(
    /^(SUM|AVERAGE|MIN|MAX|COUNT)\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)$/
  );

  if (!match) {
    return value;
  }

  const operation = match[1];
  const startRow = Number(match[3]) - 1;
  const endRow = Number(match[5]) - 1;

  const columnToIndex = (letters) => {
    let result = 0;

    for (const char of letters) {
      result =
        result * 26 +
        char.charCodeAt(0) -
        64;
    }

    return result - 1;
  };

  const column = columnToIndex(match[2]);

  const values = [];

  for (
    let row = startRow;
    row <= endRow;
    row++
  ) {
    const number = Number(
      rows[row]?.[column]
    );

    if (!Number.isNaN(number)) {
      values.push(number);
    }
  }

  if (!values.length) {
    return 0;
  }

  if (operation === "SUM") {
    return values.reduce(
      (a, b) => a + b,
      0
    );
  }

  if (operation === "AVERAGE") {
    return (
      values.reduce(
        (a, b) => a + b,
        0
      ) / values.length
    );
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

  const [workbook, setWorkbook] =
    useState(null);

  const [sheets, setSheets] =
    useState([]);

  const [activeSheet, setActiveSheet] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [sortColumn, setSortColumn] =
    useState(null);

  const [sortDirection, setSortDirection] =
    useState("asc");

  const [status, setStatus] =
    useState("Ready");

  const [filterText, setFilterText] =
    useState("");

  const activeData =
    workbook?.[activeSheet] || [];

  const headers =
    activeData[0] || [];

  const bodyRows =
    activeData.slice(1);

  const processedRows = useMemo(() => {

    let rows = [...bodyRows];

    if (search.trim()) {

      const term =
        search.toLowerCase();

      rows = rows.filter(row =>
        row.some(cell =>
          String(cell ?? "")
            .toLowerCase()
            .includes(term)
        )
      );
    }

    if (filterText.trim()) {

      const term =
        filterText.toLowerCase();

      rows = rows.filter(row =>
        row.some(cell =>
          String(cell ?? "")
            .toLowerCase()
            .includes(term)
        )
      );
    }

    if (sortColumn !== null) {

      rows.sort((a, b) => {

        const av =
          a[sortColumn] ?? "";

        const bv =
          b[sortColumn] ?? "";

        const an = Number(av);
        const bn = Number(bv);

        let comparison;

        if (
          !Number.isNaN(an) &&
          !Number.isNaN(bn)
        ) {
          comparison = an - bn;
        } else {
          comparison =
            String(av).localeCompare(
              String(bv)
            );
        }

        return sortDirection === "asc"
          ? comparison
          : -comparison;
      });
    }

    return rows;

  }, [
    bodyRows,
    search,
    filterText,
    sortColumn,
    sortDirection
  ]);

  async function handleFile(event) {

    const file =
      event.target.files?.[0];

    if (!file) return;

    try {

      setStatus("Reading workbook...");

      const buffer =
        await file.arrayBuffer();

      const wb =
        XLSX.read(buffer, {
          type: "array",
          cellDates: true
        });

      const parsed = {};

      wb.SheetNames.forEach(
        (sheetName) => {

          parsed[sheetName] =
            XLSX.utils.sheet_to_json(
              wb.Sheets[sheetName],
              {
                header: 1,
                defval: ""
              }
            );
        }
      );

      setWorkbook(parsed);

      setSheets(wb.SheetNames);

      setActiveSheet(
        wb.SheetNames[0] || ""
      );

      setStatus(
        `Loaded ${wb.SheetNames.length} sheet(s)`
      );

    } catch (error) {

      console.error(error);

      setStatus(
        "Unable to read workbook."
      );
    }

    event.target.value = "";
  }

  function updateCell(
    rowIndex,
    columnIndex,
    value
  ) {

    setWorkbook(previous => {

      if (!previous) {
        return previous;
      }

      const rows =
        previous[activeSheet].map(
          row => [...row]
        );

      const targetRow =
        rowIndex + 1;

      while (
        rows.length <= targetRow
      ) {
        rows.push([]);
      }

      rows[targetRow][columnIndex] =
        value;

      return {
        ...previous,
        [activeSheet]: rows
      };
    });

    setStatus("Cell updated");
  }

  function addRow() {

    if (!workbook || !activeSheet) {
      return;
    }

    setWorkbook(previous => {

      const rows =
        previous[activeSheet].map(
          row => [...row]
        );

      const width =
        Math.max(
          headers.length,
          1
        );

      rows.push(
        Array(width).fill("")
      );

      return {
        ...previous,
        [activeSheet]: rows
      };
    });

    setStatus("Row added");
  }

  function addColumn() {

    if (!workbook || !activeSheet) {
      return;
    }

    setWorkbook(previous => {

      const rows =
        previous[activeSheet].map(
          row => [...row]
        );

      rows.forEach(row =>
        row.push("")
      );

      if (!rows.length) {
        rows.push([""]);
      }

      return {
        ...previous,
        [activeSheet]: rows
      };
    });

    setStatus("Column added");
  }

  function deleteLastRow() {

    if (!workbook || !activeSheet) {
      return;
    }

    setWorkbook(previous => {

      const rows =
        previous[activeSheet].map(
          row => [...row]
        );

      if (rows.length > 1) {
        rows.pop();
      }

      return {
        ...previous,
        [activeSheet]: rows
      };
    });

    setStatus("Last row removed");
  }

  function deleteLastColumn() {

    if (!workbook || !activeSheet) {
      return;
    }

    setWorkbook(previous => {

      const rows =
        previous[activeSheet].map(
          row => [...row]
        );

      rows.forEach(row => {
        if (row.length) {
          row.pop();
        }
      });

      return {
        ...previous,
        [activeSheet]: rows
      };
    });

    setStatus("Last column removed");
  }

  function sortByColumn(index) {

    if (sortColumn === index) {

      setSortDirection(
        direction =>
          direction === "asc"
            ? "desc"
            : "asc"
      );

    } else {

      setSortColumn(index);
      setSortDirection("asc");
    }
  }

  function exportWorkbook() {

    if (!workbook) {
      return;
    }

    const output =
      XLSX.utils.book_new();

    Object.entries(workbook)
      .forEach(
        ([sheetName, rows]) => {

          const worksheet =
            XLSX.utils.aoa_to_sheet(
              rows
            );

          XLSX.utils.book_append_sheet(
            output,
            worksheet,
            sheetName.slice(0, 31)
          );
        }
      );

    XLSX.writeFile(
      output,
      "automation-studio.xlsx"
    );

    setStatus(
      "Excel workbook exported"
    );
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

    const blob =
      new Blob(
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

  function getDisplayValue(
    value
  ) {

    return calculateFormula(
      value,
      activeData
    );
  }

  if (!workbook) {

    return (
      <div className="excel-studio">

        <div className="excel-hero">

          <div>

            <span className="excel-kicker">
              OFFICE WORKSPACE
            </span>

            <h1>
              Excel Studio
            </h1>

            <p>
              Work with spreadsheets,
              clean data and export
              professional workbooks
              from one workspace.
            </p>

          </div>

          <label className="excel-primary">

            Open Excel / CSV

            <input
              type="file"
              hidden
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
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
            to begin.
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

          <h1>
            {activeSheet}
          </h1>

          <p>
            {activeData.length} rows ·{" "}
            {headers.length} columns
          </p>

        </div>

        <div className="excel-actions">

          <label className="excel-button primary">

            Replace File

            <input
              type="file"
              hidden
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
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
            onClick={exportWorkbook}
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
            onChange={e =>
              setSearch(e.target.value)
            }
            placeholder="Search..."
          />

        </div>

        <input
          className="excel-filter"
          value={filterText}
          onChange={e =>
            setFilterText(e.target.value)
          }
          placeholder="Filter rows..."
        />

        <span className="excel-status">
          {status}
        </span>

      </div>

      <div className="excel-tools">

        <button
          onClick={addRow}
        >
          + Row
        </button>

        <button
          onClick={addColumn}
        >
          + Column
        </button>

        <button
          onClick={deleteLastRow}
        >
          − Last Row
        </button>

        <button
          onClick={deleteLastColumn}
        >
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

          {sheets.map(sheet => (

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
                          sortByColumn(index)
                        }
                      >

                        {String(
                          header ||
                          `Column ${index + 1}`
                        )}

                        {sortColumn === index
                          ? sortDirection === "asc"
                            ? " ↑"
                            : " ↓"
                          : " ↕"}

                      </th>

                    )
                  )}

                </tr>

              </thead>

              <tbody>

                {processedRows.map(
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
                              onBlur={event =>
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
                                getDisplayValue(
                                  value
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
