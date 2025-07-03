import { RangeCell } from "../front-end/src/basic-implementation/RangeCell";
import { SpreadsheetModel } from "../front-end/src/basic-implementation/SpreadsheetModel";

describe("RangeCell testing", (): void => {
  let rangeCell: RangeCell;
  let spreadsheet: SpreadsheetModel;

  beforeEach((): void => {
    rangeCell = new RangeCell(0, 0);
    spreadsheet = SpreadsheetModel.getInstance();
    spreadsheet.clearAllCells();
    // spreadsheet.updateCell(2, 2, "10");
    // spreadsheet.updateCell(1, 2, "3");
    // spreadsheet.updateCell(3, 8, "11");
    // spreadsheet.updateCell(20, 19, "1000");
    // spreadsheet.updateCell(4, 3, "REF(U19)");

    // spreadsheet.updateCell(23, 23, "Incompatible");
  });

  it("An evaluation of a basic SUM should succeed", (): void => {
    spreadsheet.updateCell(0, 0, "10");
    spreadsheet.updateCell(1, 0, "10");
    const correctRange = "SUM(A1..A2)";
    expect(rangeCell.evaluate(correctRange)).toBe("20");
  });

  it("An evaluation of a basic SUM containing references should succeed", (): void => {
    spreadsheet.updateCell(0, 0, "10");
    spreadsheet.updateCell(1, 0, "10");
    spreadsheet.updateCell(2, 0, "REF(A1)");
    const correctRange = "SUM(A1..A3)";
    expect(rangeCell.evaluate(correctRange)).toBe("30");
  });

  it("An evaluation of a basic SUM containing invalid content should fail", (): void => {
    spreadsheet.updateCell(0, 0, "10");
    spreadsheet.updateCell(1, 0, "10");
    spreadsheet.updateCell(2, 0, "Incompatible");
    const correctRange = "SUM(A1..A3)";
    expect(rangeCell.evaluate(correctRange)).toBe(null);
  });

  it("An evaluation of a basic AVERAGE should succeed", (): void => {
    spreadsheet.updateCell(0, 0, "10");
    spreadsheet.updateCell(1, 0, "10");
    const correctRange = "AVERAGE(A1..A2)";
    expect(rangeCell.evaluate(correctRange)).toBe("10");
  });

  it("An evaluation of a basic AVERAGE containing references succeed", (): void => {
    spreadsheet.updateCell(0, 0, "10");
    spreadsheet.updateCell(1, 0, "10");
    spreadsheet.updateCell(2, 0, "REF(A1)");
    const correctRange = "AVERAGE(A1..A3)";
    expect(rangeCell.evaluate(correctRange)).toBe("10");
  });

  it("An evaluation of a basic AVERAGE containing invalid content should fail", (): void => {
    spreadsheet.updateCell(0, 0, "10");
    spreadsheet.updateCell(1, 0, "10");
    spreadsheet.updateCell(2, 0, "Incompatible");
    const correctRange = "AVERAGE(A1..A3)";
    expect(rangeCell.evaluate(correctRange)).toBe(null);
  });

  it("An evaluation of a basic SUM with relative addressing (column) should succeed", (): void => {
    spreadsheet.updateCell(0, 0, "10");
    spreadsheet.updateCell(1, 0, "10");
    const correctRange = "SUM(A1..A2)";

    spreadsheet.updateCell(80, 80, correctRange);
    const sheetFormulaCell = spreadsheet.getCell(80, 80);
    expect(sheetFormulaCell.evaluate(correctRange)).toBe("20");

    spreadsheet.addColumn(0);
    expect(sheetFormulaCell.display()).toBe("20");
  });

  it("An evaluation of a basic SUM with relative addressing (row) should succeed", (): void => {
    spreadsheet.updateCell(0, 0, "10");
    spreadsheet.updateCell(1, 0, "10");
    const correctRange = "SUM(A1..A2)";


    spreadsheet.updateCell(80, 80, correctRange);
    const sheetFormulaCell = spreadsheet.getCell(80, 80);
    expect(sheetFormulaCell.evaluate(correctRange)).toBe("20");

    spreadsheet.addRow(0);
    expect(sheetFormulaCell.display()).toBe("20");
  });

  it("An evaluation of a basic AVERAGE with relative addressing (column) should succeed", (): void => {
    spreadsheet.updateCell(0, 0, "10");
    spreadsheet.updateCell(1, 0, "10");
    const correctRange = "AVERAGE(A1..A2)";

    spreadsheet.updateCell(80, 80, correctRange);
    const sheetFormulaCell = spreadsheet.getCell(80, 80);
    expect(sheetFormulaCell.evaluate(correctRange)).toBe("10");

    spreadsheet.addColumn(0);
    expect(sheetFormulaCell.display()).toBe("10");
  });

  it("An evaluation of a basic AVERAGE with relative addressing (row) should succeed", (): void => {
    spreadsheet.updateCell(0, 0, "10");
    spreadsheet.updateCell(1, 0, "10");
    const correctRange = "AVERAGE(A1..A2)";

    spreadsheet.updateCell(80, 80, correctRange);
    const sheetFormulaCell = spreadsheet.getCell(80, 80);
    expect(sheetFormulaCell.evaluate(correctRange)).toBe("10");

    spreadsheet.addRow(0);
    expect(sheetFormulaCell.display()).toBe("10");
  });
});
