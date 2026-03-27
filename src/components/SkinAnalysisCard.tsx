import { Sun, Moon, Leaf, ShoppingBag, CheckCircle, XCircle, Activity, AlertTriangle } from 'lucide-react'
import type { SkinAnalysisResult, SeverityLevel } from '../types'
import SkinTypeTag from './SkinTypeTag'
import DermatologistAlert from './DermatologistAlert'

interface Props { result: SkinAnalysisResult }

const severityConfig: Record<SeverityLevel, { label: string; color: string; bar: string; width: string }> = {
  none:   { label: 'None',   color: 'text-teal-600',  bar: 'bg-teal-300',  width: 'w-0' },
  low:    { label: 'Low',    color: 'text-green-600', bar: 'bg-green-400', width: 'w-1/4' },
  medium: { label: 'Medium', color: 'text-amber-600', bar: 'bg-amber-400', width: 'w-2/4' },
  high:   { label: 'High',   color: 'text-red-600',   bar: 'bg-red-400',   width: 'w-3/4' },
}

function SeverityRow({ label, value }: { label: string; value: SeverityLevel }) {
  const cfg = severityConfig[value]
  return (
    <div className="space-y-1 animate-slide-up">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-teal-800">{label}</span>
        <span className={`font-bold text-xs ${cfg.color}`}>{cfg.label}</span>
      </div>
      <div className="h-2 rounded-full bg-teal-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar} ${cfg.width}`} />
      </div>
    </div>
  )
}

function HealthScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? '#14b8a6' : score >= 50 ? '#f59e0b' : '#ef4444'
  const r = 36, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1 animate-pop">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#ccfbf1" strokeWidth="8" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-teal-700">{score}</span>
          <span className="text-xs text-teal-400 font-medium">/100</span>
        </div>
      </div>
      <p className="text-xs font-bold text-teal-600 uppercase tracking-wide">Skin Health Score</p>
    </div>
  )
}

function Section({ icon, title, children, delay = '0s' }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; delay?: string
}) {
  return (
    <section className="space-y-2 animate-slide-up" style={{ animationDelay: delay }}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-teal-700">
        <span className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function ListItem({ text, variant = 'default', delay = '0s' }: {
  text: string; variant?: 'do' | 'dont' | 'default'; delay?: string
}) {
  const styles = {
    do:      { wrap: 'bg-teal-50 border-teal-200 text-teal-900',  icon: <CheckCircle size={12} className="text-teal-500 flex-shrink-0 mt-0.5" /> },
    dont:    { wrap: 'bg-red-50 border-red-200 text-red-800',      icon: <XCircle size={12} className="text-red-400 flex-shrink-0 mt-0.5" /> },
    default: { wrap: 'bg-cyan-50 border-cyan-100 text-teal-800',   icon: <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0 mt-2" /> },
  }
  const s = styles[variant]
  return (
    <li className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm transition-all hover:scale-[1.01] animate-slide-in-left ${s.wrap}`}
      style={{ animationDelay: delay }}>
      {s.icon}<span>{text}</span>
    </li>
  )
}

export default function SkinAnalysisCard({ result }: Props) {
  const { skinType, acne, pigmentation, darkCircles, healthScore, skinSummary,
    routine, dos, donts, naturalRemedies, productSuggestions, dermatologistFlag } = result

  const isUnclear = healthScore === 0 && !skinType

  return (
    <div className="animate-pop glass rounded-3xl border border-teal-100 shadow-xl p-5 space-y-6 teal-glow-lg">

      {/* Unclear image message */}
      {isUnclear && skinSummary ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 font-medium">{skinSummary}</p>
        </div>
      ) : (
        <>
          {/* Score + metrics */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <HealthScoreRing score={healthScore} />
            <div className="flex-1 space-y-2 w-full">
              {skinType && <SkinTypeTag skinType={skinType} />}
              <div className="space-y-2.5 pt-1">
                <SeverityRow label="Acne" value={acne} />
                <SeverityRow label="Pigmentation" value={pigmentation} />
                <SeverityRow label="Dark Circles" value={darkCircles} />
              </div>
            </div>
          </div>

          {/* Skin summary */}
          {skinSummary && (
            <div className="rounded-2xl bg-teal-50 border border-teal-100 px-4 py-3 animate-slide-up">
              <p className="text-sm text-teal-800 leading-relaxed">{skinSummary}</p>
            </div>
          )}

          <DermatologistAlert show={dermatologistFlag} />

          {/* Routine */}
          {routine && (routine.morning.length > 0 || routine.night.length > 0) && (
            <Section icon={<Sun size={13} className="text-amber-500" />} title="Daily Skincare Routine" delay="0.1s">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {routine.morning.length > 0 && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 space-y-1.5">
                    <p className="flex items-center gap-1 text-xs font-bold text-amber-600 uppercase tracking-wide"><Sun size={10} /> Morning</p>
                    <ul className="space-y-1.5">{routine.morning.map((s, i) => <ListItem key={i} text={s} delay={`${0.12 + i * 0.04}s`} />)}</ul>
                  </div>
                )}
                {routine.night.length > 0 && (
                  <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-3 space-y-1.5">
                    <p className="flex items-center gap-1 text-xs font-bold text-indigo-500 uppercase tracking-wide"><Moon size={10} /> Night</p>
                    <ul className="space-y-1.5">{routine.night.map((s, i) => <ListItem key={i} text={s} delay={`${0.12 + i * 0.04}s`} />)}</ul>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Do's and Don'ts */}
          {((dos?.length ?? 0) > 0 || (donts?.length ?? 0) > 0) && (
            <Section icon={<CheckCircle size={13} className="text-teal-500" />} title="Do's and Don'ts" delay="0.2s">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(dos?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-1.5">✅ Do's</p>
                    <ul className="space-y-1.5">{dos!.map((d, i) => <ListItem key={i} text={d} variant="do" delay={`${0.22 + i * 0.04}s`} />)}</ul>
                  </div>
                )}
                {(donts?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1.5">❌ Don'ts</p>
                    <ul className="space-y-1.5">{donts!.map((d, i) => <ListItem key={i} text={d} variant="dont" delay={`${0.22 + i * 0.04}s`} />)}</ul>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Natural Remedies */}
          {(naturalRemedies?.length ?? 0) > 0 && (
            <Section icon={<Leaf size={13} className="text-teal-500" />} title="Natural Remedies" delay="0.3s">
              <ul className="space-y-1.5">{naturalRemedies!.map((r, i) => <ListItem key={i} text={r} delay={`${0.32 + i * 0.04}s`} />)}</ul>
            </Section>
          )}

          {/* Product Suggestions */}
          {(productSuggestions?.length ?? 0) > 0 && (
            <Section icon={<ShoppingBag size={13} className="text-teal-500" />} title="Product Suggestions" delay="0.4s">
              <ul className="space-y-1.5">{productSuggestions!.map((p, i) => <ListItem key={i} text={p} delay={`${0.42 + i * 0.04}s`} />)}</ul>
            </Section>
          )}
        </>
      )}

      {/* Disclaimer */}
      <p className="flex items-start gap-1.5 text-xs text-teal-400 border-t border-teal-50 pt-3">
        <Activity size={11} className="flex-shrink-0 mt-0.5" />
        AI-based analysis for informational purposes only. Consult a dermatologist for medical advice.
      </p>
    </div>
  )
}
