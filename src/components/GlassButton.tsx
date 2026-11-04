import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Tone = 'default' | 'gold' | 'dark'

interface GlassButtonProps {
  children: ReactNode
  to?: string
  href?: string
  icon?: ReactNode
  external?: boolean
  /** default = vidro branco (use sobre fotos/fundos escuros) · gold = vidro dourado · dark = vidro azul-marinho (use sobre fundo claro) */
  tone?: Tone
  className?: string
}

const tones: Record<Tone, string> = {
  default:
    'border-white/25 bg-white/10 text-white hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]',
  gold:
    'border-gold/60 bg-gold/25 text-white hover:bg-gold/40 hover:shadow-[0_0_20px_rgba(201,162,39,0.45)]',
  dark:
    'border-navy/30 bg-navy/85 text-white hover:bg-navy hover:shadow-[0_0_20px_rgba(20,40,75,0.45)]',
}

/** Botão "vidro" (efeito GlassyNavbar). */
export default function GlassButton({
  children,
  to,
  href,
  icon,
  external,
  tone = 'default',
  className = '',
}: GlassButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-medium tracking-wide shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 ${tones[tone]} ${className}`

  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <a href={href} className={classes} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {content}
    </a>
  )
}
