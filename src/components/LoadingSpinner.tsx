import { Sparkles } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div role="status" className="animate-fade-in flex flex-col items-center justify-center py-10 gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-pink-100 border-t-rose-400 animate-spin" aria-hidden="true" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles size={18} className="text-rose-400 animate-pulse-soft" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-rose-500 font-semibold text-sm">Analyzing your skin concern...</p>
        <p className="text-rose-300 text-xs">This may take a few seconds</p>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
