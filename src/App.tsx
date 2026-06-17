import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-neutral-800 rounded-2xl shadow-xl p-6 border border-neutral-700 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent mb-4">
          PawSome v4
        </h1>
        <p className="text-neutral-400 mb-6">
          Tailwind CSS v4 is successfully configured with React 19 & Vite.
        </p>
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-medium rounded-xl shadow-lg hover:shadow-pink-500/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          Count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
