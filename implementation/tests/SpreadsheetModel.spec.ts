import { NumberCell } from "../front-end/src/basic-implementation/NumberCell";
import { SpreadsheetModel } from "../front-end/src/basic-implementation/SpreadsheetModel";

describe("SpreadsheetModel testing", (): void => {

  it("Should be able to fetch an instance of SpreadsheetModel", (): void => {
    let model: SpreadsheetModel = SpreadsheetModel.getInstance()
    expect(model).not.toBeNull();
  });

  it("Should be able to successfully add a cell to a SpreadsheetModel", (): void => {
    let model: SpreadsheetModel = SpreadsheetModel.getInstance()
    model.updateCell(0, 0, "");
    expect(model.getCell(0,0)).not.toBeNull();
  });

  it("Should be able to successfully clear a SpreadsheetModel", (): void => {
    let model: SpreadsheetModel = SpreadsheetModel.getInstance()
    model.updateCell(0, 0, "");
    model.clearAllCells();
    expect(model.getCell(0,0)).toBeNull();
  });

  it("Should be able to generate a numerical FormulaCell through a SpreadsheetModel", (): void => {
    let model: SpreadsheetModel = SpreadsheetModel.getInstance()
    model.updateCell(0, 0, "1+1");
    expect(model.getCell(0,0).display()).toBe("2");
    
  });

  it("Should be able to generate a StringCell through a SpreadsheetModel", (): void => {
    let model: SpreadsheetModel = SpreadsheetModel.getInstance()
    model.updateCell(0, 0, "apples");
    expect(model.getCell(0,0).display()).toBe("apples");
    
  });

  it("Should be able to generate a NumberCell through a SpreadsheetModel", (): void => {
    let model: SpreadsheetModel = SpreadsheetModel.getInstance()
    model.updateCell(0, 0, "1");
    expect(model.getCell(0,0).display()).toBe("1");
    
  });

  it("Should be able to generate a string FormulaCell through a SpreadsheetModel", (): void => {
    let model: SpreadsheetModel = SpreadsheetModel.getInstance()
    model.updateCell(0, 0, "apples + apples");
    expect(model.getCell(0,0).display()).toBe("applesapples");
  });

});
