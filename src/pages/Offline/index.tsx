import { WifiOff } from 'lucide-react'
import { StatusPage, statusPagePrimaryButton } from '@/components/ui/StatusPage'

function OfflinePage() {
  return (
    <StatusPage
      icon={WifiOff}
      tone="neutral"
      title="You're offline"
      description="Check your internet connection — we'll pick back up automatically as soon as you're back."
      action={
        <button onClick={() => window.location.reload()} className={statusPagePrimaryButton}>
          Try again
        </button>
      }
    />
  )
}

export default OfflinePage
