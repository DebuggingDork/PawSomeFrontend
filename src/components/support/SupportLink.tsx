import type { ReactNode } from 'react'
import { SUPPORT_EMAIL, supportComposeUrl } from '@/lib/support'

interface SupportLinkProps {
  /** Prefills Gmail's subject line, so a request arrives already sorted. */
  subject?: string
  body?: string
  className?: string
  /** Defaults to the address itself, which keeps it copyable for non-Gmail users. */
  children?: ReactNode
}

export function SupportLink({ subject, body, className, children }: SupportLinkProps) {
  return (
    <a
      href={supportComposeUrl(subject, body)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children ?? SUPPORT_EMAIL}
    </a>
  )
}
