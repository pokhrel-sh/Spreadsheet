import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Toolbar from "./components/Toolbar";
import Spreadsheet from "./components/Spreadsheet";
import Auth from "./Auth";
import { SpreadsheetProvider } from "./components/SpreadsheetContext";

const App: React.FC = () => {
  return (
    <SpreadsheetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />

          <Route
            path="/spreadsheet/:routerDocId?"
            element={
              <div style={{ padding: "20px" }}>
                <Toolbar />
                <Spreadsheet />
              </div>
            }
          />
        </Routes>
      </Router>
    </SpreadsheetProvider>
  );
};

export default App;
