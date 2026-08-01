import { useLocation } from 'react-router'
import { useSeo, type SeoOptions } from '@/hooks/useSeo'

/**
 * Titles and descriptions for the routes whose copy is fixed, in one table.
 *
 * Central rather than a call in each page component: this is a lookup keyed by
 * path with no access to anything a page renders, so spreading it across twelve
 * files would only spread it. Routes whose title depends on loaded data — a
 * pet's name, an owner's — are deliberately absent here and call useSeo
 * themselves, which is also why this renders *before* <Routes>: sibling effects
 * run in document order, so a page's own call lands after this one and wins
 * rather than being overwritten by it.
 *
 * The signed-in routes are listed only to be marked noindex. robots.txt already
 * disallows them, but robots.txt is a request not to crawl, not an instruction
 * to drop a URL already in the index — and a URL that is disallowed cannot be
 * re-read to discover a noindex. Belt and braces, cheap.
 */
const ROUTES: Record<string, SeoOptions> = {
  '/': {
    title: 'PawSome — Find Playdates for Your Dog or Cat',
    description:
      'Match your dog or cat with compatible pets nearby, chat with their owner, and plan a real playdate. Join local pet meetups on PawSome.',
    path: '/',
  },
  '/community': {
    title: 'Browse Pets Near You',
    description:
      'Every dog and cat on PawSome, with their owners. Filter by species, breed and gender to find a companion near you.',
    path: '/community',
  },
  '/events': {
    title: 'Pet Meetups and Dog Park Events',
    description:
      'Find dog-park hangouts, adoption drives and pet meetups near you, or post your own and see who RSVPs.',
    path: '/events',
  },
  '/about': {
    title: 'About PawSome',
    description:
      'Why PawSome exists: pets get a fraction of the years we do, and they deserve better company than a stranger they sniff once.',
    path: '/about',
  },
  '/faq': {
    title: 'Frequently Asked Questions',
    description:
      'How matching works, how playdates are arranged, and how PawSome keeps pets and owners safe.',
    path: '/faq',
  },
  '/privacy': { title: 'Privacy Policy', description: 'How PawSome handles your data.', path: '/privacy' },
  '/terms': { title: 'Terms of Use', description: 'The terms you agree to by using PawSome.', path: '/terms' },

  '/auth': { title: 'Sign In', noIndex: true },
  '/forgot-password': { title: 'Reset Your Password', noIndex: true },
  '/reset-password': { title: 'Reset Your Password', noIndex: true },
  '/verify-email': { title: 'Verify Your Email', noIndex: true },
  '/discover': { title: 'Discover', noIndex: true },
  '/matches': { title: 'Matches', noIndex: true },
  '/chat': { title: 'Chat', noIndex: true },
  '/profile': { title: 'Your Profile', noIndex: true },
  '/onboarding': { title: 'Set Up Your Pet', noIndex: true },
}

const FALLBACK: SeoOptions = {
  title: 'PawSome — Find Playdates for Your Dog or Cat',
  description:
    'Match your dog or cat with compatible pets nearby, chat with their owner, and plan a real playdate.',
}

export function RouteSeo() {
  const { pathname } = useLocation()
  // Trailing slashes are normalised so /community/ and /community are not two
  // different lookups that fall through to different titles.
  const key = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  useSeo(ROUTES[key] ?? FALLBACK)
  return null
}
