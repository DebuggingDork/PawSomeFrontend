import { useState } from 'react'
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
  { key: 'pets', label: 'My Pets', icon: PawPrint },
  { key: 'photos', label: 'Photos', icon: Image },
  { key: 'account', label: 'Account', icon: User },
  { key: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { key: 'activity', label: 'Activity', icon: BarChart3 },
  { key: 'badges', label: 'Badges', icon: Award },
  { key: 'favorites', label: 'Favorites', icon: Heart },
  { key: 'blocked', label: 'Blocked Users', icon: ShieldOff },
] as const

type TabKey = (typeof TABS)[number]['key']

function ProfilePage() {
  const { isAuthenticated, isHydrating } = useAuthStore()
  const [tab, setTab] = useState<TabKey>('pets')

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

      {tab === 'pets' && <PetsTab />}
      {tab === 'photos' && <PhotosTab />}
      {tab === 'account' && <AccountTab />}
      {tab === 'preferences' && <PreferencesTab />}
      {tab === 'activity' && <ActivityTab />}
      {tab === 'badges' && <BadgesTab />}
      {tab === 'favorites' && <FavoritesTab />}
      {tab === 'blocked' && <BlockedUsersTab />}
    </div>
  )
}

export default ProfilePage
