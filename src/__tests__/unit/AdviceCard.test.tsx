import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AdviceCard from "../../components/AdviceCard";
import type { AdviceResponse } from "../../types";

const baseAdvice: AdviceResponse = {
  skinType: "Oily",
  routine: {
    morning: ["Foaming cleanser", "Niacinamide serum", "SPF 30"],
    night: ["Salicylic acid cleanser", "Retinol", "Light moisturizer"],
  },
  homeRemedies: ["Apply diluted tea tree oil", "Use a honey mask weekly"],
  productSuggestions: ["CeraVe Foaming Cleanser", "The Ordinary Niacinamide 10%"],
  dosAndDonts: {
    dos: ["Drink plenty of water", "Change pillowcases weekly"],
    donts: ["Avoid heavy oil-based moisturizers", "Don't over-wash your face"],
  },
  dermatologistFlag: false,
};

describe("AdviceCard", () => {
  it("renders all four section headings", () => {
    render(<AdviceCard advice={baseAdvice} />);
    expect(screen.getByTestId("section-routine")).toBeInTheDocument();
    expect(screen.getByTestId("section-home-remedies")).toBeInTheDocument();
    expect(screen.getByTestId("section-product-suggestions")).toBeInTheDocument();
    expect(screen.getByTestId("section-dos-and-donts")).toBeInTheDocument();
  });

  it("renders section heading text correctly", () => {
    render(<AdviceCard advice={baseAdvice} />);
    expect(screen.getByText("Skincare Routine")).toBeInTheDocument();
    expect(screen.getByText("Home Remedies")).toBeInTheDocument();
    expect(screen.getByText("Product Suggestions")).toBeInTheDocument();
    expect(screen.getByText("Do's and Don'ts")).toBeInTheDocument();
  });

  it("renders morning and night sub-sections", () => {
    render(<AdviceCard advice={baseAdvice} />);
    expect(screen.getByText("Morning")).toBeInTheDocument();
    expect(screen.getByText("Night")).toBeInTheDocument();
  });

  it("renders routine items", () => {
    render(<AdviceCard advice={baseAdvice} />);
    expect(screen.getByText("Foaming cleanser")).toBeInTheDocument();
    expect(screen.getByText("Retinol")).toBeInTheDocument();
  });

  it("renders home remedies items", () => {
    render(<AdviceCard advice={baseAdvice} />);
    expect(screen.getByText("Apply diluted tea tree oil")).toBeInTheDocument();
  });

  it("renders product suggestions items", () => {
    render(<AdviceCard advice={baseAdvice} />);
    expect(screen.getByText("CeraVe Foaming Cleanser")).toBeInTheDocument();
  });

  it("renders dos and donts items", () => {
    render(<AdviceCard advice={baseAdvice} />);
    expect(screen.getByText("Drink plenty of water")).toBeInTheDocument();
    expect(screen.getByText("Avoid heavy oil-based moisturizers")).toBeInTheDocument();
  });

  it("shows skin type tag when skinType is non-null", () => {
    render(<AdviceCard advice={baseAdvice} />);
    expect(screen.getByTestId("skin-type-tag")).toBeInTheDocument();
    expect(screen.getByText("Oily Skin")).toBeInTheDocument();
  });

  it("does not show skin type tag when skinType is null", () => {
    render(<AdviceCard advice={{ ...baseAdvice, skinType: null }} />);
    expect(screen.queryByTestId("skin-type-tag")).not.toBeInTheDocument();
  });

  it("shows dermatologist alert when dermatologistFlag is true", () => {
    render(<AdviceCard advice={{ ...baseAdvice, dermatologistFlag: true }} />);
    expect(screen.getByTestId("dermatologist-alert")).toBeInTheDocument();
  });

  it("does not show dermatologist alert when dermatologistFlag is false", () => {
    render(<AdviceCard advice={baseAdvice} />);
    expect(screen.queryByTestId("dermatologist-alert")).not.toBeInTheDocument();
  });
});
