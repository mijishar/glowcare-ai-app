import { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw, Sparkles, Star, Shield, Zap, TrendingUp, Camera, MessageCircle, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import QueryInput from '../components/QueryInput'
import QuickOptions from '../components/QuickOptions'
import LoadingSpinner from '../components/LoadingSpinner'
import AdviceCard from '../components/AdviceCard'
import DailyTip from '../components/DailyTip'
import { queryAdvice } from '../services/api'
import { useQueryHistory } from '../hooks/useQueryHistory'
import { useSkinScoreHistory } from '../hooks/useSkinScoreHistory'
import { useGamification } from '../hooks/useGamification'
import type { AdviceResponse } from '../types'

const FEATURES = [
  { icon: <Zap size={13} className="text-yellow-300" />,  label: 'Instant AI Advice' },
  { icon: <Shield size={14} className="text-teal-300" />, label: 'Safe & Trusted' },
  { icon: <Star size={14} className="text-yellow-300" />, label: 'Personalized' },
]

const PARTICLES = [
  { top:'10%', left:'8%',  size:6, delay:'0s',   dur:'3s' },
  { top:'20%', left:'88%', size:8, delay:'0.5s', dur:'4s' },
  { top:'60%', left:'5%',  size:5, delay:'1s',   dur:'3.5s' },
  { top:'75%', left:'92%', size:7, delay:'1.5s', dur:'2.8s' },
  { top:'40%', left:'50%', size:4, delay:'0.8s', dur:'4.2s' },
  { top:'85%', left:'30%', size:6, delay:'0.3s', dur:'3.8s' },
]

const QUICK_LINKS = [
  { to: '/analyze',      icon: <Camera size={20} />,      label: 'Skin Scan',   desc: 'AI photo analysis',    gradient: 'from-teal-500 to-cyan-500' },
  { to: '/chat',         icon: <MessageCircle size={20}/>, label: 'Dr. Glow',   desc: 'Chat with AI derm',    gradient: 'from-violet-500 to-fuchsia-500' },
  { to: '/progress',     icon: <TrendingUp size={20} />,  label: 'Progress',    desc: 'Track your score',     gradient: 'from-cyan-500 to-teal-500' },
  { to: '/achievements', icon: <Trophy size={20} />,      label: 'Badges',      desc: 'Earn achievements',    gradient: 'from-amber-500 to-orange-500' },
]

export default function Home() {
  const { addEntry } = useQueryHistory()
  const { getHistory } = useSkinScoreHistory()
  const { getState } = useGamification()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [advice, setAdvice] = useState<AdviceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [heroVisible, setHeroVisible] = useState(false)

  const scoreHistory = getHistory()
  const latestScore = scoreHistory[scoreHistory.length - 1]
  const gamState = getState()

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = async (value: string) => {
    if (!value.trim()) return
    setIsLoading(true); setError(null); setAdvice(null)
    try {
      const response = await queryAdvice(value)
      setAdvice(response)
      addEntry(value, response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickOptionSelect = (option: string) => {
    setSelectedOption(option); setInput(option); handleSubmit(option)
  }

  return (
    <div className="min-h-screen">
      {/* Premium hero */}
      <div className="relative overflow-hidden bg-premium text-white pt-12 pb-20 px-4 text-center">
        {/* Animated orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 animate-pulse-soft" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-500/10 translate-x-1/3 translate-y-1/3 animate-pulse-soft" style={{ animationDelay:'1s' }} />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-cyan-300/10 blur-2xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-fuchsia-300/10 blur-xl animate-float" style={{ animationDelay:'1.5s' }} />

        {PARTICLES.map((p, i) => (
          <div key={i} className="absolute rounded-full bg-white/15 animate-bounce-soft"
            style={{ top:p.top, left:p.left, width:p.size, height:p.size, animationDelay:p.delay, animationDuration:p.dur }} />
        ))}

        <div className="relative z-10 space-y-4 max-w-lg mx-auto transition-all duration-700"
          style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(24px)' }}>
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-2xl animate-float border border-white/20">
              <Sparkles size={36} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-tight">
            Your Skin, Your Glow ✨
          </h1>
          <p className="text-white/80 text-base leading-relaxed max-w-sm mx-auto">
            AI-powered personalized skincare — describe your concern and get expert guidance instantly
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {FEATURES.map(({ icon, label }, i) => (
              <span key={label} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-500"
                style={{ opacity: heroVisible ? 1 : 0, transitionDelay:`${0.3 + i * 0.15}s` }}>
                {icon} {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 -mt-8 pb-12 space-y-6">

        {/* Dashboard stats row */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up">
          {/* Skin score */}
          <div className="glass rounded-3xl border border-white/60 shadow-card p-4 glow-teal">
            <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-1">Skin Score</p>
            {latestScore ? (
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-teal-700">{latestScore.score}</span>
                <span className="text-lg text-teal-400 mb-1">/100</span>
              </div>
            ) : (
              <p className="text-sm text-teal-400 mt-1">Scan to get your score</p>
            )}
            <div className="mt-2 h-1.5 rounded-full bg-teal-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-700"
                style={{ width: latestScore ? `${latestScore.score}%` : '0%' }} />
            </div>
          </div>

          {/* Streak */}
          <div className="glass rounded-3xl border border-white/60 shadow-card p-4 glow-violet">
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-1">Streak</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black text-violet-600">{gamState.streak}</span>
              <span className="text-lg text-violet-400 mb-1">days 🔥</span>
            </div>
            <p className="text-xs text-violet-400 mt-1">{gamState.glowLevel.emoji} {gamState.glowLevel.name}</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay:'0.1s' }}>
          {QUICK_LINKS.map(({ to, icon, label, desc, gradient }) => (
            <Link key={to} to={to}
              className={`glass rounded-3xl border border-white/60 shadow-card p-4 flex flex-col items-center gap-2 text-center hover:scale-105 transition-all duration-200 active:scale-95 group`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md text-white group-hover:shadow-lg transition-shadow`}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Daily Tip */}
        <DailyTip />

        {/* Input card */}
        <div className="glass rounded-3xl border border-white/60 shadow-glow-teal p-6 space-y-5 animate-slide-up" style={{ animationDelay:'0.2s' }}>
          <QueryInput value={input} onChange={setInput} onSubmit={handleSubmit} isLoading={isLoading} />
          <div className="border-t border-teal-50 pt-4">
            <QuickOptions selectedOption={selectedOption} onSelect={handleQuickOptionSelect} />
          </div>
        </div>

        {isLoading && <LoadingSpinner />}

        {error && !isLoading && (
          <div role="alert" className="animate-slide-up glass rounded-3xl border border-red-200 px-5 py-4 flex items-start gap-3 shadow-card">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={16} className="text-red-500" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <p className="text-xs text-red-400">Make sure the backend server is running on port 3001.</p>
              <button type="button" onClick={() => input.trim() && handleSubmit(input)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-sm font-bold px-4 py-2 transition-all focus:outline-none active:scale-95 shadow-sm">
                <RefreshCw size={13} /> Try Again
              </button>
            </div>
          </div>
        )}

        {advice && !isLoading && <AdviceCard advice={advice} />}
      </main>
    </div>
  )
}
