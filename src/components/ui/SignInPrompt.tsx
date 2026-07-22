import { Link } from 'react-router'
import { LogIn } from 'lucide-react'

interface SignInPromptProps {
  title: string
  message: string
}

export function SignInPrompt({ title, message }: SignInPromptProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b35] to-pink-500 shadow-lg shadow-[#ff6b35]/30">
        <LogIn className="h-7 w-7 text-white" />
      </div>
      <h2 className="mb-2 font-display text-2xl font-bold text-white">{title}</h2>
      <p className="mb-6 max-w-sm text-neutral-400">{message}</p>
      <Link
        to="/auth"
        className="rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:-translate-y-0.5"
      >
        Sign In
      </Link>
    </div>
  )
}
