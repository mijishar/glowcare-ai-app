import { AlertTriangle } from 'lucide-react'

interface DermatologistAlertProps {
  show: boolean
}

export default function DermatologistAlert({ show }: DermatologistAlertProps) {
  if (!show) return null

  return (
    <div
      role="alert"
      data-testid="dermatologist-alert"
      className="animate-slide-up flex items-start gap-3 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-4 shadow-sm"
    >
      <div className="mt-0.5 w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
        <AlertTriangle size={17} className="text-amber-500" />
      </div>
      <div>
        <p className="text-sm font-bold text-amber-800 mb-0.5">Professional Attention Recommended</p>
        <p className="text-sm text-amber-700">
          This concern may need professional attention — please consult a dermatologist.
        </p>
      </div>
    </div>
  )
}
