import type { SkinType } from '../types'

interface SkinTypeTagProps {
  skinType: SkinType
}

const skinTypeConfig: Record<NonNullable<SkinType>, { emoji: string; color: string }> = {
  Dry:         { emoji: '🌵', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  Oily:        { emoji: '💧', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  Combination: { emoji: '⚖️', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  Sensitive:   { emoji: '🌸', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  Normal:      { emoji: '✨', color: 'bg-green-100 text-green-700 border-green-200' },
}

export default function SkinTypeTag({ skinType }: SkinTypeTagProps) {
  if (skinType === null) return null

  const config = skinTypeConfig[skinType]

  return (
    <span
      data-testid="skin-type-tag"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border shadow-sm ${config.color}`}
    >
      <span>{config.emoji}</span>
      {skinType} Skin Detected
    </span>
  )
}
