import { useState } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

interface NavScrollState {
  /** Past the collapse threshold — shrink to the glass pill / drop the wordmark. */
  collapsed: boolean
  /** Scrolling down past the hide threshold — slide the whole bar off-screen. */
  hidden: boolean
}

/** Shared scroll-tracking for the navbar: collapses the glass pill once scrolled,
 * and hides the bar while scrolling down (reappears on scroll-up). */
export function useNavScroll(collapseThreshold = 100, hideThreshold = 150): NavScrollState {
  const { scrollY } = useScroll()
  const [collapsed, setCollapsed] = useState(false)
  const [hidden, setHidden] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setCollapsed(latest > collapseThreshold)

    const previous = scrollY.getPrevious() ?? 0
    setHidden(latest > previous && latest > hideThreshold)
  })

  return { collapsed, hidden }
}
