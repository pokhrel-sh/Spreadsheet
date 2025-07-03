import { AbstractCell } from "./AbstractCell";
import { Calculator } from "./Calculator";
import { CellUtilities } from "./CellUtilities";
import { ICell } from "./ICell";
import { SpreadsheetModel } from "./SpreadsheetModel";

/**
 * Represents a cell that contains a range-based formula (e.g., SUM, AVERAGE) within a spreadsheet model.
 * Extends the {@link AbstractCell} class to provide range-specific functionality.
 */
export class RangeCell extends AbstractCell {
  /**
   * Converts the cell's formula and value into a JSON string.
   *
   * @returns A JSON string representation of the cell.
   */
  jsonify(): string {
    const jsonObject = {
      formula: this.formula,
      value: this.value,
    };
    return JSON.stringify(jsonObject);
  }

  /**
   * Notifies the cell to evaluate its formula.
   */
  notify(): void {
    this.evaluate(this.formula);
  }

  /**
   * Updates all observer cells that depend on this cell.
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
   * Modifies the row index of the cell and its observers based on the given shift and delimiter.
   *
   * @param shift - The number of rows to shift. Positive to move down, negative to move up.
   * @param delimiter - The row index at which the shift starts.
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

    // Adjust references in this.formula
    const { expression, firstRef, secondRef } = this.parseExpression(
      this.formula
    );

    // Convert references to indices
    const indicesFirst = CellUtilities.convertReference(firstRef);
    const indicesSecond = CellUtilities.convertReference(secondRef);

    // Adjust row indices for the first reference
    if (shift > 0 && indicesFirst[0] >= delimiter) {
      indicesFirst[0] += shift;
    } else if (shift < 0 && indicesFirst[0] > delimiter) {
      indicesFirst[0] += shift;
    }

    // Adjust row indices for the second reference
    if (shift > 0 && indicesSecond[0] >= delimiter) {
      indicesSecond[0] += shift;
    } else if (shift < 0 && indicesSecond[0] > delimiter) {
      indicesSecond[0] += shift;
    }

    // Update the formula with new references
    const newFirstRef = CellUtilities.deconvertReference(
      indicesFirst[0],
      indicesFirst[1]
    );
    const newSecondRef = CellUtilities.deconvertReference(
      indicesSecond[0],
      indicesSecond[1]
    );
    this.formula = `${expression}(${newFirstRef}..${newSecondRef})`;
  }

  /**
   * Modifies the column index of the cell and its observers based on the given shift and delimiter.
   *
   * @param shift - The number of columns to shift. Positive to move right, negative to move left.
   * @param delimiter - The column index at which the shift starts.
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

    const { expression, firstRef, secondRef } = this.parseExpression(
      this.formula
    );

    // Convert references to indices
    const indicesFirst = CellUtilities.convertReference(firstRef);
    const indicesSecond = CellUtilities.convertReference(secondRef);

    // Adjust column indices for the first reference
    if (shift > 0 && indicesFirst[1] >= delimiter) {
      indicesFirst[1] += shift;
    } else if (shift < 0 && indicesFirst[1] > delimiter) {
      indicesFirst[1] += shift;
    }

    // Adjust column indices for the second reference
    if (shift > 0 && indicesSecond[1] >= delimiter) {
      indicesSecond[1] += shift;
    } else if (shift < 0 && indicesSecond[1] > delimiter) {
      indicesSecond[1] += shift;
    }

    // Update the formula with new references
    const newFirstRef = CellUtilities.deconvertReference(
      indicesFirst[0],
      indicesFirst[1]
    );
    const newSecondRef = CellUtilities.deconvertReference(
      indicesSecond[0],
      indicesSecond[1]
    );
    this.formula = `${expression}(${newFirstRef}..${newSecondRef})`;
  }

  /**
   * Evaluates the cell's formula and updates its value based on the range expression.
   *
   * @param content - The formula content to evaluate.
   * @returns The evaluated value of the formula as a string.
   */
  evaluate(content: string): string {
    this.formula = content;
    if (!this.validity()) {
      this.value = null;
      this.update();
      return this.value;
    } else {
      const output: number = this.calculateRangeExpression();
      if (isNaN(output)) {
        this.value = null;
      } else {
        this.value = output.toString();
      }
      this.update();
      return this.value;
    }
  }

