import { getSocket } from "../utils/socket";
import { CellUtilities } from "./CellUtilities";
import { FormulaCell } from "./FormulaCell";
import { ICell } from "./ICell";
import { NumberCell } from "./NumberCell";
import { RangeCell } from "./RangeCell";
import { StringCell } from "./StringCell";
import { VersionHistory } from "./VersionHistory";

/**
 * Represents the model of the spreadsheet, managing cells, version history, and interactions.
 * Implements the Singleton pattern to ensure only one instance exists throughout the application.
 */
export class SpreadsheetModel {
  /**
   * The single instance of the SpreadsheetModel.
   */
  static spreadsheet: SpreadsheetModel;

  /**
   * The grid representing the spreadsheet cells, organized in rows and columns.
   */
  private grid: Array<Array<ICell>>;

  /**
   * The history manager for tracking versions of the spreadsheet.
   */
  private history: VersionHistory;

  /**
   * Creates an instance of SpreadsheetModel.
   * Initializes the grid with 100 rows and 100 columns, and sets up version history.
   */
  private constructor() {
    this.grid = new Array<Array<ICell>>();
    this.history = new VersionHistory();

    for (let i = 0; i < 100; i++) {
      this.grid.push(new Array<ICell>());
      for (let j = 0; j < 100; j++) {
        this.grid[i].push(null);
      }
    }
  }

  /**
   * Retrieves the single instance of SpreadsheetModel.
   * If an instance does not exist, it creates one.
   *
   * @returns The singleton instance of SpreadsheetModel.
   */
  public static getInstance(): SpreadsheetModel {
    if (SpreadsheetModel.spreadsheet == null) {
      SpreadsheetModel.spreadsheet = new SpreadsheetModel();
      return SpreadsheetModel.spreadsheet;
    } else {
      return SpreadsheetModel.spreadsheet;
    }
  }

  /**
   * Imports data into the spreadsheet model.
   * Supports importing from arrays of objects or objects with array properties.
   * Updates cells and notifies observers accordingly.
   *
   * @param data - The data to import into the spreadsheet.
   * @throws Will throw an error if the data format is unsupported.
   */
  public importData(data: any): void {
    const cells = [];

    if (Array.isArray(data)) {
      const keysSet = new Set<string>();
      for (const obj of data) {
        for (const key in obj) {
          keysSet.add(key);
        }
      }
      const columns = Array.from(keysSet);
      const rows = data.map((obj) => {
        return columns.map((column) =>
          obj.hasOwnProperty(column) ? obj[column] : ""
        );
      });
      const numRows = rows.length + 1;
      const numCols = columns.length;
      this.ensureGridSize(numRows, numCols);
      for (let col = 0; col < columns.length; col++) {
        this.updateCell(0, col, columns[col]);
        cells.push({
          position: [col, 0],
          type: "STRING",
          value: columns[col],
          meta: {},
        });
      }
      for (let row = 0; row < rows.length; row++) {
        for (let col = 0; col < columns.length; col++) {
          const value = rows[row][col];
          this.updateCell(row + 1, col, value.toString());
          cells.push({
            position: [col, row + 1],
            type: "STRING",
            value: value.toString(),
            meta: {},
          });
        }
      }
    } else if (typeof data === "object" && data !== null) {
      const columns = Object.keys(data);
      const lengths = columns.map((key) =>
        Array.isArray(data[key]) ? data[key].length : 0
      );
      const maxLength = Math.max(...lengths);
      for (const key of columns) {
        if (!Array.isArray(data[key])) {
          data[key] = Array(maxLength).fill("");
        } else {
          const arr = data[key];
          while (arr.length < maxLength) {
            arr.push("");
          }
        }
      }
      const rows = [];
      for (let i = 0; i < maxLength; i++) {
        const row = columns.map((key) => data[key][i]);
        rows.push(row);
      }
      const numRows = rows.length + 1;
      const numCols = columns.length;
      this.ensureGridSize(numRows, numCols);
      for (let col = 0; col < columns.length; col++) {
        this.updateCell(0, col, columns[col]);
        cells.push({
          position: [col, 0],
          type: "STRING",
          value: columns[col],
          meta: {},
        });
      }
      for (let row = 0; row < rows.length; row++) {
        for (let col = 0; col < columns.length; col++) {
          const value = rows[row][col];
          this.updateCell(row + 1, col, value.toString());
          cells.push({
            position: [col, row + 1],
            type: "STRING",
            value: value.toString(),
            meta: {},
          });
        }
      }
    } else {
      throw new Error("Unsupported data format");
    }

    // Check if the cells array is not empty
    if (cells.length > 0) {
      console.log("Sending UPDATE message:", {
        type: "UPDATE",
        data: {
          cells: cells,
        },
      });
      // Use socket.emit to update
      getSocket().emit("message", {
        type: "UPDATE",
        data: {
          cells: cells,
        },
      });
    }
  }

  /**
   * Ensures that the grid has at least the specified number of rows and columns.
   * If the grid is smaller, it expands the grid and initializes new cells as StringCells.
   *
   * @param numRows - The minimum number of rows the grid should have.
   * @param numCols - The minimum number of columns the grid should have.
   */
  private ensureGridSize(numRows: number, numCols: number): void {
    const currentRows = this.grid.length;
    if (currentRows < numRows) {
      for (let i = currentRows; i < numRows; i++) {
        const newRow = [];
        for (let j = 0; j < numCols; j++) {
          const cell = new StringCell(i, j);
          cell.evaluate("");
          newRow.push(cell);
        }
        this.grid.push(newRow);
      }
    }
    for (let i = 0; i < this.grid.length; i++) {
      const row = this.grid[i];
      const currentCols = row.length;
      if (currentCols < numCols) {
        for (let j = currentCols; j < numCols; j++) {
          const cell = new StringCell(i, j);
          cell.evaluate("");
          row.push(cell);
        }
      }
    }
  }

