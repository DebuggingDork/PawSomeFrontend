import { Wrench } from 'lucide-react'
import { StatusPage } from '@/components/ui/StatusPage'

function MaintenancePage() {
  return (
    <StatusPage
      icon={Wrench}
      tone="neutral"
      title="We'll be right back"
      description="PawSome is down for scheduled maintenance. We're making things better and should be back online shortly — thanks for your patience."
    />
  )
}

export default MaintenancePage
