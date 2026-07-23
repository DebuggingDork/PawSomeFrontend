interface SkeletonProps {
  className?: string
}

/** Loading placeholder with a soft shimmer sweep instead of a flat pulse. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-neutral-900/60 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  )
}
