import { useState, KeyboardEvent } from 'react'
import { Sparkles, Send } from 'lucide-react'

interface QueryInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  isLoading: boolean
}

export default function QueryInput({ value, onChange, onSubmit, isLoading }: QueryInputProps) {
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!value.trim()) {
      setValidationError('Please describe your skin concern before submitting.')
      return
    }
    setValidationError(null)
    onSubmit(value)
  }

  const handleChange = (newValue: string) => {
    if (validationError) setValidationError(null)
    onChange(newValue)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full space-y-3">
      <label htmlFor="skin-concern-input" className="flex items-center gap-2 text-rose-700 font-semibold text-base">
        <Sparkles size={16} className="text-rose-400" />
        Describe your skin concern
      </label>
      <div className="relative">
        <textarea
          id="skin-concern-input"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. I have oily skin with frequent breakouts..."
          rows={4}
          aria-describedby={validationError ? 'skin-concern-error' : undefined}
          aria-invalid={!!validationError}
          className={`w-full rounded-2xl border-2 px-4 py-3 text-base text-rose-900 placeholder-rose-300 bg-white/70 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all duration-200 ${
            validationError ? 'border-rose-400' : 'border-pink-200 focus:border-pink-400'
          }`}
        />
      </div>
      {validationError && (
        <p id="skin-concern-error" role="alert" className="text-sm text-rose-500 flex items-center gap-1">
          ⚠️ {validationError}
        </p>
      )}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        aria-label="Submit skin concern"
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 disabled:from-rose-200 disabled:to-pink-200 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-base transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Analyzing your skin...
          </>
        ) : (
          <>
            <Send size={16} />
            Get Advice
          </>
        )}
      </button>
    </div>
  )
}
