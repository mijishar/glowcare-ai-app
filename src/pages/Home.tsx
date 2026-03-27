import { useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import QueryInput from '../components/QueryInput'
import QuickOptions from '../components/QuickOptions'
import LoadingSpinner from '../components/LoadingSpinner'
import AdviceCard from '../components/AdviceCard'
import DailyTip from '../components/DailyTip'
import { queryAdvice } from '../services/api'
import { useQueryHistory } from '../hooks/useQueryHistory'
import type { AdviceResponse } from '../types'

export default function Home() {
  const { addEntry } = useQueryHistory()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [advice, setAdvice] = useState<AdviceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleSubmit = async (value: string) => {
    if (!value.trim()) return
    setIsLoading(true)
    setError(null)
    setAdvice(null)
    try {
      const response = await queryAdvice(value)
      setAdvice(response)
      addEntry(value, response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickOptionSelect = (option: string) => {
    setSelectedOption(option)
    setInput(option)
    handleSubmit(option)
  }

  const handleRetry = () => {
    if (input.trim()) handleSubmit(input)
  }

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-rose-400 via-pink-400 to-peach-300 text-white py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-1">Your Personal Skincare Advisor 🌸</h1>
        <p className="text-white/80 text-sm">Describe your skin concern and get personalized advice instantly</p>
      </div>

      <main className="mx-auto max-w-xl px-4 py-6 space-y-5">
        {/* Daily Tip */}
        <DailyTip />

        {/* Input card */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-pink-100 shadow-md p-5 space-y-4">
          <QueryInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
          <QuickOptions
            selectedOption={selectedOption}
            onSelect={handleQuickOptionSelect}
          />
        </div>

        {/* Loading */}
        {isLoading && <LoadingSpinner />}

        {/* Error */}
        {error && !isLoading && (
          <div
            role="alert"
            className="animate-slide-up rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 flex items-start gap-3"
          >
            <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-rose-700">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-1.5 rounded-xl bg-rose-400 hover:bg-rose-500 text-white text-sm font-semibold px-4 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 active:scale-95"
              >
                <RefreshCw size={13} />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Advice result */}
        {advice && !isLoading && <AdviceCard advice={advice} />}
      </main>
    </div>
  )
}
