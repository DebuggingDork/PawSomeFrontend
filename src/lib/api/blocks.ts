import { apiFetch } from './client'
import type { Block } from './types'

export interface BlockListResponse {
  blocks: Block[]
  total: number
}

export function createBlock(blockedUserId: string, reason?: string): Promise<{ id: string; matches_affected: number }> {
  return apiFetch<{ id: string; matches_affected: number }>('/blocks', {
    method: 'POST',
    body: { blocked_user_id: blockedUserId, reason },
  })
}

export function listBlocks(): Promise<BlockListResponse> {
  return apiFetch<BlockListResponse>('/blocks')
}

export function removeBlock(blockId: string): Promise<void> {
  return apiFetch<void>(`/blocks/${blockId}`, { method: 'DELETE' })
}
