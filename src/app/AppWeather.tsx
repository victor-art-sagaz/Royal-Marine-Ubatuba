import { useState } from 'react'
import { ArrowUp, Bell, CloudRain, Droplets, RefreshCw, Sunrise, Sunset, Waves, Wind } from 'lucide-react'
import AppAlertSheet from './AppAlertSheet'
import { PlaceSheet, PlaceTitle, UvCard, WeatherDetails } from './AppExtras'
import { useApp, weatherKey } from './i18n'
import type { AlertTarget } from '../components/AlertDialog'
import WeatherIcon from '../components/WeatherIcon'
import { dateFromBrazilIso } from '../lib/alerts'
import { useWeather } from '../lib/useWeather'
import { describeWeather, seaLevel } from '../lib/weather'
import type { WeatherBundle } from '../lib/weather'

const RAIN_PROB = 50
const WIND_KMH = 25
const hhmm = (iso: string) => iso.slice(11, 16)
const round = Math.round

interface WeatherEvent {
  kind: 'rain' | 'wind'
  time: string
  value: number
}

/** Quando começa a chover ou a ventar forte nas próximas 24 horas */
function findEvents(data: WeatherBundle): WeatherEvent[] {
  const events: WeatherEvent[] = []
  data.hourly.forEach((hour, i) => {
    const prev = data.hourly[i - 1]
    if (i > 0 && hour.precipProb >= RAIN_PROB && prev && prev.precipProb < RAIN_PROB) {
      events.push({ kind: 'rain', time: hour.time, value: hour.precipProb })
    }
    if (i > 0 && hour.windSpeed >= WIND_KMH && prev && prev.windSpeed < WIND_KMH) {
      events.push({ kind: 'wind', time: hour.time, value: hour.windSpeed })
    }
  })
  return events.filter((e) => dateFromBrazilIso(e.time).getTime() > Date.now()).slice(0, 6)
}

const seaStyle = {
  calmo: 'bg-emerald-400/15 text-emerald-200',
  moderado: 'bg-amber-400/15 text-amber-200',
  agitado: 'bg-rose-400/15 text-rose-200',
} as const

const seaKey = { calmo: 'seaCalm', moderado: 'seaModerate', agitado: 'seaRough' } as const

