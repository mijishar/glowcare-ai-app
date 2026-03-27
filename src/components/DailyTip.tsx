import { Lightbulb } from 'lucide-react'
import { useDailyTip } from '../hooks/useDailyTip'

export default function DailyTip() {
  const tip = useDailyTip()

  return (
    <div
      data-testid="daily-tip"
      className="animate-slide-up rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-200 px-4 py-4 flex gap-3 items-start shadow-sm"
    >
      <div className="mt-0.5 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 animate-bounce-soft">
        <Lightbulb size={14} className="text-amber-500" />
      </div>
      <div>
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-0.5">Daily Tip</p>
        <p className="text-sm text-amber-900 leading-relaxed">{tip}</p>
      </div>
    </div>
  )
}
