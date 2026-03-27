import { Trash2, Clock } from 'lucide-react'
import type { QueryHistoryEntry } from '../types'
import HistoryItem from './HistoryItem'

interface HistoryListProps {
  history: QueryHistoryEntry[]
  onSelect: (entry: QueryHistoryEntry) => void
  onClear: () => void
}

export default function HistoryList({ history, onSelect, onClear }: HistoryListProps) {
  return (
    <div data-testid="history-list" className="flex flex-col gap-3">
      {history.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-teal-500 font-medium">
              {history.length} past {history.length === 1 ? 'query' : 'queries'}
            </p>
            <button
              data-testid="clear-history-btn"
              onClick={onClear}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full px-3 py-1.5 hover:bg-red-50"
            >
              <Trash2 size={13} /> Clear All
            </button>
          </div>
          <div className="space-y-2 animate-fade-in">
            {history.map((entry) => (
              <HistoryItem key={entry.id} entry={entry} onSelect={onSelect} />
            ))}
          </div>
        </>
      ) : (
        <div
          data-testid="history-empty-state"
          className="animate-fade-in flex flex-col items-center justify-center py-20 gap-4 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center shadow-sm">
            <Clock size={32} className="text-teal-300" />
          </div>
          <div>
            <p className="text-teal-700 font-bold text-base">No history yet</p>
            <p className="text-teal-400 text-sm mt-1">Your past queries will appear here</p>
          </div>
        </div>
      )}
    </div>
  )
}
