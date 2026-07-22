import { apiFetch, WS_BASE_URL } from './client'
import { getAccessToken } from './tokens'
import type { ChatHistoryResponse, ChatSocketEvent, ChatStatus } from './types'

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
