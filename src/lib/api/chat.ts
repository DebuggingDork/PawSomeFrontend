import { apiFetch, WS_BASE_URL } from './client'
import { getAccessToken } from './tokens'
import type {
  ChatHistoryResponse,
  ChatReaction,
  ChatSearchResponse,
  ChatSocketEvent,
  ChatStatus,
  ReadReceipts,
} from './types'

export function getChatHistory(matchId: string, before?: string): Promise<ChatHistoryResponse> {
  const query = before ? `?before=${before}` : ''
  return apiFetch<ChatHistoryResponse>(`/chat/${matchId}/history${query}`)
}

export function getChatStatus(matchId: string): Promise<ChatStatus> {
  return apiFetch<ChatStatus>(`/chat/${matchId}/status`)
}

export function markRead(matchId: string, messageId: string): Promise<void> {
  return apiFetch<void>(`/chat/${matchId}/read`, {
    method: 'POST',
    body: { message_id: messageId },
  })
}

export function getReadReceipts(matchId: string): Promise<ReadReceipts> {
  return apiFetch<ReadReceipts>(`/chat/${matchId}/read-receipts`)
}

export function searchMessages(matchId: string, query: string): Promise<ChatSearchResponse> {
  return apiFetch<ChatSearchResponse>(`/chat/${matchId}/search?q=${encodeURIComponent(query)}`)
}

export function deleteMessage(matchId: string, messageId: string): Promise<void> {
  return apiFetch<void>(`/chat/${matchId}/messages/${messageId}`, { method: 'DELETE' })
}

export function addReaction(matchId: string, messageId: string, emoji: string): Promise<ChatReaction> {
  return apiFetch<ChatReaction>(`/chat/${matchId}/messages/${messageId}/reactions`, {
    method: 'POST',
    body: { message_id: messageId, emoji },
  })
}

export function removeReaction(matchId: string, messageId: string): Promise<void> {
  return apiFetch<void>(`/chat/${matchId}/messages/${messageId}/reactions`, { method: 'DELETE' })
}

export interface ChatSocketHandlers {
  onEvent: (event: ChatSocketEvent) => void
  onOpen?: () => void
  onClose?: () => void
  /** Fired after a dropped connection is re-established, so the caller can
   * reload anything that happened while it was down. */
  onReconnect?: () => void
}

export interface ChatSocket {
  sendMessage: (content: string, clientId: string) => void
  sendTyping: (isTyping: boolean) => void
  sendRead: (messageId: string) => void
  close: () => void
}

const RECONNECT_BASE_MS = 500
const RECONNECT_MAX_MS = 10_000
// Sent on an interval so the connection never sits silent long enough for a
// proxy/load balancer's idle timeout to kill it. That silent-idle-timeout is
// the actual cause behind "works for a bit, then sends stop landing and
// nothing comes in until I refresh": the hop between browser and server
// drops the connection after ~30-60s of no traffic in either direction, but
// the browser's WebSocket often doesn't notice for a long time afterward —
// readyState keeps reporting OPEN on a socket nothing is listening on the far
// end of, so sends go nowhere and no error is ever raised.
const HEARTBEAT_MS = 20_000
// If nothing at all — not even our own heartbeat's send succeeding — has come
// through in this long, the socket is almost certainly the zombie described
// above rather than a merely quiet conversation. Force a reconnect instead of
// waiting for a close event that may never arrive.
const STALE_AFTER_MS = 45_000

/**
 * Opens the real-time chat WebSocket for a match and keeps it open.
 *
 * Two things this deliberately does that the previous version did not:
 *
 * - **Reconnects.** There was no reconnect at all. Once the socket dropped —
 *   an idle proxy timeout, a sleeping laptop, a brief network blip — the chat
 *   was dead until the page was reloaded, which is exactly what "I have to
 *   refresh every time" describes.
 * - **Queues.** Sends made while the socket wasn't OPEN were dropped on the
 *   floor with no error, so a message typed during those windows simply never
 *   existed. They are now held and flushed on connect.
 *
 * Caller still owns the lifecycle: close() stops reconnecting for good.
 */
