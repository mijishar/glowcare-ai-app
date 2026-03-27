import { Sun, Moon, Leaf, ShoppingBag, CheckCircle, XCircle } from 'lucide-react'
import type { AdviceResponse } from '../types'
import SkinTypeTag from './SkinTypeTag'
import DermatologistAlert from './DermatologistAlert'

interface AdviceCardProps {
  advice: AdviceResponse
}

function Section({ icon, title, testId, children }: {
  icon: React.ReactNode
  title: string
  testId: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2
        data-testid={testId}
        className="flex items-center gap-2 text-base font-bold text-rose-700"
      >
        <span className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function ListItem({ text, variant = 'default' }: { text: string; variant?: 'do' | 'dont' | 'default' }) {
  const colors = {
    do:      'bg-emerald-50 border-emerald-200 text-emerald-800',
    dont:    'bg-rose-50 border-rose-200 text-rose-800',
    default: 'bg-pink-50 border-pink-100 text-stone-700',
  }
  const icons = {
    do:      <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />,
    dont:    <XCircle size={13} className="text-rose-400 flex-shrink-0 mt-0.5" />,
    default: <span className="w-1.5 h-1.5 rounded-full bg-rose-300 flex-shrink-0 mt-2" />,
  }

  return (
    <li className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${colors[variant]}`}>
      {icons[variant]}
      <span>{text}</span>
    </li>
  )
}

export default function AdviceCard({ advice }: AdviceCardProps) {
  const { skinType, routine, homeRemedies, productSuggestions, dosAndDonts, dermatologistFlag } = advice

  return (
    <div className="animate-slide-up rounded-2xl bg-white/80 backdrop-blur-sm border border-pink-100 shadow-md p-5 space-y-6">
      {/* Skin type */}
      {skinType && <SkinTypeTag skinType={skinType} />}

      {/* Dermatologist alert */}
      <DermatologistAlert show={dermatologistFlag} />

      {/* Skincare Routine */}
      <Section icon={<Sun size={14} className="text-rose-500" />} title="Skincare Routine" testId="section-routine">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wide">
              <Sun size={11} /> Morning
            </p>
            <ul className="space-y-1.5">
              {routine.morning.map((step, i) => (
                <ListItem key={i} text={step} />
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 uppercase tracking-wide">
              <Moon size={11} /> Night
            </p>
            <ul className="space-y-1.5">
              {routine.night.map((step, i) => (
                <ListItem key={i} text={step} />
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Home Remedies */}
      <Section icon={<Leaf size={14} className="text-emerald-500" />} title="Home Remedies" testId="section-home-remedies">
        <ul className="space-y-1.5">
          {homeRemedies.map((remedy, i) => (
            <ListItem key={i} text={remedy} />
          ))}
        </ul>
      </Section>

      {/* Product Suggestions */}
      <Section icon={<ShoppingBag size={14} className="text-rose-500" />} title="Product Suggestions" testId="section-product-suggestions">
        <ul className="space-y-1.5">
          {productSuggestions.map((product, i) => (
            <ListItem key={i} text={product} />
          ))}
        </ul>
      </Section>

      {/* Do's and Don'ts */}
      <Section icon={<CheckCircle size={14} className="text-rose-500" />} title="Do's and Don'ts" testId="section-dos-and-donts">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">✅ Do's</p>
            <ul className="space-y-1.5">
              {dosAndDonts.dos.map((item, i) => (
                <ListItem key={i} text={item} variant="do" />
              ))}
            </ul>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-1">❌ Don'ts</p>
            <ul className="space-y-1.5">
              {dosAndDonts.donts.map((item, i) => (
                <ListItem key={i} text={item} variant="dont" />
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  )
}
