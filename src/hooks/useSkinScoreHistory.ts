export interface SkinScoreEntry {
  date: string       // ISO date e.g. "2026-03-27"
  score: number
  skinType: string | null
  label: string      // short display label e.g. "Mar 27"
}

const STORAGE_KEY = 'glowcare_skin_scores'

function toLabel(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function useSkinScoreHistory() {
  const load = (): SkinScoreEntry[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  const save = (entries: SkinScoreEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {}
  }

  const addScore = (score: number, skinType: string | null) => {
    const today = new Date().toISOString().split('T')[0]
    const entries = load()
    // Update today's entry or add new
    const idx = entries.findIndex(e => e.date === today)
    const entry: SkinScoreEntry = { date: today, score, skinType, label: toLabel(today) }
    if (idx >= 0) {
      entries[idx] = entry
    } else {
      entries.push(entry)
    }
    // Keep last 30 days
    const sorted = entries.sort((a, b) => a.date.localeCompare(b.date)).slice(-30)
    save(sorted)
    return sorted
  }

  const getHistory = (): SkinScoreEntry[] => load()

  const clearHistory = () => localStorage.removeItem(STORAGE_KEY)

  return { addScore, getHistory, clearHistory }
}
