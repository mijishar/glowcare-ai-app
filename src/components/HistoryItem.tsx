import { ChevronRight, Clock } from 'lucide-react'
import type { QueryHistoryEntry } from '../types'

interface HistoryItemProps {
  entry: QueryHistoryEntry
  onSelect: (entry: QueryHistoryEntry) => void
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

const MAX_QUERY_LENGTH = 80

export default function HistoryItem({ entry, onSelect }: HistoryItemProps) {
  const truncated =
    entry.input.length > MAX_QUERY_LENGTH
      ? entry.input.slice(0, MAX_QUERY_LENGTH).trimEnd() + '…'
      : entry.input

  return (
    <button
      data-testid="history-item"
      onClick={() => onSelect(entry)}
      className="w-full text-left glass rounded-2xl border border-teal-100 hover:border-teal-300 hover:bg-teal-50/60 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200 px-4 py-3.5 flex items-center gap-3 group shadow-sm hover:shadow-md"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center flex-shrink-0 group-hover:from-teal-200 group-hover:to-cyan-200 transition-colors">
        <span className="text-base">💬</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-teal-900 leading-snug truncate">{truncated}</p>
        <p className="flex items-center gap-1 text-xs text-teal-400 mt-0.5">
          <Clock size={10} />
          {formatTimestamp(entry.timestamp)}
        </p>
      </div>
      <ChevronRight size={16} className="text-teal-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
    </button>
  )
}
