// src/store/spreadsheetSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SpreadsheetState {
  data: string[][]; // Current spreadsheet data as a 2D array
  history: string[][][]; // History stack for undo functionality
  future: string[][][]; // Future stack for redo functionality
}

// Initialize state with an empty 100x20 grid
const initialState: SpreadsheetState = {
  data: Array.from({ length: 100 }, () => Array(20).fill("")),
  history: [],
  future: [],
};

const spreadsheetSlice = createSlice({
  name: "spreadsheet",
  initialState,
  reducers: {
    // Update data, push the current state to history, and clear future stack
    updateData: (state, action: PayloadAction<string[][]>) => {
      state.history.push(JSON.parse(JSON.stringify(state.data)));
      state.data = action.payload;
      state.future = [];
      localStorage.setItem("spreadsheetData", JSON.stringify(state.data)); // Save to localStorage
    },

    // Undo the last action by restoring the previous state from history
    undo: (state) => {
      if (state.history.length > 0) {
        state.future.push(JSON.parse(JSON.stringify(state.data))); // Push current to future
        state.data = state.history.pop()!; // Restore previous state
        localStorage.setItem("spreadsheetData", JSON.stringify(state.data)); // Save to localStorage
      }
    },

    // Redo the last undone action by restoring the next state from future
    redo: (state) => {
      if (state.future.length > 0) {
        state.history.push(JSON.parse(JSON.stringify(state.data))); // Push current to history
        state.data = state.future.pop()!; // Restore next state
        localStorage.setItem("spreadsheetData", JSON.stringify(state.data)); // Save to localStorage
      }
    },

    // Load data from localStorage when the app starts
    loadDataFromLocalStorage: (state) => {
      const savedData = localStorage.getItem("spreadsheetData");
      if (savedData) {
        state.data = JSON.parse(savedData);
      }
    },
  },
});

export const { updateData, undo, redo, loadDataFromLocalStorage } =
  spreadsheetSlice.actions;
export default spreadsheetSlice.reducer;
