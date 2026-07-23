import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { PartyPopper } from 'lucide-react'
import { getOnboardingStatus } from '@/lib/api/onboarding'
import { getMyProfile } from '@/lib/api/users'
import { listMyPets } from '@/lib/api/pets'
import { Skeleton } from '@/components/ui/Skeleton'
import type { OnboardingStep } from '@/lib/api/types'
import { EmailVerificationStep } from './steps/EmailVerificationStep'
import { ProfileBasicsStep } from './steps/ProfileBasicsStep'
import { ProfilePhotoStep } from './steps/ProfilePhotoStep'
import { PetProfileStep } from './steps/PetProfileStep'
import { PetPhotosStep } from './steps/PetPhotosStep'
import { PreferencesStep } from './steps/PreferencesStep'

function markWizardDismissed() {
  sessionStorage.setItem('onboarding-dismissed', '1')
}

function CompleteScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b35] to-pink-500 shadow-lg shadow-[#ff6b35]/30"
      >
        <PartyPopper className="h-7 w-7 text-white" />
      </motion.div>
      <h2 className="mb-2 font-display text-2xl font-bold text-white">You're all set!</h2>
      <p className="mb-6 text-neutral-400">Your profile is ready. Time to find a match.</p>
      <button
        onClick={onContinue}
        className="rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-8 py-3 font-semibold text-white shadow-lg shadow-[#ff6b35]/30 transition-transform hover:-translate-y-0.5"
      >
        Start discovering
      </button>
    </div>
  )
}

function OnboardingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [skippedSteps, setSkippedSteps] = useState<Set<OnboardingStep>>(new Set())

  const statusQuery = useQuery({ queryKey: ['onboarding', 'status'], queryFn: getOnboardingStatus })
  const profileQuery = useQuery({ queryKey: ['users', 'me'], queryFn: getMyProfile })
  const petsQuery = useQuery({ queryKey: ['pets', 'me'], queryFn: listMyPets })

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] })
    queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
    queryClient.invalidateQueries({ queryKey: ['pets', 'me'] })
  }

  const skipStep = (step: OnboardingStep) => setSkippedSteps((prev) => new Set(prev).add(step))

  const goToDiscover = () => {
    markWizardDismissed()
    navigate('/discover')
  }

  if (statusQuery.isLoading || !statusQuery.data) {
    return (
      <div className="relative min-h-screen px-6 py-24">
        <div className="mx-auto max-w-xl">
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="mb-8 flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-1.5 flex-1 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  const status = statusQuery.data
  const activeStep = status.steps.find((s) => !s.completed && !skippedSteps.has(s.step))
  const myPet = petsQuery.data?.[0]

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff6b35]/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-white">Set up your profile</h1>
          {activeStep && (
            <button onClick={goToDiscover} className="text-sm text-neutral-500 hover:text-neutral-300">
              Skip for now
            </button>
          )}
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-1.5">
          {status.steps.map((s) => {
            const isDone = s.completed || skippedSteps.has(s.step)
            const isActive = activeStep?.step === s.step
            return (
              <div
                key={s.step}
                title={s.title}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  isDone
                    ? 'bg-gradient-to-r from-[#ff6b35] to-pink-500'
                    : isActive
                      ? 'bg-neutral-600'
                      : 'bg-neutral-800'
                }`}
              />
            )
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep?.step ?? 'complete'}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              {!activeStep && <CompleteScreen onContinue={goToDiscover} />}

              {activeStep?.step === 'email_verification' && (
                <>
                  <StepHeading title={activeStep.title} description={activeStep.description} required={false} />
                  <EmailVerificationStep
                    email={profileQuery.data?.email ?? ''}
                    onSkip={() => skipStep('email_verification')}
                  />
                </>
              )}

              {activeStep?.step === 'profile_basics' && (
                <>
                  <StepHeading title={activeStep.title} description={activeStep.description} required />
                  <ProfileBasicsStep
                    initialFullName={profileQuery.data?.full_name ?? ''}
                    initialOccupation={profileQuery.data?.occupation ?? ''}
                    initialLat={profileQuery.data?.latitude ?? null}
                    initialLng={profileQuery.data?.longitude ?? null}
                    onSaved={refreshAll}
                  />
                </>
              )}

              {activeStep?.step === 'profile_photo' && (
                <>
                  <StepHeading title={activeStep.title} description={activeStep.description} required />
                  <ProfilePhotoStep onSaved={refreshAll} onSkip={() => skipStep('profile_photo')} />
                </>
              )}

              {activeStep?.step === 'pet_profile' && (
                <>
                  <StepHeading title={activeStep.title} description={activeStep.description} required />
                  <PetProfileStep onSaved={refreshAll} />
                </>
              )}

              {activeStep?.step === 'pet_photos' && (
                <>
                  <StepHeading title={activeStep.title} description={activeStep.description} required />
                  {myPet ? (
                    <PetPhotosStep
                      petId={myPet.id}
                      petName={myPet.name}
                      onSaved={refreshAll}
                      onSkip={() => skipStep('pet_photos')}
                    />
                  ) : (
                    <Skeleton className="mx-auto h-52 w-full max-w-[220px]" />
                  )}
                </>
              )}

              {activeStep?.step === 'preferences' && (
                <>
                  <StepHeading title={activeStep.title} description={activeStep.description} required={false} />
                  <PreferencesStep
                    initialBio={profileQuery.data?.bio ?? ''}
                    initialAddress={profileQuery.data?.address ?? ''}
                    onSaved={refreshAll}
                    onSkip={() => skipStep('preferences')}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function StepHeading({ title, description, required }: { title: string; description: string; required: boolean }) {
  return (
    <div className="mb-5">
      <div className="mb-1 flex items-center gap-2">
        <h2 className="font-display text-lg font-bold text-white">{title}</h2>
        {!required && (
          <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
            Optional
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-400">{description}</p>
    </div>
  )
}

export default OnboardingPage
