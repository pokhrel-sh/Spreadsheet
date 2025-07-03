import React, { useState, useContext } from "react";
import { Button, Input, Select, Typography } from "antd";
import { SpreadsheetContext } from "./SpreadsheetContext";

const { Option } = Select;
const { Title } = Typography;

const ManageSidebar: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [mode, setMode] = useState<"row" | "column">("row");
  const { addRow, addColumn, removeRow, removeColumn } =
    useContext(SpreadsheetContext);

  const handleInsertAboveOrLeft = () => {
    if (mode === "row") {
      const index = parseInt(inputValue, 10);
      if (!isNaN(index)) {
        addRow(index - 1, "above");
      }
    } else {
      const index = inputValue.charCodeAt(0) - 65;
      if (index >= 0) {
        addColumn(index, "left");
      }
    }
    setInputValue("");
  };

  const handleInsertBelowOrRight = () => {
    if (mode === "row") {
      const index = parseInt(inputValue, 10);
      if (!isNaN(index)) {
        addRow(index, "below");
      }
    } else {
      const index = inputValue.charCodeAt(0) - 65;
      if (index >= 0) {
        addColumn(index + 1, "right");
      }
    }
    setInputValue("");
  };

  const handleDelete = () => {
    if (mode === "row") {
      const index = parseInt(inputValue, 10);
      if (!isNaN(index)) {
        removeRow(index - 1);
      }
    } else {
      const index = inputValue.charCodeAt(0) - 65;
      if (index >= 0) {
        removeColumn(index);
      }
    }
    setInputValue("");
  };

  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #ddd",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Title level={4}>Manage Rows & Columns</Title>
      <Select
        value={mode}
        onChange={(value) => setMode(value)}
        style={{ width: "100%", marginBottom: "16px" }}
      >
        <Option value="row">Row</Option>
        <Option value="column">Column</Option>
      </Select>
      <Input
        placeholder={
          mode === "row" ? "Enter row number" : "Enter column letter"
        }
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ marginBottom: "16px" }}
      />
      <Button
        type="primary"
        block
        onClick={handleInsertAboveOrLeft}
        style={{ marginBottom: "8px" }}
      >
        Insert {mode === "row" ? "Above" : "Left"}
      </Button>
      <Button
        type="primary"
        block
        onClick={handleInsertBelowOrRight}
        style={{ marginBottom: "8px" }}
      >
        Insert {mode === "row" ? "Below" : "Right"}
      </Button>
      <Button type="default" danger block onClick={handleDelete}>
        Delete {mode === "row" ? "Row" : "Column"}
      </Button>
    </div>
  );
};

export default ManageSidebar;
