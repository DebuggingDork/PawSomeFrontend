import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { connectNotificationSocket } from '@/lib/api/matches'
import { useNotificationsStore } from '@/store/useNotificationsStore'
import { NotificationToastStack } from './NotificationToast'
import { MatchCelebrationOverlay } from './MatchCelebrationOverlay'
import type { NotificationPushEvent } from '@/lib/api/types'

/**
 * Mounted exactly once (in App.tsx, alongside OnboardingGate / SessionExpiryWatcher)
 * regardless of how many <NotificationBell /> instances are in the tree — the
 * desktop and mobile navbars both render their own bell at all times (CSS just
 * hides whichever doesn't match the viewport, see resizable-navbar.tsx), so a
 * socket connection and toast/celebration state owned *per bell* used to mean
 * two independent WebSocket connections racing for the same backend connection
 * slot, with pushes landing on whichever bell happened to be listening — which
 * could be the one that's currently hidden. Owning it here instead means there
 * is exactly one connection and one set of overlays, full stop.
 */
export function NotificationsRuntime() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toasts = useNotificationsStore((s) => s.toasts)
  const celebration = useNotificationsStore((s) => s.celebration)

  useEffect(() => {
    if (!isAuthenticated) return

    const socket = connectNotificationSocket((event: NotificationPushEvent) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      // A match is a bigger moment than a normal toast can carry — show the
      // full celebration instead of (not in addition to) the usual toast,
      // for both the person who just accepted and the person who gets the
      // async push while they're off doing something else on the site.
      if (event.data.notification_type === 'new_match') {
        useNotificationsStore.getState().showCelebration({
          matchId: event.data.match_id,
          otherPet: event.data.other_pet,
        })
        return
      }

      // Skip the toast when the dropdown is already open — it'd be redundant
      // with the row that just landed in the list underneath it.
      if (!useNotificationsStore.getState().open) {
        useNotificationsStore.getState().addToast({ id: event.data.id, event })
      }
    })

    return () => socket.close()
  }, [isAuthenticated, queryClient])

  if (!isAuthenticated) return null

  return (
    <>
      <NotificationToastStack
        toasts={toasts}
        onDismiss={(id) => useNotificationsStore.getState().dismissToast(id)}
        onClick={(event) => {
          useNotificationsStore.getState().dismissToast(event.data.id)
          if (event.data.match_id) navigate(`/chat?match=${event.data.match_id}`)
          else useNotificationsStore.getState().setOpen(true)
        }}
      />
      <MatchCelebrationOverlay
        data={celebration}
        onDismiss={() => useNotificationsStore.getState().dismissCelebration()}
        onOpenChat={(matchId) => {
          useNotificationsStore.getState().dismissCelebration()
          navigate(`/chat?match=${matchId}`)
        }}
      />
    </>
  )
}
