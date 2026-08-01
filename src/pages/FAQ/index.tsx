import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import PawsomeFooter from '@/components/ui/PawsomeFooter'
import { SupportLink } from '@/components/support/SupportLink'
import { SUPPORT_EMAIL } from '@/lib/support'

interface QA {
  q: string
  a: ReactNode
}

interface Category {
  id: string
  title: string
  blurb: string
  items: QA[]
}

const A = 'text-neutral-300 leading-relaxed'

const CATEGORIES: Category[] = [
  {
    id: 'starting',
    title: 'Getting started',
    blurb: 'The first fifteen minutes.',
    items: [
      {
        q: 'What is PawSome, in one sentence?',
        a: (
          <p className={A}>
            A place to find a suitable match for your dog or cat nearby, from an owner who is a real, contactable
            person rather than a phone number someone passed you at the park.
          </p>
        ),
      },
      {
        q: 'Does it cost anything?',
        a: (
          <p className={A}>
            No. PawSome is free while it is this young, and there is no payment system in the app at all right now. If
            that ever changes, existing users will hear it from us before they see it in the interface.
          </p>
        ),
      },
      {
        q: 'How do I set up a pet profile?',
        a: (
          <p className={A}>
            Create an account, verify your email, then add your pet: name, species, breed, age, gender, temperament
            and photos. Set a location so we can work out who is near you. That is the whole of onboarding.
          </p>
        ),
      },
      {
        q: 'Can I add more than one pet?',
        a: (
          <p className={A}>
            Up to five active profiles per account. If you need more than five you are probably running a kennel,
            which is a different kind of account than the one we have built so far. Email us and tell us what you
            need.
          </p>
        ),
      },
      {
        q: 'Is this only for dogs?',
        a: (
          <p className={A}>
            Cats too. The species field is built to take more than dogs, and matching filters on it, so a cat is never
            shown a Labrador as a promising option.
          </p>
        ),
      },
    ],
  },
  {
    id: 'matching',
    title: 'Matching and breeding',
    blurb: 'How pets actually find each other.',
    items: [
      {
        q: 'How does matching work?',
        a: (
          <p className={A}>
            Matches are filtered by species and breed first, then sorted by how close they are to you. Age, gender and
            temperament narrow it further. Nothing is randomised for engagement, and there is no feed algorithm trying
            to keep you scrolling.
          </p>
        ),
      },
      {
        q: 'Why am I seeing so few matches?',
        a: (
          <p className={A}>
            Almost always because of where you are. This is a local product by design, and a new city starts empty.
            Widening your distance filter helps. Being early in your area is genuinely unglamorous, and we would
            rather admit that than pad your results with pets four hundred kilometres away.
          </p>
        ),
      },
      {
        q: 'Does PawSome check that the other animal is healthy?',
        a: (
          <p className={A}>
            No, and this is the one thing worth reading twice. We do not inspect animals, verify pedigree papers or
            confirm vaccination records. Health screening and genetic testing are between you, the other owner and a
            vet. A match is an introduction, not a clearance.
          </p>
        ),
      },
      {
        q: 'What should I sort out before agreeing to a breeding?',
        a: (
          <div className="space-y-3">
            <p className={A}>Have the boring conversation early, because it stops being boring later:</p>
            <ul className={`${A} list-disc space-y-1.5 pl-5 marker:text-[#ff6b35]`}>
              <li>Vet checks and any health screening the breed calls for.</li>
              <li>Stud fee, or pick of the litter, and exactly what that means.</li>
              <li>Who pays vet bills, and what happens if there is no pregnancy.</li>
              <li>Whether you are both allowed to breed where you live.</li>
            </ul>
            <p className={A}>
              Write it down and both keep a copy. PawSome is not part of that agreement and cannot enforce it.
            </p>
          </div>
        ),
      },
      {
        q: 'Is the distance shown accurate?',
        a: (
          <p className={A}>
            It is a straight-line distance, so treat it as "roughly this far" rather than a drive time. Fifteen
            kilometres across a city is a very different afternoon than fifteen kilometres down a highway.
          </p>
        ),
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety and trust',
    blurb: 'Meeting strangers, sensibly.',
    items: [
      {
        q: 'What does the verified badge mean?',
        a: (
          <p className={A}>
            That the person clicked a link in an email we sent to the address they signed up with. It filters out
            throwaway accounts, and that is all it does. It is not an identity check and not an endorsement.
          </p>
        ),
      },
      {
        q: 'How should I handle a first meeting?',
        a: (
          <p className={A}>
            Somewhere public, in daylight, with both animals on leads, and tell someone where you are going. Meet the
            person before anything is decided. If they push to skip that step, that is your answer about them.
          </p>
        ),
      },
      {
        q: 'Someone is behaving badly. What do I do?',
        a: (
          <p className={A}>
            Email <SupportLink subject="Reporting a user" className="text-[#ff6b35] underline-offset-4 transition-colors hover:text-[#ff8c5c] hover:underline" /> with their username and what happened. We can restrict features, suspend
            or remove accounts. Reports about animal welfare or someone's safety go to the front of the queue.
          </p>
        ),
      },
      {
        q: 'How do I spot a fake profile?',
        a: (
          <p className={A}>
            Photos that look like stock or studio shots, a story that changes between messages, pressure to move to
            another app straight away, and any request for money before you have met. Reverse image search is free
            and takes ten seconds.
          </p>
        ),
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Photos, location and privacy',
    blurb: 'What other people can and cannot see.',
    items: [
      {
        q: 'Can other users see exactly where I live?',
        a: (
          <p className={A}>
            No. The public view of a pet omits coordinates entirely. Other users are sent a distance, never a
            position, and only you can see the raw coordinates on your own pets.
          </p>
        ),
      },
      {
        q: 'Who can see my pet photos?',
        a: (
          <p className={A}>
            Other signed-in users, on your pet's profile. One caveat worth knowing: photos live in public object
            storage, so the direct image link works without signing in. The links are long and unguessable and we
            never publish them, but treat a pet photo as shareable rather than secret.
          </p>
        ),
      },
      {
        q: 'Do you sell my data or run ad trackers?',
        a: (
          <p className={A}>
            No to both. There is no ad network in PawSome and no third-party analytics following you around the
            internet. The{' '}
            <Link to="/privacy" className="text-[#ff6b35] underline-offset-4 transition-colors hover:text-[#ff8c5c] hover:underline">
              Privacy Policy
            </Link>{' '}
            lists every company that touches your data and what each of them gets.
          </p>
        ),
      },
      {
        q: 'How do I delete my account?',
        a: (
          <p className={A}>
            Email <SupportLink subject="Account deletion request" className="text-[#ff6b35] underline-offset-4 transition-colors hover:text-[#ff8c5c] hover:underline" /> and we will remove your personal data within 30 days. Deleting a single
            pet is instant from its profile: it disappears from browsing and matching straight away.
          </p>
        ),
      },
    ],
  },
  {
    id: 'trouble',
    title: 'When something is broken',
    blurb: 'The short list of things that actually go wrong.',
    items: [
      {
        q: 'My verification email never arrived.',
        a: (
          <p className={A}>
            Check spam first, that is where most of them are. If it is genuinely missing, request another from the
            sign-in screen. Still nothing after a few minutes and it is on us, so email
            <SupportLink subject="Verification email did not arrive" className="text-[#ff6b35] underline-offset-4 transition-colors hover:text-[#ff8c5c] hover:underline" /> and we will verify you by hand.
          </p>
        ),
      },
      {
        q: 'A photo will not upload.',
        a: (
          <p className={A}>
            Usually a very large file or a format phones use that browsers do not, such as HEIC. Try a JPEG or PNG
            under a few megabytes. If it still fails, tell us the file type and the browser you are on.
          </p>
        ),
      },
      {
        q: 'The app says it cannot reach the server.',
        a: (
          <p className={A}>
            Give it a moment and reload. The backend runs on a plan that puts the server to sleep when nobody has
            used it for a while, so the first request after a quiet spell can take up to a minute to wake it up.
          </p>
        ),
      },
      {
        q: 'Something else is wrong, or I have an idea.',
        a: (
          <p className={A}>
            Email <SupportLink subject="PawSome feedback" className="text-[#ff6b35] underline-offset-4 transition-colors hover:text-[#ff8c5c] hover:underline" />. This is a small enough project that suggestions from real users
            genuinely change what gets built next.
          </p>
        ),
      },
    ],
  },
]

function AccordionItem({ item }: { item: QA }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonId = useId()

  return (
    <div className="border-t border-neutral-900 first:border-t-0">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group flex w-full items-start justify-between gap-6 py-5 text-left transition-colors duration-150 hover:text-white"
        >
          <span className="text-pretty font-medium leading-snug text-white">{item.q}</span>
          <ChevronDown
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500 transition-[transform,color] duration-200 ease-out group-hover:text-neutral-300 motion-reduce:transition-none"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
      </h3>

      {/*
        0fr to 1fr on a grid row is the one way to transition to a content-driven
        height without measuring it in JS. The inner div needs the overflow clip,
        because the row collapses but the content does not.
      */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="grid transition-[grid-template-rows] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div
            className="max-w-[68ch] pb-6 pr-8 transition-opacity duration-200 ease-out motion-reduce:transition-none"
            style={{ opacity: open ? 1 : 0 }}
            /* A 0fr grid row still contains focusable children, so without this
               a closed answer's links stay in the tab order. */
            inert={!open}
          >
            {item.a}
          </div>
        </div>
      </div>
    </div>
  )
}

function FAQPage() {
  return (
    <div className="w-full bg-neutral-950">
      <header className="mx-auto max-w-3xl px-4 sm:px-6 pb-16 pt-28 md:pt-36">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 ease-out hoverable:group-hover:-translate-x-0.5" />
          Back to PawSome
        </Link>

        <h1 className="mt-8 text-balance font-display text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
          Questions people actually ask
        </h1>
        <p className="mt-5 max-w-[62ch] text-pretty text-lg leading-relaxed text-neutral-300">
          Grouped so you can find yours. If the answer you need is not here, the last one tells you where to send it.
        </p>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-24">
        {CATEGORIES.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="scroll-mt-28 gap-12 border-t border-neutral-900 py-14 first:border-t-0 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]"
          >
            <div className="mb-6 lg:mb-0">
              <div className="lg:sticky lg:top-28">
                <h2 className="font-display text-2xl font-bold text-white">{category.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{category.blurb}</p>
              </div>
            </div>

            <div>
              {category.items.map((item) => (
                <AccordionItem key={item.q} item={item} />
              ))}
            </div>
          </section>
        ))}

        <section className="mt-4 rounded-2xl bg-[#ff6b35]/[0.07] px-6 py-10 text-center md:px-10">
          <h2 className="text-balance font-display text-2xl font-bold text-white">Still stuck?</h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-pretty leading-relaxed text-neutral-300">
            Write to us and describe what happened. Real replies, from the person who built this.
          </p>
          <SupportLink
            subject="PawSome support"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ff6b35] px-7 py-3 font-semibold text-white shadow-lg shadow-[#ff6b35]/25 transition-[transform,background-color] duration-200 ease-out hover:bg-[#ff5722] active:scale-[0.97] motion-reduce:transition-none"
          >
            Email support
          </SupportLink>
          <p className="mt-4 text-sm text-neutral-400">
            Opens a Gmail compose window. Not a Gmail user? Write to {SUPPORT_EMAIL}.
          </p>
        </section>
      </div>

      <PawsomeFooter />
    </div>
  )
}

export default FAQPage
