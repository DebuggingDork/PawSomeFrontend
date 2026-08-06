import { Link, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { PawPrint, Heart, MessageCircle, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { getMyProfile } from '@/lib/api/users'
import { PetAvatar } from '@/components/chat/PetAvatar'

const TABS = [
  { name: 'Discover', to: '/discover', icon: PawPrint },
  { name: 'Matches', to: '/matches', icon: Heart },
  { name: 'Chat', to: '/chat', icon: MessageCircle },
  { name: 'Community', to: '/community', icon: Users },
] as const

/** Native-app-style primary nav for signed-in users on a phone, replacing the
 * hamburger for the five destinations people reach for every session.
 * Mirrors NavItems' own `pathname === link` check for the active state — no
 * fuzzy prefix matching, so a nested route like /pets/:id shows no active
 * tab rather than guessing which one it "belongs" to.
 *
 * Renders nothing while hydrating (same reasoning as GuestOnlyRoute: a guess
 * here would flash the wrong chrome at whoever is loading) and nothing at
 * all on /onboarding, which has its own sticky bottom action bar — two
 * bottom bars stacked would look broken. */
export function BottomTabBar() {
  const { isAuthenticated, isHydrating } = useAuthStore()
  const location = useLocation()

  // Same ['users', 'me'] key App.tsx's navbar avatar link uses, so this
  // doesn't cost a second request — React Query dedupes by key and both
  // consumers share the one in-flight fetch and cache entry.
  const { data: myProfile } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: getMyProfile,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })

  if (isHydrating || !isAuthenticated) return null
  if (location.pathname.startsWith('/onboarding')) return null

  const profileActive = location.pathname === '/profile'

  return (
    // z-40: deliberately below BrowseFiltersPanel's mobile sheet (z-60) and
    // every modal (z-100+), so an open filter sheet or bottom-sheet dialog
    // paints over this bar instead of fighting it for the same edge.
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex h-[var(--tab-bar-total-h)] items-stretch border-t border-white/10 bg-neutral-950/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:hidden"
    >
      {TABS.map(({ name, to, icon: Icon }) => {
        const active = location.pathname === to
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? 'page' : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-1"
          >
            <Icon className={cn('h-[22px] w-[22px]', active ? 'text-brand' : 'text-neutral-400')} strokeWidth={active ? 2.25 : 2} />
            <span className={cn('text-[11px] font-medium', active ? 'text-brand' : 'text-neutral-400')}>{name}</span>
          </Link>
        )
      })}
      <Link
        to="/profile"
        aria-current={profileActive ? 'page' : undefined}
        className="flex flex-1 flex-col items-center justify-center gap-1"
      >
        <PetAvatar name={myProfile?.full_name ?? 'You'} photoUrl={myProfile?.profile_photo_url} size="xs" />
        <span className={cn('text-[11px] font-medium', profileActive ? 'text-brand' : 'text-neutral-400')}>Profile</span>
      </Link>
    </nav>
  )
}
