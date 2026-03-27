export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  unlockedAt?: number
  locked: boolean
}

export interface GlowLevel {
  level: number
  name: string
  emoji: string
  minStreak: number
  color: string
  gradient: string
}

export interface GamificationState {
  streak: number
  lastCheckIn: string | null
  totalCheckIns: number
  badges: Badge[]
  glowLevel: GlowLevel
  xp: number
}

const KEY = 'glowcare_gamification'

export const GLOW_LEVELS: GlowLevel[] = [
  { level: 1, name: 'Glow Starter',    emoji: '🌱', minStreak: 0,  color: 'text-gray-500',   gradient: 'from-gray-100 to-gray-200' },
  { level: 2, name: 'Skin Seeker',     emoji: '🌿', minStreak: 3,  color: 'text-green-600',  gradient: 'from-green-100 to-teal-100' },
  { level: 3, name: 'Glow Apprentice', emoji: '✨', minStreak: 7,  color: 'text-teal-600',   gradient: 'from-teal-100 to-cyan-100' },
  { level: 4, name: 'Radiance Rising', emoji: '💫', minStreak: 14, color: 'text-cyan-600',   gradient: 'from-cyan-100 to-blue-100' },
  { level: 5, name: 'Glow Champion',   emoji: '🌟', minStreak: 21, color: 'text-yellow-600', gradient: 'from-yellow-100 to-amber-100' },
  { level: 6, name: 'Skin Goddess',    emoji: '👑', minStreak: 30, color: 'text-purple-600', gradient: 'from-purple-100 to-pink-100' },
]

export const ALL_BADGES: Badge[] = [
  { id: 'first_checkin',   name: 'First Step',       emoji: '👣', description: 'Complete your first daily check-in',       locked: true },
  { id: 'streak_3',        name: '3-Day Streak',      emoji: '🔥', description: 'Maintain a 3-day skincare streak',          locked: true },
  { id: 'streak_7',        name: 'Glow Level Up!',    emoji: '⭐', description: '7 days of consistent skincare',             locked: true },
  { id: 'streak_14',       name: 'Two Week Warrior',  emoji: '💪', description: '14 days of dedication',                     locked: true },
  { id: 'streak_21',       name: '21-Day Habit',      emoji: '🏆', description: 'You\'ve built a real habit!',               locked: true },
  { id: 'streak_30',       name: 'Skin Goddess',      emoji: '👑', description: '30-day streak — you\'re unstoppable!',      locked: true },
  { id: 'first_scan',      name: 'Skin Scanner',      emoji: '📸', description: 'Complete your first AI skin scan',          locked: true },
  { id: 'score_70',        name: 'Healthy Glow',      emoji: '🌸', description: 'Achieve a skin score of 70+',               locked: true },
  { id: 'score_85',        name: 'Radiant Skin',      emoji: '💎', description: 'Achieve a skin score of 85+',               locked: true },
  { id: 'first_chat',      name: 'Ask the Doc',       emoji: '💬', description: 'Have your first chat with Dr. Glow',        locked: true },
  { id: 'tip_reader',      name: 'Tip Collector',     emoji: '💡', description: 'Read 7 daily tips',                         locked: true },
]

function getLevel(streak: number): GlowLevel {
  return [...GLOW_LEVELS].reverse().find(l => streak >= l.minStreak) ?? GLOW_LEVELS[0]
}

function load(): GamificationState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    return JSON.parse(raw)
  } catch { return defaultState() }
}

function defaultState(): GamificationState {
  return {
    streak: 0,
    lastCheckIn: null,
    totalCheckIns: 0,
    badges: ALL_BADGES.map(b => ({ ...b, locked: true })),
    glowLevel: GLOW_LEVELS[0],
    xp: 0,
  }
}

function save(state: GamificationState) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
}

export function useGamification() {
  const getState = (): GamificationState => load()

  const checkIn = (): { state: GamificationState; newBadges: Badge[]; leveledUp: boolean } => {
    const state = load()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (state.lastCheckIn === today) {
      return { state, newBadges: [], leveledUp: false }
    }

    const prevStreak = state.streak
    const newStreak = state.lastCheckIn === yesterday ? prevStreak + 1 : 1
    const newTotal = state.totalCheckIns + 1
    const newXp = state.xp + 10 + (newStreak >= 7 ? 5 : 0)

    // Unlock badges
    const newBadges: Badge[] = []
    const badges = state.badges.map(b => {
      if (!b.locked) return b
      let unlock = false
      if (b.id === 'first_checkin' && newTotal >= 1) unlock = true
      if (b.id === 'streak_3'  && newStreak >= 3)  unlock = true
      if (b.id === 'streak_7'  && newStreak >= 7)  unlock = true
      if (b.id === 'streak_14' && newStreak >= 14) unlock = true
      if (b.id === 'streak_21' && newStreak >= 21) unlock = true
      if (b.id === 'streak_30' && newStreak >= 30) unlock = true
      if (unlock) { newBadges.push({ ...b, locked: false, unlockedAt: Date.now() }); return { ...b, locked: false, unlockedAt: Date.now() } }
      return b
    })

    const prevLevel = getLevel(prevStreak)
    const newLevel = getLevel(newStreak)
    const leveledUp = newLevel.level > prevLevel.level

    const newState: GamificationState = {
      streak: newStreak,
      lastCheckIn: today,
      totalCheckIns: newTotal,
      badges,
      glowLevel: newLevel,
      xp: newXp,
    }
    save(newState)
    return { state: newState, newBadges, leveledUp }
  }

  const unlockBadge = (id: string) => {
    const state = load()
    const badges = state.badges.map(b =>
      b.id === id && b.locked ? { ...b, locked: false, unlockedAt: Date.now() } : b
    )
    save({ ...state, badges, xp: state.xp + 20 })
  }

  const addXp = (amount: number) => {
    const state = load()
    save({ ...state, xp: state.xp + amount })
  }

  return { getState, checkIn, unlockBadge, addXp }
}
