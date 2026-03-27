const QUICK_OPTIONS = [
  { label: 'Acne',         emoji: '🔴' },
  { label: 'Tan Removal',  emoji: '☀️' },
  { label: 'Glowing Skin', emoji: '✨' },
  { label: 'Dark Circles', emoji: '👁️' },
]

interface QuickOptionsProps {
  selectedOption: string | null
  onSelect: (option: string) => void
}

export default function QuickOptions({ selectedOption, onSelect }: QuickOptionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-teal-500 uppercase tracking-wider">Quick select</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick skin concern options">
        {QUICK_OPTIONS.map(({ label, emoji }) => {
          const isActive = selectedOption === label
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              aria-pressed={isActive}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md scale-105 teal-glow'
                  : 'bg-white/80 text-teal-700 border border-teal-200 hover:border-teal-400 hover:bg-teal-50 hover:scale-105'
              }`}
            >
              <span>{emoji}</span>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { QUICK_OPTIONS }
