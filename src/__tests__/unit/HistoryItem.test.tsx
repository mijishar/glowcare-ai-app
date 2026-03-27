import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import HistoryItem from "../../components/HistoryItem";
import type { QueryHistoryEntry } from "../../types";

const baseEntry: QueryHistoryEntry = {
  id: "abc-123",
  timestamp: new Date("2024-01-15T15:45:00").getTime(),
  input: "I have oily skin with frequent breakouts",
  response: {
    skinType: "Oily",
    routine: { morning: ["Cleanser"], night: ["Moisturizer"] },
    homeRemedies: ["Tea tree oil"],
    productSuggestions: ["CeraVe"],
    dosAndDonts: { dos: ["Drink water"], donts: ["Avoid oils"] },
    dermatologistFlag: false,
  },
};

describe("HistoryItem", () => {
  it("renders with data-testid history-item", () => {
    render(<HistoryItem entry={baseEntry} onSelect={vi.fn()} />);
    expect(screen.getByTestId("history-item")).toBeInTheDocument();
  });

  it("displays the query input text", () => {
    render(<HistoryItem entry={baseEntry} onSelect={vi.fn()} />);
    expect(screen.getByText(baseEntry.input)).toBeInTheDocument();
  });

  it("truncates long query text", () => {
    const longInput = "a".repeat(100);
    render(<HistoryItem entry={{ ...baseEntry, input: longInput }} onSelect={vi.fn()} />);
    const text = screen.getByTestId("history-item").querySelector("p")?.textContent ?? "";
    expect(text.length).toBeLessThan(longInput.length);
    expect(text.endsWith("…")).toBe(true);
  });

  it("does not truncate short query text", () => {
    render(<HistoryItem entry={baseEntry} onSelect={vi.fn()} />);
    expect(screen.getByText(baseEntry.input)).toBeInTheDocument();
  });

  it("displays a human-readable timestamp", () => {
    render(<HistoryItem entry={baseEntry} onSelect={vi.fn()} />);
    // Should contain the year and month abbreviation
    const item = screen.getByTestId("history-item");
    expect(item.textContent).toMatch(/Jan/);
    expect(item.textContent).toMatch(/2024/);
  });

  it("calls onSelect with the entry when clicked", async () => {
    const onSelect = vi.fn();
    render(<HistoryItem entry={baseEntry} onSelect={onSelect} />);
    await userEvent.click(screen.getByTestId("history-item"));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(baseEntry);
  });

  it("is keyboard accessible (rendered as a button)", () => {
    render(<HistoryItem entry={baseEntry} onSelect={vi.fn()} />);
    const el = screen.getByTestId("history-item");
    expect(el.tagName).toBe("BUTTON");
  });
});
