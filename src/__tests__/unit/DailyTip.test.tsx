import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import DailyTip from "../../components/DailyTip";
import { SKINCARE_TIPS } from "../../data/tips";

const TODAY = "2024-06-15";
const YESTERDAY = "2024-06-14";

function mockDate(dateStr: string) {
  vi.setSystemTime(new Date(`${dateStr}T12:00:00Z`));
}

function getTipText(): string {
  return screen.getByTestId("daily-tip").querySelector("p:last-child")?.textContent ?? "";
}

describe("DailyTip", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    mockDate(TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders the container with data-testid='daily-tip'", () => {
    render(<DailyTip />);
    expect(screen.getByTestId("daily-tip")).toBeInTheDocument();
  });

  it("renders the '💡 Daily Tip' label", () => {
    render(<DailyTip />);
    expect(screen.getByText(/💡 Daily Tip/i)).toBeInTheDocument();
  });

  it("renders a tip that is one of the known skincare tips", () => {
    render(<DailyTip />);
    const tipText = getTipText();
    expect(SKINCARE_TIPS).toContain(tipText);
  });

  it("handles missing localStorage gracefully on first visit (no stored keys)", () => {
    // localStorage is empty — should not throw and should render a valid tip
    expect(() => render(<DailyTip />)).not.toThrow();
    const tipText = getTipText();
    expect(SKINCARE_TIPS).toContain(tipText);
  });

  it("shows the same tip on the same day (localStorage date matches today)", () => {
    // Pre-seed localStorage with today's date and a specific index
    const storedIndex = 5;
    localStorage.setItem("glowcare_last_tip_date", TODAY);
    localStorage.setItem("glowcare_last_tip_index", String(storedIndex));

    render(<DailyTip />);
    const tipText = getTipText();

    expect(tipText).toBe(SKINCARE_TIPS[storedIndex]);
  });

  it("shows the same tip on re-render within the same day", () => {
    const { unmount } = render(<DailyTip />);
    const first = getTipText();
    unmount();

    render(<DailyTip />);
    const second = getTipText();

    expect(first).toBe(second);
  });

  it("shows a different tip on a new day (localStorage date differs from today)", () => {
    // Seed yesterday's date with index 3
    const yesterdayIndex = 3;
    localStorage.setItem("glowcare_last_tip_date", YESTERDAY);
    localStorage.setItem("glowcare_last_tip_index", String(yesterdayIndex));

    render(<DailyTip />);
    const tipText = getTipText();

    // Should advance to the next index (4), not stay at 3
    expect(tipText).toBe(SKINCARE_TIPS[yesterdayIndex + 1]);
    expect(tipText).not.toBe(SKINCARE_TIPS[yesterdayIndex]);
  });

  it("persists the new tip index to localStorage when the date changes", () => {
    const yesterdayIndex = 2;
    localStorage.setItem("glowcare_last_tip_date", YESTERDAY);
    localStorage.setItem("glowcare_last_tip_index", String(yesterdayIndex));

    render(<DailyTip />);

    expect(localStorage.getItem("glowcare_last_tip_date")).toBe(TODAY);
    expect(localStorage.getItem("glowcare_last_tip_index")).toBe(String(yesterdayIndex + 1));
  });

  it("does not overwrite localStorage when the date has not changed", () => {
    const storedIndex = 7;
    localStorage.setItem("glowcare_last_tip_date", TODAY);
    localStorage.setItem("glowcare_last_tip_index", String(storedIndex));

    render(<DailyTip />);

    // Keys should remain unchanged
    expect(localStorage.getItem("glowcare_last_tip_date")).toBe(TODAY);
    expect(localStorage.getItem("glowcare_last_tip_index")).toBe(String(storedIndex));
  });

  it("wraps around to index 0 when the last index is the final tip", () => {
    const lastIndex = SKINCARE_TIPS.length - 1;
    localStorage.setItem("glowcare_last_tip_date", YESTERDAY);
    localStorage.setItem("glowcare_last_tip_index", String(lastIndex));

    render(<DailyTip />);
    const tipText = getTipText();

    // Should wrap around to index 0
    expect(tipText).toBe(SKINCARE_TIPS[0]);
  });

  it("degrades gracefully when localStorage throws on read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("localStorage unavailable");
    });

    expect(() => render(<DailyTip />)).not.toThrow();
    const tipText = getTipText();
    expect(SKINCARE_TIPS).toContain(tipText);
  });
});
