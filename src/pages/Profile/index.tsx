import { useState, type ComponentType } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { PawPrint, Image, User, SlidersHorizontal, Award, Heart, ShieldOff, BarChart3, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
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
  { key: 'favorites', label: 'Favorites', icon: Heart },
  { key: 'blocked', label: 'Blocked Users', icon: ShieldOff },
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
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-24 md:pt-28">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#ff6b35]/10 text-[#ff6b35]">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Profile</h1>
          <p className="text-sm text-neutral-400">Manage your profile and preferences</p>
        </div>
      </div>

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
