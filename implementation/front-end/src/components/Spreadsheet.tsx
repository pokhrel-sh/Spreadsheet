import React, { useContext, useState } from "react";
import "./Spreadsheet.css";
import { SpreadsheetContext } from "./SpreadsheetContext";
import Cell from "./Cell";
import { NumberCell } from "../basic-implementation/NumberCell";
import { StringCell } from "../basic-implementation/StringCell";
import { FormulaCell } from "../basic-implementation/FormulaCell";
import { RangeCell } from "../basic-implementation/RangeCell";
import socket, { getSocket } from "../utils/socket";
import FormulaBar from "./Formulabar";

const Spreadsheet: React.FC = () => {
  const {
    getCell,
    updateCell,
    addRow,
    addColumn,
    removeRow,
    removeColumn,
    loading,
    error,
    rowCount,
    colCount,
    setRowCount,
    setColCount,
  } = useContext(SpreadsheetContext);
  const [selectedCell, setSelectedCell] = useState<{
    rowIndex: number;
    colIndex: number;
  } | null>(null);

  const getCellType = (
    rowIndex: number,
    colIndex: number
  ): "string" | "number" | "formula" => {
    const cell = getCell(rowIndex, colIndex);

    if (cell instanceof NumberCell) {
      return "number";
    } else if (cell instanceof FormulaCell) {
      return "formula";
    } else if (cell instanceof StringCell) {
      return "string";
    } else {
      return "string"; // default type
    }
  };

  const handleSave = (
    rowIndex: number,
    colIndex: number,
    newValue: { type: string; value: string | number; meta?: object | null }
  ) => {
    console.log("Saving value:", newValue);
    if (newValue.type === "formula") {
      updateCell(rowIndex, colIndex, `=${newValue.value}`);
      setSelectedCell({ rowIndex, colIndex });
    } else {
      updateCell(rowIndex, colIndex, `${newValue.value}`);
      setSelectedCell({ rowIndex, colIndex });
    }

    // Use socket.emit to update
    console.log("Sending UPDATE message:", {
      type: "UPDATE",
      data: {
        cells: [
          {
            position: [colIndex, rowIndex],
            type: newValue.type,
            value: newValue.value,
            meta: newValue.meta,
          },
        ],
      },
    });
    getSocket().emit("message", {
      type: "UPDATE",
      data: {
        cells: [
          {
            position: [colIndex, rowIndex],
            type: newValue.type,
            value: newValue.value,
            meta: newValue.meta,
          },
        ],
      },
    });
  };

  if (loading) {
    return <div>Loading spreadsheet...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Function to safely get the display value of a cell
  const getDisplayValue = (rowIndex: number, colIndex: number): string => {
    const cell = getCell(rowIndex, colIndex);
    return cell?.display() || "";
  };

  return (
    <div className="spreadsheet-container">
      {/* Formula Bar */}
      <FormulaBar
        cellPosition={
          selectedCell
            ? `${String.fromCharCode(65 + selectedCell.colIndex)}${
                selectedCell.rowIndex + 1
              }`
            : ""
        }
        cellValue={
          selectedCell
            ? getCell(
                selectedCell.rowIndex,
                selectedCell.colIndex
              )?.display() || ""
            : ""
        }
        onValueChange={(newValue) => {
          if (selectedCell) {
            // Determine the type based on the newValue (e.g., if it starts with '=' it's a formula)
            const type =
              typeof newValue === "string" && newValue.startsWith("=")
                ? "formula"
                : "string";
            handleSave(selectedCell.rowIndex, selectedCell.colIndex, {
              type: type,
              value: type === "formula" ? newValue.slice(1) : newValue, // Remove '=' for formula
              meta: null,
            });
          }
        }}
      />

      <table className="spreadsheet-table">
        <thead>
          <tr>
            <th />
            {Array.from({ length: colCount }, (_, colIndex) => (
              <th key={colIndex}>{String.fromCharCode(65 + colIndex)}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <tr key={rowIndex}>
              <td className="row-number-column">{rowIndex + 1}</td>
              {Array.from({ length: colCount }, (_, colIndex) => (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  value={{
                    type: getCellType(rowIndex, colIndex),
                    value: getDisplayValue(rowIndex, colIndex),
                    meta: null,
                  }}
                  onSave={(newValue) =>
                    handleSave(rowIndex, colIndex, newValue)
                  }
                  onClick={() => setSelectedCell({ rowIndex, colIndex })}
                  // handle  right click for clearing the cell
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleSave(rowIndex, colIndex, {
                      type: "string",
                      value: "",
                      meta: null,
                    });
                  }}
                  rowIndex={rowIndex} // Pass row index
                  colIndex={colIndex} // Pass column index
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Spreadsheet;
