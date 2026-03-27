import { Lightbulb } from 'lucide-react'
import { useDailyTip } from '../hooks/useDailyTip'

export default function DailyTip() {
  const tip = useDailyTip()

  return (
    <div
      data-testid="daily-tip"
      className="animate-slide-up glass rounded-2xl border border-teal-200 px-4 py-4 flex gap-3 items-start shadow-sm teal-glow"
    >
      <div className="mt-0.5 w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-md animate-float">
        <Lightbulb size={16} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-0.5">Daily Tip</p>
        <p className="text-sm text-teal-900 leading-relaxed">{tip}</p>
      </div>
    </div>
  )
}
