import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Toolbar from "../Toolbar";
import "@testing-library/jest-dom";
import { act } from "react";

describe("Toolbar Component", () => {
  beforeAll(() => {
    // Ensure the window's state matches our design's state
    window.matchMedia =
      window.matchMedia ||
      function () {
        return {
          matches: false,
          addListener: function () {},
          removeListener: function () {},
        };
      };
  });

  test("renders all tool buttons and icons correctly", () => {
    render(<Toolbar />);

    // Check if the undo and redo buttons are present
    expect(screen.getByRole("button", { name: /undo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /redo/i })).toBeInTheDocument();

    // Check if text format buttons are present
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /strikethrough/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /underline/i })
    ).toBeInTheDocument();

    // Check if the history sidebar button is present
    expect(screen.getByRole("button", { name: /clock/i })).toBeInTheDocument();

    // Check if the share button is present
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  test("renders last updated text and check icon", () => {
    render(<Toolbar />);

    // Check if the "Last updated" text is displayed
    expect(
      screen.getByText(/last updated: 12:00, 01\/01\/2000/i)
    ).toBeInTheDocument();

    // Check if the check icon is present
    expect(
      screen.getByRole("img", { name: /check-circle/i })
    ).toBeInTheDocument();
  });

  test("renders group user icons", () => {
    render(<Toolbar />);

    // Check if user icons are present
    const userIcons = screen.getAllByRole("img", { name: /user/i });
    expect(userIcons.length).toBe(4); // There should be 4 user icons
  });

  test("opens history sidebar when history icon is clicked", () => {
    render(<Toolbar />);

    // Click the clock button to open the HistorySidebar
    const historyButton = screen.getByRole("button", { name: /clock/i });
    fireEvent.click(historyButton);

    // Check if the HistorySidebar content is displayed and confirm the drawer is opened
    expect(screen.getByText("History Version")).toBeInTheDocument();
  });
});
