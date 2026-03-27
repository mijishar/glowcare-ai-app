import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import HistoryList from "../../components/HistoryList";
import type { QueryHistoryEntry } from "../../types";

const makeEntry = (id: string, timestamp: number, input: string): QueryHistoryEntry => ({
  id,
  timestamp,
  input,
  response: {
    skinType: "Oily",
    routine: { morning: ["Cleanser"], night: ["Moisturizer"] },
    homeRemedies: ["Tea tree oil"],
    productSuggestions: ["CeraVe"],
    dosAndDonts: { dos: ["Drink water"], donts: ["Avoid oils"] },
    dermatologistFlag: false,
  },
});

const entry1 = makeEntry("1", 1000, "Oily skin concern");
const entry2 = makeEntry("2", 2000, "Dry skin concern");

describe("HistoryList", () => {
  it("renders with data-testid history-list", () => {
    render(<HistoryList history={[]} onSelect={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByTestId("history-list")).toBeInTheDocument();
  });

  it("shows empty state when history is empty", () => {
    render(<HistoryList history={[]} onSelect={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByTestId("history-empty-state")).toBeInTheDocument();
    expect(screen.getByTestId("history-empty-state")).toHaveTextContent("No history yet");
  });

  it("does not show clear button when history is empty", () => {
    render(<HistoryList history={[]} onSelect={vi.fn()} onClear={vi.fn()} />);
    expect(screen.queryByTestId("clear-history-btn")).not.toBeInTheDocument();
  });

  it("renders history items when history is non-empty", () => {
    render(<HistoryList history={[entry1, entry2]} onSelect={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getAllByTestId("history-item")).toHaveLength(2);
  });

  it("shows clear button when history is non-empty", () => {
    render(<HistoryList history={[entry1]} onSelect={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByTestId("clear-history-btn")).toBeInTheDocument();
  });

  it("does not show empty state when history is non-empty", () => {
    render(<HistoryList history={[entry1]} onSelect={vi.fn()} onClear={vi.fn()} />);
    expect(screen.queryByTestId("history-empty-state")).not.toBeInTheDocument();
  });

  it("calls onClear when clear button is clicked", async () => {
    const onClear = vi.fn();
    render(<HistoryList history={[entry1]} onSelect={vi.fn()} onClear={onClear} />);
    await userEvent.click(screen.getByTestId("clear-history-btn"));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("calls onSelect with the correct entry when a history item is clicked", async () => {
    const onSelect = vi.fn();
    render(<HistoryList history={[entry1, entry2]} onSelect={onSelect} onClear={vi.fn()} />);
    const items = screen.getAllByTestId("history-item");
    await userEvent.click(items[0]);
    expect(onSelect).toHaveBeenCalledWith(entry1);
  });

  it("renders entries in the order provided (newest first)", () => {
    // entry2 has higher timestamp — caller is responsible for sorting
    render(<HistoryList history={[entry2, entry1]} onSelect={vi.fn()} onClear={vi.fn()} />);
    const items = screen.getAllByTestId("history-item");
    expect(items[0]).toHaveTextContent(entry2.input);
    expect(items[1]).toHaveTextContent(entry1.input);
  });
});
