import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowDown, ArrowUp, BellPlus, ExternalLink, Fish, MapPin, Moon, RefreshCw } from 'lucide-react'
import AlertDialog from '../components/AlertDialog'
import type { AlertTarget } from '../components/AlertDialog'
import InstallAppButton from '../components/InstallAppButton'
import GlassButton from '../components/GlassButton'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { fetchTides, formatHour } from '../lib/tide'
import type { TideDay } from '../lib/tide'
import { levelOf, solunarDay } from '../lib/solunar'
import type { ActivityLevel, SolunarDay } from '../lib/solunar'
import { WEATHER_PLACE } from '../lib/weather'
import type { Place } from '../lib/weather'
import { dateAtBrazilHour } from '../lib/alerts'

/** Página da tábua de marés de Ubatuba no tabuademares.com */
export const TABUA_DE_MARES_URL = 'https://tabuademares.com/br/so-paulo/ubatuba'

const NAVY = '#14284b'
const TEAL = '#74bac5'
const TEAL_DARK = '#4f9fae'

export const levelColor: Record<ActivityLevel, string> = {
  'muito alta': '#0e7466',
  alta: '#4f9fae',
  média: '#9fd0d8',
  baixa: '#d7e3ea',
}

export const meters = (value: number) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m`

/** Data de hoje no horário de Brasília (AAAA-MM-DD) */
export function todayInBrazil(): string {
  return new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 10)
}

export function nowHourInBrazil(): number {
  const d = new Date(Date.now() - 3 * 3600000)
  return d.getUTCHours() + d.getUTCMinutes() / 60
}

export function dayLabel(date: string, index: number) {
  const d = new Date(`${date}T12:00:00-03:00`)
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'America/Sao_Paulo' }).replace('.', '')
  const day = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
  return { top: index === 0 ? 'Hoje' : weekday.replace(/^\w/, (c) => c.toUpperCase()), bottom: day }
}

/* ------------------------------ Busca dos dados ------------------------------ */

type TideState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; days: TideDay[] }

export function useTides(place: Place = WEATHER_PLACE) {
  const [state, setState] = useState<TideState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    fetchTides(controller.signal, place)
      .then((days) => setState(days.length ? { status: 'ready', days } : { status: 'error' }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' })
      })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, place.lat, place.lon])

  return { state, reload: () => setAttempt((n) => n + 1) }
}

/* ------------------------------ Gráfico ------------------------------ */

const PAD_L = 52
const PAD_R = 16
const TIDE_TOP = 34
const TIDE_BOTTOM = 230
const ACT_TOP = 268
const ACT_BOTTOM = 330
const H = 374

/** true em telas pequenas (celular): o gráfico fica mais estreito para as letras ficarem legíveis */
function useCompact() {
  const query = '(max-width: 640px)'
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setCompact(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return compact
}

/** Linha suave passando pelos pontos (curva de Catmull-Rom convertida em Bézier) */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }
  return d
}

/** Textos do gráfico (o app troca pelo idioma escolhido) */
export interface TideChartLabels {
  title: string
  height: string
  now: string
  fish: string
  time: string
  high: string
  low: string
  level: (level: ActivityLevel) => string
}

const PT_LABELS: TideChartLabels = {
  title: 'Gráfico da maré',
  height: 'Altura (m)',
  now: 'agora',
  fish: 'Atividade dos peixes',
  time: 'Tempo (h)',
  high: 'preia-mar',
  low: 'baixa-mar',
  level: (level) => level,
}

export function TideChart({
  day,
  solunar,
  nowHour,
  labels = PT_LABELS,
  locale = 'pt-BR',
  compact: forceCompact,
}: {
  day: TideDay
  solunar: SolunarDay
  nowHour: number | null
  labels?: TideChartLabels
  locale?: string
  /** Força o gráfico estreito (letras maiores), usado no app */
  compact?: boolean
}) {
  const m = (value: number) => `${value.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m`
  const screenCompact = useCompact()
  const compact = forceCompact ?? screenCompact
  const W = compact ? 420 : 720
  const xOf = (hour: number) => PAD_L + (hour / 24) * (W - PAD_L - PAD_R)
  const heights = day.points.map((p) => p.height)
  const rawMin = Math.min(...heights)
  const rawMax = Math.max(...heights)
  const span = Math.max(0.4, rawMax - rawMin)
  const min = Math.floor((rawMin - span * 0.15) * 10) / 10
  const max = Math.ceil((rawMax + span * 0.25) * 10) / 10
  const yOf = (h: number) => TIDE_BOTTOM - ((h - min) / (max - min)) * (TIDE_BOTTOM - TIDE_TOP)

  const pts = day.points.map((p) => ({ x: xOf(p.hour), y: yOf(p.height) }))
  const line = smoothPath(pts)
  const area = `${line} L${xOf(24).toFixed(1)},${TIDE_BOTTOM} L${xOf(0).toFixed(1)},${TIDE_BOTTOM} Z`

  const step = max - min > 1.6 ? 0.5 : max - min > 0.8 ? 0.25 : 0.1
  const yTicks: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) yTicks.push(Math.round(v * 100) / 100)

  const barW = (W - PAD_L - PAD_R) / 24

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${labels.title}: ${day.extremes
        .map((e) => `${e.type === 'high' ? labels.high : labels.low} ${formatHour(e.hour)} · ${m(e.height)}`)
        .join('; ')}`}
    >
      <defs>
        <linearGradient id="mare-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TEAL} stopOpacity="0.55" />
          <stop offset="1" stopColor={TEAL} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Grade e eixo Y (altura) */}
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD_L} x2={W - PAD_R} y1={yOf(v)} y2={yOf(v)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={PAD_L - 8} y={yOf(v) + 4} textAnchor="end" fontSize="12" fill="#64748b">
            {v.toLocaleString(locale, { minimumFractionDigits: step < 0.25 ? 1 : 2 })}
          </text>
        </g>
      ))}
      <text x={12} y={TIDE_TOP - 14} fontSize="12" fill="#64748b">
        {labels.height}
      </text>

      {/* Eixo X (tempo) */}
      {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
        <line key={h} x1={xOf(h)} x2={xOf(h)} y1={TIDE_TOP} y2={ACT_BOTTOM} stroke="#f1f5f9" strokeWidth="1" />
      ))}

      {/* Curva da maré */}
      <path d={area} fill="url(#mare-area)" />
      <path d={line} fill="none" stroke={TEAL_DARK} strokeWidth="3" strokeLinecap="round" />

      {/* Agora */}
      {nowHour !== null ? (
        <g>
          <line x1={xOf(nowHour)} x2={xOf(nowHour)} y1={TIDE_TOP - 6} y2={ACT_BOTTOM} stroke="#e2bd45" strokeWidth="2" strokeDasharray="4 4" />
          <text x={xOf(nowHour)} y={TIDE_TOP - 10} textAnchor="middle" fontSize="12" fontWeight="600" fill="#b8901c">
            {labels.now}
          </text>
        </g>
      ) : null}

      {/* Preia-mares e baixa-mares */}
      {day.extremes.map((e) => {
        const x = xOf(e.hour)
        const y = yOf(e.height)
        const high = e.type === 'high'
        const anchor = x < PAD_L + 40 ? 'start' : x > W - PAD_R - 40 ? 'end' : 'middle'
        return (
          <g key={`${e.type}-${e.hour}`}>
            <circle cx={x} cy={y} r="6" fill={high ? NAVY : '#ffffff'} stroke={NAVY} strokeWidth="2.5" />
            <text x={x} y={high ? y - 22 : y + 22} textAnchor={anchor} fontSize="13" fontWeight="700" fill={NAVY}>
              {formatHour(e.hour)}
            </text>
            <text x={x} y={high ? y - 9 : y + 36} textAnchor={anchor} fontSize="12" fill="#475569">
              {m(e.height)}
            </text>
          </g>
        )
      })}

      {/* Atividade dos peixes, hora a hora */}
      <text x={12} y={ACT_TOP - 10} fontSize="12" fill="#64748b">
        {labels.fish}
      </text>
      {solunar.hourly.map((score, h) => {
        const height = Math.max(4, (score / 100) * (ACT_BOTTOM - ACT_TOP))
        return (
          <rect
            key={h}
            x={xOf(h) + 1.5}
            y={ACT_BOTTOM - height}
            width={barW - 3}
            height={height}
            rx="3"
            fill={levelColor[levelOf(score)]}
          >
            <title>{`${String(h).padStart(2, '0')}h: ${labels.level(levelOf(score))}`}</title>
          </rect>
        )
      })}

      {/* Horas */}
      {[0, 6, 12, 18, 24].map((h) => (
        <text key={h} x={xOf(h)} y={H - 14} textAnchor={h === 0 ? 'start' : h === 24 ? 'end' : 'middle'} fontSize="13" fill="#475569">
          {h === 24 ? '00:00' : `${String(h).padStart(2, '0')}:00`}
        </text>
      ))}
      <text x={W - PAD_R} y={H - 2} textAnchor="end" fontSize="11" fill="#94a3b8">
        {labels.time}
      </text>
    </svg>
  )
}

