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
}

export interface ChatSocket {
  sendMessage: (content: string) => void
  sendTyping: (isTyping: boolean) => void
  sendRead: (messageId: string) => void
  close: () => void
}

/** Opens the real-time chat WebSocket for a match. Caller owns the lifecycle (close on unmount). */
export function connectChatSocket(matchId: string, handlers: ChatSocketHandlers): ChatSocket {
  const token = getAccessToken()
  const socket = new WebSocket(`${WS_BASE_URL}/chat/ws/${matchId}?token=${encodeURIComponent(token ?? '')}`)

  socket.onopen = () => handlers.onOpen?.()
  socket.onclose = () => handlers.onClose?.()
  socket.onmessage = (event) => {
    try {
      handlers.onEvent(JSON.parse(event.data) as ChatSocketEvent)
    } catch {
      // ignore malformed frames
    }
  }

  const send = (payload: Record<string, unknown>) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload))
    }
  }

  return {
    sendMessage: (content) => send({ type: 'message', content }),
    sendTyping: (isTyping) => send({ type: 'typing', is_typing: isTyping }),
    sendRead: (messageId) => send({ type: 'read', message_id: messageId }),
    close: () => socket.close(),
  }
}
