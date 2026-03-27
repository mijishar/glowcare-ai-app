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
            <p className="text-sm text-stone-500">{history.length} past {history.length === 1 ? 'query' : 'queries'}</p>
            <button
              data-testid="clear-history-btn"
              onClick={onClear}
              className="flex items-center gap-1.5 text-sm text-rose-400 hover:text-rose-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 rounded-full px-3 py-1.5 hover:bg-rose-50"
            >
              <Trash2 size={13} />
              Clear All
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
          className="animate-fade-in flex flex-col items-center justify-center py-16 gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
            <Clock size={28} className="text-rose-200" />
          </div>
          <div>
            <p className="text-stone-500 font-medium">No history yet</p>
            <p className="text-stone-400 text-sm mt-1">Your past queries will appear here</p>
          </div>
        </div>
      )}
    </div>
  )
}
