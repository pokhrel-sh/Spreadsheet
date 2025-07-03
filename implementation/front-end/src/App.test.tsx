import { render, screen } from "@testing-library/react";
import App from "./App";
import React from "react";
import "@testing-library/jest-dom";
import Spreadsheet from "components/Spreadsheet";

describe("App Component", () => {
  beforeAll(() => {
    // Ensure the window's state matches our design's state
    window.matchMedia =
      window.matchMedia ||
      function () {
        return {
          matches: false,
          media: "",
          onchange: null,
          addListener: function () {},
          removeListener: function () {},
          addEventListener: function () {},
          removeEventListener: function () {},
          dispatchEvent: function () {
            return false;
          },
        };
      };
  });

  test("App has correctly rends the button of toolbar", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /undo/i })).toBeInTheDocument();
  });

  test("App has correctly renders empty spreadsheet with initial data", () => {
    render(<Spreadsheet />);

    // Check if cells are rendered
    const cells = screen.getAllByRole("gridcell");
    expect(cells.length).toBeGreaterThan(0); // Ensure there are cells rendered

    // Check whether cells return correctly
    const firstCell = cells[0];
    expect(firstCell).toHaveTextContent("");
  });
});
