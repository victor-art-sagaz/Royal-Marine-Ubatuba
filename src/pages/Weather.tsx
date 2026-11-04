import { AlertTriangle, ArrowUp, Droplets, ExternalLink, MapPin, RefreshCw, Sunrise, Sunset, Sun, Thermometer, Waves, Wind } from 'lucide-react'
import type { ReactNode } from 'react'
import GlassButton from '../components/GlassButton'
import Reveal from '../components/Reveal'
import WeatherIcon from '../components/WeatherIcon'
import WeatherScene from '../components/WeatherScene'
import { useWeather } from '../lib/useWeather'
import { WEATHER_PLACE, describeWeather, directionLabel, seaLevel } from '../lib/weather'
import type { DailyPoint, WeatherBundle } from '../lib/weather'

const GOOGLE_WEATHER_URL = `https://www.google.com/search?q=${encodeURIComponent('previsão do tempo Ubatuba SP')}`

const time = (iso: string) => iso.slice(11, 16)
const round = (value: number) => Math.round(value)

function dayName(date: string, index: number): string {
  if (index === 0) return 'Hoje'
  if (index === 1) return 'Amanhã'
  const name = new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short' })
  return name.replace('.', '').replace(/^\w/, (c) => c.toUpperCase())
}

function uvLabel(uv: number): string {
  if (uv < 3) return 'Baixo'
  if (uv < 6) return 'Moderado'
  if (uv < 8) return 'Alto'
  if (uv < 11) return 'Muito alto'
  return 'Extremo'
}

const glassCard =
  'rounded-3xl border border-white/20 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md'

function Detail({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
        {icon}
        {label}
      </p>
      <div className="mt-2 text-xl font-light text-white">{children}</div>
    </div>
  )
}

/* ------------------------------ Cartão do tempo agora ------------------------------ */

