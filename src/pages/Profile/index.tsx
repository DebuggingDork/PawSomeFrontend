import { useState } from 'react'
import { PawPrint, Image, User, SlidersHorizontal, Award, Heart, ShieldOff } from 'lucide-react'
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

const TABS = [
  { key: 'pets', label: 'My Pets', icon: PawPrint },
  { key: 'photos', label: 'Photos', icon: Image },
  { key: 'account', label: 'Account', icon: User },
  { key: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
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
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 md:pt-28">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Profile</h1>

      <PillTabs layoutId="profile-tab-pill" active={tab} onChange={setTab} tabs={TABS} className="mb-6 w-full" />

      {tab === 'pets' && <PetsTab />}
      {tab === 'photos' && <PhotosTab />}
      {tab === 'account' && <AccountTab />}
      {tab === 'preferences' && <PreferencesTab />}
      {tab === 'badges' && <BadgesTab />}
      {tab === 'favorites' && <FavoritesTab />}
      {tab === 'blocked' && <BlockedUsersTab />}
    </div>
  )
}

export default ProfilePage
