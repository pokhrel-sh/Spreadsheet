describe("NPM Configuration Regression Testing", (): void => {
  let basicInteger: number;

  beforeEach((): void => {
    basicInteger = 406;
  });

  it("A single basic assertion should successfully pass", (): void => {
    expect(406).toBe(basicInteger);
  });
});