export function connectChatSocket(matchId: string, handlers: ChatSocketHandlers): ChatSocket {
  let socket: WebSocket | null = null
  let closedByCaller = false
  let attempts = 0
  let hasConnectedOnce = false
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let lastActivity = Date.now()
  // Only messages are worth holding. A stale typing flag or read receipt
  // delivered seconds late is noise, so those are dropped when offline.
  const pending: string[] = []

  const flush = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    while (pending.length > 0) {
      socket.send(pending.shift()!)
    }
  }

  // Forces a fresh connection attempt right now instead of waiting on a
  // pending backoff timer or an onclose event that a zombie socket will
  // never fire. Used both by the staleness check below and by the
  // visibility/online listeners, so a laptop that just woke up or a tab that
  // just regained focus doesn't sit on a dead socket until its next natural
  // reconnect slot.
  const forceReconnect = () => {
    if (closedByCaller) return
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    attempts = 0
    socket?.close()
    // socket.close() only synchronously fires onclose for a genuinely live
    // connection; a zombie one may never fire it at all, so open() is called
    // directly rather than relying on onclose to schedule it.
    open()
  }

  const open = () => {
    const token = getAccessToken()
    socket = new WebSocket(`${WS_BASE_URL}/chat/ws/${matchId}?token=${encodeURIComponent(token ?? '')}`)

    socket.onopen = () => {
      attempts = 0
      lastActivity = Date.now()
      handlers.onOpen?.()
      flush()
      if (hasConnectedOnce) handlers.onReconnect?.()
      hasConnectedOnce = true
    }

    socket.onclose = () => {
      handlers.onClose?.()
      if (closedByCaller) return
      // Exponential backoff, capped, so a server that is down doesn't get
      // hammered but a transient blip recovers within half a second.
      const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempts, RECONNECT_MAX_MS)
      attempts += 1
      reconnectTimer = setTimeout(open, delay)
    }

    socket.onmessage = (event) => {
      lastActivity = Date.now()
      try {
        handlers.onEvent(JSON.parse(event.data) as ChatSocketEvent)
      } catch {
        // ignore malformed frames
      }
    }
  }

  open()

  // Keeps traffic flowing across any silence so nothing in between times the
  // connection out, and independently checks whether the socket has gone
  // quiet for longer than that should ever take — the tell for a zombie
  // connection the browser hasn't reported as closed yet.
  heartbeatTimer = setInterval(() => {
    if (Date.now() - lastActivity > STALE_AFTER_MS) {
      forceReconnect()
      return
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping' }))
    }
  }, HEARTBEAT_MS)

  // A backgrounded tab throttles timers, including the reconnect backoff
  // above, so a socket that died while minimized could otherwise sit dead
  // for minutes after the tab is brought back — exactly "I had to refresh
  // every time" after stepping away. Recheck the moment focus/network return.
  const onVisible = () => {
    if (document.visibilityState !== 'visible') return
    if (!socket || socket.readyState !== WebSocket.OPEN) forceReconnect()
  }
  const onOnline = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) forceReconnect()
  }
  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('online', onOnline)

  const send = (payload: Record<string, unknown>, queueIfClosed = false) => {
    const text = JSON.stringify(payload)
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(text)
    } else if (queueIfClosed) {
      pending.push(text)
    }
  }

  return {
    sendMessage: (content, clientId) => send({ type: 'message', content, client_id: clientId }, true),
    sendTyping: (isTyping) => send({ type: 'typing', is_typing: isTyping }),
    sendRead: (messageId) => send({ type: 'read', message_id: messageId }),
    close: () => {
      closedByCaller = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (heartbeatTimer) clearInterval(heartbeatTimer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
      socket?.close()
    },
  }
}
