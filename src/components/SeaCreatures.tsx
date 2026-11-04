/**
 * Poucas tartarugas e baleias nadando bem devagar ao fundo (vistas de cima).
 * São só enfeite: ficam atrás do conteúdo e somem para quem prefere menos movimento.
 */

interface SwimmerSpec {
  kind: 'whale' | 'turtle'
  /** Posição vertical em % da área */
  top: number
  /** Altura do bicho, em pixels */
  size: number
  dir: 'right' | 'left'
  /** Segundos para atravessar a tela (quanto maior, mais devagar) */
  duration: number
  /** Atraso negativo = já começa no meio do caminho */
  delay: number
  opacity: number
}

/** Anima uma parte do desenho girando em volta de um ponto (em unidades do desenho). */
function flap(origin: string, name: string, seconds: number, delay = 0) {
  return {
    transformBox: 'view-box' as const,
    transformOrigin: origin,
    animation: `${name} ${seconds}s ease-in-out ${delay}s infinite`,
  }
}

const swimmers: SwimmerSpec[] = [
  { kind: 'whale', top: 6, size: 230, dir: 'right', duration: 130, delay: -38, opacity: 0.36 },
  { kind: 'whale', top: 60, size: 130, dir: 'left', duration: 170, delay: -95, opacity: 0.28 },
  { kind: 'turtle', top: 36, size: 70, dir: 'right', duration: 80, delay: -12, opacity: 0.48 },
  { kind: 'turtle', top: 80, size: 56, dir: 'left', duration: 95, delay: -50, opacity: 0.42 },
  { kind: 'turtle', top: 22, size: 48, dir: 'right', duration: 110, delay: -70, opacity: 0.32 },
]

function Turtle({ phase = 0 }: { phase?: number }) {
  return (
    <svg viewBox="0 0 100 120" className="h-full w-full overflow-visible" aria-hidden="true">
      {/* Nadadeiras de trás: balançam rápido, de leve */}
      <path d="M38 84 C26 90 18 101 22 105 C30 101 40 93 43 85 Z" fill="#7fdcc4" style={flap('40px 84px', 'turtle-hind-a', 1.7, phase)} />
      <path d="M62 84 C74 90 82 101 78 105 C70 101 60 93 57 85 Z" fill="#7fdcc4" style={flap('60px 84px', 'turtle-hind-b', 1.7, phase)} />
      {/* Nadadeiras da frente: remam como asas, uma de cada vez */}
      <path
        d="M35 50 C14 46 0 32 5 22 C16 25 33 36 41 47 Z"
        fill="#a6f0dc"
        style={flap('38px 49px', 'turtle-row-a', 2.8, phase)}
      />
      <path
        d="M65 50 C86 46 100 32 95 22 C84 25 67 36 59 47 Z"
        fill="#a6f0dc"
        style={flap('62px 49px', 'turtle-row-b', 2.8, phase)}
      />
      {/* Rabinho */}
      <path d="M50 92 L45 106 L55 106 Z" fill="#7fdcc4" style={flap('50px 92px', 'turtle-hind-a', 1.7, phase)} />
      {/* Cabeça (balança de leve ao nadar) */}
      <g style={flap('50px 36px', 'turtle-head', 2.8, phase)}>
        <ellipse cx="50" cy="24" rx="9" ry="11" fill="#8fe6cf" />
        <circle cx="46" cy="21" r="1.2" fill="#14403a" />
        <circle cx="54" cy="21" r="1.2" fill="#14403a" />
      </g>
      {/* Casco */}
      <ellipse cx="50" cy="62" rx="25" ry="31" fill="#2f8f7a" />
      <ellipse cx="50" cy="62" rx="20" ry="26" fill="#3fae96" />
      <g fill="none" stroke="#2f8f7a" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M50 38 L62 46 L62 62 L50 70 L38 62 L38 46 Z" />
        <path d="M50 70 L50 90" />
        <path d="M38 62 L31 72" />
        <path d="M62 62 L69 72" />
        <path d="M38 46 L32 40" />
        <path d="M62 46 L68 40" />
      </g>
    </svg>
  )
}

function Whale({ phase = 0 }: { phase?: number }) {
  return (
    <svg viewBox="0 0 120 320" className="h-full w-full overflow-visible" aria-hidden="true">
      {/* Nadadeiras peitorais compridas (marca da baleia-jubarte): abrem e fecham devagar */}
      <path
        d="M38 92 C20 112 6 152 2 190 C14 181 28 152 45 124 Z"
        fill="#cdeaf3"
        style={flap('42px 98px', 'whale-pec-a', 4.6, phase)}
      />
      <path
        d="M82 92 C100 112 114 152 118 190 C106 181 92 152 75 124 Z"
        fill="#cdeaf3"
        style={flap('78px 98px', 'whale-pec-b', 4.6, phase)}
      />
      {/* Corpo inteiro ondula do meio para trás, como quando a baleia nada */}
      <g style={flap('60px 120px', 'whale-body', 4.6, phase)}>
        <g style={flap('60px 250px', 'whale-tail', 4.6, phase)}>
          {/* Cauda (bate devagar) */}
          <g style={flap('60px 256px', 'fluke', 4.6, phase)}>
            <path d="M60 248 C48 262 24 268 3 258 C20 283 44 288 60 277 C76 288 100 283 117 258 C96 268 72 262 60 248 Z" fill="#2a5f86" />
            <path d="M60 262 L60 277" stroke="#0e2b46" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <path d="M54 236 L66 236 L64 256 L56 256 Z" fill="#1d4466" />
        </g>
        {/* Corpo */}
        <path
          d="M60 4 C74 4 82 20 84 40 C89 72 93 112 87 162 C83 202 73 236 66 256 L54 256 C47 236 37 202 33 162 C27 112 31 72 36 40 C38 20 46 4 60 4 Z"
          fill="#1d4466"
        />
        <path d="M60 22 L60 244" stroke="#0e2b46" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M44 150 C48 190 54 220 60 240 C66 220 72 190 76 150" fill="none" stroke="#2c6089" strokeWidth="2" opacity="0.6" />
      </g>
    </svg>
  )
}

export default function SeaCreatures() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden="true">
      {swimmers.map((s, index) => {
        const width = s.kind === 'whale' ? (s.size * 120) / 320 : (s.size * 100) / 120
        return (
          <div
            key={index}
            className="swimmer"
            style={{
              top: `${s.top}%`,
              width,
              height: s.size,
              opacity: s.opacity,
              animation: `${s.dir === 'right' ? 'swim-right' : 'swim-left'} ${s.duration}s linear ${s.delay}s infinite`,
            }}
          >
            <div className="h-full w-full" style={{ animation: `swim-sway ${9 + index * 1.7}s ease-in-out infinite` }}>
              <div className="h-full w-full" style={{ transform: `rotate(${s.dir === 'right' ? 90 : -90}deg)` }}>
                {s.kind === 'whale' ? <Whale phase={-index * 1.3} /> : <Turtle phase={-index * 0.9} />}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
