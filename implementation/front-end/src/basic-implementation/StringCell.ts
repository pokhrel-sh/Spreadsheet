import { AbstractCell } from "./AbstractCell";
import { CellUtilities } from "./CellUtilities";
import { SpreadsheetModel } from "./SpreadsheetModel";

/**
 * A class representing a string-based spreadsheet cell.
 */
export class StringCell extends AbstractCell {
  /**
   * Converts the cell's formula and value into a JSON string representation.
   *
   * @returns A JSON string containing the cell's formula and value.
   */
  jsonify(): string {
    const jsonObject = {
      formula: this.value,
      value: this.value,
    };
    return JSON.stringify(jsonObject);
  }

  /**
   * Updates all cells which are subscribed to this cell, and are thus dependent on it.
   */
  update(): void {
    for (let i = 0; i < this.observers.length; i++) {
      const location: Array<number> = CellUtilities.convertReference(
        this.observers.at(i)
      );
      SpreadsheetModel.getInstance().getCell(location[0], location[1]).notify();
    }
  }

  /**
   * Notifies the cell, updating its value.
   *
   * String cells cannot rely on another cell, and will not be updated.
   */
  notify(): void {
    this.value = this.value;
  }

  /**
   * Evaluates the provided content and assigns it as the cell's value.
   *
   * @param content - The content to evaluate and assign to the cell.
   * @returns The evaluated value as a string.
   */
  evaluate(content: string): string {
    this.value = content;
    return this.value;
  }

  /**
   * Displays the cell's current value.
   *
   * @returns The cell's value as a string.
   */
  display(): string {
    return this.value;
  }

  /**
   * Validates the content of the cell. All strings are considered to be valid.
   *
   * @returns A boolean indicating the cell's validity (always true for `StringCell`).
   */
  validity(): boolean {
    return true;
  }
}
