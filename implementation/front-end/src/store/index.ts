import { configureStore } from "@reduxjs/toolkit";
import spreadsheetReducer from "./spreadsheetSlice";
import cellReducer from "./cellSlice";

const store = configureStore({
  reducer: {
    spreadsheet: spreadsheetReducer,
    cell: cellReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
