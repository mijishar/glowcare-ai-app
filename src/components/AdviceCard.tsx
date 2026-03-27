import { Sun, Moon, Leaf, ShoppingBag, CheckCircle, XCircle } from 'lucide-react'
import type { AdviceResponse } from '../types'
import SkinTypeTag from './SkinTypeTag'
import DermatologistAlert from './DermatologistAlert'

interface AdviceCardProps {
  advice: AdviceResponse
}

function Section({ icon, title, testId, accent, children, delay = '0s' }: {
  icon: React.ReactNode
  title: string
  testId: string
  accent: string
  children: React.ReactNode
  delay?: string
}) {
  return (
    <section
      className="space-y-3 animate-slide-up"
      style={{ animationDelay: delay }}
    >
      <h2
        data-testid={testId}
        className={`flex items-center gap-2 text-base font-bold ${accent}`}
      >
        <span className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 shadow-sm animate-float" style={{ animationDelay: delay }}>
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function ListItem({ text, variant = 'default', delay = '0s' }: {
  text: string
  variant?: 'do' | 'dont' | 'default'
  delay?: string
}) {
  const styles = {
    do:      { wrap: 'bg-teal-50 border-teal-200 text-teal-900',   icon: <CheckCircle size={13} className="text-teal-500 flex-shrink-0 mt-0.5" /> },
    dont:    { wrap: 'bg-red-50 border-red-200 text-red-800',       icon: <XCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" /> },
    default: { wrap: 'bg-cyan-50 border-cyan-100 text-teal-800',    icon: <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0 mt-2" /> },
  }
  const s = styles[variant]

  return (
    <li
      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-sm animate-slide-in-left ${s.wrap}`}
      style={{ animationDelay: delay }}
    >
      {s.icon}
      <span>{text}</span>
    </li>
  )
}

export default function AdviceCard({ advice }: AdviceCardProps) {
  const { skinType, routine, homeRemedies, productSuggestions, dosAndDonts, dermatologistFlag } = advice

  return (
    <div className="animate-pop glass rounded-3xl border border-teal-100 shadow-xl p-5 space-y-6 teal-glow-lg">
      {/* Skin type */}
      {skinType && (
        <div className="animate-slide-in-left">
          <SkinTypeTag skinType={skinType} />
        </div>
      )}

      {/* Dermatologist alert */}
      <DermatologistAlert show={dermatologistFlag} />

      {/* Skincare Routine */}
      <Section icon={<Sun size={15} className="text-amber-500" />} title="Skincare Routine" testId="section-routine" accent="text-teal-700" delay="0.05s">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 space-y-2 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
            <p className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wide">
              <Sun size={11} /> Morning
            </p>
            <ul className="space-y-1.5">
              {routine.morning.map((step, i) => <ListItem key={i} text={step} delay={`${0.12 + i * 0.05}s`} />)}
            </ul>
          </div>
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-3 space-y-2 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
            <p className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 uppercase tracking-wide">
              <Moon size={11} /> Night
            </p>
            <ul className="space-y-1.5">
              {routine.night.map((step, i) => <ListItem key={i} text={step} delay={`${0.12 + i * 0.05}s`} />)}
            </ul>
          </div>
        </div>
      </Section>

      {/* Home Remedies */}
      <Section icon={<Leaf size={15} className="text-teal-500" />} title="Home Remedies" testId="section-home-remedies" accent="text-teal-700" delay="0.15s">
        <ul className="space-y-1.5">
          {homeRemedies.map((remedy, i) => <ListItem key={i} text={remedy} delay={`${0.2 + i * 0.05}s`} />)}
        </ul>
      </Section>

      {/* Product Suggestions */}
      <Section icon={<ShoppingBag size={15} className="text-teal-500" />} title="Product Suggestions" testId="section-product-suggestions" accent="text-teal-700" delay="0.25s">
        <ul className="space-y-1.5">
          {productSuggestions.map((product, i) => <ListItem key={i} text={product} delay={`${0.3 + i * 0.05}s`} />)}
        </ul>
      </Section>

      {/* Do's and Don'ts */}
      <Section icon={<CheckCircle size={15} className="text-teal-500" />} title="Do's and Don'ts" testId="section-dos-and-donts" accent="text-teal-700" delay="0.35s">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-1">✅ Do's</p>
            <ul className="space-y-1.5">
              {dosAndDonts.dos.map((item, i) => <ListItem key={i} text={item} variant="do" delay={`${0.4 + i * 0.05}s`} />)}
            </ul>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">❌ Don'ts</p>
            <ul className="space-y-1.5">
              {dosAndDonts.donts.map((item, i) => <ListItem key={i} text={item} variant="dont" delay={`${0.4 + i * 0.05}s`} />)}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  )
}
