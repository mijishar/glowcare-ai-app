import { useState } from 'react';
import type { AdviceResponse, QueryHistoryEntry } from '../types';

const STORAGE_KEY = 'glowcare_history';

function loadHistory(): QueryHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueryHistoryEntry[];
  } catch {
    return [];
  }
}

function persistHistory(entries: QueryHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable — degrade gracefully
  }
}

/**
 * Pure helper: creates a new entry, prepends it (newest first), and returns the updated array.
 */
export function saveHistoryEntry(
  existing: QueryHistoryEntry[],
  input: string,
  response: AdviceResponse
): QueryHistoryEntry[] {
  const entry: QueryHistoryEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    input,
    response,
  };
  return [entry, ...existing];
}

export function useQueryHistory(): {
  history: QueryHistoryEntry[];
  addEntry: (input: string, response: AdviceResponse) => void;
  clearHistory: () => void;
} {
  const [history, setHistory] = useState<QueryHistoryEntry[]>(() => loadHistory());

  const addEntry = (input: string, response: AdviceResponse) => {
    setHistory((prev) => {
      const updated = saveHistoryEntry(prev, input, response);
      persistHistory(updated);
      return updated;
    });
  };

  const clearHistory = () => {
    persistHistory([]);
    setHistory([]);
  };

  return { history, addEntry, clearHistory };
}
