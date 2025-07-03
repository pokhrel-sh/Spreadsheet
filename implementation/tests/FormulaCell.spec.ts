import { FormulaCell } from "../front-end/src/basic-implementation/FormulaCell";
import { SpreadsheetModel } from "../front-end/src/basic-implementation/SpreadsheetModel";

describe("FormulaCell testing", (): void => {
  let formulaCell: FormulaCell;
  let spreadsheet: SpreadsheetModel;

  beforeEach((): void => {
    formulaCell = new FormulaCell(0, 1);

    spreadsheet = SpreadsheetModel.getInstance();
    spreadsheet.clearAllCells();
    // spreadsheet.updateCell(0, 0, "Hello");
    // spreadsheet.updateCell(1, 1, "World");
    // spreadsheet.updateCell(2, 2, "Yay");
    // spreadsheet.updateCell(5, 5, "REF(A0) + REF(B1) + REF(C2)");
  });

  it("An evaluation of individual numbers should succeed", (): void => {
    const correctFormula = "1";
    expect(formulaCell.evaluate(correctFormula)).toBe("1");
  });

  it("An verification and eval of a basic formula should succeed", (): void => {
    const correctFormula = "1+2+3";
    const actual: string = formulaCell.evaluate(correctFormula);

    expect(formulaCell.validity()).toBe(true);
    expect(actual).toBe("6");
  });

  it("An evaluation of a formula with order of operations should succeed", (): void => {
    const mixedFormula = "1-10+2*6/15*60";
    expect(formulaCell.evaluate(mixedFormula)).toBe("39");
  });

  it("An evaluation of a formula with parenthesis should succeed", (): void => {
    const mixedFormula = "(18 * (1-10+2*6/15*60) - (15 + 12))";
    expect(formulaCell.evaluate(mixedFormula)).toBe("675");
  });

  it("An evaluation of a string formula should succeed", (): void => {
    const stringFormula = "string+wing";
    expect(formulaCell.evaluate(stringFormula)).toBe("stringwing");
  });

  it("A verification and eval of an incorrect string formula should fail", (): void => {
    const incorrectFormula = "String+";
    formulaCell.evaluate(incorrectFormula);
    expect(formulaCell.validity()).toBe(false);
  });

  it("An verification and eval of an incorrect formula should fail", (): void => {
    const incorrectFormula = "%$21";
    formulaCell.evaluate(incorrectFormula);
    expect(formulaCell.validity()).toBe(false);
  });

  it("An evaluation of an incorrect formula should fail", (): void => {
    const incorrectFormula = "1*";
    expect(formulaCell.evaluate(incorrectFormula)).toBe(null);
  });

  it("An evaluation of a formula containing references should succeed", (): void => {
    spreadsheet.updateCell(0, 0, "Hello");
    spreadsheet.updateCell(1, 1, "World");
    spreadsheet.updateCell(2, 2, "Yay");

    const referenceFormula = "REF(A1) + REF(B2) + REF(C3)";
    expect(formulaCell.evaluate(referenceFormula)).toBe("HelloWorldYay");
  });

  it("An evaluation of a formula using relative addressing should succeed", (): void => {
    spreadsheet.updateCell(0, 0, "Hello");
    spreadsheet.updateCell(1, 1, "World");
    spreadsheet.updateCell(2, 2, "Yay");
    spreadsheet.updateCell(5, 5, "REF(A1) + REF(B2) + REF(C3)");

    const referenceFormula = "REF(A1) + REF(B2) + REF(C3)";
    const sheetFormulaCell = spreadsheet.getCell(5, 5);
    expect(sheetFormulaCell.evaluate(referenceFormula)).toBe("HelloWorldYay");

    spreadsheet.addColumn(0);
    expect(sheetFormulaCell.display()).toBe("HelloWorldYay");
  });
});