  /**
   * Retrieves the cell at the specified row and column.
   *
   * @param row - The row index of the cell.
   * @param col - The column index of the cell.
   * @returns The cell located at the given row and column.
   */
  public getCell(row: number, col: number): ICell {
    return this.grid[row][col];
  }

  /**
   * Clears all cells in the spreadsheet by setting them to null.
   */
  public clearAllCells(): void {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        this.grid[i][j] = null;
      }
    }
  }

  /**
   * Updates the value of a specific cell.
   * Determines the cell type based on the value and evaluates the cell.
   *
   * @param row - The row index of the cell to update.
   * @param col - The column index of the cell to update.
   * @param value - The new value to set in the cell.
   * @returns `true` if the update was successful; otherwise, `false`.
   */
  public updateCell(row: number, col: number, value: string): boolean {
    const operatorRegex = /[+\-/*]/;
    const keywordRegex = /AVERAGE|SUM/;
    const alphabetRegex = /[A-Za-z]/;
    const refRegex = /\bREF\b/;

    const currentSize = this.grid.length;
    const newSize = Math.max(currentSize, row + 1, col + 1);

    if (newSize > currentSize) {
      for (let i = 0; i < currentSize; i++) {
        while (this.grid[i].length < newSize) {
          const j = this.grid[i].length; // Current column index
          this.grid[i].push(null);
        }
      }

      for (let i = currentSize; i < newSize; i++) {
        const newRow = [];
        for (let j = 0; j < newSize; j++) {
          newRow.push(null);
        }
        this.grid.push(newRow);
      }
    }

    let newCell: ICell = null;
    if (operatorRegex.test(value) || refRegex.test(value)) {
      newCell = new FormulaCell(row, col);
    } else if (keywordRegex.test(value)) {
      newCell = new RangeCell(row, col);
    } else if (alphabetRegex.test(value)) {
      newCell = new StringCell(row, col);
    } else {
      newCell = new NumberCell(row, col);
    }

    if (this.grid[row][col] != null) {
      newCell.setObserver(this.grid[row][col].getObserver());
    }
    this.grid[row][col] = newCell;
    const result: string = this.grid[row][col].evaluate(value);
    return result != null;
  }

  /**
   * Adds a new row at the specified index.
   * Shifts existing rows below the index and updates cell references.
   *
   * @param index - The index at which to add the new row.
   */
  public addRow(index: number): void {
    const numColumns = this.grid.length > 0 ? this.grid[0].length : 0;
    const newRow = new Array(numColumns).fill(null);
    this.grid.splice(index, 0, newRow);

    // Iterate from bottom to top to update cell references
    for (let i = this.grid.length - 1; i >= 0; i--) {
      for (let j = 0; j < this.grid[i].length; j++) {
        if (this.grid[i][j]) {
          this.grid[i][j].modifyRow(1, index);
        }
      }
    }
  }

  /**
   * Removes the row at the specified index.
   * Shifts existing rows below the index and updates cell references.
   *
   * @param index - The index of the row to remove.
   * @throws Will throw an error if the index is out of bounds.
   */
  public removeRow(index: number): void {
    if (index >= 0 && index < this.grid.length) {
      this.grid.splice(index, 1);

      // Iterate from bottom to top to update cell references
      for (let i = this.grid.length - 1; i >= 0; i--) {
        for (let j = 0; j < this.grid[i].length; j++) {
          if (this.grid[i][j]) {
            this.grid[i][j].modifyRow(-1, index);
          }
        }
      }
    } else {
      throw new Error("Index out of bounds");
    }
  }

  /**
   * Adds a new column at the specified index.
   * Shifts existing columns to the right and updates cell references.
   *
   * @param index - The index at which to add the new column.
   */
  public addColumn(index: number): void {
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i].splice(index, 0, null);

      for (let j = this.grid[i].length - 1; j >= 0; j--) {
        if (this.grid[i][j]) {
          this.grid[i][j].modifyColumn(1, index);
        }
      }
    }
  }

  /**
   * Removes the column at the specified index.
   * Shifts existing columns to the left and updates cell references.
   *
   * @param index - The index of the column to remove.
   * @throws Will throw an error if the index is out of bounds.
   */
  public removeColumn(index: number): void {
    console.log("deleted column");
    for (let i = 0; i < this.grid.length; i++) {
      if (index >= 0 && index < this.grid[i].length) {
        this.grid[i].splice(index, 1);

        for (let j = this.grid[i].length - 1; j >= 0; j--) {
          if (this.grid[i][j]) {
            this.grid[i][j].modifyColumn(-1, index);
          }
        }
      } else {
        throw new Error("Index out of bounds");
      }
    }
  }

  /**
   * Saves the current state of the spreadsheet as a new version.
   *
   * @param name - The name of the version.
   * @param user - The user who is saving the version.
   * @param datetime - The datetime when the version is saved.
   */
  public saveVersion(name: string, user: string, datetime: string): void {
    this.history.addSnapshot(name, user, datetime, this.grid);
  }

  /**
   * Retrieves all saved versions of the spreadsheet.
   */
  public getVersions(): void {
    this.history.getSnapshots();
  }

  /**
   * Retrieves the current state of the spreadsheet as a two-dimensional array of strings.
   *
   * @returns A two-dimensional array representing the current state of the spreadsheet.
   */
  public getState(): Array<Array<string>> {
    return CellUtilities.exportSheet(this.grid);
  }
}
