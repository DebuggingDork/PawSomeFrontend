import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Shuffle,
  Star,
  Heart,
  Award,
  CalendarHeart,
  Camera,
  Undo2,
  SlidersHorizontal,
  PawPrint,
  Timer,
  SmilePlus,
  Search,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Tip {
  key: string
  icon: LucideIcon
  /** Tailwind classes for the icon chip. Literal strings, since Tailwind
   * scans source text and never sees a class name built at runtime. */
  chip: string
  title: string
  body: string
}

/**
 * Everything here is checked against the actual implementation, not written to
 * sound good: the one-per-day Super Woof allowance and its 24h window are
 * SUPER_WOOF_LIMIT / SUPER_WOOF_WINDOW_SECONDS in matches.py, the badge names
 * and thresholds come from achievements.py, and there really are 21 badges in
 * AchievementType. A tip that overpromises is worse than no tip, because the
 * person finds out by being disappointed.
 */
const TIPS: Tip[] = [
  {
    key: 'super-woof',
    icon: Star,
    chip: 'bg-sky-500/15 text-sky-300 ring-sky-400/30',
    title: 'One Super Woof a day. Use it well.',
    body: 'It puts you at the top of their Likes instead of somewhere in the pile. Your allowance comes back 24 hours later.',
  },
  {
    key: 'likes',
    icon: Heart,
    chip: 'bg-brand/15 text-brand-light ring-brand/30',
    title: 'Liking is not shouting into the void.',
    body: 'They get notified as soon as you like them. If they like you back, the match happens on the spot and this chat opens itself.',
  },
  {
    key: 'badges',
    icon: Award,
    chip: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
    title: 'There are 21 badges. You have a few.',
    body: 'Breaking the Ice for your first message, Match Maker for your first match, Week One for still being here after seven days.',
  },
  {
    key: 'playdates',
    icon: CalendarHeart,
    chip: 'bg-pink-500/15 text-pink-300 ring-pink-400/30',
    title: 'Take it outside.',
    body: 'Plan a playdate from any chat: pick a spot and a time, and they accept or counter. Proposing your first one earns Park Life.',
  },
  {
    key: 'photos',
    icon: Camera,
    chip: 'bg-violet-500/15 text-violet-300 ring-violet-400/30',
    title: 'One photo is a small sample size.',
    body: 'Every pet has five photo slots — add, remove, or pick the main one from Profile → Photos. Fill all five and Photogenic is yours.',
  },
  {
    key: 'undo',
    icon: Undo2,
    chip: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
    title: 'Passed on someone too quickly?',
    body: 'The undo button in Discover brings the last card back. You can also reopen a pass later from their profile.',
  },
  {
    key: 'filters',
    icon: SlidersHorizontal,
    chip: 'bg-cyan-500/15 text-cyan-300 ring-cyan-400/30',
    title: 'Your deck, your rules.',
    body: 'Filter by distance, breed, age, and whether they are vaccinated, neutered, or trained. The deck rebuilds around whatever you pick.',
  },
  // MAX_PETS_PER_USER = 5 in pets.py; the Add pet button lives in Profile → Pets.
  {
    key: 'more-pets',
    icon: PawPrint,
    chip: 'bg-orange-500/15 text-orange-300 ring-orange-400/30',
    title: 'More than one animal runs your house?',
    body: 'You can add up to five pets from Profile → Pets. Each one gets its own card, its own photos, and its own matches.',
  },
  // MESSAGE_DELETE_WINDOW = 15 minutes in chat.py; ChatBubble gates the same way.
  {
    key: 'delete-window',
    icon: Timer,
    chip: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
    title: 'Sent it to the wrong chat?',
    body: 'You can delete any message of yours within fifteen minutes of sending it — the menu is on the bubble. After that, it stands.',
  },
  // One reaction per person per message; picking again replaces, same emoji removes.
  {
    key: 'reactions',
    icon: SmilePlus,
    chip: 'bg-lime-500/15 text-lime-300 ring-lime-400/30',
    title: 'Not everything needs a reply.',
    body: 'Tap any message to react with an emoji. One reaction per message — picking a different one swaps it, picking the same one takes it back.',
  },
  {
    key: 'chat-search',
    icon: Search,
    chip: 'bg-indigo-500/15 text-indigo-300 ring-indigo-400/30',
    title: '"They mentioned a park… which one?"',
    body: 'The magnifying glass at the top of any conversation searches that whole thread and jumps you straight to the message.',
  },
]

/**
 * The right-hand pane before a conversation is picked.
 *
 * This is the most-seen screen in Chat now that a thread never opens by
 * itself, so it does something rather than apologise for being empty. A
 * different tip each time the page mounts keeps it from going stale, and the
 * shuffle gives anyone who wants a different one a way to ask.
 */
export function ChatIdlePanel() {
  // Lazy initialiser, so a fresh tip is chosen per mount rather than once per
  // module load, which would show every visit in a session the same tip.
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TIPS.length))
  const reduceMotion = useReducedMotion()
  const tip = TIPS[index]
  const Icon = tip.icon

  // Steps rather than re-randomises: a random pick can land on the tip already
  // on screen, which reads as a broken button.
  const nextTip = () => setIndex((i) => (i + 1) % TIPS.length)

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tip.key}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex max-w-sm flex-col items-center"
        >
          <span
            className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${tip.chip}`}
            aria-hidden="true"
          >
            <Icon className="h-7 w-7" />
          </span>

          <h2 className="text-balance font-display text-xl font-bold leading-snug text-white">{tip.title}</h2>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-neutral-300">{tip.body}</p>
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={nextTip}
        className="mt-6 flex items-center gap-2 rounded-full border border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-400 transition duration-150 ease-out hover:border-neutral-700 hover:text-white active:scale-95"
      >
        <Shuffle className="h-3.5 w-3.5" />
        Show me another
      </button>

      {/* The pane still has a job. Kept quiet so it reads as a footnote to the
          tip rather than competing with it, but never dropped. */}
      <p className="mt-10 max-w-xs text-xs leading-relaxed text-neutral-400">
        Pick a match from the list to open that conversation.
      </p>
    </div>
  )
}
