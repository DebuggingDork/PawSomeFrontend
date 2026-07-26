import { genderMark } from '@/lib/petBadges'

/**
 * A pet's gender as a solid pink/blue chip.
 *
 * Shared rather than inlined because the five surfaces that show gender had
 * already drifted apart when this was a raw glyph — different sizes, and only
 * some carried a screen-reader label. See `genderMark` for why it is a filled
 * SVG chip and not a coloured `♀`/`♂` character.
 */

const SIZES = {
  /** Inside a dense pill, next to the species emoji. Sticks to the standard
      spacing scale — `h-4.5` compiles to nothing here and collapses the chip. */
  sm: { box: 'h-4 w-4', icon: 'h-2.5 w-2.5' },
  /** Standalone on a card corner. */
  md: { box: 'h-5 w-5', icon: 'h-3.5 w-3.5' },
  lg: { box: 'h-6 w-6', icon: 'h-4 w-4' },
  /** The whole corner badge on a swipe card, replacing the old black circle. */
  xl: { box: 'h-8 w-8', icon: 'h-5 w-5' },
} as const

export interface GenderBadgeProps {
  gender: string | null | undefined
  size?: keyof typeof SIZES
  /** Set when a parent already announces the gender, to avoid saying it twice. */
  decorative?: boolean
  className?: string
}

export function GenderBadge({ gender, size = 'md', decorative = false, className = '' }: GenderBadgeProps) {
  const { Icon, label, fillClassName } = genderMark(gender)
  const { box, icon } = SIZES[size]

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${box} ${fillClassName} ${className}`}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
    >
      {/* Heavier stroke than Lucide's 2 default: at this size the standard
          weight reads as thin as the glyph this replaced. */}
      <Icon className={`${icon} text-white`} strokeWidth={2.75} aria-hidden="true" />
    </span>
  )
}
