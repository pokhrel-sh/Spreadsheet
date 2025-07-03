import { CellUtilities } from "./CellUtilities";
import { ICell } from "./ICell";

/**
 * Abstract class representing a generic cell in a spreadsheet.
 * Implements common functionalities shared by all cell types.
 */
export abstract class AbstractCell implements ICell {
  /**
   * The row index of the cell.
   */
  public row: number;

  /**
   * The column index of the cell.
   */
  public column: number;

  /**
   * The value stored in the cell.
   */
  public value: string;

  /**
   * The formula used in the cell.
   */
  public formula: string;

  /**
   * A list of cell references that observe changes in this cell.
   */
  public observers: Array<string>;

  /**
   * Creates a new instance of `AbstractCell`.
   *
   * @param row - The row index of the cell.
   * @param column - The column index of the cell.
   */
  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
    this.observers = new Array<string>();
  }

  /**
   * Attaches a dependent cell to this cell as an observer.
   *
   * @param cell - The reference to the dependent cell.
   */
  attach(cell: string): void {
    if (!this.observers.includes(cell)) {
      this.observers.push(cell);
    }
  }

  /**
   * Modifies the row index of the cell and its observers based on a shift and delimiter.
   *
   * @param shift - The amount to shift the row index.
   * @param delimiter - The delimiter to determine affected rows.
   */
  modifyRow(shift: number, delimiter: number): void {
    if (shift > 0 && this.row >= delimiter) {
      this.row += shift;
    } else if (shift < 0 && this.row > delimiter) {
      this.row += shift;
    }

    for (let i = 0; i < this.observers.length; i++) {
      const indices = CellUtilities.convertReference(this.observers[i]);
      let observerRow = indices[0];

      if (shift > 0 && observerRow >= delimiter) {
        observerRow += shift;
      } else if (shift < 0 && observerRow > delimiter) {
        observerRow += shift;
      }

      indices[0] = observerRow;
      this.observers[i] = CellUtilities.deconvertReference(
        indices[0],
        indices[1]
      );
    }
  }

  /**
   * Modifies the column index of the cell and its observers based on a shift and delimiter.
   *
   * @param shift - The amount to shift the column index.
   * @param delimiter - The delimiter to determine affected columns.
   */
  modifyColumn(shift: number, delimiter: number): void {
    if (shift > 0 && this.column >= delimiter) {
      this.column += shift;
    } else if (shift < 0 && this.column > delimiter) {
      this.column += shift;
    }

    for (let i = 0; i < this.observers.length; i++) {
      const indices = CellUtilities.convertReference(this.observers[i]);
      let observerColumn = indices[1];

      if (shift > 0 && observerColumn >= delimiter) {
        observerColumn += shift;
      } else if (shift < 0 && observerColumn > delimiter) {
        observerColumn += shift;
      }

      indices[1] = observerColumn;
      this.observers[i] = CellUtilities.deconvertReference(
        indices[0],
        indices[1]
      );
    }
  }

  /**
   * Updates the cell and propagates changes to dependent cells.
   * Abstract method to be implemented by subclasses.
   */
  abstract update(): void;

  /**
   * Evaluates the provided content and assigns it to the cell.
   * Abstract method to be implemented by subclasses.
   *
   * @param content - The content to evaluate.
   * @returns The evaluated content as a string.
   */
  abstract evaluate(content: string): string;

  /**
   * Displays the current value of the cell.
   * Abstract method to be implemented by subclasses.
   *
   * @returns The cell's value as a string.
   */
  abstract display(): string;

  /**
   * Validates the content of the cell.
   * Abstract method to be implemented by subclasses.
   *
   * @returns A boolean indicating whether the cell's content is valid.
   */
  abstract validity(): boolean;

  /**
   * Notifies the cell of changes and triggers necessary updates.
   * Abstract method to be implemented by subclasses.
   */
  abstract notify(): void;

  /**
   * Converts the cell's data into a JSON string representation.
   * Abstract method to be implemented by subclasses.
   *
   * @returns A JSON string representing the cell's data.
   */
  abstract jsonify(): string;

  /**
   * Sets the list of observers for the cell.
   *
   * @param obs - An array of cell references to set as observers.
   */
  setObserver(obs: Array<string>): void {
    this.observers = obs;
  }

  /**
   * Retrieves the list of observers attached to the cell.
   *
   * @returns An array of cell references observing this cell.
   */
  getObserver(): Array<string> {
    return this.observers;
  }
}
