import { ServerCrash } from 'lucide-react'
import { StatusPage, statusPagePrimaryButton } from '@/components/ui/StatusPage'

function ServerErrorPage() {
  return (
    <StatusPage
      icon={ServerCrash}
      tone="danger"
      title="We're having trouble connecting"
      description="Your internet looks fine, but our servers aren't responding right now. This is on us — try again in a moment."
      action={
        <button onClick={() => window.location.reload()} className={statusPagePrimaryButton}>
          Try again
        </button>
      }
    />
  )
}

export default ServerErrorPage
