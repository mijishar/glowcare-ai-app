import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DermatologistAlert from "../../components/DermatologistAlert";

const ADVISORY_TEXT =
  "This concern may need professional attention — please consult a dermatologist.";

describe("DermatologistAlert", () => {
  it("renders nothing when show is false", () => {
    const { container } = render(<DermatologistAlert show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the advisory banner when show is true", () => {
    render(<DermatologistAlert show={true} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(ADVISORY_TEXT)).toBeInTheDocument();
  });

  it("has the correct data-testid", () => {
    render(<DermatologistAlert show={true} />);
    expect(screen.getByTestId("dermatologist-alert")).toBeInTheDocument();
  });
});
