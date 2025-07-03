import { ICell } from "./ICell";

/**
 * Utility class for handling cell references and spreadsheet-related operations.
 */
export class CellUtilities {
  /**
   * Converts a row and column index into a spreadsheet cell reference (e.g., A1).
   *
   * @param row - The zero-based row index.
   * @param col - The zero-based column index.
   * @returns The cell reference as a string (e.g., "A1").
   */
  public static deconvertReference(row: number, col: number): string {
    let result = "";

    while (row >= 0) {
      const remainder: number = row % 26;
      result = String.fromCharCode(remainder + "A".charCodeAt(0)) + result;
      row = Math.floor(row / 26) - 1;
      if (row < 0) break;
    }

    return result + col;
  }

  /**
   * Converts a spreadsheet cell reference (e.g., A1) into row and column indices.
   *
   * @param ref - The cell reference as a string.
   * @returns A tuple containing the column index and row index.
   */
  public static convertReference(ref: string): [number, number] {
    const alphabet = this.generateAlphabetMap();

    const { letters, numbers } = this.splitCellReference(ref);

    const columnIndex = this.calculateColumnIndex(letters, alphabet);

    const rowIndex = parseInt(numbers, 10);

    return [columnIndex, rowIndex];
  }

  /**
   * Generates a map of alphabet letters to their zero-based indices (A = 0, B = 1, etc.).
   *
   * @returns A map where keys are letters and values are their indices.
   */
  private static generateAlphabetMap(): Map<string, number> {
    const alphabet = new Map<string, number>();
    for (let i = 0; i < 26; i++) {
      alphabet.set(String.fromCharCode(65 + i), i);
    }
    return alphabet;
  }

  /**
   * Splits a cell reference (e.g., A1) into its letter and number components.
   *
   * @param cellRef - The cell reference as a string.
   * @returns An object containing `letters` (e.g., "A") and `numbers` (e.g., "1").
   */
  private static splitCellReference(cellRef: string): {
    letters: string;
    numbers: string;
  } {
    const pattern = /^([A-Z]+)(\d+)$/;
    const match: RegExpMatchArray = cellRef.match(pattern)!; // non-null assertion since validation is assumed
    return { letters: match[1], numbers: match[2] };
  }

  /**
   * Calculates the column index from a sequence of letters (e.g., A = 0, B = 1, AA = 26).
   *
   * @param letters - The letters representing the column in the cell reference.
   * @param alphabet - A map of letters to their zero-based indices.
   * @returns The zero-based column index.
   */
  private static calculateColumnIndex(
    letters: string,
    alphabet: Map<string, number>
  ): number {
    let index = 0;
    for (let i = 0; i < letters.length; i++) {
      index = index * 26 + (alphabet.get(letters[i]) ?? 0);
    }
    return index;
  }

  /**
   * Exports a grid of cells into a 2D array of JSON strings representing the cells.
   *
   * @param referenceGrid - A 2D array of ICells
   * @returns A 2D array of JSON strings representing the spreadsheet cells.
   */
  public static exportSheet(
    referenceGrid: Array<Array<ICell>>
  ): Array<Array<string>> {
    const tempGrid: Array<Array<string>> = referenceGrid.map((row) =>
      row.map(() => null)
    );

    for (let i = 0; i < referenceGrid.length; i++) {
      for (let j = 0; j < referenceGrid.at(i).length; j++) {
        const currValue: ICell = referenceGrid[i][j];
        if (currValue == null) {
          tempGrid[i][j] = null;
        } else {
          tempGrid[i][j] = currValue.jsonify();
        }
      }
    }

    return tempGrid;
  }
}
