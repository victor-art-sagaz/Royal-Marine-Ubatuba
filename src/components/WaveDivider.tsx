import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import MusaSide from './MusaSide'

interface WaveDividerProps {
  /** Classes de posição e COR (ex.: "absolute inset-x-0 bottom-0 text-white") */
  className?: string
  /**
   * O que "nada" por cima da onda:
   * - "fin": uma barbatana (padrão)
   * - "both": barbatana e a lancha Musa de lado
   * - "none": nada (use quando a faixa estiver de cabeça para baixo)
   */
  rider?: 'fin' | 'both' | 'none'
}

const WAVE_PATH =
  'M0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 C1350,100 1550,0 1800,60 C2050,120 2250,20 2400,60 L2400,120 L0,120 Z'

/* ------------------------------------------------------------------ */
/* Altura da onda em qualquer ponto (mesma curva do desenho acima)      */
/* ------------------------------------------------------------------ */

const PERIOD = 1200
const TABLE_N = 600

/** Tabela com a altura (y) da curva a cada 2 unidades, para saber onde a onda está sem refazer a conta. */
const WAVE_TABLE: Float32Array = (() => {
  const segments = [
    [0, 60, 150, 100, 350, 0, 600, 60],
    [600, 60, 850, 120, 1050, 20, 1200, 60],
  ]
  const pts: { x: number; y: number }[] = []
  for (const [x0, y0, x1, y1, x2, y2, x3, y3] of segments) {
    for (let i = 0; i <= 120; i++) {
      const t = i / 120
      const m = 1 - t
      pts.push({
        x: m * m * m * x0 + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t * t * t * x3,
        y: m * m * m * y0 + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t * t * t * y3,
      })
    }
  }
  const table = new Float32Array(TABLE_N + 1)
  let j = 0
  for (let k = 0; k <= TABLE_N; k++) {
    const x = (k * PERIOD) / TABLE_N
    while (j < pts.length - 2 && pts[j + 1].x < x) j++
    const a = pts[j]
    const b = pts[j + 1]
    const f = b.x === a.x ? 0 : Math.min(1, Math.max(0, (x - a.x) / (b.x - a.x)))
    table[k] = a.y + (b.y - a.y) * f
  }
  return table
})()

function waveY(xv: number): number {
  let x = xv % PERIOD
  if (x < 0) x += PERIOD
  const f = (x / PERIOD) * TABLE_N
  const i = Math.floor(f)
  const frac = f - i
  return WAVE_TABLE[i] + (WAVE_TABLE[Math.min(TABLE_N, i + 1)] - WAVE_TABLE[i]) * frac
}

const FRONT_PERIOD = 14 // segundos para a onda da frente andar um "comprimento"
const BACK_PERIOD = 24

/** Barbatana: leva um colar de espuma na base e deixa um rastro para trás. */
function Fin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 40" className={className} style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
      <defs>
        <linearGradient id="fin-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fa3b8" />
          <stop offset="1" stopColor="#2c5068" />
        </linearGradient>
      </defs>
      {/* Rastro de espuma atrás da barbatana */}
      <path d="M2 40 C-8 41 -20 38 -34 41" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 42 C-6 44 -18 43 -28 46" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M8 38 C-2 37 -14 34 -24 35" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />
      {/* Barbatana dorsal */}
      <path
        d="M4 40 C8.5 31 12.5 15 14.5 1.5 C23 9 31 26 38 40 Z"
        fill="url(#fin-body)"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M15.2 6 C16 16 12 30 8 37" fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
      {/* Colar de espuma na base */}
      <ellipse cx="21" cy="40.5" rx="21" ry="3.6" fill="#ffffff" fillOpacity="0.88" />
      <ellipse cx="14" cy="39.4" rx="7" ry="2" fill="#ffffff" />
      <circle cx="40" cy="38" r="1.3" fill="#fff" fillOpacity="0.8" />
      <circle cx="43" cy="41" r="0.9" fill="#fff" fillOpacity="0.8" />
      <circle cx="-3" cy="38" r="1.1" fill="#fff" fillOpacity="0.7" />
    </svg>
  )
}

/**
 * Onda animada que "navega" devagar. A cor vem do text-* (usa currentColor).
 * Uma barbatana (e, nas páginas que pedem, a lancha Musa) acompanha a subida e a descida
 * da onda e anda na horizontal por cima dela.
 */
