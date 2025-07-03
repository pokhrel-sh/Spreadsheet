// SidebarWithApiInput.tsx
import React, { useContext, useState } from "react";
import "./SidebarWithApiInput.css";
import { SpreadsheetModel } from "./../basic-implementation/SpreadsheetModel"; // Adjust the import path accordingly
import { SpreadsheetContext } from "./SpreadsheetContext";
const SidebarWithApiInput: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<Array<Array<string>>>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [userApiEndpoint, setUserApiEndpoint] = useState<string>("");
  const { setModelVersion } = useContext(SpreadsheetContext);

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
    setFetchedData(null); // Clear previous data
    setSpreadsheetData([]); // Clear previous spreadsheet data
    setError(null); // Clear previous errors
    setUserApiEndpoint(""); // Clear the endpoint input when sidebar is toggled
  };
  const handleEndpointChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setUserApiEndpoint(event.target.value);
  };
  const fetchData = async (): Promise<void> => {
    if (!userApiEndpoint) {
      setError("Please enter a valid API endpoint.");
      return;
    }
    try {
      const response = await fetch(userApiEndpoint, {
        method: "GET", // Adjust to POST or other methods if required
        headers: {
          "Content-Type": "application/json",
          // Add any other headers if required
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setFetchedData(data);
      setError(null);
      // **Import data into the spreadsheet model**
      const spreadsheet = SpreadsheetModel.getInstance();
      spreadsheet.importData(data);
      // **Update the UI to reflect the new data**
      setSpreadsheetData(spreadsheet.getState());
      // **Trigger a re-render of the spreadsheet component**
      setModelVersion((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };
  return (
    <div>
      <button onClick={toggleSidebar} className="button">
        API
      </button>
      {isSidebarOpen && (
        <div className="sidebar">
          <h2>API Endpoint</h2>
          <input
            type="text"
            placeholder="Enter API endpoint URL"
            value={userApiEndpoint}
            onChange={handleEndpointChange}
            className="input"
          />
          <button onClick={fetchData} className="fetch-button">
            Fetch Data
          </button>
          <button onClick={toggleSidebar} className="close-button">
            Close Sidebar
          </button>
          {fetchedData && (
            <div className="result">
              <h3>Fetched Data:</h3>
              <pre>{JSON.stringify(fetchedData, null, 2)}</pre>
            </div>
          )}
          {spreadsheetData.length > 0 && (
            <div className="spreadsheet-container">
              <h3>Spreadsheet Data:</h3>
              <table className="spreadsheet-table">
                <tbody>
                  {spreadsheetData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cellValue, colIndex) => (
                        <td key={colIndex}>{cellValue}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {error && (
            <div className="error">
              <h3>Error:</h3>
              <p>{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default SidebarWithApiInput;
