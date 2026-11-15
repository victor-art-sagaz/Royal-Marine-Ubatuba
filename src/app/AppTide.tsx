import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Bell, ExternalLink, Fish, Moon, RefreshCw } from 'lucide-react'
import AppAlertSheet from './AppAlertSheet'
import type { AlertTarget } from '../components/AlertDialog'
import { TABUA_DE_MARES_URL, TideChart, dayLabel, meters, nowHourInBrazil, todayInBrazil, useTides } from '../pages/Tide'
import { dateAtBrazilHour } from '../lib/alerts'
import { formatHour } from '../lib/tide'
import type { TideDay, TideExtreme } from '../lib/tide'
import { solunarDay } from '../lib/solunar'
import { WEATHER_PLACE } from '../lib/weather'

/** Altura da maré agora, ligando os pontos de hora em hora */
function heightAt(day: TideDay, hour: number): number {
  const pts = day.points
  for (let i = 0; i < pts.length - 1; i++) {
    if (hour >= pts[i].hour && hour <= pts[i + 1].hour) {
      const t = (hour - pts[i].hour) / (pts[i + 1].hour - pts[i].hour || 1)
      return pts[i].height + (pts[i + 1].height - pts[i].height) * t
    }
  }
  return pts[pts.length - 1]?.height ?? 0
}

function untilText(ms: number) {
  const total = Math.max(0, Math.round(ms / 60000))
  const h = Math.floor(total / 60)
  const m = total % 60
  return h ? `${h}h ${String(m).padStart(2, '0')}min` : `${m} min`
}

/** Círculo com a "água" no nível da maré agora, com onda animada */
function TideGauge({ level, rising }: { level: number; rising: boolean }) {
  const fill = Math.min(0.92, Math.max(0.08, level))
  return (
    <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-teal/50 bg-navy-dark/60 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-x-0 bottom-0 transition-[height] duration-1000" style={{ height: `${fill * 100}%` }}>
        <svg className="absolute -top-3 left-0 h-4 w-[200%] animate-wave-drift" viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 10 Q 50 0 100 10 T 200 10 T 300 10 T 400 10 V 20 H 0 Z" fill="#4f9fae" />
        </svg>
        <div className="h-full w-full bg-gradient-to-b from-[#4f9fae] to-[#1d5f74]" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {rising ? <ArrowUp size={22} className="text-white drop-shadow" /> : <ArrowDown size={22} className="text-white drop-shadow" />}
        <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-white drop-shadow">
          {rising ? 'Subindo' : 'Descendo'}
        </span>
      </div>
    </div>
  )
}

