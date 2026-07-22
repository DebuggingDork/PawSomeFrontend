import { apiFetch } from './client'
import type { OnboardingStatus } from './types'

export function getOnboardingStatus(): Promise<OnboardingStatus> {
  return apiFetch<OnboardingStatus>('/onboarding/status')
}

export function skipOptionalSteps(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/onboarding/skip-optional', { method: 'POST' })
}
