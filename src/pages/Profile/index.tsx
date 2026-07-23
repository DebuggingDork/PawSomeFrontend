import { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { SignInPrompt } from '@/components/ui/SignInPrompt'
import { PetsTab } from './tabs/PetsTab'
import { PhotosTab } from './tabs/PhotosTab'
import { AccountTab } from './tabs/AccountTab'

const TABS = [
  { key: 'pets', label: 'My Pets' },
  { key: 'photos', label: 'Photos' },
  { key: 'account', label: 'Account' },
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

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-full bg-neutral-900 p-1 text-sm font-semibold">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 transition-colors ${
              tab === t.key ? 'bg-gradient-to-r from-[#ff6b35] to-pink-500 text-white' : 'text-neutral-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pets' && <PetsTab />}
      {tab === 'photos' && <PhotosTab />}
      {tab === 'account' && <AccountTab />}
    </div>
  )
}

export default ProfilePage