export default function AppTide() {
  const { state, reload } = useTides()
  const [selected, setSelected] = useState(0)
  const [target, setTarget] = useState<AlertTarget | null>(null)
  const [, setTick] = useState(0)

  // Atualiza a contagem regressiva a cada minuto
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 60000)
    return () => window.clearInterval(t)
  }, [])

  const today = todayInBrazil()
  const days = state.status === 'ready' ? state.days.filter((d) => d.date >= today) : []
  const day = days[Math.min(selected, Math.max(0, days.length - 1))]
  const todayDay = days.find((d) => d.date === today)
  const solunar = useMemo(() => (day ? solunarDay(day.date, WEATHER_PLACE.lat, WEATHER_PLACE.lon) : null), [day])

  const next = useMemo(() => {
    const now = Date.now()
    for (const d of days) {
      for (const e of d.extremes) {
        const at = dateAtBrazilHour(d.date, e.hour)
        if (at.getTime() > now) return { day: d, extreme: e, at }
      }
    }
    return null
  }, [days])

  const openAlert = (d: TideDay, e: TideExtreme) =>
    setTarget({
      kind: e.type === 'high' ? 'tide-high' : 'tide-low',
      eventAt: dateAtBrazilHour(d.date, e.hour),
      summary: `${e.type === 'high' ? 'Preia-mar' : 'Baixa-mar'} às ${formatHour(e.hour)} (${meters(e.height)})`,
    })

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-white/70" role="status">
        <RefreshCw className="animate-spin text-teal" size={28} aria-hidden="true" />
        Carregando as marés…
      </div>
    )
  }

  if (!day || !solunar) {
    return (
      <div className="mt-10 rounded-3xl bg-white/10 p-6 text-center">
        <p className="font-medium">Não conseguimos carregar a maré agora.</p>
        <p className="mt-1 text-sm text-white/70">Confira a internet e tente de novo.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reload} className="rounded-full bg-teal px-5 py-3 text-sm font-semibold text-navy-dark">
            Tentar de novo
          </button>
          <a href={TABUA_DE_MARES_URL} target="_blank" rel="noreferrer" className="rounded-full border border-white/30 px-5 py-3 text-sm">
            tabuademares.com
          </a>
        </div>
      </div>
    )
  }

  const nowHour = nowHourInBrazil()
  const heights = todayDay ? todayDay.points.map((p) => p.height) : [0, 1]
  const nowHeight = todayDay ? heightAt(todayDay, nowHour) : 0
  const level = (nowHeight - Math.min(...heights)) / (Math.max(...heights) - Math.min(...heights) || 1)
  const rising = next ? next.extreme.type === 'high' : true

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-teal">Tábua de Maré</p>
        <h1 className="font-display text-2xl tracking-wide">Saco da Ribeira</h1>
      </div>

      {/* Agora */}
      {todayDay ? (
        <section aria-label="Maré agora" className="animate-fade-up rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <TideGauge level={level} rising={rising} />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-white/60">Agora</p>
              <p className="font-display text-4xl font-light">{meters(nowHeight)}</p>
              {next ? (
                <>
                  <p className="mt-2 text-sm text-white/80">
                    {next.extreme.type === 'high' ? 'Preia-mar' : 'Baixa-mar'} em{' '}
                    <strong className="font-semibold text-[#e2bd45]">{untilText(next.at.getTime() - Date.now())}</strong>
                  </p>
                  <p className="text-xs text-white/60">
                    às {formatHour(next.extreme.hour)} · {meters(next.extreme.height)}
                  </p>
                  <button
                    type="button"
                    onClick={() => openAlert(next.day, next.extreme)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e2bd45] px-3 py-1.5 text-xs font-semibold text-navy-dark"
                  >
                    <Bell size={14} aria-hidden="true" /> Me avise
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Dias */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex min-w-max gap-2" role="tablist" aria-label="Escolha o dia">
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
                className={`flex min-w-[4.25rem] flex-col items-center rounded-2xl px-3 py-2 text-sm transition-all duration-300 ${
                  active ? 'bg-white text-navy shadow-lg' : 'bg-white/10 text-white/80 hover:bg-white/15'
                }`}
              >
                <span className="font-semibold">{label.top}</span>
                <span className={active ? 'text-teal-dark' : 'text-white/50'}>{label.bottom}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Marés do dia */}
      <section aria-label="Preia-mares e baixa-mares" className="grid grid-cols-2 gap-2">
        {day.extremes.map((e) => {
          const high = e.type === 'high'
          const future = dateAtBrazilHour(day.date, e.hour).getTime() > Date.now()
          return (
            <div
              key={`${e.type}-${e.hour}`}
              className={`relative rounded-3xl p-4 ${high ? 'bg-gradient-to-br from-teal/30 to-teal/5' : 'bg-white/[0.06]'} border border-white/10`}
            >
              <p className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-white/70">
                {high ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />}
                {high ? 'Preia-mar' : 'Baixa-mar'}
              </p>
              <p className="mt-1 font-display text-3xl font-light">{formatHour(e.hour)}</p>
              <p className="text-sm text-white/70">{meters(e.height)}</p>
              {future ? (
                <button
                  type="button"
                  onClick={() => openAlert(day, e)}
                  aria-label={`Criar alerta para ${high ? 'preia-mar' : 'baixa-mar'} às ${formatHour(e.hour)}`}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#e2bd45] transition hover:bg-white/20"
                >
                  <Bell size={16} />
                </button>
              ) : null}
            </div>
          )
        })}
      </section>

      {/* Gráfico */}
      <section aria-label="Gráfico da maré" className="rounded-[2rem] bg-white p-3 text-navy shadow-xl">
        <TideChart day={day} solunar={solunar} nowHour={day.date === today ? nowHour : null} />
      </section>

      {/* Peixes */}
      <section aria-label="Atividade dos peixes" className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-display text-lg tracking-wide">
            <Fish size={20} className="text-teal" aria-hidden="true" /> Peixes
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white/60">
            <Moon size={14} aria-hidden="true" /> {solunar.moonName}
          </p>
        </div>
        <p className="mt-2 font-display text-2xl font-light capitalize">Atividade {solunar.level}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-gradient-to-r from-teal to-[#e2bd45] transition-[width] duration-1000" style={{ width: `${solunar.average}%` }} />
        </div>
        {solunar.periods.length ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {solunar.periods.map((p) => (
              <li
                key={`${p.kind}-${p.hour}`}
                className={`rounded-full px-3 py-1.5 text-xs ${p.kind === 'maior' ? 'bg-teal text-navy-dark' : 'bg-white/10 text-white/80'}`}
              >
                {formatHour(Math.max(0, p.start))}–{formatHour(Math.min(23.99, p.end))}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-3 text-[11px] text-white/45">Destaque = período maior (Lua passando). Estimativa para pescaria.</p>
      </section>

      <p className="text-center text-[11px] leading-relaxed text-white/45">
        Alturas em relação ao nível médio do mar, estimadas por modelo (Open-Meteo). Não use para navegação.
      </p>
      <a
        href={TABUA_DE_MARES_URL}
        target="_blank"
        rel="noreferrer"
        className="mx-auto flex w-fit items-center gap-1.5 text-xs text-teal underline-offset-4 hover:underline"
      >
        Ver também no tabuademares.com <ExternalLink size={12} aria-hidden="true" />
      </a>

      <AppAlertSheet target={target} onClose={() => setTarget(null)} />
    </div>
  )
}
