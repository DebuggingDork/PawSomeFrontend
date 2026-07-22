import { apiFetch } from './client'
import type { ReportInput } from './types'

export function createReport(body: ReportInput): Promise<{ id: string; status: string; created_at: string }> {
  return apiFetch<{ id: string; status: string; created_at: string }>('/reports', {
    method: 'POST',
    body,
  })
}
