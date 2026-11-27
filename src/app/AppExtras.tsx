import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Check, ChevronDown, CloudRain, Cloud, Droplets, Eye, ExternalLink, Fish, Heart, MapPin, Navigation, Sun, Thermometer, Waves, Wind, X } from 'lucide-react'
import { BEACHES, LANGS, moonKey, useApp, weatherKey } from './i18n'
import type { ConditionsByDay } from './conditions'
import WeatherIcon from '../components/WeatherIcon'
import { moonPhase } from '../lib/solunar'
import { describeWeather } from '../lib/weather'
import type { WeatherBundle } from '../lib/weather'

const round = Math.round

/* ------------------------------ Gaveta ------------------------------ */

/** Gaveta que sobe de baixo (usada para idioma, praia e alertas) */
export function BottomSheet({
  open,
  onClose,
  title,
  labelId,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  labelId: string
  children: ReactNode
}) {
  const { t } = useApp()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center" role="presentation">
      <button type="button" aria-label={t('close')} onClick={onClose} className="absolute inset-0 bg-[#050d1c]/70 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className="relative max-h-[85vh] w-full max-w-lg animate-fade-up overflow-y-auto rounded-t-[2rem] border-t border-white/10 bg-gradient-to-b from-[#16305a] to-navy-dark p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-white landscape:max-h-[92vh]"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/25" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <h2 id={labelId} className="font-display text-xl tracking-wide text-white">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label={t('close')} className="rounded-full p-2 text-white/60 hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ------------------------------ Idioma ------------------------------ */

export function LanguageSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, setLang, t } = useApp()
  return (
    <BottomSheet open={open} onClose={onClose} title={t('chooseLanguage')} labelId="escolher-idioma">
      <ul className="mt-4 space-y-2">
        {LANGS.map((l) => {
          const active = l.code === lang
          return (
            <li key={l.code}>
              <button
                type="button"
                lang={l.code}
                aria-pressed={active}
                onClick={() => {
                  setLang(l.code)
                  onClose()
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                  active ? 'bg-teal text-navy-dark' : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                <span className="text-xl" aria-hidden="true">
                  {l.flag}
                </span>
                <span className="flex-1 font-medium">{l.name}</span>
                {active ? <Check size={18} aria-hidden="true" /> : null}
              </button>
            </li>
          )
        })}
      </ul>
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex items-center justify-center gap-1.5 text-xs text-teal underline-offset-4 hover:underline"
      >
        {t('siteLink')} <ExternalLink size={12} aria-hidden="true" />
      </a>
    </BottomSheet>
  )
}

/* ------------------------------ Praia ------------------------------ */

export function PlaceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { place, setPlace, t } = useApp()
  return (
    <BottomSheet open={open} onClose={onClose} title={t('choosePlace')} labelId="escolher-praia">
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {BEACHES.map((b) => {
          const active = b.id === place.id
          return (
            <li key={b.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setPlace(b.id)
                  onClose()
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                  active ? 'bg-teal text-navy-dark' : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                <MapPin size={16} aria-hidden="true" className={active ? '' : 'text-teal'} />
                <span className="flex-1 font-medium">{b.name}</span>
                {active ? <Check size={18} aria-hidden="true" /> : null}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-[11px] leading-relaxed text-white/45">{t('placeNote')}</p>
    </BottomSheet>
  )
}

/** Título da tela com o nome da praia; ao tocar, abre a escolha de praia */
export function PlaceTitle({ kicker, onOpen }: { kicker: string; onOpen: () => void }) {
  const { place, t } = useApp()
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-teal">{kicker}</p>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${place.name} · ${t('changePlace')}`}
        className="group mt-0.5 flex items-center gap-2 rounded-xl text-left"
      >
        <h1 className="font-display text-2xl tracking-wide text-white">{place.name}</h1>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-teal transition group-hover:bg-white/20">
          <ChevronDown size={16} aria-hidden="true" />
        </span>
      </button>
    </div>
  )
}

/* ------------------------------ Setas e bússola ------------------------------ */

/** Seta que aponta para onde vai o vento/onda (a direção informada é de onde vem) */
export function DirArrow({ from, size = 18, className = '' }: { from: number; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`transition-transform duration-700 ${className}`}
      style={{ transform: `rotate(${from + 180}deg)` }}
      aria-hidden="true"
    >
      <path d="M12 2 L18 20 L12 16 L6 20 Z" fill="currentColor" />
    </svg>
  )
}

/** Bússola redonda com a seta do vento */
function Compass({ from }: { from: number }) {
  const { dir } = useApp()
  const marks = [0, 90, 180, 270]
  return (
    <div className="relative h-20 w-20 shrink-0 rounded-full border border-white/20 bg-navy-dark/50">
      {marks.map((d) => {
        const rad = (d * Math.PI) / 180
        return (
          <span
            key={d}
            className="absolute text-[9px] font-semibold text-white/50"
            style={{ left: `calc(50% + ${Math.sin(rad) * 31}px)`, top: `calc(50% - ${Math.cos(rad) * 31}px)`, transform: 'translate(-50%,-50%)' }}
          >
            {dir(d)}
          </span>
        )
      })}
      <div className="absolute inset-0 flex items-center justify-center text-teal">
        <DirArrow from={from} size={30} />
      </div>
    </div>
  )
}

/* ------------------------------ Tempo em detalhes ------------------------------ */

function DetailTile({ icon, label, value, sub }: { icon: ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.07] p-3">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/50">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {sub ? <p className="text-[11px] text-white/60">{sub}</p> : null}
    </div>
  )
}

/** Quadro com tudo do tempo agora: condição, nuvens, chuva, vento, temperatura, umidade, visibilidade e ondas */
export function WeatherDetails({ data }: { data: WeatherBundle }) {
  const { t, num, dir } = useApp()
  const { current, daily, marine } = data
  const today = daily[0]
  const info = describeWeather(current.code)

  return (
    <section aria-labelledby="tempo-detalhes" className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-4">
      <h2 id="tempo-detalhes" className="font-display text-lg tracking-wide text-white">
        {t('details')}
      </h2>

      {/* Vento com bússola */}
      <div className="mt-3 flex items-center gap-4 rounded-2xl bg-white/[0.07] p-3">
        <Compass from={current.windDirection} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/50">
            <Wind size={12} aria-hidden="true" /> {t('wind')}
          </p>
          <p className="text-2xl font-semibold">{round(current.windSpeed)} km/h</p>
          <p className="text-xs text-white/70">
            {t('comesFrom', { dir: dir(current.windDirection), deg: round(current.windDirection) })}
          </p>
          <p className="text-xs text-teal">{t('gustsOf', { v: round(current.windGusts) })}</p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <DetailTile
          icon={<WeatherIcon kind={info.kind} isDay={current.isDay} size={12} />}
          label={t('condition')}
          value={t(weatherKey(current.code))}
        />
        {current.cloudCover != null ? (
          <DetailTile icon={<Cloud size={12} aria-hidden="true" />} label={t('cloudCover')} value={`${round(current.cloudCover)}%`} />
        ) : null}
        <DetailTile
          icon={<CloudRain size={12} aria-hidden="true" />}
          label={t('precipitation')}
          value={`${num(current.precipitation)} mm`}
          sub="L/m²"
        />
        <DetailTile
          icon={<Thermometer size={12} aria-hidden="true" />}
          label={t('temperature')}
          value={`${round(current.temperature)}°`}
          sub={today ? t('maxMin', { max: round(today.tMax), min: round(today.tMin) }) : t('feelsLike', { t: round(current.apparent) })}
        />
        <DetailTile
          icon={<Droplets size={12} aria-hidden="true" />}
          label={t('humidity')}
          value={`${round(current.humidity)}%`}
          sub={current.dewPoint != null ? t('dewPoint', { t: round(current.dewPoint) }) : undefined}
        />
        {current.visibility != null ? (
          <DetailTile
            icon={<Eye size={12} aria-hidden="true" />}
            label={t('visibility')}
            value={`${num(current.visibility / 1000, current.visibility < 10000 ? 1 : 0)} km`}
          />
        ) : null}
      </div>

      {/* Ondas agora */}
      {marine?.waveHeight != null ? (
        <div className="mt-2 flex items-center gap-3 rounded-2xl bg-teal/15 p-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-dark/60 text-teal">
            {marine.waveDirection != null ? <DirArrow from={marine.waveDirection} size={22} /> : <Waves size={20} aria-hidden="true" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-white/60">{t('waveNow')}</p>
            <p className="text-lg font-semibold">
              {num(marine.waveHeight)} m
              {marine.wavePeriod != null ? (
                <span className="ml-2 text-xs font-normal text-white/70">{t('wavePeriod', { s: round(marine.wavePeriod) })}</span>
              ) : null}
            </p>
            {marine.waveDirection != null ? (
              <p className="text-xs text-white/70">
                {t('comesFrom', { dir: dir(marine.waveDirection), deg: round(marine.waveDirection) })}
              </p>
            ) : null}
          </div>
          {marine.seaTemp != null ? <span className="text-xs text-teal">{t('seaTemp', { t: round(marine.seaTemp) })}</span> : null}
        </div>
      ) : null}
    </section>
  )
}

/* ------------------------------ Raios UV ------------------------------ */

const uvCategory = (uv: number) =>
  uv < 3
    ? { key: 'uvLow' as const, color: '#4ade80' }
    : uv < 6
      ? { key: 'uvModerate' as const, color: '#facc15' }
      : uv < 8
        ? { key: 'uvHigh' as const, color: '#fb923c' }
        : uv < 11
          ? { key: 'uvVeryHigh' as const, color: '#f87171' }
          : { key: 'uvExtreme' as const, color: '#c084fc' }

/** Índice UV agora, categoria e os 3 níveis de proteção */
export function UvCard({ data }: { data: WeatherBundle }) {
  const { t, num } = useApp()
  const uvMax = data.daily[0]?.uvMax ?? null
  const uv = data.current.uvIndex ?? uvMax
  if (uv == null) return null
  const cat = uvCategory(uv)
  const pct = Math.min(100, (uv / 12) * 100)
  const tier = uv < 3 ? 0 : uv < 8 ? 1 : 2
  const tiers = [
    { range: '1–2', title: t('uvNone'), text: t('uvNoneText') },
    { range: '3–7', title: t('uvWith'), text: t('uvWithText') },
    { range: '8+', title: t('uvExtra'), text: t('uvExtraText') },
  ]

  return (
    <section aria-labelledby="raios-uv" className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-center justify-between">
        <h2 id="raios-uv" className="flex items-center gap-2 font-display text-lg tracking-wide text-white">
          <Sun size={18} className="text-[#e2bd45]" aria-hidden="true" /> {t('uvTitle')}
        </h2>
        {uvMax != null ? <span className="text-xs text-white/60">{t('uvMaxToday', { v: num(uvMax) })}</span> : null}
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full text-navy-dark shadow-lg"
          style={{ background: cat.color }}
        >
          <span className="font-display text-2xl leading-none">{round(uv)}</span>
          <span className="text-[9px] font-semibold uppercase">UV</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-white/50">{t('uvNow')}</p>
          <p className="font-semibold" style={{ color: cat.color }}>
            {t(cat.key)}
          </p>
          <div
            className="relative mt-2 h-2 rounded-full"
            style={{ background: 'linear-gradient(90deg,#4ade80 0%,#facc15 30%,#fb923c 55%,#f87171 75%,#c084fc 100%)' }}
          >
            <span
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-navy-dark transition-[left] duration-1000"
              style={{ left: `${pct}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-2">
        {tiers.map((x, i) => (
          <li
            key={x.range}
            className={`rounded-2xl p-2.5 text-center transition ${
              i === tier ? 'bg-[#e2bd45] text-navy-dark shadow-lg' : 'bg-white/[0.07] text-white/70'
            }`}
            aria-current={i === tier ? 'true' : undefined}
          >
            <p className="font-display text-lg leading-none">{x.range}</p>
            <p className="mt-1 text-[11px] font-semibold leading-tight">{x.title}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-white/80">{tiers[tier].text}</p>
      <p className="mt-1 text-[11px] text-white/45">{t('uvNote')}</p>
    </section>
  )
}

/* ------------------------------ Fases da Lua ------------------------------ */

/** Desenho da Lua como vista do hemisfério Sul (crescente iluminada à esquerda) */
function MoonDrawing({ phase, size = 88 }: { phase: number; size?: number }) {
  const r = 40
  const c = 50
  const k = Math.cos(2 * Math.PI * phase) // 1 = nova, -1 = cheia
  const rx = Math.abs(k) * r
  // Desenha com a parte iluminada à direita e espelha quando preciso
  const sweep = k > 0 ? 0 : 1
  const lit = `M ${c} ${c - r} A ${r} ${r} 0 0 1 ${c} ${c + r} A ${rx} ${r} 0 0 ${sweep} ${c} ${c - r} Z`
  const waxing = phase < 0.5
  const litOnLeft = waxing // hemisfério Sul
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="lua-brilho" cx="50%" cy="50%" r="50%">
          <stop offset="0.7" stopColor="#f4e7b5" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f4e7b5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r="49" fill="url(#lua-brilho)" />
      <circle cx={c} cy={c} r={r} fill="#24375c" />
      <path d={lit} fill="#f4e7b5" transform={litOnLeft ? `translate(${2 * c} 0) scale(-1 1)` : undefined} />
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
    </svg>
  )
}

/** AAAA-MM-DD no horário de Brasília */
const brazilIso = (d: Date) => new Date(d.getTime() - 3 * 3600000).toISOString().slice(0, 10)

const PHASE_TARGETS = [
  { at: 0, key: 'moonNew' as const },
  { at: 0.25, key: 'moonFirstQuarter' as const },
  { at: 0.5, key: 'moonFull' as const },
  { at: 0.75, key: 'moonLastQuarter' as const },
]

/** Próximas Lua Nova, Quarto Crescente, Lua Cheia e Quarto Minguante (procura hora a hora) */
function nextPhases(from: Date) {
  const found: { key: (typeof PHASE_TARGETS)[number]['key']; date: Date; phase: number }[] = []
  let prev = moonPhase(from).phase
  for (let h = 1; h <= 24 * 32 && found.length < 4; h++) {
    const date = new Date(from.getTime() + h * 3600000)
    const p = moonPhase(date).phase
    for (const target of PHASE_TARGETS) {
      // Lua Nova: a fase "dá a volta" (de perto de 1 para perto de 0). As outras: passa pelo valor subindo.
      const crossed = target.at === 0 ? prev > 0.9 && p < 0.1 : prev < target.at && p >= target.at && p - prev < 0.1
      if (crossed && !found.some((f) => f.key === target.key)) found.push({ key: target.key, date, phase: target.at })
    }
    prev = p
  }
  return found.sort((x, y) => x.date.getTime() - y.date.getTime())
}

export function MoonCard() {
  const { t, weekdayShort, dayMonth, num } = useApp()
  const now = useMemo(() => new Date(), [])
  const { phase, fraction } = moonPhase(now)
  const upcoming = useMemo(() => nextPhases(now), [now])
  const distSpring = Math.min(phase, Math.abs(phase - 0.5), 1 - phase)
  const distNeap = Math.min(Math.abs(phase - 0.25), Math.abs(phase - 0.75))
  const tideKind = distSpring < 0.1 ? 'moonSpringNow' : distNeap < 0.08 ? 'moonNeapNow' : 'moonMidNow'

  return (
    <section aria-labelledby="fases-lua" className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5">
      <h2 id="fases-lua" className="font-display text-lg tracking-wide text-white">
        {t('moonTitle')}
      </h2>
      <div className="mt-3 flex items-center gap-4">
        <MoonDrawing phase={phase} />
        <div className="min-w-0">
          <p className="font-display text-2xl font-light">{t(moonKey(phase))}</p>
          <p className="text-sm text-white/70">{t('moonLit', { pct: num(fraction * 100, 0) })}</p>
          <p
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs ${
              tideKind === 'moonSpringNow' ? 'bg-[#e2bd45] text-navy-dark' : 'bg-white/10 text-white/80'
            }`}
          >
            {t(tideKind)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[10px] uppercase tracking-wider text-white/50">{t('moonNext')}</p>
      <ul className="mt-2 grid grid-cols-4 gap-2">
        {upcoming.map((u) => (
          <li key={u.key} className="flex flex-col items-center rounded-2xl bg-white/[0.06] p-2 text-center">
            <MoonDrawing phase={u.phase} size={34} />
            <span className="mt-1 text-[10px] font-semibold leading-tight">{t(u.key)}</span>
            <span className="text-[10px] text-white/55">
              {weekdayShort(brazilIso(u.date))} {dayMonth(brazilIso(u.date))}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-white/70">{t('moonSpring')}</p>
      <p className="mt-1 text-xs leading-relaxed text-white/50">{t('moonNeap')}</p>
    </section>
  )
}

/* ------------------------------ Ondas e vento no gráfico ------------------------------ */

const STRIP_HOURS = [0, 3, 6, 9, 12, 15, 18, 21]

/** Faixa com ondas (altura, direção, período) e vento a cada 3 horas do dia escolhido */
export function WaveWindStrip({ date, data, loading }: { date: string; data: ConditionsByDay | null; loading: boolean }) {
  const { t, num, dir } = useApp()
  const day = data?.[date]
  if (loading && !day) {
    return <div className="mt-2 h-28 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />
  }
  if (!day) return <p className="mt-2 text-center text-xs text-slate-500">{t('noWaveData')}</p>

  return (
    <div className="mt-2 animate-fade-up">
      <div className="grid grid-cols-[auto_repeat(8,minmax(0,1fr))] items-center gap-x-1 gap-y-1.5 text-center text-navy">
        <span />
        {STRIP_HOURS.map((h) => (
          <span key={`h${h}`} className="text-[10px] font-semibold text-slate-500">
            {String(h).padStart(2, '0')}h
          </span>
        ))}

        <span className="flex items-center pr-1 text-teal-dark" title={t('waves')}>
          <Waves size={14} aria-label={t('waves')} />
        </span>
        {STRIP_HOURS.map((h) => {
          const c = day[h]
          return (
            <span key={`w${h}`} className="flex flex-col items-center rounded-lg bg-teal/15 py-1">
              {c?.waveDirection != null ? (
                <span className="text-teal-dark" title={`${dir(c.waveDirection)} ${round(c.waveDirection)}°`}>
                  <DirArrow from={c.waveDirection} size={14} />
                </span>
              ) : (
                <span className="h-3.5" />
              )}
              <span className="text-[11px] font-semibold leading-tight">{c?.waveHeight != null ? num(c.waveHeight) : '–'}</span>
              <span className="text-[9px] leading-tight text-slate-500">
                {c?.wavePeriod != null ? `${round(c.wavePeriod)}s` : ''}
              </span>
            </span>
          )
        })}

        <span className="flex items-center pr-1 text-navy/70" title={t('wind')}>
          <Navigation size={14} aria-label={t('wind')} />
        </span>
        {STRIP_HOURS.map((h) => {
          const c = day[h]
          return (
            <span key={`v${h}`} className="flex flex-col items-center rounded-lg bg-slate-100 py-1">
              {c?.windDirection != null ? (
                <span className="text-navy" title={`${dir(c.windDirection)} ${round(c.windDirection)}°`}>
                  <DirArrow from={c.windDirection} size={14} />
                </span>
              ) : (
                <span className="h-3.5" />
              )}
              <span className="text-[11px] font-semibold leading-tight">{c?.windSpeed != null ? round(c.windSpeed) : '–'}</span>
              <span className="text-[9px] leading-tight text-slate-500">km/h</span>
            </span>
          )
        })}
      </div>
      <p className="mt-2 text-center text-[10px] text-slate-500">{t('waveWindNote')}</p>
    </div>
  )
}

/* ------------------------------ Cuidado com o mar ------------------------------ */

export function OceanCare() {
  const { t } = useApp()
  const items = [
    { icon: <Waves size={16} aria-hidden="true" />, text: t('ocean1') },
    { icon: <Heart size={16} aria-hidden="true" />, text: t('ocean2') },
    { icon: <Fish size={16} aria-hidden="true" />, text: t('ocean3') },
  ]
  return (
    <section aria-labelledby="cuide-do-mar" className="rounded-[2rem] border border-teal/25 bg-gradient-to-br from-teal/15 to-transparent p-5">
      <h2 id="cuide-do-mar" className="font-display text-lg tracking-wide text-white">
        {t('oceanTitle')}
      </h2>
      <ul className="mt-3 space-y-2.5">
        {items.map((i) => (
          <li key={i.text} className="flex items-start gap-3 text-xs leading-relaxed text-white/80">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal/20 text-teal">{i.icon}</span>
            {i.text}
          </li>
        ))}
      </ul>
    </section>
  )
}
