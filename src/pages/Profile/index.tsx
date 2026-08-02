import { useState, type ComponentType } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { PawPrint, Image, User, SlidersHorizontal, Award, Bookmark, ShieldOff, BarChart3, BadgeCheck } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { getMyProfile } from '@/lib/api/users'
import { membershipLine } from '@/lib/membership'
import { PetAvatar } from '@/components/chat/PetAvatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { SignInPrompt } from '@/components/ui/SignInPrompt'
import { PillTabs } from '@/components/ui/PillTabs'
import { PetsTab } from './tabs/PetsTab'
import { PhotosTab } from './tabs/PhotosTab'
import { AccountTab } from './tabs/AccountTab'
import { PreferencesTab } from './tabs/PreferencesTab'
import { BadgesTab } from './tabs/BadgesTab'
import { FavoritesTab } from './tabs/FavoritesTab'
import { BlockedUsersTab } from './tabs/BlockedUsersTab'
import { ActivityTab } from './tabs/ActivityTab'

const TABS = [
  { key: 'account', label: 'Account', icon: User },
  { key: 'pets', label: 'My Pets', icon: PawPrint },
  { key: 'photos', label: 'Photos', icon: Image },
  { key: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { key: 'activity', label: 'Activity', icon: BarChart3 },
  { key: 'badges', label: 'Badges', icon: Award },
  { key: 'favorites', label: 'Saved', icon: Bookmark },
  // "Blocked", not "Blocked Users": it is the widest tab of the eight by some
  // margin, the icon already says who it is about, and every other label here
  // is a single word.
  { key: 'blocked', label: 'Blocked', icon: ShieldOff },
] as const

type TabKey = (typeof TABS)[number]['key']

const TAB_PANELS: Record<TabKey, ComponentType> = {
  account: AccountTab,
  pets: PetsTab,
  photos: PhotosTab,
  preferences: PreferencesTab,
  activity: ActivityTab,
  badges: BadgesTab,
  favorites: FavoritesTab,
  blocked: BlockedUsersTab,
}

/** Who you're signed in as, at the top of the page.
 *
 * The header used to read just "Profile" over a generic sparkle icon, so
 * nothing on the page identified the account — no name, no photo, none of the
 * details on file. This shows the photo, name and the profile facts that are
 * already stored, rather than making the user open a tab to find out. */
function ProfileIdentityHeader() {
  const { data: profile, isLoading } = useQuery({ queryKey: ['users', 'me'], queryFn: getMyProfile })

  if (isLoading || !profile) {
    return (
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    )
  }

  const name = profile.full_name?.trim() || 'Your profile'
  const facts = [
    profile.occupation,
    profile.address,
    profile.pincode ? `PIN ${profile.pincode}` : null,
  ].filter(Boolean) as string[]

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start">
      <PetAvatar name={name} photoUrl={profile.profile_photo_url} size="lg" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-white">{name}</h1>
          {profile.is_verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
          {profile.created_at && (
            <span
              title={`Joined ${new Date(profile.created_at).toLocaleDateString()}`}
              className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand"
            >
              <PawPrint className="h-3.5 w-3.5" />
              {membershipLine(profile.created_at)}
            </span>
          )}
        </div>

        {facts.length > 0 && (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-400">
            {facts.map((fact, i) => (
              <span key={fact} className="flex items-center gap-2">
                {i > 0 && <span className="text-neutral-700">•</span>}
                {fact}
              </span>
            ))}
          </p>
        )}

        {profile.bio && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-300">{profile.bio}</p>
        )}
      </div>
    </div>
  )
}

function ProfilePage() {
  const { isAuthenticated, isHydrating } = useAuthStore()
  const [tab, setTab] = useState<TabKey>('account')
  const shouldReduceMotion = useReducedMotion()

  if (!isHydrating && !isAuthenticated) {
    return (
      <SignInPrompt
        title="Sign in to manage your profile"
        message="Your pets, photos, preferences, and badges live here."
      />
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-16 pt-24 md:pt-28">
      <ProfileIdentityHeader />

      <PillTabs layoutId="profile-tab-pill" active={tab} onChange={setTab} tabs={TABS} className="mb-6 w-full" />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {(() => {
            const ActivePanel = TAB_PANELS[tab]
            return <ActivePanel />
          })()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default ProfilePage