function NowCard({ data, onReload }: { data: WeatherBundle; onReload: () => void }) {
  const { current, daily } = data
  const info = describeWeather(current.code)
  return (
    <div className={`${glassCard} p-6 sm:p-8`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium text-white">
          <MapPin size={16} className="text-teal" aria-hidden="true" />
          {WEATHER_PLACE.name}
        </p>
        <div className="flex items-center gap-3 text-xs text-white/70">
          <span>Atualizado às {data.fetchedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          <button
            type="button"
            onClick={onReload}
            aria-label="Atualizar previsão"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            <RefreshCw size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6">
        <div className="animate-bob text-white drop-shadow-lg">
          <WeatherIcon kind={info.kind} isDay={current.isDay} size={92} />
        </div>
        <div>
          <p className="font-display text-7xl font-light leading-none text-white sm:text-8xl">{round(current.temperature)}°</p>
          <p className="mt-2 text-lg font-light text-white">{info.label}</p>
          <p className="text-sm text-white/70">Sensação de {round(current.apparent)}°</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Detail icon={<Wind size={14} aria-hidden="true" />} label="Vento">
          <span className="inline-flex items-center gap-2">
            <ArrowUp
              size={20}
              className="text-teal transition-transform duration-700"
              style={{ transform: `rotate(${current.windDirection + 180}deg)` }}
              aria-hidden="true"
            />
            {round(current.windSpeed)} <span className="text-sm text-white/70">km/h {directionLabel(current.windDirection)}</span>
          </span>
        </Detail>
        <Detail icon={<Wind size={14} aria-hidden="true" />} label="Rajadas">
          {round(current.windGusts)} <span className="text-sm text-white/70">km/h</span>
        </Detail>
        <Detail icon={<Droplets size={14} aria-hidden="true" />} label="Umidade">
          {round(current.humidity)}
          <span className="text-sm text-white/70">%</span>
        </Detail>
        <Detail icon={<Droplets size={14} aria-hidden="true" />} label="Chance de chuva">
          {daily[0]?.precipProbMax ?? 0}
          <span className="text-sm text-white/70">% hoje</span>
        </Detail>
      </div>
    </div>
  )
}

/* ----------------------------------- Mar ----------------------------------- */

function SeaSection({ data }: { data: WeatherBundle }) {
  const { marine, current } = data
  const level = seaLevel(marine?.waveHeight ?? null, current.windGusts)
  const levelStyle: Record<typeof level, string> = {
    calmo: 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100',
    moderado: 'border-amber-300/40 bg-amber-400/15 text-amber-100',
    agitado: 'border-rose-300/40 bg-rose-400/15 text-rose-100',
  }
  const waveHeight = marine?.waveHeight ?? 0

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-dark via-navy to-navy-dark py-20 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-10 text-center">
          <Waves className="mx-auto mb-3 text-teal" size={30} aria-hidden="true" />
          <h2 className="font-display text-3xl font-light tracking-wide text-white sm:text-4xl">Condições do mar</h2>
          <div className="mx-auto my-5 h-0.5 w-10 bg-teal" />
        </Reveal>

        {marine ? (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Reveal>
                <div className={`${glassCard} h-full p-6 text-center`}>
                  <div className="mx-auto mb-3 flex h-12 items-end justify-center gap-1.5" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="h-full w-1.5 origin-bottom animate-wave-bars rounded-full bg-teal"
                        style={{
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: `${Math.max(1, 3 - waveHeight).toFixed(1)}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="font-display text-4xl font-light">
                    {marine.waveHeight?.toFixed(1).replace('.', ',')}
                    <span className="text-lg text-white/70"> m</span>
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/70">Altura das ondas</p>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div className={`${glassCard} h-full p-6 text-center`}>
                  <Waves size={30} className="mx-auto mb-3 text-teal" aria-hidden="true" />
                  <p className="font-display text-4xl font-light">
                    {marine.wavePeriod !== null ? marine.wavePeriod.toFixed(0) : '—'}
                    <span className="text-lg text-white/70"> s</span>
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/70">Intervalo entre ondas</p>
                </div>
              </Reveal>
              <Reveal delay={0.16}>
                <div className={`${glassCard} h-full p-6 text-center`}>
                  <ArrowUp
                    size={30}
                    className="mx-auto mb-3 text-teal transition-transform duration-700"
                    style={{ transform: `rotate(${(marine.waveDirection ?? 0) + 180}deg)` }}
                    aria-hidden="true"
                  />
                  <p className="font-display text-4xl font-light">
                    {marine.waveDirection !== null ? directionLabel(marine.waveDirection) : '—'}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/70">Direção das ondas</p>
                </div>
              </Reveal>
              <Reveal delay={0.24}>
                <div className={`${glassCard} h-full p-6 text-center`}>
                  <Thermometer size={30} className="mx-auto mb-3 text-teal" aria-hidden="true" />
                  <p className="font-display text-4xl font-light">
                    {marine.seaTemp !== null ? round(marine.seaTemp) : '—'}
                    {marine.seaTemp !== null ? <span className="text-lg text-white/70"> °C</span> : null}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/70">Temperatura da água</p>
                </div>
              </Reveal>
            </div>

            <Reveal className="mt-8 text-center">
              <span className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium ${levelStyle[level]}`}>
                <Waves size={16} aria-hidden="true" />
                Mar {level} agora
              </span>
            </Reveal>
          </>
        ) : (
          <Reveal className="text-center">
            <p className="font-light text-white/80">
              Os dados do mar não estão disponíveis neste momento. Tente atualizar a previsão em alguns minutos.
            </p>
          </Reveal>
        )}

        <Reveal className="mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/65">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true" />
          <p>
            Informação apenas orientativa, baseada em modelos de previsão. Antes de sair para navegar, consulte
            também os avisos da Marinha do Brasil e as condições reais no local.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------------------------- Por hora ---------------------------------- */

function HourlySection({ data }: { data: WeatherBundle }) {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-8">
          <h2 className="font-display text-2xl font-light tracking-wide sm:text-3xl">Próximas 24 horas</h2>
          <div className="mt-4 h-0.5 w-10 bg-teal" />
        </Reveal>
        <div className="-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-4">
          {data.hourly.map((hour, i) => {
            const info = describeWeather(hour.code)
            return (
              <div
                key={hour.time}
                className="w-24 shrink-0 snap-start animate-fade-up rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
              >
                <p className="text-sm font-medium text-navy">{i === 0 ? 'Agora' : time(hour.time)}</p>
                <WeatherIcon kind={info.kind} isDay={hour.isDay} size={28} className="mx-auto my-3 text-navy" />
                <p className="font-display text-2xl font-light text-navy">{round(hour.temperature)}°</p>
                <p className="mt-2 flex items-center justify-center gap-1 text-xs text-teal-dark">
                  <Droplets size={12} aria-hidden="true" />
                  {hour.precipProb}%
                </p>
                <p className="mt-1 text-[11px] text-slate-500">{round(hour.windSpeed)} km/h</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------- 7 dias ---------------------------------- */

function DailySection({ days }: { days: DailyPoint[] }) {
  const weekMin = Math.min(...days.map((d) => d.tMin))
  const weekMax = Math.max(...days.map((d) => d.tMax))
  const range = Math.max(1, weekMax - weekMin)
  const today = days[0]

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <Reveal className="mb-8">
            <h2 className="font-display text-2xl font-light tracking-wide sm:text-3xl">Próximos 7 dias</h2>
            <div className="mt-4 h-0.5 w-10 bg-teal" />
          </Reveal>
          <div className="space-y-2" role="list">
            {days.map((day, i) => {
              const info = describeWeather(day.code)
              const left = ((day.tMin - weekMin) / range) * 100
              const width = Math.max(6, ((day.tMax - day.tMin) / range) * 100)
              return (
                <Reveal key={day.date} delay={Math.min(i, 6) * 0.05}>
                  <div role="listitem" className="grid grid-cols-[4.5rem_2rem_1fr] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[5rem_2rem_3.5rem_1fr_6rem]">
                    <span className="text-sm font-medium text-navy">{dayName(day.date, i)}</span>
                    <WeatherIcon kind={info.kind} size={22} className="text-navy" />
                    <span className="hidden items-center gap-1 text-xs text-teal-dark sm:flex">
                      <Droplets size={12} aria-hidden="true" />
                      {day.precipProbMax}%
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-right text-sm text-slate-500">{round(day.tMin)}°</span>
                      <div className="relative h-2 flex-1 rounded-full bg-slate-100">
                        <span
                          className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-teal to-amber-400"
                          style={{ left: `${left}%`, width: `${width}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm font-medium text-navy">{round(day.tMax)}°</span>
                    </div>
                    <span className="hidden text-right text-xs text-slate-500 sm:block">
                      {round(day.windMax)} km/h
                      {day.waveMax !== null ? <><br />ondas {day.waveMax.toFixed(1).replace('.', ',')} m</> : null}
                    </span>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* Sol e UV */}
        <Reveal delay={0.1}>
          <div className="rounded-3xl bg-gradient-to-br from-navy to-navy-dark p-7 text-white shadow-xl">
            <h3 className="font-display text-xl font-light tracking-wide text-white">Sol de hoje</h3>
            <div className="mt-6 grid gap-4">
              <p className="flex items-center gap-3">
                <Sunrise className="text-amber-300" size={28} aria-hidden="true" />
                <span>
                  <span className="block text-xs uppercase tracking-[0.14em] text-white/60">Nascer do sol</span>
                  <span className="text-2xl font-light">{time(today.sunrise)}</span>
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Sunset className="text-orange-300" size={28} aria-hidden="true" />
                <span>
                  <span className="block text-xs uppercase tracking-[0.14em] text-white/60">Pôr do sol</span>
                  <span className="text-2xl font-light">{time(today.sunset)}</span>
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Sun className="animate-spin-slow text-yellow-300" size={28} aria-hidden="true" />
                <span>
                  <span className="block text-xs uppercase tracking-[0.14em] text-white/60">Índice UV máximo</span>
                  <span className="text-2xl font-light">
                    {round(today.uvMax)} <span className="text-sm text-white/70">· {uvLabel(today.uvMax)}</span>
                  </span>
                </span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------- Estados de espera ------------------------------- */

function LoadingCard() {
  return (
    <div className={`${glassCard} p-6 sm:p-8`} role="status" aria-label="Carregando a previsão">
      <div className="wx-shimmer h-5 w-48 rounded-full" />
      <div className="mt-8 flex items-center gap-6">
        <div className="wx-shimmer h-24 w-24 rounded-full" />
        <div className="space-y-3">
          <div className="wx-shimmer h-16 w-40 rounded-2xl" />
          <div className="wx-shimmer h-4 w-32 rounded-full" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="wx-shimmer h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={`${glassCard} p-8 text-center`} role="alert">
      <AlertTriangle className="mx-auto mb-3 text-amber-300" size={36} aria-hidden="true" />
      <h2 className="font-display text-2xl font-light tracking-wide text-white">Não foi possível carregar a previsão</h2>
      <p className="mt-2 text-sm font-light text-white/80">Verifique a internet e tente de novo.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20"
        >
          <RefreshCw size={16} aria-hidden="true" /> Tentar novamente
        </button>
        <GlassButton href={GOOGLE_WEATHER_URL} external icon={<ExternalLink size={16} />}>
          Ver no Google
        </GlassButton>
      </div>
    </div>
  )
}

/* ------------------------------------- Página ------------------------------------- */

export default function Weather() {
  const { state, reload } = useWeather()

  const ready = state.status === 'ready' ? state.data : null
  const info = ready ? describeWeather(ready.current.code) : null

  return (
    <>
      <WeatherScene
        kind={info ? info.kind : 'partly'}
        isDay={ready ? ready.current.isDay : true}
        windSpeed={ready ? ready.current.windSpeed : 10}
      >
        <div className="mb-8 text-center">
          <p className="font-serif text-sm italic text-white/90">Ubatuba · Litoral Norte de São Paulo</p>
          <h1 className="mt-2 font-display text-4xl font-light tracking-wide text-white drop-shadow sm:text-5xl">
            Previsão do tempo
          </h1>
        </div>
        {state.status === 'ready' ? <NowCard data={state.data} onReload={reload} /> : null}
        {state.status === 'loading' ? <LoadingCard /> : null}
        {state.status === 'error' ? <ErrorCard onRetry={reload} /> : null}
      </WeatherScene>

      {state.status === 'ready' ? (
        <>
          <HourlySection data={state.data} />
          <DailySection days={state.data.daily} />
          <SeaSection data={state.data} />
        </>
      ) : null}

      <section className="bg-white py-12 text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6">
          <GlassButton href={GOOGLE_WEATHER_URL} external tone="dark" icon={<ExternalLink size={16} />}>
            Ver previsão também no Google
          </GlassButton>
          <p className="text-xs text-slate-500">
            Dados meteorológicos por{' '}
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline hover:text-navy">
              Open-Meteo.com
            </a>
            . Atualizados automaticamente a cada 15 minutos.
          </p>
        </div>
      </section>
    </>
  )
}