export default function WaveDivider({ className = '', rider = 'fin' }: WaveDividerProps) {
  const reduce = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<SVGSVGElement>(null)
  const frontRef = useRef<SVGSVGElement>(null)
  const finRef = useRef<HTMLDivElement>(null)
  const musaRef = useRef<HTMLDivElement>(null)
  const sprayRef = useRef<HTMLDivElement>(null)
  const showFin = rider !== 'none'
  const showMusa = rider === 'both'

  useEffect(() => {
    const root = rootRef.current
    const back = backRef.current
    const front = frontRef.current
    if (!root || !back || !front) return

    let width = root.clientWidth
    let height = root.clientHeight
    const resizeObserver = new ResizeObserver(() => {
      width = root.clientWidth
      height = root.clientHeight
    })
    resizeObserver.observe(root)

    let visible = true
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true
    })
    intersection.observe(root)

    let raf = 0
    let start = 0
    const fin = finRef.current
    const musa = musaRef.current
    const spray = sprayRef.current

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible || width === 0) return
      if (!start) start = now
      const t = reduce ? 0 : (now - start) / 1000

      // As duas ondas andam para a esquerda (mesma velocidade do CSS antigo)
      const offFront = ((t / FRONT_PERIOD) % 1) * width
      const offBack = ((t / BACK_PERIOD) % 1) * width
      front.style.transform = `translate3d(${(-offFront).toFixed(2)}px,0,0)`
      back.style.transform = `translate3d(${(-offBack).toFixed(2)}px,0,0)`

      // Altura da superfície da onda da frente (ocupa 80% da faixa, encostada embaixo)
      const surface = (x: number) => height * 0.2 + (waveY(((x + offFront) * PERIOD) / width) / 120) * height * 0.8

      if (fin) {
        const size = width < 640 ? 28 : 40
        const pad = size * 2
        const x = ((t * 22 + width * 0.18) % (width + pad * 2)) - pad
        const y = surface(x)
        const angle = (Math.atan2(surface(x + 9) - surface(x - 9), 18) * 180) / Math.PI
        fin.style.width = `${size}px`
        fin.style.height = `${size * 0.9}px`
        // Entra e sai da tela suavemente
        const edge = Math.min(1, Math.max(0, Math.min(x + pad, width + pad - x) / pad))
        fin.style.opacity = edge.toFixed(2)
        fin.style.transform = `translate3d(${(x - size / 2).toFixed(2)}px, ${(y - size * 0.9 + 2).toFixed(2)}px, 0) rotate(${(angle * 0.9).toFixed(2)}deg)`
      }

      if (musa) {
        const w = width < 640 ? 112 : 152
        const h = (w * 86) / 244
        const pad = w * 1.2
        const x = ((t * 15 + width * 0.55) % (width + pad * 2)) - pad
        const reach = w * 0.36
        const yStern = surface(x - reach)
        const yBow = surface(x + reach)
        const yMid = surface(x)
        const pitch = (Math.atan2(yBow - yStern, reach * 2) * 180) / Math.PI
        const lift = (yMid + (yBow + yStern) / 2) / 2
        // a linha d'água do desenho fica 93% do caminho para baixo; o casco afunda um pouco na onda
        musa.style.opacity = '1'
        musa.style.width = `${w}px`
        musa.style.height = `${h}px`
        musa.style.transform = `translate3d(${(x - w / 2).toFixed(2)}px, ${(lift + 5 - h * 0.93).toFixed(2)}px, 0) rotate(${(pitch * 0.95).toFixed(2)}deg)`
        if (spray) {
          spray.style.opacity = '1'
          spray.style.width = `${w * 0.5}px`
          spray.style.transform = `translate3d(${(x + w * 0.2).toFixed(2)}px, ${(lift - 1).toFixed(2)}px, 0)`
        }
      }
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersection.disconnect()
    }
  }, [reduce])

  return (
    <div ref={rootRef} className={`pointer-events-none h-10 sm:h-14 ${className}`} aria-hidden="true">
      {/* Onda de trás */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          ref={backRef}
          viewBox="0 0 2400 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-full w-[200%] opacity-40"
          fill="currentColor"
        >
          <path d={WAVE_PATH} />
        </svg>
      </div>

      {/* Lancha Musa (fica entre as duas ondas: a onda da frente cobre a parte de baixo do casco) */}
      {showMusa ? (
        <div className="absolute inset-0">
          <div ref={musaRef} className="absolute left-0 top-0 origin-[50%_93%] will-change-transform" style={{ width: 128, height: 45, opacity: 0 }}>
            <MusaSide className="h-full w-full" />
          </div>
        </div>
      ) : null}

      {/* Onda da frente */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          ref={frontRef}
          viewBox="0 0 2400 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-[80%] w-[200%]"
          fill="currentColor"
        >
          <path d={WAVE_PATH} />
        </svg>
      </div>

      {/* Espuma da proa da Musa (por cima da onda da frente) */}
      {showMusa ? (
        <div className="absolute inset-0">
          <div
            ref={sprayRef}
            className="absolute left-0 top-0 h-[5px] rounded-full bg-white/80 blur-[1.5px] will-change-transform"
            style={{ width: 64, opacity: 0 }}
          />
        </div>
      ) : null}

      {/* Barbatana */}
      {showFin ? (
        <div className="absolute inset-0">
          <div ref={finRef} className="absolute left-0 top-0 origin-[50%_100%] will-change-transform" style={{ width: 30, height: 27, opacity: 0 }}>
            <Fin className="h-full w-full" />
          </div>
        </div>
      ) : null}
    </div>
  )
}
