import React, { useState, useEffect } from "react";
import { Input, Typography } from "antd";
import { useContext } from "react";
import { SpreadsheetContext } from "./SpreadsheetContext";
import Cell from "./Cell";
import { CellUtilities } from "basic-implementation/CellUtilities";

const { Text } = Typography;

interface FormulaBarProps {
  cellPosition: string;
  cellValue: string | number | null | undefined;
  onValueChange: (newValue: string) => void;
}

const FormulaBar: React.FC<FormulaBarProps> = ({
  cellPosition,
  cellValue,
  onValueChange,
}) => {
  const { model } = useContext(SpreadsheetContext);

  const [inputValue, setInputValue] = useState<string>(
    cellValue !== null && cellValue !== undefined ? cellValue.toString() : ""
  );

  useEffect(() => {
    if (cellPosition.length >= 2) {
      console.log("FormulaBar received cellValue:", cellValue);
      console.log("FormulaBar received cellPosition:", cellPosition);

      // Convert the cell position to the row and column indices
      const [colIndex, rowIndex] = CellUtilities.convertReference(cellPosition);
      console.log("Position:", colIndex, rowIndex);

      const cell = model.getCell(rowIndex - 1, colIndex);

      if (!cell) {
        setInputValue("");
        return;
      }

      const cellJson = JSON.parse(cell.jsonify());
      if (cellJson.formula) {
        console.log("FormulaBar received formula:", cellJson.formula);
        setInputValue(cellJson.formula);
      } else {
        console.log("FormulaBar received cell value:", cell.display());
        setInputValue(cell.display());
      }
    } else {
      console.log("Invalid cellPosition, clearing FormulaBar input.");

      // Clear the input value if the cell position is invalid
      setInputValue("");

      //     let num: Array<number> = CellUtilities.convertReference(cellPosition);
      //     console.log("Formula position", num);
      //     // console.log("Current cell Value", model.getCell(num[0], num[1]).display());

      //     if (model.getCell(num[1], num[0]) === null) {
      //         console.log("Cell is null");
      //         return;
      //     }
      // }

      // if (cellValue !== null && cellValue !== undefined) {
      //     setInputValue(cellValue.toString());
      // } else if (cellValue != "") {
      //     setInputValue("");
      // } else {
      //     setInputValue("");
      // }

      // if (cellPosition.length >= 2) {
      //     console.log(cellPosition);
      //     let num: Array<number> = CellUtilities.convertReference(cellPosition);
      //     console.log("Formula position", num);
      //     let json: string = model.getCell(num[1], num[0]).jsonify();
      //     const parsedJson = JSON.parse(json)

      //     // console.log("FormulaBar received cellValue:", model.getCell(num[0], num[1]).display());
      //     const formula = parsedJson["formula"];
      //     console.log("FormulaBar received formula:", formula);
      //     setInputValue(formula);
    }
  }, [cellValue, cellPosition]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    onValueChange(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onValueChange(inputValue);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "5px 10px",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#f0f0f0",
      }}
    >
      <Text strong style={{ marginRight: "10px" }}>
        {cellPosition}
      </Text>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        placeholder="Enter a value or formula"
        style={{ flex: 1 }}
      />
    </div>
  );
};

export default FormulaBar;
