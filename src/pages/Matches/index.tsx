import { useState, useEffect } from 'react'
import { useLoaderStore } from '@/store/useLoaderStore'

function MatchesPage() {
  const { startLoading, stopLoading } = useLoaderStore()
  const [matches, setMatches] = useState<any[]>([])

  useEffect(() => {
    const loadMatches = async () => {
      startLoading('Loading your matches...')
      
      // Simulate API call
      setTimeout(() => {
        setMatches([
          { id: 1, name: 'Bella', breed: 'Poodle', location: '2 miles away' },
          { id: 2, name: 'Rocky', breed: 'German Shepherd', location: '5 miles away' },
          { id: 3, name: 'Lucy', breed: 'Beagle', location: '8 miles away' },
        ])
        stopLoading()
      }, 1500)
    }

    loadMatches()
  }, [])

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-2 text-center">Your Matches</h2>
        <p className="text-neutral-400 text-center mb-8">
          View and manage your pet's breeding matches.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match.id} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-orange-500 transition-all">
              <h3 className="text-xl font-semibold mb-2">{match.name}</h3>
              <p className="text-neutral-400 mb-1">{match.breed}</p>
              <p className="text-sm text-neutral-500">{match.location}</p>
              <button className="mt-4 w-full px-4 py-2 bg-orange-500 rounded-lg hover:bg-orange-600 transition-all">
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MatchesPage
