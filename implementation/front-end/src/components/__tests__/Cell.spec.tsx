import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Cell from "../Cell";
import "@testing-library/jest-dom";
import { act } from "react";

describe("Cell Component", () => {
  const mockOnSave = jest.fn(); // Mock the onSave callback function

  beforeEach(() => {
    mockOnSave.mockClear(); // Clear mock calls before each test
  });

  test("renders cell with initial value and allows editing on click", () => {
    render(<Cell value="Initial Value" onSave={mockOnSave} />);

    // On initial render, display the text content instead of an input field
    expect(screen.getByText("Initial Value")).toBeInTheDocument();

    // Click on the cell to enter edit mode
    fireEvent.click(screen.getByText("Initial Value"));

    // After entering edit mode, the input field should be visible and contain the initial value
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Initial Value");
  });

  test("saves new value on blur and calls onSave", () => {
    render(<Cell value="Old Value" onSave={mockOnSave} />);

    // Click on the cell to enter edit mode
    fireEvent.click(screen.getByText("Old Value"));

    // Change the value in the input field and blur to save
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "New Value" } });
    fireEvent.blur(input);

    // Confirm that onSave was called with the new value
    expect(mockOnSave).toHaveBeenCalledWith("New Value");
  });

  test("saves new value on Enter key press and calls onSave", () => {
    render(<Cell value="Original Value" onSave={mockOnSave} />);

    // Click on the cell to enter edit mode
    fireEvent.click(screen.getByText("Original Value"));

    // Change the value in the input field and press Enter to save
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Updated Value" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Confirm that onSave was called with the updated value
    expect(mockOnSave).toHaveBeenCalledWith("Updated Value");
  });

  test("does not call onSave if value is unchanged", () => {
    render(<Cell value="Static Value" onSave={mockOnSave} />);

    // Click on the cell to enter edit mode
    fireEvent.click(screen.getByText("Static Value"));

    // Do not modify the value, just blur to save
    const input = screen.getByRole("textbox");
    fireEvent.blur(input);

    // Confirm that onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
