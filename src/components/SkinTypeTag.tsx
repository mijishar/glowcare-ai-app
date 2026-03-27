import type { SkinType } from '../types'

interface SkinTypeTagProps {
  skinType: SkinType
}

const skinTypeConfig: Record<NonNullable<SkinType>, { emoji: string; color: string }> = {
  Dry:         { emoji: '🌵', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  Oily:        { emoji: '💧', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  Combination: { emoji: '⚖️', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  Sensitive:   { emoji: '🌸', color: 'bg-rose-100 text-rose-700 border-rose-200' },
}

export default function SkinTypeTag({ skinType }: SkinTypeTagProps) {
  if (skinType === null) return null

  const config = skinTypeConfig[skinType]

  return (
    <span
      data-testid="skin-type-tag"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${config.color} shadow-sm`}
    >
      <span>{config.emoji}</span>
      {skinType} Skin Detected
    </span>
  )
}