export default function AppWeather() {
  const { t, place, num, dir, time, weekdayShort } = useApp()
  const { state, reload } = useWeather(place)
  const [target, setTarget] = useState<AlertTarget | null>(null)
  const [showPlaces, setShowPlaces] = useState(false)

  const header = (
    <div className="flex items-end justify-between gap-3">
      <PlaceTitle kicker={t('forecast')} onOpen={() => setShowPlaces(true)} />
      {state.status === 'ready' ? (
        <button
          type="button"
          onClick={reload}
          aria-label={t('refresh')}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/15"
        >
          <RefreshCw size={14} aria-hidden="true" />
          {time(state.data.fetchedAt)}
        </button>
      ) : null}
      <PlaceSheet open={showPlaces} onClose={() => setShowPlaces(false)} />
    </div>
  )

  if (state.status === 'loading') {
    return (
      <div className="space-y-4">
        {header}
        <div className="flex flex-col items-center gap-3 py-24 text-white/70" role="status">
          <RefreshCw className="animate-spin text-teal" size={28} aria-hidden="true" />
          {t('loadingWeather')}
        </div>
      </div>
    )
  }
  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        {header}
        <div className="mt-10 rounded-3xl bg-white/10 p-6 text-center">
          <p className="font-medium">{t('weatherError')}</p>
          <button type="button" onClick={reload} className="mt-4 rounded-full bg-teal px-5 py-3 text-sm font-semibold text-navy-dark">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  const data = state.data
  const { current, hourly, daily, marine } = data
  const info = describeWeather(current.code)
  const events = findEvents(data)
  const sea = seaLevel(marine?.waveHeight ?? null, current.windGusts ?? current.windSpeed)

  const summaryOf = (e: WeatherEvent) =>
    e.kind === 'rain'
      ? t('rainFrom', { time: hhmm(e.time), v: round(e.value) })
      : t('windFrom', { time: hhmm(e.time), v: round(e.value) })

  return (
    <div className="space-y-4">
      {header}

      <div className="space-y-4 landscape:grid landscape:grid-cols-2 landscape:items-start landscape:gap-4 landscape:space-y-0">
      <div className="min-w-0 space-y-4">
      {/* Agora */}
      <section aria-label={t('now')} className="relative animate-fade-up overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1d4a78] via-[#16305a] to-navy-dark p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-7xl font-light leading-none">{round(current.temperature)}°</p>
            <p className="mt-2 text-base">{t(weatherKey(current.code))}</p>
            <p className="text-xs text-white/60">{t('feelsLike', { t: round(current.apparent) })}</p>
          </div>
          <div className="animate-bob drop-shadow-lg">
            <WeatherIcon kind={info.kind} isDay={current.isDay} size={96} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/10 p-3">
            <ArrowUp
              size={18}
              className="mx-auto text-teal transition-transform duration-700"
              style={{ transform: `rotate(${current.windDirection + 180}deg)` }}
              aria-hidden="true"
            />
            <p className="mt-1 text-sm font-semibold">{round(current.windSpeed)} km/h</p>
            <p className="text-[10px] uppercase text-white/50">{t('windDir', { dir: dir(current.windDirection) })}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <Wind size={18} className="mx-auto text-teal" aria-hidden="true" />
            <p className="mt-1 text-sm font-semibold">{current.windGusts != null ? `${round(current.windGusts)} km/h` : '–'}</p>
            <p className="text-[10px] uppercase text-white/50">{t('gusts')}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <Droplets size={18} className="mx-auto text-teal" aria-hidden="true" />
            <p className="mt-1 text-sm font-semibold">{daily[0]?.precipProbMax ?? 0}%</p>
            <p className="text-[10px] uppercase text-white/50">{t('rainToday')}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${seaStyle[sea]}`}>
            <Waves size={14} aria-hidden="true" /> {t('seaState', { level: t(seaKey[sea]) })}
            {marine?.waveHeight != null ? ` · ${t('wavesM', { h: num(marine.waveHeight) })}` : ''}
          </span>
          {daily[0] ? (
            <span className="flex items-center gap-2 text-white/60">
              <Sunrise size={14} aria-hidden="true" /> {hhmm(daily[0].sunrise)}
              <Sunset size={14} aria-hidden="true" /> {hhmm(daily[0].sunset)}
            </span>
          ) : null}
        </div>
      </section>

      {/* Tudo do tempo agora */}
      <WeatherDetails data={data} />
      </div>

      <div className="min-w-0 space-y-4">
      {/* Alertas sugeridos */}
      <section aria-label={t('rainWindTitle')} className="rounded-[2rem] border border-[#e2bd45]/25 bg-[#e2bd45]/[0.07] p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Bell size={16} className="text-[#e2bd45]" aria-hidden="true" /> {t('rainWindTitle')}
        </p>
        {events.length ? (
          <ul className="mt-3 space-y-2">
            {events.map((e) => (
              <li key={`${e.kind}-${e.time}`} className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-dark text-teal">
                  {e.kind === 'rain' ? <CloudRain size={18} aria-hidden="true" /> : <Wind size={18} aria-hidden="true" />}
                </span>
                <span className="flex-1 text-sm">{summaryOf(e)}</span>
                <button
                  type="button"
                  onClick={() => setTarget({ kind: e.kind, eventAt: dateFromBrazilIso(e.time), summary: summaryOf(e) })}
                  aria-label={t('createAlertX', { x: summaryOf(e) })}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e2bd45] text-navy-dark"
                >
                  <Bell size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-white/70">{t('noEvents')}</p>
        )}
      </section>

      {/* Raios UV */}
      <UvCard data={data} />

      {/* Próximas horas */}
      <section aria-label={t('nextHours')}>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/50">{t('nextHours')}</p>
        <div className="-mx-4 overflow-x-auto px-4 pb-1 landscape:mx-0 landscape:px-0">
          <ul className="flex min-w-max gap-2">
            {hourly.map((h, i) => {
              const hi = describeWeather(h.code)
              return (
                <li
                  key={h.time}
                  className={`flex w-16 flex-col items-center gap-1 rounded-2xl py-3 text-center ${i === 0 ? 'bg-white text-navy' : 'bg-white/[0.07]'}`}
                >
                  <span className="text-xs font-semibold">{i === 0 ? t('now') : hhmm(h.time)}</span>
                  <WeatherIcon kind={hi.kind} isDay={h.isDay} size={28} />
                  <span className="text-sm font-semibold">{round(h.temperature)}°</span>
                  <span className={`text-[10px] ${i === 0 ? 'text-teal-dark' : 'text-teal'}`}>{h.precipProb}%</span>
                  <span className={`text-[10px] ${i === 0 ? 'text-slate-500' : 'text-white/50'}`}>{round(h.windSpeed)} km/h</span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* 7 dias */}
      <section aria-label={t('next7')} className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-2">
        <ul>
          {daily.map((d, i) => {
            const di = describeWeather(d.code)
            return (
              <li key={d.date} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm odd:bg-white/[0.03]">
                <span className="w-14 truncate font-semibold">{i === 0 ? t('today') : weekdayShort(d.date)}</span>
                <WeatherIcon kind={di.kind} size={24} />
                <span className="flex w-12 items-center gap-1 text-xs text-teal">
                  <Droplets size={12} aria-hidden="true" /> {d.precipProbMax}%
                </span>
                <span className="flex flex-1 items-center gap-1 text-xs text-white/60">
                  <Wind size={12} aria-hidden="true" /> {round(d.windMax)} km/h
                </span>
                <span className="text-white/60">{round(d.tMin)}°</span>
                <span className="font-semibold">{round(d.tMax)}°</span>
              </li>
            )
          })}
        </ul>
      </section>

      </div>
      </div>

      <p className="text-center text-[11px] text-white/45">{t('dataBy')}</p>

      <AppAlertSheet target={target} onClose={() => setTarget(null)} />
    </div>
  )
}
