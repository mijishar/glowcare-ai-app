const QUICK_OPTIONS = [
  { label: 'Acne', emoji: '🔴' },
  { label: 'Tan Removal', emoji: '☀️' },
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
      <p className="text-xs font-medium text-rose-400 uppercase tracking-wider">Quick select</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick skin concern options">
        {QUICK_OPTIONS.map(({ label, emoji }) => {
          const isActive = selectedOption === label
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              aria-pressed={isActive}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md scale-105'
                  : 'bg-white text-rose-700 border border-pink-200 hover:border-rose-300 hover:bg-rose-50 hover:scale-105'
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