/* ------------------------------ Página ------------------------------ */

export default function Tide() {
  const { state, reload } = useTides()
  const [selected, setSelected] = useState(0)
  const [alertTarget, setAlertTarget] = useState<AlertTarget | null>(null)

  const today = todayInBrazil()
  const days = state.status === 'ready' ? state.days.filter((d) => d.date >= today) : []
  const day = days[Math.min(selected, Math.max(0, days.length - 1))]

  const solunar = useMemo(
    () => (day ? solunarDay(day.date, WEATHER_PLACE.lat, WEATHER_PLACE.lon) : null),
    [day],
  )

  return (
    <>
      <PageHero title="TÁBUA DE MARÉ" subtitle="Preia-mares e baixa-mares do Saco da Ribeira" image="/images/cuidados/ubatuba-aerea.jpg" />

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6" aria-labelledby="mare-titulo">
        <Reveal className="mb-8 text-center">
          <p className="flex items-center justify-center gap-2 font-serif text-sm italic text-teal-dark">
            <MapPin size={16} aria-hidden="true" /> {WEATHER_PLACE.name}
          </p>
          <h2 id="mare-titulo" className="mt-2 font-display text-3xl font-light sm:text-4xl">
            Marés e pescaria
          </h2>
          <div className="mx-auto mt-5 h-0.5 w-10 bg-teal" />
        </Reveal>

        {state.status === 'loading' ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-500" role="status">
            <RefreshCw className="animate-spin text-teal-dark" size={28} aria-hidden="true" />
            Carregando a tábua de maré…
          </div>
        ) : null}

        {state.status === 'error' || (state.status === 'ready' && !day) ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 text-amber-500" size={30} aria-hidden="true" />
            <p className="font-medium text-navy">Não conseguimos carregar a maré agora.</p>
            <p className="mt-2 text-sm font-light">Verifique a internet e tente de novo, ou veja no tabuademares.com.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={reload}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-medium text-white transition hover:bg-navy-dark"
              >
                <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
              </button>
              <a
                href={TABUA_DE_MARES_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-navy px-5 py-3 text-sm font-medium text-navy transition hover:bg-navy hover:text-white"
              >
                tabuademares.com <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        ) : null}

        {day && solunar ? (
          <>
            {/* Escolha do dia */}
            <div className="-mx-4 mb-6 overflow-x-auto px-4 pb-2">
              <div className="flex min-w-max gap-2 sm:justify-center" role="tablist" aria-label="Escolha o dia">
                {days.map((d, i) => {
                  const label = dayLabel(d.date, i)
                  const active = d.date === day.date
                  return (
                    <button
                      key={d.date}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelected(i)}
                      className={`flex min-w-[4.5rem] flex-col items-center rounded-2xl border px-3 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal ${
                        active
                          ? 'border-navy bg-navy text-white shadow-lg'
                          : 'border-slate-200 bg-white text-navy hover:border-teal'
                      }`}
                    >
                      <span className="font-medium">{label.top}</span>
                      <span className={active ? 'text-teal' : 'text-slate-500'}>{label.bottom}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Resumo */}
            <div className="grid gap-4 md:grid-cols-3">
              <Reveal className="md:col-span-2">
                <div className="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-display text-lg tracking-wide text-navy">Preia-mares e baixa-mares</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Toque em <strong className="font-medium">Criar alerta</strong> para ser avisado antes da maré subir ou
                    descer.
                  </p>
                  <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {day.extremes.map((e) => {
                      const high = e.type === 'high'
                      return (
                        <li
                          key={`${e.type}-${e.hour}`}
                          className={`rounded-2xl p-3 ${high ? 'bg-navy text-white' : 'border border-navy/20 bg-slate-50 text-navy'}`}
                        >
                          <p className={`flex items-center gap-1 text-xs uppercase tracking-wider ${high ? 'text-teal' : 'text-teal-dark'}`}>
                            {high ? <ArrowUp size={14} aria-hidden="true" /> : <ArrowDown size={14} aria-hidden="true" />}
                            {high ? 'Preia-mar' : 'Baixa-mar'}
                          </p>
                          <p className="mt-1 font-display text-2xl font-light">{formatHour(e.hour)}</p>
                          <p className={`text-sm ${high ? 'text-white/80' : 'text-slate-600'}`}>{meters(e.height)}</p>
                          {dateAtBrazilHour(day.date, e.hour).getTime() > Date.now() ? (
                            <button
                              type="button"
                              onClick={() =>
                                setAlertTarget({
                                  kind: high ? 'tide-high' : 'tide-low',
                                  eventAt: dateAtBrazilHour(day.date, e.hour),
                                  summary: `${high ? 'Preia-mar' : 'Baixa-mar'} às ${formatHour(e.hour)} (${meters(e.height)})`,
                                })
                              }
                              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                                high
                                  ? 'bg-[#e2bd45] text-navy-dark hover:bg-[#f0cd5a]'
                                  : 'bg-navy text-white hover:bg-navy-dark'
                              }`}
                            >
                              <BellPlus size={13} aria-hidden="true" /> Criar alerta
                            </button>
                          ) : (
                            <p className={`mt-2 text-xs ${high ? 'text-white/50' : 'text-slate-400'}`}>Já passou</p>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="h-full rounded-3xl bg-gradient-to-br from-navy-dark via-navy to-[#0e3a52] p-5 text-white shadow-lg">
                  <h3 className="flex items-center gap-2 font-display text-lg tracking-wide">
                    <Fish size={20} className="text-teal" aria-hidden="true" /> Atividade dos peixes
                  </h3>
                  <p className="mt-3 font-display text-3xl font-light capitalize">{solunar.level}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-teal" style={{ width: `${solunar.average}%` }} />
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-sm text-white/80">
                    <Moon size={16} className="text-teal" aria-hidden="true" />
                    {solunar.moonName} · {Math.round(solunar.illumination * 100)}% iluminada
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Gráfico */}
            <Reveal className="mt-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
                <TideChart day={day} solunar={solunar} nowHour={day.date === today ? nowHourInBrazil() : null} />
                <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 px-2 text-xs text-slate-600">
                  {(Object.keys(levelColor) as ActivityLevel[]).map((level) => (
                    <li key={level} className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-sm" style={{ background: levelColor[level] }} aria-hidden="true" />
                      atividade {level}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Melhores horários */}
            {solunar.periods.length ? (
              <Reveal className="mt-4">
                <div className="rounded-3xl border border-teal/40 bg-teal/10 p-5">
                  <h3 className="font-display text-lg tracking-wide text-navy">Melhores horários para pescar</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {solunar.periods.map((p) => (
                      <li
                        key={`${p.kind}-${p.hour}`}
                        className={`rounded-full px-4 py-2 text-sm ${
                          p.kind === 'maior' ? 'bg-navy text-white' : 'border border-navy/30 bg-white text-navy'
                        }`}
                      >
                        {formatHour(Math.max(0, p.start))} – {formatHour(Math.min(23.99, p.end))}
                        <span className={p.kind === 'maior' ? 'ml-2 text-teal' : 'ml-2 text-teal-dark'}>
                          período {p.kind}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs font-light text-slate-600">
                    Períodos maiores: Lua passando por cima ou por baixo de Ubatuba. Períodos menores: Lua nascendo ou se
                    pondo. Na Lua Nova e na Lua Cheia, os peixes costumam ficar mais ativos.
                  </p>
                </div>
              </Reveal>
            ) : null}

            <p className="mt-6 text-center text-xs font-light text-slate-500">
              Horários e alturas da tábua de marés de Ubatuba do Instituto Oceanográfico da USP (J. Harari), com alturas em
              relação ao nível de redução (o zero da carta náutica). A curva entre uma maré e outra é aproximada e o vento
              pode mudar o nível do mar. Serve para planejar o passeio e a pescaria,{' '}
              <strong className="font-medium">não para navegação</strong>.
            </p>
          </>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <InstallAppButton />
          <GlassButton href={TABUA_DE_MARES_URL} external tone="dark" icon={<ExternalLink size={16} />}>
            Ver também no tabuademares.com
          </GlassButton>
        </div>
        <AlertDialog target={alertTarget} onClose={() => setAlertTarget(null)} />
      </section>
    </>
  )
}
