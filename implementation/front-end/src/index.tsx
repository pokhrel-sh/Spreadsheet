// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
import App from "./App";
import { loadDataFromLocalStorage } from "./store/spreadsheetSlice";

// Initialize data from localStorage
store.dispatch(loadDataFromLocalStorage());

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
