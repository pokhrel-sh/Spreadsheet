import { NumberCell } from "../front-end/src/basic-implementation/NumberCell";

describe("NumberCell testing", (): void => {
  let numberCell: NumberCell;

  beforeEach((): void => {
    numberCell = new NumberCell(0, 0);
  });

  it("Should be able to successfully evaluate a NumberCell", (): void => {
    const number = "54";
    expect(numberCell.evaluate(number)).toBe("54");
  });

  it("Should be able to successfully validate a NumberCell", (): void => {
    const number = "12345";
    numberCell.evaluate(number);
    expect(numberCell.validity()).toBe(true);
  });
});
