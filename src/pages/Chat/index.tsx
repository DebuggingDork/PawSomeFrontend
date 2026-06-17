import { useState } from 'react'
import { useLoaderStore } from '@/store/useLoaderStore'

function ChatPage() {
  const { startLoading, stopLoading } = useLoaderStore()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<string[]>([])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    startLoading('Sending message...')
    
    // Simulate sending message
    setTimeout(() => {
      setMessages([...messages, message])
      setMessage('')
      stopLoading()
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-2 text-center">Pet Chats</h2>
        <p className="text-neutral-400 text-center mb-8">
          Connect with other pet owners and discuss details.
        </p>
        
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 min-h-[400px] mb-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="bg-neutral-800 p-3 rounded-lg">
                {msg}
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPage
