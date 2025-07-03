/**
 * Convert column letter to number
 * @param column letter of column
 * @returns number of column
 */
export const convertColumnToNumber = (column: string) => {
  const columnNumber = column.toUpperCase().charCodeAt(0) - 65;
  if (columnNumber < 0 || columnNumber > 25) {
    throw new Error("Invalid column");
  }
  return columnNumber;
};

/**
 * Convert number to column letter
 * @param number number of column
 * @returns letter of column
 */
export const convertNumberToColumn = (number: number) => {
  if (number < 0 || number > 25) {
    throw new Error("Invalid number");
  }
  return String.fromCharCode(number + 65);
};
