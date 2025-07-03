import { AbstractCell } from "./AbstractCell";
import { Calculator } from "./Calculator";
import { CellUtilities } from "./CellUtilities";
import { ICell } from "./ICell";
import { SpreadsheetModel } from "./SpreadsheetModel";

/**
 * Represents a cell containing a formula within the spreadsheet.
 */
export class FormulaCell extends AbstractCell {
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

    this.formula = this.formula.replace(
      /REF\(([A-Z]+[0-9]+)\)/gi,
      (match, cellRef) => {
        const indices = CellUtilities.convertReference(cellRef);
        const refRow = indices[1];
        let refColumn = indices[0] - 1;

        // Determine if the column index needs to be adjusted
        let columnAdjusted = false;
        if (shift > 0 && refColumn >= delimiter) {
          refColumn += shift;
          columnAdjusted = true;
        } else if (shift < 0 && refColumn > delimiter) {
          refColumn += shift;
          columnAdjusted = true;
        }

        // If the column was adjusted, update the cell reference
        if (columnAdjusted) {
          const newCellRef = CellUtilities.deconvertReference(
            refColumn + 1,
            refRow
          );
          return `REF(${newCellRef})`;
        } else {
          return match; // No adjustment needed, return the original match
        }
      }
    );
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
    this.formula = this.formula.replace(
      /REF\(([A-Z]+[0-9]+)\)/gi,
      (match, cellRef) => {
        const indices = CellUtilities.convertReference(cellRef);
        let refRow = indices[1];
        const refColumn = indices[0] - 1;

        // Determine if the row index needs to be adjusted
        let rowAdjusted = false;
        if (shift > 0 && refRow >= delimiter) {
          refRow += shift;
          rowAdjusted = true;
        } else if (shift < 0 && refRow > delimiter) {
          refRow += shift;
          rowAdjusted = true;
        }

        // If the row was adjusted, update the cell reference
        if (rowAdjusted) {
          const newCellRef = CellUtilities.deconvertReference(
            refColumn + 1,
            refRow
          );
          return `REF(${newCellRef})`;
        } else {
          return match; // No adjustment needed, return the original match
        }
      }
    );
  }

  /**
   * Evaluates the cell's formula and updates its value.
   *
   * @param content - The formula content to evaluate.
   * @returns The evaluated value of the formula as a string.
   */
  evaluate(content: string): string {
    this.formula = content;

    const strippedContent: string = content.replace(/\s+/g, "");
    const tokenRegex = /REF\([A-Za-z0-9]+\)|[+\-/*()]|\d+(\.\d+)?|[A-Za-z]+/g;
    const tokens = strippedContent.match(tokenRegex);
    const refReplaced: Array<string> = new Array<string>();
    const alphabeticalRegex = /[a-zA-Z]/;

    let stringFlag = false;

    for (let i = 0; i < tokens.length; i++) {
      const pattern = /^REF\([A-Za-z0-9]+\)$/;
      let token: string = tokens[i];

      if (pattern.test(token)) {
        // Extract the cell reference from REF(...)
        token = token.slice(4, -1);
        const indicies: [number, number] =
          CellUtilities.convertReference(token);
        const refCell: ICell = SpreadsheetModel.getInstance().getCell(
          indicies[1] - 1,
          indicies[0]
        );

        refCell.attach(CellUtilities.deconvertReference(this.row, this.column));

        token = refCell.display();
        refReplaced.push(token);
      } else {
        refReplaced.push(token);
      }

      stringFlag = stringFlag || alphabeticalRegex.test(token);
    }

    const preprocessedExpression: string = refReplaced.join("");
    this.formula = preprocessedExpression;

    if (!this.validity()) {
      this.value = null;
      this.update();
      return this.value;
    }

    this.formula = content;

    if (stringFlag) {
      this.value = Calculator.evaluate_string(
        preprocessedExpression
      ).toString();
      this.update();
      return this.value;
    } else {
      this.value = Calculator.evaluate_numerical(
        preprocessedExpression
      ).toString();
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
   * Validates the cell's formula to ensure it is syntactically correct.
   *
   * @returns `true` if the formula is valid; otherwise, `false`.
   */
  validity(): boolean {
    // Remove all whitespace for easier processing
    const expression = this.formula.replace(/\s+/g, "");

    // Tokenize the expression
    const tokens = this.tokenize(expression);

    if (!tokens) {
      return false; // Invalid tokens detected
    }

    // Check for matching parentheses
    if (!this.hasMatchingParentheses(tokens)) {
      return false;
    }

    // Validate the sequence of tokens
    if (!this.isValidTokenSequence(tokens)) {
      return false;
    }

    return true;
  }

  /**
   * Tokenizes the given expression into an array of tokens.
   *
   * @param expression - The mathematical expression to tokenize.
   * @returns An array of tokens or `null` if invalid tokens are detected.
   */
  private tokenize(expression: string): string[] | null {
    const tokens: string[] = [];
    const operatorRegex = /^[+\-*/]$/;
    let i = 0;

    while (i < expression.length) {
      const char = expression[i];

      if (char === "(" || char === ")") {
        tokens.push(char);
        i++;
      } else if (operatorRegex.test(char)) {
        tokens.push(char);
        i++;
      } else if (/[a-zA-Z0-9.\-+]/.test(char)) {
        let value = "";
        // Collect a number or string
        while (
          i < expression.length &&
          /[a-zA-Z0-9.\-+]/.test(expression[i]) &&
          !operatorRegex.test(expression[i]) &&
          expression[i] !== "(" &&
          expression[i] !== ")"
        ) {
          value += expression[i];
          i++;
        }
        if (value.length > 0) {
          tokens.push(value);
        } else {
          return null; // Invalid token detected
        }
      } else {
        return null; // Invalid character detected
      }
    }
    return tokens;
  }

  /**
   * Checks whether the tokens have matching parentheses.
   *
   * @param tokens - The array of tokens to check.
   * @returns `true` if all parentheses are matched; otherwise, `false`.
   */
  private hasMatchingParentheses(tokens: string[]): boolean {
    const stack: string[] = [];
    for (const token of tokens) {
      if (token === "(") {
        stack.push(token);
      } else if (token === ")") {
        if (stack.length === 0 || stack.pop() !== "(") {
          return false; // Unmatched closing parenthesis
        }
      }
    }
    return stack.length === 0; // Ensure no unmatched opening parentheses remain
  }

  /**
   * Validates the sequence of tokens to ensure they form a valid expression.
   *
   * @param tokens - The array of tokens to validate.
   * @returns `true` if the token sequence is valid; otherwise, `false`.
   */
  private isValidTokenSequence(tokens: string[]): boolean {
    const operatorRegex = /^[+\-*/]$/;
    const numberRegex = /^[-+]?\d+(\.\d+)?$/;
    const stringRegex = /^[a-zA-Z]+$/;
    let expectTerm = true;
    let previousTokenType: "number" | "string" | null = null;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token === "(") {
        if (!expectTerm) {
          return false; // Misplaced '('
        }
        expectTerm = true;
        previousTokenType = null;
      } else if (token === ")") {
        if (expectTerm) {
          return false; // Empty parentheses or operator before ')'
        }
        expectTerm = false;
        previousTokenType = null;
      } else if (operatorRegex.test(token)) {
        if (expectTerm) {
          return false; // Operator cannot come before a term
        }

        // Enforce that strings can only be combined using '+'
        if (previousTokenType === "string") {
          if (token !== "+") {
            return false; // Invalid operator for strings
          }
        }

        expectTerm = true;
        previousTokenType = null;
      } else if (numberRegex.test(token)) {
        if (!expectTerm) {
          return false; // Term cannot come after a term without an operator
        }
        expectTerm = false;
        previousTokenType = "number";
      } else if (stringRegex.test(token)) {
        if (!expectTerm) {
          return false; // Term cannot come after a term without an operator
        }
        expectTerm = false;
        previousTokenType = "string";
      } else {
        return false; // Invalid token detected
      }
    }

    return !expectTerm; // Should end with a term, not expecting a new term
  }
}
