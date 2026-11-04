import { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { WeatherKind } from '../lib/weather'
import WaveDivider from './WaveDivider'

interface WeatherSceneProps {
  kind: WeatherKind
  isDay: boolean
  /** Velocidade do vento em km/h: deixa as nuvens e as ondas mais rápidas. */
  windSpeed: number
  children: ReactNode
}

function skyClass(kind: WeatherKind, isDay: boolean): string {
  if (!isDay) {
    if (kind === 'storm') return 'from-slate-950 via-slate-900 to-indigo-950'
    if (kind === 'rain' || kind === 'drizzle' || kind === 'cloudy' || kind === 'fog')
      return 'from-slate-950 via-slate-800 to-slate-700'
    return 'from-[#050b1f] via-[#0b1a3d] to-[#1b2a5a]'
  }
  switch (kind) {
    case 'clear':
      return 'from-sky-500 via-sky-400 to-cyan-300'
    case 'partly':
      return 'from-sky-600 via-sky-500 to-sky-300'
    case 'cloudy':
      return 'from-slate-500 via-slate-400 to-slate-300'
    case 'fog':
      return 'from-slate-400 via-slate-300 to-slate-200'
    case 'drizzle':
    case 'rain':
      return 'from-slate-700 via-slate-600 to-slate-500'
    case 'storm':
      return 'from-slate-900 via-slate-800 to-slate-600'
    case 'snow':
      return 'from-slate-500 via-slate-400 to-slate-200'
  }
}

/** Valores "aleatórios" fixos (para as gotas e estrelas não mudarem a cada atualização). */
function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const CLOUDS = [
  { top: '8%', width: 260, height: 70, duration: 70, delay: -10, opacity: 0.85 },
  { top: '22%', width: 340, height: 90, duration: 95, delay: -55, opacity: 0.7 },
  { top: '38%', width: 220, height: 60, duration: 60, delay: -30, opacity: 0.8 },
  { top: '14%', width: 300, height: 80, duration: 110, delay: -80, opacity: 0.6 },
]

export default function WeatherScene({ kind, isDay, windSpeed, children }: WeatherSceneProps) {
  const wet = kind === 'rain' || kind === 'drizzle' || kind === 'storm'
  const cloudy = kind !== 'clear'
  const heavy = kind === 'cloudy' || wet
  const showSun = isDay && (kind === 'clear' || kind === 'partly')
  const showMoon = !isDay && (kind === 'clear' || kind === 'partly')
  const showStars = !isDay && (kind === 'clear' || kind === 'partly')

  // Quanto mais vento, mais rápido tudo se mexe
  const speedFactor = Math.min(2.2, Math.max(0.6, 1.6 - windSpeed / 40))

  const drops = useMemo(() => {
    const count = kind === 'drizzle' ? 40 : kind === 'storm' ? 110 : 80
    return Array.from({ length: count }, (_, i) => ({
      left: `${(seeded(i, 1) * 100).toFixed(1)}%`,
      delay: `${(-seeded(i, 2) * 2).toFixed(2)}s`,
      duration: `${(0.55 + seeded(i, 3) * 0.5).toFixed(2)}s`,
      height: 12 + Math.round(seeded(i, 4) * 14),
    }))
  }, [kind])

  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: `${(seeded(i, 5) * 100).toFixed(1)}%`,
        top: `${(seeded(i, 6) * 70).toFixed(1)}%`,
        size: 1 + Math.round(seeded(i, 7) * 2),
        delay: `${(-seeded(i, 8) * 3).toFixed(2)}s`,
      })),
    [],
  )

  return (
    <section className={`relative isolate overflow-hidden bg-gradient-to-b ${skyClass(kind, isDay)} text-white`}>
      {/* Estrelas */}
      {showStars
        ? stars.map((star, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute animate-twinkle rounded-full bg-white"
              style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: star.delay }}
            />
          ))
        : null}

      {/* Sol */}
      {showSun ? (
        <div className="pointer-events-none absolute right-[10%] top-[10%] h-44 w-44 sm:h-56 sm:w-56" aria-hidden="true">
          <div className="absolute inset-0 animate-spin-slow">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-0 h-1/2 w-[3px] origin-bottom -translate-x-1/2 rounded-full bg-gradient-to-t from-transparent via-amber-200/0 to-amber-200/80"
                style={{ transform: `translateX(-50%) rotate(${i * 22.5}deg)` }}
              />
            ))}
          </div>
          <div className="absolute inset-[22%] animate-sun-pulse rounded-full bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-400 shadow-[0_0_80px_30px_rgba(253,224,71,0.55)]" />
        </div>
      ) : null}

      {/* Lua */}
      {showMoon ? (
        <div className="pointer-events-none absolute right-[12%] top-[12%] h-24 w-24 sm:h-28 sm:w-28" aria-hidden="true">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-50 to-slate-300 shadow-[0_0_60px_15px_rgba(226,232,240,0.35)]" />
          <div className="absolute left-[18%] top-[22%] h-4 w-4 rounded-full bg-slate-400/40" />
          <div className="absolute left-[52%] top-[48%] h-6 w-6 rounded-full bg-slate-400/30" />
          <div className="absolute left-[30%] top-[64%] h-3 w-3 rounded-full bg-slate-400/40" />
        </div>
      ) : null}

      {/* Nuvens */}
      {cloudy
        ? CLOUDS.map((cloud, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="pointer-events-none absolute left-0 animate-cloud-drift"
              style={{
                top: cloud.top,
                width: cloud.width,
                height: cloud.height,
                opacity: cloud.opacity,
                animationDuration: `${(cloud.duration * speedFactor).toFixed(0)}s`,
                animationDelay: `${cloud.delay}s`,
              }}
            >
              <div
                className={`absolute inset-x-0 bottom-0 h-3/5 rounded-full blur-[2px] ${
                  heavy ? (isDay ? 'bg-slate-200' : 'bg-slate-500') : isDay ? 'bg-white' : 'bg-slate-300'
                }`}
              />
              <div
                className={`absolute left-[12%] top-0 h-4/5 w-2/5 rounded-full blur-[2px] ${
                  heavy ? (isDay ? 'bg-slate-200' : 'bg-slate-500') : isDay ? 'bg-white' : 'bg-slate-300'
                }`}
              />
              <div
                className={`absolute left-[42%] top-[8%] h-[70%] w-[38%] rounded-full blur-[2px] ${
                  heavy ? (isDay ? 'bg-slate-200' : 'bg-slate-500') : isDay ? 'bg-white' : 'bg-slate-300'
                }`}
              />
            </div>
          ))
        : null}

      {/* Neblina */}
      {kind === 'fog'
        ? [18, 38, 58].map((top, i) => (
            <div
              key={top}
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-1/4 h-16 animate-fog-drift rounded-full bg-white/40 blur-2xl"
              style={{ top: `${top}%`, animationDelay: `${-i * 4}s`, animationDuration: `${18 + i * 5}s` }}
            />
          ))
        : null}

      {/* Chuva */}
      {wet ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {drops.map((drop, i) => (
            <span
              key={i}
              className="absolute w-px animate-rain-fall bg-gradient-to-b from-transparent to-white/70"
              style={{
                left: drop.left,
                height: drop.height,
                animationDelay: drop.delay,
                animationDuration: drop.duration,
              }}
            />
          ))}
        </div>
      ) : null}

      {/* Relâmpago */}
      {kind === 'storm' ? (
        <div className="pointer-events-none absolute inset-0 animate-flash bg-white/70" aria-hidden="true" />
      ) : null}

      {/* Conteúdo (cartão de vidro com o tempo agora) */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-14 sm:pt-20">{children}</div>

      {/* Mar embaixo: a lancha Musa e uma barbatana navegam por cima das ondas */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5]" aria-hidden="true">
        <WaveDivider rider="both" className="relative h-14 text-white sm:h-20" />
      </div>
    </section>
  )
}
