import { Sparkles } from 'lucide-react'

const STEPS = ['Reading your concern...', 'Detecting skin type...', 'Building your routine...', 'Almost ready...']

export default function LoadingSpinner() {
  return (
    <div role="status" className="animate-fade-in glass rounded-3xl border border-teal-100 shadow-md px-6 py-10 flex flex-col items-center gap-5">
      {/* Spinner */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" aria-hidden="true" />
        <div className="w-10 h-10 rounded-full border-4 border-cyan-100 border-b-cyan-400 animate-spin absolute top-3 left-3" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} aria-hidden="true" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles size={16} className="text-teal-500 animate-pulse-soft" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-teal-700 font-bold text-sm">Analyzing your skin concern</p>
        <p className="text-teal-400 text-xs">Powered by AI — just a moment ✨</p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full bg-teal-200 animate-pulse-soft"
            style={{ width: i === 0 ? '24px' : '8px', animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  )
}
