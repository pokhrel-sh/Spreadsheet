import { StringCell } from "../front-end/src/basic-implementation/StringCell";

describe("StringCell testing", (): void => {
  let stringCell: StringCell;

  beforeEach((): void => {
    stringCell = new StringCell(0, 0);
  });

  it("Should be able to successfully evaluate a StringCell", (): void => {
    const string = "Hello";
    expect(stringCell.evaluate(string)).toBe("Hello");
  });

  it("Should be able to successfully validate a StringCell", (): void => {
    const string = "World!";
    stringCell.evaluate(string);
    expect(stringCell.validity()).toBe(true);
  });
});
