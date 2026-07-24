import { Link } from 'react-router'
import { LogIn } from 'lucide-react'
import { StatusPage, statusPagePrimaryButton } from '@/components/ui/StatusPage'

function SessionExpiredPage() {
  return (
    <StatusPage
      icon={LogIn}
      tone="neutral"
      title="Your session expired"
      description="For your security, we sign you out after a period of inactivity. Sign back in to pick up right where you left off."
      action={
        <Link to="/auth" className={statusPagePrimaryButton}>
          Sign in again
        </Link>
      }
    />
  )
}

export default SessionExpiredPage
