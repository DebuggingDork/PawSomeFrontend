import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { PawPrint, Home, Bug, Ghost } from 'lucide-react'

// A few snark options — one is picked per visit so refreshing keeps roasting you.
const HEADLINES = [
  'Well, this is awkward.',
  'Congratulations, you broke it. 🎉',
  'This page went to get treats and never came back.',
  'You have reached the edge of the internet. Turn around.',
  'Nothing here but tumbleweeds and disappointment.',
  '404: page not found. Effort: also not found.',
  "The page you want is in another castle. 🍄",
]

// The dog "typed" these. Revealed one line at a time for dramatic effect.
const ERROR_LOG = [
  '$ pawsome --find "the page you wanted"',
  '> searching...',
  '> searching harder...',
  '> asking the dog...',
  '> the dog does not care.',
  'Error 404: page.exe has gone for a walk 🐕',
]

// Static so we never call Math.random during render (keeps things deterministic per paw).
const BG_PAWS = [
  { top: '12%', left: '8%', rotate: -20, delay: 0 },
  { top: '22%', left: '82%', rotate: 25, delay: 1.2 },
  { top: '68%', left: '14%', rotate: 12, delay: 0.6 },
  { top: '78%', left: '76%', rotate: -15, delay: 1.8 },
  { top: '44%', left: '50%', rotate: 8, delay: 2.4 },
  { top: '58%', left: '38%', rotate: -30, delay: 0.9 },
  { top: '30%', left: '28%', rotate: 18, delay: 1.5 },
  { top: '84%', left: '46%', rotate: -8, delay: 2.1 },
]

// Escalating judgment based on how long they've been stuck here.
function lostSnark(seconds: number): string {
  if (seconds < 5) return 'You just got here. Impatient much?'
  if (seconds < 15) return 'Still lost. Bold strategy.'
  if (seconds < 30) return 'You could have walked home by now.'
  if (seconds < 60) return "We're starting to worry about you."
  return "Okay, this is just sad. There's a button. Two, actually."
}

const DODGE_LABELS = ['Take me home', 'Nope.', 'Missed me. 😜', 'Ugh, fine — go →']

function NotFoundPage() {
  const [headline, setHeadline] = useState(HEADLINES[0])
  const [seconds, setSeconds] = useState(0)
  const [visibleLogLines, setVisibleLogLines] = useState(0)
  const [dodges, setDodges] = useState(0)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [reported, setReported] = useState(false)

  const surrendered = dodges >= DODGE_LABELS.length - 1

  // Pick a random roast on mount (deferred so it's not a synchronous effect setState).
  useEffect(() => {
    const id = setTimeout(() => setHeadline(HEADLINES[Math.floor(Math.random() * HEADLINES.length)]), 0)
    return () => clearTimeout(id)
  }, [])

  // "Lost for X seconds" ticker.
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Reveal the fake error log one line at a time.
  useEffect(() => {
    const id = setInterval(() => setVisibleLogLines((n) => (n >= ERROR_LOG.length ? n : n + 1)), 450)
    return () => clearInterval(id)
  }, [])

  const dodge = () => {
    if (surrendered) return
    setDodges((d) => d + 1)
    setPos({ x: (Math.random() - 0.5) * 260, y: (Math.random() - 0.5) * 90 })
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-6rem)] flex-col items-center justify-center overflow-hidden px-4 sm:px-6 pb-16 pt-24 text-center md:pt-28">
      {/* Floating paw prints, judging you from the background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {BG_PAWS.map((p, i) => (
          <motion.div
            key={i}
            className="absolute text-neutral-800"
            style={{ top: p.top, left: p.left, rotate: `${p.rotate}deg` }}
            animate={{ y: [0, -14, 0], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          >
            <PawPrint className="h-10 w-10" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex w-full max-w-lg flex-col items-center"
      >
        {/* 4 🐾 4 */}
        <div className="mb-2 flex items-center justify-center gap-2 font-display font-extrabold leading-none">
          <span className="bg-gradient-to-br from-brand to-pink-500 bg-clip-text text-[7rem] text-transparent md:text-[9rem]">4</span>
          <motion.span
            animate={{ rotate: [0, -12, 12, -6, 0], y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-brand drop-shadow-[0_0_25px_rgba(255,107,53,0.5)]"
          >
            <PawPrint className="h-24 w-24 md:h-32 md:w-32" fill="currentColor" />
          </motion.span>
          <span className="bg-gradient-to-br from-pink-500 to-brand bg-clip-text text-[7rem] text-transparent md:text-[9rem]">4</span>
        </div>

        <h1 className="mb-3 font-display text-2xl font-bold text-white md:text-3xl">{headline}</h1>

        <p className="mb-6 text-neutral-400">
          We looked everywhere — under the couch, behind the router, inside a very confused Golden Retriever. This page
          isn't here. Honestly? Between us — are you <em className="text-neutral-300">sure</em> you typed that right?
        </p>

        {/* Fake terminal, "typed" by the dog */}
        <div className="mb-6 w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/80 text-left font-accent text-xs shadow-inner">
          <div className="flex items-center gap-1.5 border-b border-neutral-800 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-[10px] text-neutral-600">not-found — zsh — 80×24</span>
          </div>
          <div className="space-y-1 px-4 py-3">
            {ERROR_LOG.slice(0, visibleLogLines).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={i === ERROR_LOG.length - 1 ? 'font-bold text-brand-light' : 'text-neutral-400'}
              >
                {line}
              </motion.p>
            ))}
            {visibleLogLines >= ERROR_LOG.length && (
              <span className="inline-block h-3 w-2 animate-pulse bg-brand align-middle" />
            )}
          </div>
        </div>

        {/* Live shame counter */}
        <p className="mb-8 flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-500">
          <Ghost className="h-4 w-4 text-neutral-600" />
          Lost for{' '}
          <span className="font-accent font-semibold text-brand-light">{seconds}s</span>
          <span className="text-neutral-600">— {lostSnark(seconds)}</span>
        </p>

        {/* The gag: a home button that runs away (mouse only), plus a real escape hatch */}
        <div className="relative flex min-h-[6rem] w-full flex-col items-center justify-center gap-4">
          <motion.div animate={pos} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
            <Link
              to="/"
              onMouseEnter={dodge}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-pink-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-brand/30 transition-transform hoverable:hover:-translate-y-0.5"
            >
              <Home className="h-4 w-4" />
              {DODGE_LABELS[Math.min(dodges, DODGE_LABELS.length - 1)]}
            </Link>
          </motion.div>

          <Link
            to="/discover"
            className="text-sm font-medium text-neutral-500 underline decoration-neutral-700 underline-offset-4 transition-colors hover:text-neutral-300"
          >
            or just click here, quitter — go find some pets instead
          </Link>
        </div>

        {/* Bug report troll */}
        <div className="mt-10">
          {reported ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-neutral-500"
            >
              ✅ Report received. We've assigned it to the dog. Estimated fix: <span className="text-neutral-400">never</span>.
            </motion.p>
          ) : (
            <button
              onClick={() => setReported(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-400"
            >
              <Bug className="h-3.5 w-3.5" />
              Report this "bug"
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default NotFoundPage
