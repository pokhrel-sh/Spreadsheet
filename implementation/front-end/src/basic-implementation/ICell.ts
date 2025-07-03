/**
 * Interface representing a cell in a spreadsheet.
 */
export interface ICell {
  /**
   * Evaluates the provided content and assigns it to the cell.
   *
   * @param content - The content to evaluate and assign.
   * @returns The evaluated content as a string.
   */
  evaluate(content: string): string;

  /**
   * Displays the current value of the cell.
   *
   * @returns The cell's value as a string.
   */
  display(): string;

  /**
   * Validates the content of the cell.
   *
   * @returns A boolean indicating whether the cell's content is valid.
   */
  validity(): boolean;

  /**
   * Attaches a dependent cell to the current cell.
   *
   * @param cell - The reference to the dependent cell.
   */
  attach(cell: string): void;

  /**
   * Updates the cell by propagating changes to dependent cells.
   */
  update(): void;

  /**
   * Converts the cell's content into a JSON string representation.
   *
   * @returns A JSON string representing the cell.
   */
  jsonify(): string;

  /**
   * Notifies the cell of changes, allowing it to update its state.
   */
  notify(): void;

  /**
   * Modifies the cell's row position based on a shift and a delimiter.
   *
   * @param shift - The amount to shift the row.
   * @param delimiter - Row number at which a change was made.
   */
  modifyRow(shift: number, delimiter: number): void;

  /**
   * Modifies the cell's column position based on a shift and a delimiter.
   *
   * @param shift - The amount to shift the column.
   * @param delimiter - Column number at which a change was made.
   */
  modifyColumn(shift: number, delimiter: number): void;

  /**
   * Retrieves the list of dependent cells (observers) attached to the current cell.
   *
   * @returns An array of cell references as strings.
   */
  getObserver(): Array<string>;

  /**
   * Sets the list of dependent cells (observers) for the current cell.
   *
   * @param obs - An array of cell references to set as observers.
   */
  setObserver(obs: Array<string>): void;
}
