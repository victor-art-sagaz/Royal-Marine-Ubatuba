import { useId } from 'react'

interface MusaSideProps {
  className?: string
}

/**
 * Lancha Musa II desenhada de lado (proa para a direita), baseada nas fotos reais:
 * casco branco com vigias ovais e o nome "MUSA II", flybridge com toldo azul-marinho,
 * para-brisa escuro, defensas pretas na proa e plataforma de popa.
 * O desenho vai até a linha d'água (y = 76); abaixo dela fica "dentro" da água.
 */
export default function MusaSide({ className }: MusaSideProps) {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      viewBox="-4 -4 244 86"
      className={className}
      role="img"
      aria-label="Lancha Musa II vista de lado"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`hull-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.65" stopColor="#f1f4f6" />
          <stop offset="1" stopColor="#cdd8df" />
        </linearGradient>
        <linearGradient id={`glass-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4b5a" />
          <stop offset="1" stopColor="#10171f" />
        </linearGradient>
        <linearGradient id={`bimini-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#27406f" />
          <stop offset="1" stopColor="#14284b" />
        </linearGradient>
      </defs>

      {/* Plataforma de popa, bote inflável e motor de popa */}
      <rect x="-3" y="66" width="16" height="3.4" rx="1" fill="#e9edf0" stroke="#8aa0ae" strokeWidth="0.6" />
      <path d="M-2 60 Q1 54 8 55 Q14 56 13 63 L13 66 L-2 66 Z" fill="#aeb7bd" stroke="#7d8a93" strokeWidth="0.6" />
      <rect x="-5" y="57" width="3.6" height="9" rx="1" fill="#1b1f24" />

      {/* Flybridge: banco, console e para-brisa */}
      <path d="M40 27 L40 21 Q40 19 42 19 L82 19 Q84 19 84 21 L84 27 Z" fill="#dfe5e9" stroke="#9eb0bc" strokeWidth="0.6" />
      <path d="M94 27 L94 17.5 Q94 15.5 96 15.5 L120 15.5 L128 27 Z" fill="#f6f8f9" stroke="#9eb0bc" strokeWidth="0.7" />
      <path d="M100 17 L119 17 L124.5 24.5 L100 24.5 Z" fill={`url(#glass-${id})`} />
      <path d="M101 18.2 H117" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.6" strokeLinecap="round" />

      {/* Toldo azul-marinho e a armação de inox */}
      <g stroke="#b4bec6" strokeWidth="1.1" strokeLinecap="round" fill="none">
        <line x1="40" y1="5.4" x2="40" y2="27" />
        <line x1="66" y1="4" x2="66" y2="19" />
        <line x1="124" y1="5.8" x2="124" y2="22" />
        <line x1="124" y1="5.8" x2="132" y2="27" />
      </g>
      <path d="M33 8 Q82 -4 134 7 L136 11 Q84 1 35 12 Z" fill={`url(#bimini-${id})`} />
      <path d="M36 9 Q84 -1.5 133 8" fill="none" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="0.7" />

      {/* Cabine principal */}
      <path
        d="M58 47 L62 27 Q62.6 25.6 64 25.6 L146 25.6 Q148 25.6 149 27 L178 44 L182 47 Z"
        fill={`url(#hull-${id})`}
        stroke="#9eb0bc"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <path
        d="M70 29.6 L145 29.6 Q147 29.6 148.4 30.8 L168 43 L72 43 Q68 43 68.4 40 Z"
        fill={`url(#glass-${id})`}
        stroke="#0b1117"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <path d="M74 33 H142 L154 40" fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="108" y1="29.8" x2="108" y2="43" stroke="#0b1117" strokeWidth="1.1" />

      {/* Casco */}
      <path
        d="M4 47 L4 71 Q4 76 10 76 L196 76 Q214 74 224 61 Q232 51 235 39 L231 37 Q226 41 214 42 L150 46 Q96 49 52 47.6 Z"
        fill={`url(#hull-${id})`}
        stroke="#8aa0ae"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* Faixa de inox ao longo do casco */}
      <path d="M6 51.4 Q100 53 160 50.6 Q210 48 232 38.6" fill="none" stroke="#b9c5cd" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6 54 Q100 55.6 160 53.2 Q206 51 227 43.6" fill="none" stroke="#d2dce2" strokeWidth="0.6" strokeLinecap="round" />

      {/* Vigias ovais */}
      <g fill="#1c2833" stroke="#c5d0d7" strokeWidth="0.8">
        <ellipse cx="150" cy="58" rx="5.6" ry="2.7" />
        <ellipse cx="168" cy="57.2" rx="5.6" ry="2.7" />
        <ellipse cx="206" cy="52.4" rx="4.6" ry="2.3" />
      </g>

      {/* Nome da lancha */}
      <text
        x="118"
        y="69"
        fontFamily="Roboto, system-ui, sans-serif"
        fontSize="8.6"
        fontWeight="900"
        fontStyle="italic"
        letterSpacing="0.9"
        fill="#12171c"
      >
        MUSA II
      </text>

      {/* Proa: convés, corrimão e as defensas pretas */}
      <path d="M180 44 L233 37.2 L234 39 L184 46 Z" fill="#d9d4c8" stroke="#a69f8d" strokeWidth="0.5" />
      <g stroke="#c0cad1" strokeWidth="0.9" strokeLinecap="round" fill="none">
        <path d="M168 36 Q200 30 229 28.4" />
        <line x1="180" y1="44" x2="180" y2="34.2" />
        <line x1="196" y1="42.4" x2="196" y2="32.4" />
        <line x1="212" y1="40.6" x2="212" y2="30.6" />
        <line x1="228" y1="38.8" x2="228" y2="28.6" />
      </g>
      <g fill="#14171a">
        <rect x="199.4" y="34" width="4.2" height="10" rx="1.9" />
        <rect x="205.6" y="33.4" width="4.2" height="10" rx="1.9" />
        <rect x="211.8" y="32.8" width="4.2" height="10" rx="1.9" />
      </g>
      <circle cx="233.4" cy="37.6" r="1.1" fill="#9aa4ab" />
    </svg>
  )
}
