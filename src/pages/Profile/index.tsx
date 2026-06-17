import { useState } from 'react'
import { useLoaderStore } from '@/store/useLoaderStore'

function ProfilePage() {
  const { startLoading, stopLoading } = useLoaderStore()
  const [petName, setPetName] = useState('Max')
  const [breed, setBreed] = useState('Golden Retriever')

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    startLoading('Updating profile...')
    
    // Simulate API call
    setTimeout(() => {
      stopLoading()
      alert('Profile updated successfully!')
    }, 1500)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    
    startLoading('Uploading image...')
    
    // Simulate upload
    setTimeout(() => {
      stopLoading()
    }, 2000)
  }

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-2 text-center">Pet Profile</h2>
        <p className="text-neutral-400 text-center mb-8">
          Manage your pet's bio, details, and photos.
        </p>
        
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-8">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Pet Name</label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Breed</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Upload Photos</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-orange-500 file:text-white hover:file:bg-orange-600"
              />
            </div>
            
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Save Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
