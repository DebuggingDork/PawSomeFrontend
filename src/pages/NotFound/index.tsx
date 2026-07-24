import { Link } from 'react-router'
import { Compass, Home } from 'lucide-react'
import { StatusPage, statusPagePrimaryButton, statusPageSecondaryButton } from '@/components/ui/StatusPage'

function NotFoundPage() {
  return (
    <StatusPage
      icon={Compass}
      title="This page wandered off"
      description="We couldn't find what you were looking for. It may have been moved, renamed, or never existed."
      action={
        <Link to="/" className={statusPagePrimaryButton}>
          <Home className="mr-2 inline h-4 w-4" />
          Back home
        </Link>
      }
      secondaryAction={
        <Link to="/community" className={statusPageSecondaryButton}>
          Browse Community
        </Link>
      }
    />
  )
}

export default NotFoundPage
