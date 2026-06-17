import { useState, useEffect } from 'react'
import { useLoaderStore } from '@/store/useLoaderStore'

function DiscoverPage() {
  const { startLoading, stopLoading } = useLoaderStore()
  const [pets, setPets] = useState<any[]>([])

  useEffect(() => {
    const loadPets = async () => {
      startLoading('Finding your perfect match...')
      
      // Simulate API call to fetch pets
      setTimeout(() => {
        setPets([
          { id: 1, name: 'Max', breed: 'Golden Retriever' },
          { id: 2, name: 'Luna', breed: 'Persian Cat' },
          { id: 3, name: 'Charlie', breed: 'Labrador' },
        ])
        stopLoading()
      }, 1500)
    }

    loadPets()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-3xl font-bold mb-2">Discover Matches</h2>
      <p className="text-neutral-400 mb-8">Swipe and match with pets around you.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {pets.map((pet) => (
          <div key={pet.id} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
            <h3 className="text-xl font-semibold">{pet.name}</h3>
            <p className="text-neutral-400">{pet.breed}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DiscoverPage
