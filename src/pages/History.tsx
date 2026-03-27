import { useState } from 'react'
import { ArrowLeft, Clock } from 'lucide-react'
import type { QueryHistoryEntry } from '../types'
import { useQueryHistory } from '../hooks/useQueryHistory'
import HistoryList from '../components/HistoryList'
import AdviceCard from '../components/AdviceCard'

export default function History() {
  const { history, clearHistory } = useQueryHistory()
  const [selectedEntry, setSelectedEntry] = useState<QueryHistoryEntry | null>(null)

  return (
    <div className="min-h-screen">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-rose-400 via-pink-400 to-peach-300 text-white py-6 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock size={20} />
          <h1 className="text-xl font-bold">My History</h1>
        </div>
        <p className="text-white/80 text-sm">Review your past skincare queries</p>
      </div>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {selectedEntry === null ? (
          <HistoryList
            history={history}
            onSelect={setSelectedEntry}
            onClear={clearHistory}
          />
        ) : (
          <div className="space-y-4 animate-slide-up">
            <button
              data-testid="back-to-history-btn"
              onClick={() => setSelectedEntry(null)}
              className="flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 rounded-full px-3 py-1.5 hover:bg-rose-50"
            >
              <ArrowLeft size={14} />
              Back to History
            </button>
            <div className="rounded-2xl bg-white/80 border border-pink-100 shadow-sm px-4 py-3 space-y-1">
              <p className="text-xs text-stone-400">{new Date(selectedEntry.timestamp).toLocaleString()}</p>
              <p className="text-sm text-stone-700 font-medium italic">"{selectedEntry.input}"</p>
            </div>
            <AdviceCard advice={selectedEntry.response} />
          </div>
        )}
      </main>
    </div>
  )
}
