import React from "react";
import { ExcelStudio } from "./features/excel";

export default function ExcelStudioWorkspace() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        padding: "0"
      }}
    >
      <ExcelStudio />
    </div>
  );
}

