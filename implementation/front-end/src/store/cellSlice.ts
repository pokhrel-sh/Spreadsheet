// src/store/cellSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CellData {
  value: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
}

interface CellState {
  data: CellData[][]; // A 2D array to represent the grid of cells
  history: CellData[][][];
  future: CellData[][][];
}

// Initial state with an empty 100x20 grid
const initialState: CellState = {
  data: Array.from({ length: 100 }, () =>
    Array.from({ length: 20 }, () => ({
      value: "",
    }))
  ),
  history: [],
  future: [],
};

const cellSlice = createSlice({
  name: "cell",
  initialState,
  reducers: {
    updateCellValue: (
      state,
      action: PayloadAction<{
        rowIndex: number;
        colIndex: number;
        value: string;
      }>
    ) => {
      const { rowIndex, colIndex, value } = action.payload;
      state.history.push(JSON.parse(JSON.stringify(state.data)));
      state.data[rowIndex][colIndex].value = value;
      state.future = [];
    },
    toggleBold: (
      state,
      action: PayloadAction<{ rowIndex: number; colIndex: number }>
    ) => {
      const { rowIndex, colIndex } = action.payload;
      const cell = state.data[rowIndex][colIndex];
      cell.bold = !cell.bold;
    },
    toggleItalic: (
      state,
      action: PayloadAction<{ rowIndex: number; colIndex: number }>
    ) => {
      const { rowIndex, colIndex } = action.payload;
      const cell = state.data[rowIndex][colIndex];
      cell.italic = !cell.italic;
    },
    toggleStrikethrough: (
      state,
      action: PayloadAction<{ rowIndex: number; colIndex: number }>
    ) => {
      const { rowIndex, colIndex } = action.payload;
      const cell = state.data[rowIndex][colIndex];
      cell.strikethrough = !cell.strikethrough;
    },
    toggleUnderline: (
      state,
      action: PayloadAction<{ rowIndex: number; colIndex: number }>
    ) => {
      const { rowIndex, colIndex } = action.payload;
      const cell = state.data[rowIndex][colIndex];
      cell.underline = !cell.underline;
    },
  },
});

export const {
  updateCellValue,
  toggleBold,
  toggleItalic,
  toggleStrikethrough,
  toggleUnderline,
} = cellSlice.actions;
export default cellSlice.reducer;
