interface MusaBoatProps {
  className?: string
}

const DECK_PATH =
  'M32 11 C42 28 51 52 52 88 L50 136 Q50 140 46 140 L18 140 Q14 140 14 136 L12 88 C13 52 22 28 32 11 Z'

/** Lancha Musa II vista de cima (ilustração em SVG, igual à do arquivo da MUSA). */
export default function MusaBoat({ className }: MusaBoatProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 154"
      width="100%"
      height="100%"
      role="img"
      aria-label="Lancha Musa II vista de cima"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="musa-hull" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f3f2ee" />
          <stop offset="1" stopColor="#d6d8d8" />
        </linearGradient>
        <linearGradient id="musa-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c8955d" />
          <stop offset="0.5" stopColor="#b98853" />
          <stop offset="1" stopColor="#a47642" />
        </linearGradient>
        <linearGradient id="musa-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c3b49" />
          <stop offset="1" stopColor="#141c25" />
        </linearGradient>
        <clipPath id="musa-deck-clip">
          <path d={DECK_PATH} />
        </clipPath>
      </defs>

      {/* Plataforma de popa */}
      <rect x="19" y="143" width="26" height="9" rx="2.2" fill="url(#musa-wood)" stroke="#8c6335" strokeWidth="0.6" />
      <line x1="22" y1="146" x2="42" y2="146" stroke="#8c6335" strokeWidth="0.4" />
      <line x1="22" y1="149" x2="42" y2="149" stroke="#8c6335" strokeWidth="0.4" />

      {/* Casco e convés */}
      <path
        d="M32 3 C45 22 57 50 58 88 L56 138 Q56 146 48 146 L16 146 Q8 146 8 138 L6 88 C7 50 19 22 32 3 Z"
        fill="url(#musa-hull)"
        stroke="#5f7384"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path d={DECK_PATH} fill="#f7f6f1" />
      <path d={DECK_PATH} fill="none" stroke="#9aa5ae" strokeWidth="1.1" strokeDasharray="0.9 2.8" strokeLinecap="round" />

      {/* Proa */}
      <circle cx="32" cy="15" r="1.3" fill="#9aa0a6" stroke="#5b6168" strokeWidth="0.3" />
      <rect x="29" y="19" width="6" height="5" rx="1" fill="#ffffff" stroke="#b5bcc3" strokeWidth="0.6" />

      {/* Bancos da proa */}
      <rect x="22" y="29" width="20" height="10" rx="2.6" fill="#8b8f96" stroke="#6f737a" strokeWidth="0.5" />
      <rect x="20.6" y="40.5" width="22.8" height="11" rx="2.8" fill="#8b8f96" stroke="#6f737a" strokeWidth="0.5" />
      <path d="M24 31.5 H40" stroke="#a7abb1" strokeWidth="0.5" strokeLinecap="round" />
      <path d="M23 43 H41" stroke="#a7abb1" strokeWidth="0.5" strokeLinecap="round" />

      {/* Defensas */}
      <g fill="#151515" stroke="#000000" strokeWidth="0.3">
        <ellipse cx="16.8" cy="44" rx="1.5" ry="3.3" transform="rotate(-8 16.8 44)" />
        <ellipse cx="15.6" cy="51" rx="1.5" ry="3.3" transform="rotate(-6 15.6 51)" />
        <ellipse cx="14.6" cy="58" rx="1.5" ry="3.3" transform="rotate(-4 14.6 58)" />
      </g>

      {/* Para-brisa */}
      <path d="M20 57 Q32 52 44 57 L46 66 Q32 61 18 66 Z" fill="url(#musa-glass)" />
      <path d="M23 57.8 Q32 54.6 41 57.8" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.6" />

      {/* Cabine */}
      <rect x="17" y="66" width="30" height="44" rx="6" fill="#efede6" stroke="#c3c8cc" strokeWidth="0.7" />
      <rect x="19.5" y="69" width="25" height="38" rx="5" fill="#1f2a44" stroke="#12192b" strokeWidth="0.6" />
      <g stroke="#2d3b5e" strokeWidth="0.8">
        <line x1="21" y1="79" x2="43" y2="79" />
        <line x1="21" y1="88" x2="43" y2="88" />
        <line x1="21" y1="97" x2="43" y2="97" />
      </g>
      <path d="M23 71.5 H41" stroke="#43537d" strokeWidth="0.7" strokeLinecap="round" />
      <g fill="#c9ced3" stroke="#7d868f" strokeWidth="0.3">
        <circle cx="20.6" cy="70.2" r="1.1" />
        <circle cx="43.4" cy="70.2" r="1.1" />
        <circle cx="20.6" cy="105.8" r="1.1" />
        <circle cx="43.4" cy="105.8" r="1.1" />
      </g>
      <line x1="32" y1="107" x2="32" y2="111.5" stroke="#9aa0a6" strokeWidth="0.6" />
      <circle cx="32" cy="111.8" r="0.9" fill="#cfd4d9" stroke="#7d868f" strokeWidth="0.3" />

      {/* Deck de madeira da popa */}
      <g clipPath="url(#musa-deck-clip)">
        <rect x="10" y="114" width="44" height="28" fill="url(#musa-wood)" />
        <g stroke="#8c6335" strokeWidth="0.4" opacity="0.7">
          <line x1="16" y1="114" x2="16" y2="142" />
          <line x1="20" y1="114" x2="20" y2="142" />
          <line x1="24" y1="114" x2="24" y2="142" />
          <line x1="28" y1="114" x2="28" y2="142" />
          <line x1="32" y1="114" x2="32" y2="142" />
          <line x1="36" y1="114" x2="36" y2="142" />
          <line x1="40" y1="114" x2="40" y2="142" />
          <line x1="44" y1="114" x2="44" y2="142" />
          <line x1="48" y1="114" x2="48" y2="142" />
        </g>
      </g>

      {/* Mesa e assentos da popa */}
      <rect x="25.5" y="121" width="13" height="12" rx="2" fill="#ffffff" stroke="#d3d9de" strokeWidth="0.5" />
      <circle cx="29" cy="124.5" r="1.6" fill="none" stroke="#cdd3d9" strokeWidth="0.4" />
      <circle cx="35.5" cy="129.5" r="1.6" fill="none" stroke="#cdd3d9" strokeWidth="0.4" />
      <circle cx="35" cy="124" r="1.1" fill="#f59e0b" />
      <g fill="#e9ddc3" stroke="#b9a77f" strokeWidth="0.5">
        <circle cx="21.5" cy="124.5" r="2.7" />
        <circle cx="21.5" cy="131" r="2.7" />
        <circle cx="42.5" cy="124.5" r="2.7" />
        <circle cx="42.5" cy="131" r="2.7" />
      </g>
      <circle cx="15.5" cy="138.5" r="1.1" fill="#9aa0a6" />
      <circle cx="48.5" cy="138.5" r="1.1" fill="#9aa0a6" />

      {/* Brilho do casco */}
      <path d="M32 6 C20 26 10 54 9 90" fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
