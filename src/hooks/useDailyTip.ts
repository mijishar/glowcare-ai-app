import { useState } from "react";
import { SKINCARE_TIPS } from "../data/tips";

const LAST_TIP_DATE_KEY = "glowcare_last_tip_date";
const LAST_TIP_INDEX_KEY = "glowcare_last_tip_index";

/**
 * Pure helper: given today's date string, the last stored date, the last stored index,
 * and the total number of tips, returns the tip index to use today.
 *
 * Rules:
 * - If today matches lastDate, return lastIndex (same day → same tip).
 * - Otherwise, pick a new index that differs from lastIndex.
 */
export function getDailyTipIndex(
  today: string,
  lastDate: string | null,
  lastIndex: number | null,
  tipsCount: number
): number {
  // Same day: return the stored index (or 0 if somehow invalid)
  if (lastDate === today && lastIndex !== null && lastIndex >= 0 && lastIndex < tipsCount) {
    return lastIndex;
  }

  // New day: pick a different index from lastIndex
  if (lastIndex === null || lastIndex < 0 || lastIndex >= tipsCount) {
    // No valid previous index — just start at 0
    return 0;
  }

  // Advance by 1, wrapping around, ensuring we never land on lastIndex
  const next = (lastIndex + 1) % tipsCount;
  return next;
}

export function useDailyTip(): string {
  const [tip] = useState<string>(() => {
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    let lastDate: string | null = null;
    let lastIndex: number | null = null;

    try {
      lastDate = localStorage.getItem(LAST_TIP_DATE_KEY);
      const raw = localStorage.getItem(LAST_TIP_INDEX_KEY);
      if (raw !== null) {
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed)) {
          lastIndex = parsed;
        }
      }
    } catch {
      // localStorage unavailable — degrade gracefully
    }

    const index = getDailyTipIndex(today, lastDate, lastIndex, SKINCARE_TIPS.length);

    // Persist only when the date has changed (or first run)
    if (lastDate !== today) {
      try {
        localStorage.setItem(LAST_TIP_DATE_KEY, today);
        localStorage.setItem(LAST_TIP_INDEX_KEY, String(index));
      } catch {
        // Ignore write failures
      }
    }

    return SKINCARE_TIPS[index];
  });

  return tip;
}
