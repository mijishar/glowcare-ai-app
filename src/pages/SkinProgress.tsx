import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Trash2, Activity, ChevronRight } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts'
import { useSkinScoreHistory, SkinScoreEntry } from '../hooks/useSkinScoreHistory'

// ─── Score colour helper ──────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 75) return { text: 'text-teal-600', bg: 'bg-teal-500', light: 'bg-teal-50', border: 'border-teal-200' }
  if (score >= 50) return { text: 'text-amber-600', bg: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-200' }
  return { text: 'text-red-500', bg: 'bg-red-500', light: 'bg-red-50', border: 'border-red-200' }
}

function scoreLabel(score: number) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Fair'
  if (score >= 30) return 'Needs Care'
  return 'Poor'
}

// ─── Improvement steps based on score ────────────────────────────────────────
function getImprovementSteps(score: number): { step: string; impact: string }[] {
  if (score >= 85) return [
    { step: 'Maintain your current routine consistently', impact: '+2–3 pts' },
    { step: 'Add a weekly hydrating face mask', impact: '+3 pts' },
    { step: 'Use SPF 50 daily even indoors', impact: '+2 pts' },
    { step: 'Stay hydrated — 8 glasses of water daily', impact: '+2 pts' },
  ]
  if (score >= 70) return [
    { step: 'Add a Vitamin C serum to your morning routine', impact: '+5 pts' },
    { step: 'Use a gentle exfoliant 2x per week', impact: '+4 pts' },
    { step: 'Apply SPF 30+ every morning', impact: '+3 pts' },
    { step: 'Switch to a non-comedogenic moisturizer', impact: '+3 pts' },
    { step: 'Get 7–8 hours of sleep consistently', impact: '+3 pts' },
  ]
  if (score >= 50) return [
    { step: 'Start a consistent morning + night cleansing routine', impact: '+8 pts' },
    { step: 'Apply a targeted serum (niacinamide or retinol)', impact: '+6 pts' },
    { step: 'Use SPF daily — sun damage lowers your score', impact: '+5 pts' },
    { step: 'Reduce sugar and dairy intake', impact: '+4 pts' },
    { step: 'Drink at least 2L of water daily', impact: '+4 pts' },
    { step: 'Change pillowcases every 3 days', impact: '+3 pts' },
  ]
  return [
    { step: 'See a dermatologist for a personalized treatment plan', impact: '+15 pts' },
    { step: 'Start with a basic 3-step routine: cleanse, moisturize, SPF', impact: '+10 pts' },
    { step: 'Stop touching your face throughout the day', impact: '+5 pts' },
    { step: 'Eliminate harsh soaps and alcohol-based products', impact: '+5 pts' },
    { step: 'Eat more antioxidant-rich foods (berries, leafy greens)', impact: '+4 pts' },
    { step: 'Manage stress — cortisol worsens skin conditions', impact: '+4 pts' },
  ]
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const score = payload[0].value
  const c = scoreColor(score)
  return (
    <div className="glass rounded-2xl border border-teal-100 shadow-lg px-3 py-2 text-sm">
      <p className="text-teal-500 font-semibold text-xs mb-0.5">{label}</p>
      <p className={`font-extrabold text-lg ${c.text}`}>{score}<span className="text-xs text-teal-400 font-normal">/100</span></p>
      <p className="text-xs text-teal-400">{scoreLabel(score)}</p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SkinProgress() {
  const { getHistory, clearHistory } = useSkinScoreHistory()
  const [history, setHistory] = useState<SkinScoreEntry[]>(getHistory)

  const latest = history[history.length - 1]
  const prev = history[history.length - 2]
  const trend = latest && prev ? latest.score - prev.score : null
  const c = latest ? scoreColor(latest.score) : scoreColor(0)
  const steps = latest ? getImprovementSteps(latest.score) : []

  const handleClear = () => {
    clearHistory()
    setHistory([])
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-500 to-cyan-400 text-white pt-10 pb-16 px-4 text-center">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 animate-pulse-soft" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-300/10 translate-x-1/3 translate-y-1/3 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="relative z-10 space-y-2 max-w-sm mx-auto">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl animate-bounce-soft border border-white/30">
              <TrendingUp size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Skin Progress 📈</h1>
          <p className="text-teal-100 text-sm">Track your skin health score over time and see how you improve</p>
        </div>
      </div>

      <main className="mx-auto max-w-xl px-4 -mt-6 pb-10 space-y-5">

        {history.length === 0 ? (
          /* Empty state */
          <div className="animate-slide-up glass rounded-3xl border border-teal-100 shadow-xl p-10 flex flex-col items-center gap-4 text-center teal-glow">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
              <Activity size={32} className="text-teal-300" />
            </div>
            <div>
              <p className="text-teal-700 font-bold text-base">No scores tracked yet</p>
              <p className="text-teal-400 text-sm mt-1">Use the <strong>Scan</strong> tab to analyze your skin and your score will appear here automatically</p>
            </div>
          </div>
        ) : (
          <>
            {/* Latest score card */}
            <div className={`animate-pop glass rounded-3xl border shadow-xl p-6 teal-glow-lg ${c.border}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-1">Your Skin Score</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-6xl font-extrabold ${c.text}`}>{latest.score}</span>
                    <span className="text-2xl text-teal-400 font-semibold mb-1">/100</span>
                  </div>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${c.light} ${c.text} border ${c.border}`}>
                    {scoreLabel(latest.score)}
                  </span>
                </div>

                {/* Trend indicator */}
                <div className="flex flex-col items-center gap-1">
                  {trend === null ? (
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
                      <Minus size={22} className="text-teal-400" />
                    </div>
                  ) : trend > 0 ? (
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
                      <TrendingUp size={22} className="text-teal-500" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                      <TrendingDown size={22} className="text-red-400" />
                    </div>
                  )}
                  {trend !== null && (
                    <span className={`text-xs font-bold ${trend > 0 ? 'text-teal-500' : trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {trend > 0 ? '+' : ''}{trend} pts
                    </span>
                  )}
                  <span className="text-xs text-teal-400">vs prev</span>
                </div>
              </div>

              {/* Score bar */}
              <div className="h-3 rounded-full bg-teal-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${c.bg}`}
                  style={{ width: `${latest.score}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-teal-400 mt-1">
                <span>0</span><span>50</span><span>100</span>
              </div>

              {latest.skinType && (
                <p className="text-xs text-teal-500 mt-2">Skin type: <span className="font-semibold">{latest.skinType}</span></p>
              )}
            </div>

            {/* Progress graph */}
            {history.length >= 2 && (
              <div className="animate-slide-up glass rounded-3xl border border-teal-100 shadow-md p-5 teal-glow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-teal-700 flex items-center gap-2">
                    <TrendingUp size={15} className="text-teal-500" />
                    Progress Over Time
                  </h2>
                  <span className="text-xs text-teal-400">{history.length} scans</span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5eead4' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#5eead4' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={75} stroke="#14b8a6" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'Good', position: 'right', fontSize: 10, fill: '#14b8a6' }} />
                    <Area type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2.5}
                      fill="url(#scoreGrad)" dot={{ fill: '#14b8a6', r: 4 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Improvement steps */}
            {steps.length > 0 && (
              <div className="animate-slide-up glass rounded-3xl border border-teal-100 shadow-md p-5 space-y-4 teal-glow">
                <h2 className="text-sm font-bold text-teal-700 flex items-center gap-2">
                  <Activity size={15} className="text-teal-500" />
                  Steps to Improve Your Score
                </h2>
                <ul className="space-y-2">
                  {steps.map(({ step, impact }, i) => (
                    <li key={i}
                      className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50/60 px-4 py-3 animate-slide-in-left"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-teal-800">{step}</p>
                      </div>
                      <span className="text-xs font-bold text-teal-500 bg-teal-100 rounded-full px-2 py-0.5 flex-shrink-0 mt-0.5">
                        {impact}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-teal-400 text-center">Scan daily to track your improvement</p>
              </div>
            )}

            {/* History list */}
            <div className="animate-slide-up glass rounded-3xl border border-teal-100 shadow-md p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-teal-700">Scan History</h2>
                <button onClick={handleClear}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-semibold rounded-full px-3 py-1.5 hover:bg-red-50 transition-colors">
                  <Trash2 size={12} /> Clear
                </button>
              </div>
              <div className="space-y-2">
                {[...history].reverse().map((entry, i) => {
                  const ec = scoreColor(entry.score)
                  return (
                    <div key={entry.date}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 animate-slide-up ${ec.light} ${ec.border}`}
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <div className={`w-10 h-10 rounded-xl ${ec.bg} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-sm font-extrabold">{entry.score}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${ec.text}`}>{scoreLabel(entry.score)}</p>
                        <p className="text-xs text-teal-400">{entry.label}{entry.skinType ? ` · ${entry.skinType} skin` : ''}</p>
                      </div>
                      <ChevronRight size={14} className="text-teal-300" />
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
