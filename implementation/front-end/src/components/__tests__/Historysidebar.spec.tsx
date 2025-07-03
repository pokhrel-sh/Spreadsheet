import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react";
import HistorySidebar from "../HistorySidebar";

describe("HistorySidebar Component", () => {
  beforeAll(() => {
    // Ensure the window's state is meatching our desgin's state
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

  test("renders clock icon button", () => {
    render(<HistorySidebar />);

    // Ensure the clock icon button exists
    const clockButton = screen.getByRole("button", { name: /clock/i });
    expect(clockButton).toBeInTheDocument();
  });

  test("opens drawer on clock icon button click", () => {
    render(<HistorySidebar />);

    // Simulate clicking the clock icon button to open the drawer
    const clockButton = screen.getByRole("button", { name: /clock/i });
    fireEvent.click(clockButton);

    // Confirm the drawer title is displayed, indicating the drawer is open
    const drawerTitle = screen.getByText("History Version");
    expect(drawerTitle).toBeInTheDocument();
  });

  test("renders version list in drawer", () => {
    render(<HistorySidebar />);

    // Open the drawer
    const clockButton = screen.getByRole("button", { name: /clock/i });
    fireEvent.click(clockButton);

    // Check if specific content in the version list is displayed
    expect(screen.getByText("Version 4")).toBeInTheDocument();
    expect(
      screen.getByText("was created by User E at 2023-08-01 12:00")
    ).toBeInTheDocument();
    expect(screen.getByText("Version 1")).toBeInTheDocument();
    expect(
      screen.getByText("was created by User B at 2023-07-30 14:30")
    ).toBeInTheDocument();
  });

  test("renders action buttons in each list item", () => {
    render(<HistorySidebar />);

    // Open the drawer
    const clockButton = screen.getByRole("button", { name: /clock/i });
    fireEvent.click(clockButton);

    // Check if each version item contains Eye and Rollback buttons
    const eyeIcons = screen.getAllByLabelText(/eye/i);
    const rollbackIcons = screen.getAllByLabelText(/rollback/i);
    expect(eyeIcons.length).toBe(4); // Should have 4 versions, so should have 4 Eye icons
    expect(rollbackIcons.length).toBe(4); // Should have 4 versions, so should have 4 Rollback icons
  });
});
