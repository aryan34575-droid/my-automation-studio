import React from "react";
import { ExcelStudio } from "./features/excel";

/**
 * Safe Excel Studio integration bridge.
 * Existing application navigation can render this component
 * without modifying the Excel Studio implementation.
 */
export default function ExcelStudioWorkspace() {
  return <ExcelStudio />;
}
