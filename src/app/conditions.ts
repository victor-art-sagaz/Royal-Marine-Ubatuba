import { useEffect, useState } from 'react'
import { fetchMet, fetchWaves, toBrazilLocal } from '../lib/weather'
import type { Place } from '../lib/weather'

/** Ondas e vento de uma hora do dia */
export interface HourConditions {
  waveHeight: number | null
  waveDirection: number | null
  wavePeriod: number | null
  windSpeed: number | null
  windDirection: number | null
}

/** "AAAA-MM-DD" → hora (0–23) → condições */
export type ConditionsByDay = Record<string, Record<number, HourConditions>>

interface Sample {
  /** milissegundos (UTC) */
  at: number
  [key: string]: number | null
}

/** Valor mais próximo da hora pedida (até 3 horas de diferença) */
function nearest<T extends Sample>(list: T[], at: number): T | null {
  let best: T | null = null
  for (const s of list) {
    if (Math.abs(s.at - at) <= 3 * 3600000 && (!best || Math.abs(s.at - at) < Math.abs(best.at - at))) best = s
  }
  return best
}

/** Busca vento (MET Norway) e ondas (CPTEC/INPE) para os próximos dias */
export async function fetchConditions(place: Place, signal?: AbortSignal): Promise<ConditionsByDay> {
  const [met, waves] = await Promise.all([fetchMet(place, signal).catch(() => null), fetchWaves(signal)])

  const wind = (met?.properties.timeseries ?? []).map((s) => ({
    at: Date.parse(s.time),
    speed: typeof s.data.instant.details.wind_speed === 'number' ? s.data.instant.details.wind_speed * 3.6 : null,
    dir: s.data.instant.details.wind_from_direction ?? null,
  }))
  const sea = waves.map((w) => ({ at: Date.parse(w.hora), height: w.altura, dir: w.direcao }))
  if (!wind.length && !sea.length) return {}

  const all = [...wind.map((w) => w.at), ...sea.map((w) => w.at)]
  const first = Math.min(...all)
  const last = Math.max(...all)
  const out: ConditionsByDay = {}
  // Uma linha por hora inteira, do primeiro ao último dado
  for (let at = Math.floor(first / 3600000) * 3600000; at <= last; at += 3600000) {
    const local = toBrazilLocal(new Date(at).toISOString())
    const date = local.slice(0, 10)
    const hour = Number(local.slice(11, 13))
    const w = nearest(wind, at)
    const s = nearest(sea, at)
    if (!w && !s) continue
    if (!out[date]) out[date] = {}
    out[date][hour] = {
      waveHeight: s?.height ?? null,
      waveDirection: s?.dir ?? null,
      wavePeriod: null,
      windSpeed: w?.speed ?? null,
      windDirection: w?.dir ?? null,
    }
  }
  return out
}

/** Busca as condições só quando `enabled` (o botão do gráfico está ligado) */
export function useConditions(place: Place, enabled: boolean) {
  const [data, setData] = useState<ConditionsByDay | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    setLoading(true)
    fetchConditions(place, controller.signal)
      .then((d) => setData(d))
      .catch(() => setData({}))
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, place.lat, place.lon])

  return { data, loading }
}
