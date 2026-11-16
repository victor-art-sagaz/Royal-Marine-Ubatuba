import { WEATHER_PLACE, seaPoints } from './weather'
import type { Place } from './weather'

/**
 * Maré do Saco da Ribeira (Ubatuba) a partir da previsão gratuita da Open-Meteo
 * (altura do mar em relação ao nível médio, já com o efeito da maré).
 * É uma estimativa por modelo: não serve para navegação. Para dados oficiais, consulte a Marinha.
 */

export interface TidePoint {
  /** Data e hora local, ex.: 2026-11-13T14:00 */
  time: string
  /** Hora do dia em número (0 a 24, com fração) */
  hour: number
  /** Altura em metros (nível médio do mar = 0) */
  height: number
}

export interface TideExtreme {
  type: 'high' | 'low'
  /** Hora do dia com fração (ex.: 14.5 = 14:30) */
  hour: number
  height: number
}

export interface TideDay {
  /** AAAA-MM-DD */
  date: string
  /** 25 pontos: de 00:00 até 24:00 (meia-noite do dia seguinte) */
  points: TidePoint[]
  extremes: TideExtreme[]
}

interface MarineTideResponse {
  hourly?: { time: string[]; sea_level_height_msl: (number | null)[] }
}


const FORECAST_DAYS = 7

async function fetchSeries(lat: number, lon: number, signal?: AbortSignal) {
  const url =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
    `&hourly=sea_level_height_msl&timezone=America%2FSao_Paulo&forecast_days=${FORECAST_DAYS + 1}`
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Falha ao buscar a maré (${response.status})`)
  const data = (await response.json()) as MarineTideResponse
  const times = data.hourly?.time ?? []
  const values = data.hourly?.sea_level_height_msl ?? []
  const series = times.map((time, i) => ({ time, height: values[i] }))
  const valid = series.filter((p): p is { time: string; height: number } => typeof p.height === 'number')
  // Precisa de quase todos os valores para desenhar a curva
  if (valid.length < times.length * 0.9 || valid.length < 48) throw new Error('Sem dados de maré para este ponto')
  return valid
}

const hourOf = (time: string) => Number(time.slice(11, 13)) + Number(time.slice(14, 16)) / 60

/** Encontra preia-mares (picos) e baixa-mares (vales), afinando a hora entre um ponto e outro. */
function findExtremes(series: { time: string; height: number }[]) {
  const result: { date: string; type: 'high' | 'low'; hour: number; height: number }[] = []
  for (let i = 1; i < series.length - 1; i++) {
    const a = series[i - 1].height
    const b = series[i].height
    const c = series[i + 1].height
    const isHigh = b >= a && b > c
    const isLow = b <= a && b < c
    if (!isHigh && !isLow) continue
    // Parábola pelos 3 pontos: acha o momento exato do topo/fundo
    const denom = a - 2 * b + c
    const offset = denom === 0 ? 0 : Math.max(-0.5, Math.min(0.5, (a - c) / (2 * denom)))
    const height = b - ((a - c) * offset) / 4
    let hour = hourOf(series[i].time) + offset
    let date = series[i].time.slice(0, 10)
    if (hour < 0) {
      hour += 24
      date = series[i - 1].time.slice(0, 10)
    } else if (hour >= 24) {
      hour -= 24
      date = series[i + 1].time.slice(0, 10)
    }
    result.push({ date, type: isHigh ? 'high' : 'low', hour, height })
  }
  return result
}

export async function fetchTides(signal?: AbortSignal, place: Place = WEATHER_PLACE): Promise<TideDay[]> {
  let series: { time: string; height: number }[] | null = null
  let lastError: unknown = null
  // Pontos tentados em ordem: em frente ao lugar e, se faltar dado, um pouco mais ao largo
  for (const point of seaPoints(place)) {
    try {
      series = await fetchSeries(point.lat, point.lon, signal)
      break
    } catch (error) {
      if (signal?.aborted) throw error
      lastError = error
    }
  }
  if (!series) throw lastError ?? new Error('Sem dados de maré')

  const extremes = findExtremes(series)
  const dates = Array.from(new Set(series.map((p) => p.time.slice(0, 10)))).slice(0, FORECAST_DAYS)

  return dates
    .map((date) => {
      const points: TidePoint[] = []
      series!.forEach((p, i) => {
        if (p.time.slice(0, 10) === date) {
          points.push({ time: p.time, hour: hourOf(p.time), height: p.height })
          // Fecha o gráfico às 24:00 com a meia-noite do dia seguinte
          const next = series![i + 1]
          if (p.time.slice(11, 13) === '23' && next) points.push({ time: next.time, hour: 24, height: next.height })
        }
      })
      return {
        date,
        points,
        extremes: extremes.filter((e) => e.date === date).map(({ type, hour, height }) => ({ type, hour, height })),
      }
    })
    .filter((day) => day.points.length >= 24)
}

/** 14.5 → "14:30" */
export function formatHour(hour: number): string {
  let total = Math.round(hour * 60)
  if (total >= 24 * 60) total = 24 * 60 - 1
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
