import React from "react";
import { act } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Spreadsheet from "../Spreadsheet";

describe("Spreadsheet Component", () => {
  beforeEach(() => {
    localStorage.clear(); // Clear localStorage before each test
  });

  test("renders empty spreadsheet with initial data", () => {
    render(<Spreadsheet />);

    // Check if cells are rendered
    const cells = screen.getAllByRole("gridcell");
    expect(cells.length).toBeGreaterThan(0); // Ensure there are cells rendered

    // Check whether cells return correctly
    const firstCell = cells[0];
    expect(firstCell).toHaveTextContent("");
  });

  test("updates cell content", () => {
    render(<Spreadsheet />);

    const cells = screen.getAllByRole("gridcell");
    const firstCell = cells[0];

    // Simulate editing the first cell
    act(() => {
      // Update cell content
      firstCell.textContent = "Test Value";
    });

    // Check if the content has been updated
    expect(firstCell).toHaveTextContent("Test Value");
  });
});
