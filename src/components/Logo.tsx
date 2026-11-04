import { useId } from 'react'
import { LOGO_ANCHOR, LOGO_MARINE, LOGO_ROYAL } from '../lib/logoPaths'

interface LogoProps {
  className?: string
  /**
   * Quanto da moldura azul (e do cartão branco) aparece, de 0 a 1.
   * 0 = só a âncora e as letras (faixa branca da Página Inicial)
   * 1 = logo inteira, igual à imagem original (barra lateral, cartões)
   * Também aceita uma variável CSS, ex.: "var(--logo-frame, 1)".
   */
  frameOpacity?: number | string
  title?: string
}

/** Logo oficial da Royal Marine, desenhada em vetor a partir da imagem original. */
export default function Logo({ className = '', frameOpacity = 1, title = 'Royal Marine - Garagem Náutica' }: LogoProps) {
  const gradientId = `rm-gold-${useId().replace(/:/g, '')}`
  return (
    <svg
      viewBox="24 106 638 1066"
      className={className}
      role="img"
      aria-label={title}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6c026" />
          <stop offset="1" stopColor="#e8741c" />
        </linearGradient>
      </defs>
      {/* Cartão branco + moldura azul (somem na faixa branca) */}
      <g style={{ opacity: frameOpacity as number }}>
        <rect x="24" y="106" width="638" height="1066" fill="#ffffff" />
        <rect x="32" y="114" width="622" height="1050" fill="none" stroke="#14284b" strokeWidth="7" />
      </g>
      <path d={LOGO_ANCHOR} fill="#16296b" fillRule="evenodd" />
      <path d={LOGO_ROYAL} fill="#0f1b3d" fillRule="evenodd" />
      <path d={LOGO_MARINE} fill={`url(#${gradientId})`} fillRule="evenodd" />
      <text
        x="119"
        y="1050"
        fontFamily="Roboto, system-ui, sans-serif"
        fontSize="27"
        fill="#14284b"
        textLength="448"
        lengthAdjust="spacing"
      >
        GARAGEM NÁUTICA
      </text>
    </svg>
  )
}

interface WordmarkProps {
  className?: string
  /** light = letras brancas (fundo escuro) · dark = letras azul-marinho (fundo claro) */
  tone?: 'light' | 'dark'
}

/**
 * "ROYAL MARINE GARAGEM NÁUTICA" em uma linha, com as mesmas letras da logo original.
 */
export function Wordmark({ className = '', tone = 'light' }: WordmarkProps) {
  const gradientId = `rm-word-${useId().replace(/:/g, '')}`
  const royal = tone === 'light' ? '#ffffff' : '#0f1b3d'
  const tagline = tone === 'light' ? 'rgba(255,255,255,0.78)' : '#14284b'
  return (
    <svg
      viewBox="0 -2 1063 182"
      className={className}
      role="img"
      aria-label="Royal Marine - Garagem Náutica"
      style={{ display: 'block', height: 'auto' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6c026" />
          <stop offset="1" stopColor="#e8741c" />
        </linearGradient>
      </defs>
      <path d={LOGO_ROYAL} fill={royal} fillRule="evenodd" transform="translate(-100.5 -773)" />
      <path
        d={LOGO_MARINE}
        fill={`url(#${gradientId})`}
        fillRule="evenodd"
        transform="translate(536 -997.7) scale(1.11) translate(-105 0)"
      />
      <text
        x="0"
        y="168"
        fontFamily="Roboto, system-ui, sans-serif"
        fontSize="38"
        fill={tagline}
        textLength="1063"
        lengthAdjust="spacing"
      >
        GARAGEM NÁUTICA
      </text>
    </svg>
  )
}

/**
 * Só a âncora da logo da Royal Marine (o mesmo desenho da logo oficial).
 * A cor vem do texto do elemento (currentColor), então use classes como "text-teal".
 */
export function LogoAnchor({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="98 188 489 552"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      style={{ display: 'block' }}
    >
      <path d={LOGO_ANCHOR} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}
