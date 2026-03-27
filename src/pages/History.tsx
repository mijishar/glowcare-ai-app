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
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-400 text-white py-8 px-4 text-center">
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-1">
            <Clock size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">My History</h1>
          <p className="text-teal-100 text-sm">Review your past skincare queries</p>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {selectedEntry === null ? (
          <HistoryList history={history} onSelect={setSelectedEntry} onClear={clearHistory} />
        ) : (
          <div className="space-y-4 animate-slide-up">
            <button
              data-testid="back-to-history-btn"
              onClick={() => setSelectedEntry(null)}
              className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 rounded-full px-3 py-1.5 hover:bg-teal-50"
            >
              <ArrowLeft size={14} /> Back to History
            </button>
            <div className="glass rounded-2xl border border-teal-100 shadow-sm px-4 py-3 space-y-1">
              <p className="text-xs text-gray-400">{new Date(selectedEntry.timestamp).toLocaleString()}</p>
              <p className="text-sm text-teal-800 font-medium italic">"{selectedEntry.input}"</p>
            </div>
            <AdviceCard advice={selectedEntry.response} />
          </div>
        )}
      </main>
    </div>
  )
}
