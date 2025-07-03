/**
 * A utility class for performing formula and expression evaluation in a spreadsheet.
 */
export class Calculator {
  /**
   * Calculates the sum of a list of numbers.
   *
   * @param values - An array of numbers to sum.
   * @returns The sum of the input numbers.
   */
  public static sum(values: number[]): number {
    let runningSum = 0;
    for (let i = 0; i < values.length; i++) {
      runningSum += values[i];
    }
    return runningSum;
  }

  /**
   * Calculates the average of a list of numbers.
   *
   * @param values - An array of numbers to average.
   * @returns The average of the input numbers.
   */
  public static average(values: number[]): number {
    let runningSum = 0;
    for (let i = 0; i < values.length; i++) {
      runningSum += values[i];
    }
    return runningSum / values.length;
  }

  /**
   * Performs the concatenation of strings.
   *
   * @param equation - The equation string to concatenate.
   * @returns A simplified version of the input equation.
   */
  public static evaluate_string(equation: string): string {
    return equation.split("+").join("");
  }

  /**
   * Evaluates a numerical equation string and computes the result.
   *
   * @param equation - The equation string to evaluate.
   * @returns The numerical result of the equation.
   */
  public static evaluate_numerical(equation: string): number {
    const splitEquation: Array<string> = Calculator.splitEquation(equation);
    let runningSum = 0;
    let storedValue = 0;
    let storedOperator = "";
    let currentOperator = "+";
    let orderOfOperations = false;

    const numberRegex = /^\d+(\.\d+)?$/;
    const operatorRegex = /^[+\-/*]$/;
    const mixedRegex = /^(?=.*\d)(?=.*[+\-/*]).+$/;

    for (let i = 0; i < splitEquation.length; i++) {
      const token = splitEquation[i];

      if (numberRegex.test(token)) {
        const number = parseFloat(token);
        if (
          orderOfOperations &&
          (storedOperator === "*" || storedOperator === "/")
        ) {
          storedValue =
            storedOperator === "*"
              ? storedValue * number
              : storedValue / number;
          orderOfOperations = false;
        } else if (currentOperator) {
          runningSum = Calculator.applyOperator(
            runningSum,
            storedValue,
            currentOperator
          );
          storedValue = number;
        } else {
          storedValue = number;
        }
      } else if (operatorRegex.test(token)) {
        const operator = token;
        if (operator === "*" || operator === "/") {
          orderOfOperations = true;
        } else {
          runningSum = Calculator.applyOperator(
            runningSum,
            storedValue,
            currentOperator
          );
          currentOperator = operator;
          storedValue = 0;
        }
        storedOperator = operator;
      } else if (mixedRegex.test(token)) {
        const subResult = Calculator.evaluate_numerical(token);
        if (
          orderOfOperations &&
          (storedOperator === "*" || storedOperator === "/")
        ) {
          storedValue =
            storedOperator === "*"
              ? storedValue * subResult
              : storedValue / subResult;
          orderOfOperations = false;
        } else if (currentOperator) {
          runningSum = Calculator.applyOperator(
            runningSum,
            storedValue,
            currentOperator
          );
          storedValue = subResult;
        } else {
          storedValue = subResult;
        }
      }
    }

    runningSum = Calculator.applyOperator(
      runningSum,
      storedValue,
      currentOperator
    );

    return runningSum;
  }

  /**
   * Applies an arithmetic operator to two numbers.
   *
   * @param left - The left operand.
   * @param right - The right operand.
   * @param operator - The arithmetic operator (`+`, `-`, `*`, `/`).
   * @returns The result of applying the operator.
   * @throws Error if division by zero or an unsupported operator is encountered.
   */
  private static applyOperator(
    left: number,
    right: number,
    operator: string
  ): number {
    switch (operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        if (right === 0) {
          throw new Error("Division by zero");
        }
        return left / right;
      default:
        console.log(`Unsupported operator: ${operator}`);
        console.log(`Left: ${left}`);
        console.log(`Right: ${right}`);
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  /**
   * Splits an equation string into tokens for evaluation.
   * Tokens include numbers, operators, and sub-equations within parentheses.
   *
   * @param equation - The equation string to split.
   * @returns An array of tokens extracted from the equation.
   */
  private static splitEquation(equation: string): string[] {
    const result: string[] = [];
    let depth = 0;
    let current = "";

    for (const char of equation) {
      if (char === "(") {
        if (depth > 0) current += char;
        depth++;
      } else if (char === ")") {
        depth--;
        if (depth > 0) {
          current += char;
        } else {
          result.push(current.trim());
          current = "";
        }
      } else if (depth > 0) {
        current += char;
      } else if ("+-*/".includes(char)) {
        if (current.trim() !== "") {
          result.push(current.trim());
        }
        result.push(char);
        current = "";
      } else {
        current += char;
      }
    }

    if (current.trim() !== "") {
      result.push(current.trim());
    }

    return result.map((part) => part.replace(/^\((.*)\)$/, "$1").trim());
  }
}
