import { useState, useEffect } from 'react'
import { Trophy, Flame, Star, Zap, CheckCircle } from 'lucide-react'
import { useGamification, GamificationState, GLOW_LEVELS } from '../hooks/useGamification'

function StreakCalendar({ streak }: { streak: number }) {
  const days = Array.from({ length: 7 }, (_, i) => i < streak % 7 || streak >= 7)
  return (
    <div className="flex gap-1.5 justify-center">
      {days.map((active, i) => (
        <div key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
          active ? 'bg-gradient-to-br from-teal-400 to-cyan-400 text-white shadow-sm animate-pop' : 'bg-teal-50 border border-teal-100 text-teal-300'
        }`} style={{ animationDelay: `${i * 0.05}s` }}>
          {active ? '🔥' : (i + 1)}
        </div>
      ))}
    </div>
  )
}

export default function Achievements() {
  const { getState, checkIn } = useGamification()
  const [state, setState] = useState<GamificationState>(getState)
  const [newBadges, setNewBadges] = useState<string[]>([])
  const [leveledUp, setLeveledUp] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const alreadyCheckedIn = state.lastCheckIn === today

  useEffect(() => {
    setState(getState())
  }, [])

  const handleCheckIn = () => {
    const result = checkIn()
    setState(result.state)
    if (result.newBadges.length > 0) setNewBadges(result.newBadges.map(b => b.id))
    if (result.leveledUp) setLeveledUp(true)
    setCheckedIn(true)
    setTimeout(() => { setNewBadges([]); setLeveledUp(false); setCheckedIn(false) }, 4000)
  }

  const { streak, totalCheckIns, badges, glowLevel, xp } = state
  const unlockedBadges = badges.filter(b => !b.locked)
  const lockedBadges = badges.filter(b => b.locked)
  const nextLevel = GLOW_LEVELS.find(l => l.level === glowLevel.level + 1)
  const progressToNext = nextLevel ? Math.min(100, ((streak - glowLevel.minStreak) / (nextLevel.minStreak - glowLevel.minStreak)) * 100) : 100

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-500 to-cyan-400 text-white pt-10 pb-16 px-4 text-center">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 animate-pulse-soft" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-300/10 translate-x-1/3 translate-y-1/3 animate-pulse-soft" />
        <div className="relative z-10 space-y-2 max-w-sm mx-auto">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl animate-bounce-soft border border-white/30">
              <Trophy size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Achievements 🏆</h1>
          <p className="text-teal-100 text-sm">Build your streak, earn badges, level up your glow</p>
        </div>
      </div>

      <main className="mx-auto max-w-xl px-4 -mt-6 pb-10 space-y-5">

        {/* Level up / new badge toast */}
        {(leveledUp || newBadges.length > 0) && (
          <div className="animate-pop glass rounded-3xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 px-5 py-4 shadow-lg text-center space-y-1">
            <p className="text-2xl">{leveledUp ? '🎉' : '🏅'}</p>
            <p className="font-extrabold text-amber-700 text-base">
              {leveledUp ? `Level Up! You're now ${state.glowLevel.name} ${state.glowLevel.emoji}` : `Badge Unlocked!`}
            </p>
            {newBadges.map(id => {
              const b = badges.find(b => b.id === id)
              return b ? <p key={id} className="text-sm text-amber-600">{b.emoji} {b.name}</p> : null
            })}
          </div>
        )}

        {/* Streak card */}
        <div className="animate-slide-up glass rounded-3xl border border-teal-100 shadow-xl p-6 space-y-4 teal-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-orange-500" />
              <span className="font-extrabold text-teal-800 text-lg">{streak}-Day Streak</span>
            </div>
            <div className="flex items-center gap-1.5 bg-teal-50 rounded-full px-3 py-1 border border-teal-100">
              <Zap size={12} className="text-teal-500" />
              <span className="text-xs font-bold text-teal-600">{xp} XP</span>
            </div>
          </div>

          <StreakCalendar streak={streak} />

          <div className="text-center space-y-1">
            <p className="text-xs text-teal-500">{totalCheckIns} total check-ins</p>
          </div>

          <button
            onClick={handleCheckIn}
            disabled={alreadyCheckedIn}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl font-bold py-3.5 text-base transition-all shadow-md focus:outline-none active:scale-[0.98] ${
              alreadyCheckedIn
                ? 'bg-teal-100 text-teal-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white teal-glow hover:shadow-lg'
            }`}
          >
            {alreadyCheckedIn ? (
              <><CheckCircle size={17} /> Checked in today ✓</>
            ) : (
              <><Flame size={17} /> Check In Today (+10 XP)</>
            )}
          </button>
        </div>

        {/* Glow Level card */}
        <div className={`animate-slide-up glass rounded-3xl border border-teal-100 shadow-md p-5 space-y-3 bg-gradient-to-br ${glowLevel.gradient}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-0.5">Current Level</p>
              <p className={`text-xl font-extrabold ${glowLevel.color}`}>{glowLevel.emoji} {glowLevel.name}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center text-3xl shadow-sm">
              {glowLevel.emoji}
            </div>
          </div>

          {nextLevel && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-teal-500">
                <span>Progress to {nextLevel.name} {nextLevel.emoji}</span>
                <span>{streak}/{nextLevel.minStreak} days</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/60 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-700"
                  style={{ width: `${progressToNext}%` }} />
              </div>
            </div>
          )}

          {/* All levels */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {GLOW_LEVELS.map(l => (
              <div key={l.level} className={`rounded-2xl p-2 text-center border transition-all ${
                l.level === glowLevel.level
                  ? 'bg-white/80 border-teal-300 shadow-sm scale-105'
                  : l.level < glowLevel.level
                  ? 'bg-white/40 border-teal-100'
                  : 'bg-white/20 border-transparent opacity-50'
              }`}>
                <p className="text-lg">{l.emoji}</p>
                <p className="text-xs font-semibold text-teal-700 leading-tight">{l.name}</p>
                <p className="text-xs text-teal-400">{l.minStreak}d</p>
              </div>
            ))}
          </div>
        </div>

        {/* Unlocked badges */}
        {unlockedBadges.length > 0 && (
          <div className="animate-slide-up glass rounded-3xl border border-teal-100 shadow-md p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-teal-700">
              <Star size={15} className="text-yellow-500" /> Earned Badges ({unlockedBadges.length})
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {unlockedBadges.map(b => (
                <div key={b.id} className={`rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-3 flex items-center gap-2.5 animate-pop ${newBadges.includes(b.id) ? 'ring-2 ring-yellow-400' : ''}`}>
                  <span className="text-2xl">{b.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-teal-800">{b.name}</p>
                    <p className="text-xs text-teal-500 leading-tight">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked badges */}
        {lockedBadges.length > 0 && (
          <div className="animate-slide-up glass rounded-3xl border border-teal-100 shadow-md p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-teal-400">
              <Trophy size={15} className="text-teal-300" /> Locked Badges ({lockedBadges.length})
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {lockedBadges.map(b => (
                <div key={b.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-3 flex items-center gap-2.5 opacity-60">
                  <span className="text-2xl grayscale">{b.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-500">{b.name}</p>
                    <p className="text-xs text-gray-400 leading-tight">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
