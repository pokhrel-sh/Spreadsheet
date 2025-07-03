import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { SpreadsheetContext } from "./SpreadsheetContext"; // Adjust path as needed
import { CellUtilities } from "basic-implementation/CellUtilities";
import { ICell } from "basic-implementation/ICell";
import { FormulaCell } from "basic-implementation/FormulaCell";

interface CellProps {
  value: {
    type: "string" | "number" | "formula";
    value: string | number;
    meta?: object | null;
  };
  onSave: (newValue: {
    type: string;
    value: string | number;
    meta?: object | null;
  }) => void;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  rowIndex: number; // Add row index
  colIndex: number; // Add column index
}

const Cell: React.FC<CellProps> = ({
  value,
  rowIndex,
  colIndex,
  onSave,
  onClick,
  onContextMenu,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [cellValue, setCellValue] = useState<string | number>(value.value);
  const { model } = useContext(SpreadsheetContext);

  useEffect(() => {
    if (!isEditing) {
      const cell = model.getCell(rowIndex, colIndex);
      setCellValue(cell ? cell.display() : "");
    }
  }, [value, isEditing, model, rowIndex, colIndex]); // Updated dependency

  const handleBlur = (e: React.FocusEvent<HTMLTableCellElement>) => {
    setIsEditing(false);
    const newValue = e.currentTarget.textContent || "";
    if (newValue !== value.value.toString()) {
      const updatedValue =
        value.type === "number" ? parseFloat(newValue) || 0 : newValue;
      onSave({ ...value, value: updatedValue });
    }
  };

  const handleCellClick = () => {
    onClick();
    setIsEditing(true);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    onContextMenu(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableCellElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const renderContent = () => {
    const thisCell: ICell = model.getCell(rowIndex, colIndex);
    if (thisCell == null) {
      return "";
    } else {
      const thisCellValue: string = thisCell.display();
      console.log(thisCell instanceof FormulaCell);
      if (thisCellValue == null) {
        return "Error";
      } else {
        return thisCellValue;
      }
    }
  };

  return (
    <td
      role="gridcell"
      contentEditable={isEditing}
      suppressContentEditableWarning
      onClick={handleCellClick}
      onContextMenu={handleContextMenu}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        width: "100px",
        border: "1px solid #ddd",
        padding: "5px",
        outline: "none",
        cursor: "pointer",
      }}
    >
      {isEditing ? cellValue : renderContent()}
    </td>
  );
};

export default Cell;