  /**
   * Returns the current value of the cell for display purposes.
   *
   * @returns The cell's value as a string.
   */
  display(): string {
    return this.value;
  }

  /**
   * Validates the cell's formula to ensure it matches the expected range expression pattern.
   *
   * @returns `true` if the formula is valid; otherwise, `false`.
   */
  validity(): boolean {
    const pattern = /^(SUM|AVERAGE)\([A-Z]+\d+\.\.[A-Z]+\d+\)$/;
    return pattern.test(this.formula);
  }

  /**
   * Calculates the result of the range expression (e.g., SUM or AVERAGE) based on the specified range.
   *
   * @returns The numerical result of the range expression.
   */
  private calculateRangeExpression(): number {
    const {
      expression,
      firstRef,
      secondRef,
    }: { expression: string; firstRef: string; secondRef: string } =
      this.parseExpression(this.formula);

    const indexRefOne: [number, number] =
      CellUtilities.convertReference(firstRef);
    const indexRefTwo: [number, number] =
      CellUtilities.convertReference(secondRef);

    const valuesArray: number[] = this.collectValues(
      indexRefOne[0],
      indexRefTwo[0],
      Math.min(indexRefOne[1] - 1, indexRefTwo[1] - 1),
      Math.max(indexRefOne[1] - 1, indexRefTwo[1] - 1)
    );

    const result: number =
      expression === "AVERAGE"
        ? Calculator.average(valuesArray)
        : Calculator.sum(valuesArray);
    return result;
  }

  /**
   * Parses the formula to extract the expression type and the two cell references defining the range.
   *
   * @param value - The formula string to parse.
   * @returns An object containing the expression type and the two cell references.
   */
  private parseExpression(value: string): {
    expression: string;
    firstRef: string;
    secondRef: string;
  } {
    const pattern = /^(SUM|AVERAGE)\(([A-Z]+\d+)\.\.([A-Z]+\d+)\)$/;
    const match: RegExpMatchArray = value.match(pattern)!; // non-null assertion since validation is assumed
    return { expression: match[1], firstRef: match[2], secondRef: match[3] };
  }

  /**
   * Collects numerical values from the specified range of cells.
   *
   * @param startIndex - The starting column index of the range.
   * @param endIndex - The ending column index of the range.
   * @param startRow - The starting row index of the range.
   * @param endRow - The ending row index of the range.
   * @returns An array of numerical values from the specified cell range.
   */
  private collectValues(
    startIndex: number,
    endIndex: number,
    startRow: number,
    endRow: number
  ): number[] {
    const pattern = /^REF\([A-Za-z0-9]+\)$/;
    const valuesArray: number[] = [];
    const spreadsheetInstance = SpreadsheetModel.getInstance();

    for (let col = startIndex; col <= endIndex; col++) {
      for (let row = startRow; row <= endRow; row++) {
        const cellInstance: ICell = spreadsheetInstance.getCell(row, col);
        let cellValue: string = null;
        if (cellInstance != null) {
          cellValue = cellInstance.display();
        }

        if (cellValue == null) {
          valuesArray.push(0);
        } else if (pattern.test(cellValue)) {
          cellValue = cellValue.slice(4, -1);
          const indicies: [number, number] =
            CellUtilities.convertReference(cellValue);
          const refCell: ICell = SpreadsheetModel.getInstance().getCell(
            indicies[0],
            indicies[1]
          );

          cellValue = refCell.display();
          valuesArray.push(parseInt(cellValue, 10));
        } else {
          valuesArray.push(parseInt(cellValue, 10));
        }

        const refCell: ICell = SpreadsheetModel.getInstance().getCell(row, col);
        refCell.attach(CellUtilities.deconvertReference(this.row, this.column));
      }
    }
    return valuesArray;
  }
}
