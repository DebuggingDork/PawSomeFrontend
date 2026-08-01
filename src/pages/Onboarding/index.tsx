import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { getOnboardingStatus } from '@/lib/api/onboarding'
import { getMyProfile } from '@/lib/api/users'
import { listMyPets } from '@/lib/api/pets'
import { ONBOARDING_PROMPTED_KEY } from '@/lib/queryClient'
import { useAuthStore } from '@/store/useAuthStore'
import { useIsNarrowViewport } from '@/hooks/useMediaQuery'
import { Skeleton } from '@/components/ui/Skeleton'
import type { OnboardingStep } from '@/lib/api/types'
import { LiveCardPreview, type CardDraft } from './LiveCardPreview'
import { PawTrail, type TrailItem } from './PawTrail'
import { EmailVerificationStep } from './steps/EmailVerificationStep'
import { ProfileBasicsStep } from './steps/ProfileBasicsStep'
import { ProfilePhotoStep } from './steps/ProfilePhotoStep'
import { PetProfileStep } from './steps/PetProfileStep'
import { PetPhotosStep } from './steps/PetPhotosStep'
import { PreferencesStep } from './steps/PreferencesStep'

const EASE_OUT = [0.16, 1, 0.3, 1] as const

/** Our own copy rather than the API's step titles. The backend strings describe the
 * data ("Add Your Photo"); these describe why anyone would want to. */
const STEP_COPY: Record<OnboardingStep, { label: string; question: string; sub: string }> = {
  email_verification: {
    label: 'Confirm your email',
    question: "Let's make sure that inbox is yours.",
    sub: 'Verified owners get a blue check on every card they appear on, and swiping stays locked until this is done.',
  },
  profile_basics: {
    label: 'About you',
    question: 'First, who are we introducing?',
    sub: "Your name and neighbourhood decide who your pet shows up for, and how far away you look to them.",
  },
  profile_photo: {
    label: 'Your photo',
    question: 'Put a face to the name.',
    sub: 'People are arranging to meet a stranger in a park. Seeing who you are does most of the convincing.',
  },
  pet_profile: {
    label: 'Your pet',
    question: 'Now the one everyone came for.',
    sub: 'Tell us about the animal currently running your household.',
  },
  pet_photos: {
    label: 'Their photos',
    question: 'Time for the photo shoot.',
    sub: 'One photo is required — that is the card. There are five slots, and nobody should be judged on one angle.',
  },
  preferences: {
    label: 'Finishing touches',
    question: 'Anything else worth knowing?',
    sub: 'One honest line about you is the difference between a match and a conversation.',
  },
  complete: { label: 'Done', question: "That's a profile.", sub: '' },
}

function localityOf(address: string | null | undefined): string {
  return address?.split(',')[0]?.trim() ?? ''
}

/**
 * Returns the reader to the top of the wizard whenever the step changes.
 *
 * Mounted inside the step's own animated container, which is keyed by step, so
 * mounting *is* the signal. On a phone the pet form runs three screens deep;
 * saving it from the bottom used to drop the user into the middle of the next
 * step, below its heading, with no indication that anything had advanced beyond
 * the fields having gone blank.
 */
function ScrollToStepTop() {
  useEffect(() => {
    if (window.scrollY === 0) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }, [])
  return null
}

function OnboardingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const shouldReduceMotion = useReducedMotion()
  const isNarrow = useIsNarrowViewport()
  const refreshSession = useAuthStore((s) => s.refreshSession)

  /** Set when the user taps a finished paw to go back and change an answer. */
  const [revisiting, setRevisiting] = useState<OnboardingStep | null>(null)
  /** Values typed but not yet saved, so the card preview can react per keystroke. */
  const [draft, setDraft] = useState<Partial<CardDraft>>({})

  const statusQuery = useQuery({ queryKey: ['onboarding', 'status'], queryFn: getOnboardingStatus })
  const profileQuery = useQuery({ queryKey: ['users', 'me'], queryFn: getMyProfile })
  const petsQuery = useQuery({ queryKey: ['pets', 'me'], queryFn: listMyPets })

  const patchDraft = useCallback((patch: Partial<CardDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
  }, [])

  const refreshAll = useCallback(() => {
    // Leaving a revisited step re-hands control to whatever is genuinely unfinished.
    setRevisiting(null)
    queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] })
    queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
    queryClient.invalidateQueries({ queryKey: ['pets', 'me'] })
    queryClient.invalidateQueries({ queryKey: ['achievements', 'me'] })
    // The auth store holds its own copy of the pet list, and Discover reads
    // `activePet` from it to decide whether swiping is allowed. Without this, the
    // pet created two steps ago doesn't exist as far as Discover is concerned.
    void refreshSession()
  }, [queryClient, refreshSession])

  /** Refresh photo-bearing data without touching onboarding status, so adding
   * a photo doesn't advance the wizard out from under someone mid-gallery.
   * The step advances only when they press Continue (which calls refreshAll). */
  const refreshPets = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['pets', 'me'] })
    queryClient.invalidateQueries({ queryKey: ['achievements', 'me'] })
    void refreshSession()
  }, [queryClient, refreshSession])

  const leaveWizard = useCallback(() => {
    sessionStorage.setItem(ONBOARDING_PROMPTED_KEY, '1')
    navigate('/discover')
  }, [navigate])

  const profile = profileQuery.data
  const myPet = petsQuery.data?.[0]

  // The card the rest of PawSome will see, assembled from whatever exists so far:
  // unsaved keystrokes first, then saved server state, then nothing.
  const card: CardDraft = useMemo(
    () => ({
      petName: draft.petName ?? myPet?.name ?? '',
      species: draft.species ?? myPet?.species ?? 'dog',
      breed: draft.breed ?? myPet?.breed ?? '',
      ageMonths: draft.ageMonths ?? myPet?.age_months ?? null,
      gender: draft.gender ?? ((myPet?.gender as 'male' | 'female') || 'male'),
      petPhotoUrl: draft.petPhotoUrl ?? myPet?.primary_photo_url ?? null,
      ownerName: draft.ownerName ?? profile?.full_name ?? '',
      ownerPhotoUrl: draft.ownerPhotoUrl ?? profile?.profile_photo_url ?? null,
      ownerVerified: profile?.is_verified ?? false,
      locality: draft.locality ?? localityOf(profile?.address),
    }),
    [draft, myPet, profile]
  )

  if (statusQuery.isLoading || !statusQuery.data) {
    return (
      <div className="px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
          <div>
            <Skeleton className="mb-8 h-10 w-full max-w-sm rounded-full" />
            <Skeleton className="mb-3 h-10 w-3/4" />
            <Skeleton className="mb-8 h-5 w-full max-w-md" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="hidden aspect-[3/4.1] w-full rounded-3xl lg:block" />
        </div>
      </div>
    )
  }

  const status = statusQuery.data
  const firstUnfinished = status.steps.find((s) => !s.completed)
  // A revisited step wins until it is saved.
  const activeStep = revisiting ? (status.steps.find((s) => s.step === revisiting) ?? firstUnfinished) : firstUnfinished
  const activeIndex = activeStep ? status.steps.findIndex((s) => s.step === activeStep.step) : status.steps.length - 1

  const trailItems: TrailItem[] = status.steps.map((s) => ({
    step: s.step,
    label: STEP_COPY[s.step]?.label ?? s.title,
    completed: s.completed,
  }))

  const copy = activeStep ? STEP_COPY[activeStep.step] : STEP_COPY.complete
  const petLabel = card.petName.trim() || 'your pet'

  // A photo of you and a photo of your pet are what the whole product is built
  // on — an account without them has nothing to show anyone. So the only way
  // out of a required step is to finish it. The escape hatch survives on the
  // genuinely optional step (the bio), where "later" is a real answer.
  const canLeaveWizard = !activeStep || !activeStep.required

  const stepMotion = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : isNarrow
      ? // No blur on phones. Animating a filter over a subtree this size forces a
        // full-page repaint every frame on mobile GPUs, and the step change —
        // which happens six times in a row — was the jerkiest moment in the flow.
        { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }
      : {
          initial: { opacity: 0, y: 16, filter: 'blur(6px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, y: -12, filter: 'blur(6px)' },
        }

  return (
    <div className="relative min-h-screen px-4 pb-10 pt-20 sm:px-6 sm:pb-16 sm:pt-24 lg:pb-20 lg:pt-28">
      {/* Two offset washes rather than one centred blob, so the page has a
          direction to it and the card column sits in the warmer half.

          Both are dialled right back on phones: a pair of 480px circles under a
          140px blur is a very large compositing job to redo on every scroll
          frame, and it was buying atmosphere the user could barely see behind
          the form anyway. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#ff6b35]/8 blur-[80px] sm:-left-32 sm:h-[30rem] sm:w-[30rem] sm:blur-[140px]" />
        <div className="absolute right-0 top-1/3 hidden h-[26rem] w-[26rem] rounded-full bg-pink-500/8 blur-[140px] sm:block" />
      </div>

      <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        {/* ── Questions ─────────────────────────────────────────────────────── */}
        <div className="min-w-0">
          <div className="mb-6 sm:mb-8">
            <PawTrail items={trailItems} activeIndex={activeIndex} onSelect={(step) => setRevisiting(step)} />
            {/* Wraps rather than squeezes: "Step 3 of 6 / Finishing touches" and
                the exit link do not both fit on one line at 320px, and letting
                them collide was shrinking the step counter to two words a line. */}
            <div className="mt-3.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 sm:mt-4">
              <p className="text-sm text-neutral-400">
                {activeStep ? (
                  <>
                    <span className="font-medium text-white">
                      Step {activeIndex + 1} of {status.steps.length}
                    </span>
                    <span className="mx-2 text-neutral-700">/</span>
                    {copy.label}
                    {!activeStep.required && <span className="ml-2 text-neutral-500">optional</span>}
                  </>
                ) : (
                  <span className="font-medium text-emerald-400">All steps done</span>
                )}
              </p>
              {activeStep && canLeaveWizard && (
                <button
                  type="button"
                  onClick={leaveWizard}
                  className="flex-shrink-0 py-1 text-sm text-neutral-500 underline-offset-4 transition-colors hover:text-neutral-300 hover:underline"
                >
                  Finish later
                </button>
              )}
            </div>
          </div>

          {/* Compact card preview for narrow screens, where the full card can't sit
              beside the form.

              Sticky, so it keeps doing on a phone what the full card does on a
              desktop: react to what you are typing while you type it. Parked
              flush under the fixed navbar. */}
          <div className="sticky top-[3.75rem] z-20 mb-6 -mx-4 bg-neutral-950/85 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
            <LiveCardPreview draft={card} compact />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep?.step ?? 'complete'}
              {...stepMotion}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            >
              <ScrollToStepTop />
              <h1 className="text-balance font-display text-[1.7rem] font-bold leading-[1.12] tracking-[-0.02em] text-white sm:text-3xl md:text-4xl">
                {copy.question}
              </h1>
              {copy.sub && (
                <p className="mt-3 max-w-[54ch] text-pretty text-[0.9375rem] leading-relaxed text-neutral-400 sm:text-base">
                  {copy.sub}
                </p>
              )}

              <div className="mt-7 sm:mt-8">
                {!activeStep && <CompleteBlock petName={card.petName} onContinue={leaveWizard} />}

                {activeStep?.step === 'email_verification' && (
                  <EmailVerificationStep email={profile?.email ?? ''} onVerified={refreshAll} />
                )}

                {activeStep?.step === 'profile_basics' && (
                  <ProfileBasicsStep
                    initialFullName={profile?.full_name ?? ''}
                    initialOccupation={profile?.occupation ?? ''}
                    initialLat={profile?.latitude ?? null}
                    initialLng={profile?.longitude ?? null}
                    initialAddress={profile?.address ?? ''}
                    onDraft={patchDraft}
                    onSaved={refreshAll}
                  />
                )}

                {activeStep?.step === 'profile_photo' && (
                  <ProfilePhotoStep
                    currentPhotoUrl={profile?.profile_photo_url ?? null}
                    onDraft={patchDraft}
                    onSaved={refreshAll}
                  />
                )}

                {activeStep?.step === 'pet_profile' && (
                  <PetProfileStep
                    initialLat={profile?.latitude ?? null}
                    initialLng={profile?.longitude ?? null}
                    initialAddress={profile?.address ?? ''}
                    onDraft={patchDraft}
                    onSaved={refreshAll}
                  />
                )}

                {activeStep?.step === 'pet_photos' &&
                  (myPet ? (
                    <PetPhotosStep
                      petId={myPet.id}
                      petName={myPet.name}
                      photos={myPet.photos ?? []}
                      onDraft={patchDraft}
                      onPhotosChanged={refreshPets}
                      onContinue={refreshAll}
                    />
                  ) : (
                    <Skeleton className="mx-auto h-64 w-full max-w-[260px] rounded-2xl" />
                  ))}

                {activeStep?.step === 'preferences' && (
                  <PreferencesStep
                    initialBio={profile?.bio ?? ''}
                    initialAddress={profile?.address ?? ''}
                    petName={petLabel}
                    onSaved={refreshAll}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Live card ─────────────────────────────────────────────────────── */}
        <aside className="hidden lg:sticky lg:top-28 lg:flex lg:flex-col lg:items-center lg:gap-4 lg:self-start">
          <LiveCardPreview draft={card} />
          <p className="max-w-[34ch] text-center text-xs leading-relaxed text-neutral-500">
            {activeStep
              ? 'This is the card other owners swipe on. It updates as you type.'
              : `${card.petName || 'Your pet'} is live in Discover.`}
          </p>
        </aside>
      </div>
    </div>
  )
}

function CompleteBlock({ petName, onContinue }: { petName: string; onContinue: () => void }) {
  const shouldReduceMotion = useReducedMotion()
  return (
    <div className="space-y-6">
      <p className="max-w-[52ch] text-base leading-relaxed text-neutral-400">
        {petName ? `${petName} is` : "They're"} in Discover now, showing to owners nearby. You can change any of this
        later from your profile.
      </p>
      <motion.button
        type="button"
        onClick={onContinue}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
        className="group flex w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-8 py-4 font-semibold text-white shadow-lg shadow-[#ff6b35]/25 transition-shadow hoverable:hover:shadow-xl hoverable:hover:shadow-[#ff6b35]/35 sm:w-auto sm:py-3.5"
      >
        See who's nearby
        <ArrowRight className="h-4 w-4 transition-transform hoverable:group-hover:translate-x-0.5" />
      </motion.button>
    </div>
  )
}

export default OnboardingPage
