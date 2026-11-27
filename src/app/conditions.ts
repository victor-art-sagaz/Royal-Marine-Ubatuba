import { useEffect, useState } from 'react'
import { seaPoints } from '../lib/weather'
import type { Place } from '../lib/weather'
import { openMeteoFetch } from '../lib/openMeteo'

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

interface MarineHourly {
  hourly?: { time: string[]; wave_height?: (number | null)[]; wave_direction?: (number | null)[]; wave_period?: (number | null)[] }
}
interface WindHourly {
  hourly?: { time: string[]; wind_speed_10m?: (number | null)[]; wind_direction_10m?: (number | null)[] }
}

const TZ = 'timezone=America%2FSao_Paulo&forecast_days=7'

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await openMeteoFetch(url, signal)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as T
}

async function fetchWaves(place: Place, signal?: AbortSignal): Promise<MarineHourly | null> {
  for (const p of seaPoints(place)) {
    try {
      const data = await getJson<MarineHourly>(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${p.lat}&longitude=${p.lon}&hourly=wave_height,wave_direction,wave_period&${TZ}`,
        signal,
      )
      if (data.hourly?.wave_height?.some((v) => typeof v === 'number')) return data
    } catch {
      if (signal?.aborted) return null
    }
  }
  return null
}

/** Busca ondas (altura, direção, período) e vento hora a hora para 7 dias */
export async function fetchConditions(place: Place, signal?: AbortSignal): Promise<ConditionsByDay> {
  const [waves, wind] = await Promise.all([
    fetchWaves(place, signal),
    getJson<WindHourly>(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&hourly=wind_speed_10m,wind_direction_10m&${TZ}`,
      signal,
    ).catch(() => null),
  ])
  const out: ConditionsByDay = {}
  const slot = (iso: string) => {
    const date = iso.slice(0, 10)
    const hour = Number(iso.slice(11, 13))
    if (!out[date]) out[date] = {}
    if (!out[date][hour]) {
      out[date][hour] = { waveHeight: null, waveDirection: null, wavePeriod: null, windSpeed: null, windDirection: null }
    }
    return out[date][hour]
  }
  const h = waves?.hourly
  h?.time.forEach((iso, i) => {
    const s = slot(iso)
    s.waveHeight = h.wave_height?.[i] ?? null
    s.waveDirection = h.wave_direction?.[i] ?? null
    s.wavePeriod = h.wave_period?.[i] ?? null
  })
  const w = wind?.hourly
  w?.time.forEach((iso, i) => {
    const s = slot(iso)
    s.windSpeed = w.wind_speed_10m?.[i] ?? null
    s.windDirection = w.wind_direction_10m?.[i] ?? null
  })
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
