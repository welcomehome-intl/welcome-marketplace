"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ComponentProps, useTransition } from 'react'

type SmoothLinkProps = ComponentProps<typeof Link> & {
  children: React.ReactNode
}

export function SmoothLink({ href, children, ...props }: SmoothLinkProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    startTransition(() => {
      router.push(href.toString())
    })
  }

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
