import { TIDE_EXTREMES, TIDE_SOURCE } from '../data/mares-ubatuba'
import type { Place } from './weather'

/**
 * Maré de Ubatuba pela tábua oficial do Instituto Oceanográfico da USP (estação da Base Norte, em Ubatuba).
 * Os horários e alturas das preia-mares e baixa-mares vêm da tábua (ficam dentro do site, sem custo).
 * Entre uma maré e outra, a curva é desenhada com a forma de onda (cosseno), como fazem as tábuas.
 * Alturas em relação ao nível de redução (o zero da carta náutica). Não serve para navegação.
 */

export { TIDE_SOURCE }

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

const FORECAST_DAYS = 7

/** "AAAA-MM-DDTHH:mm" (hora de Brasília) → milissegundos */
const ms = (local: string) => Date.parse(`${local}:00-03:00`)
const hourOf = (local: string) => Number(local.slice(11, 13)) + Number(local.slice(14, 16)) / 60

/** Hoje no horário de Brasília (AAAA-MM-DD) */
const todayBrazil = () => new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 10)

const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T12:00:00Z`) + n * 86400000).toISOString().slice(0, 10)

/** Altura da maré num instante, pela curva entre as duas marés vizinhas */
function heightAt(t: number, list: { t: number; h: number }[], i: number) {
  const a = list[i]
  const b = list[i + 1]
  const f = (t - a.t) / (b.t - a.t)
  return a.h + (b.h - a.h) * (1 - Math.cos(Math.PI * f)) / 2
}

export async function fetchTides(_signal?: AbortSignal, _place?: Place): Promise<TideDay[]> {
  const list = TIDE_EXTREMES.map(([local, h]) => ({ local, t: ms(local), h }))
  if (list.length < 3) throw new Error('Tábua de marés indisponível')

  const start = todayBrazil()
  const days: TideDay[] = []
  for (let d = 0; d < FORECAST_DAYS; d++) {
    const date = addDays(start, d)
    const dayStart = ms(`${date}T00:00`)
    // Precisa de marés antes do início e depois do fim do dia
    const i0 = list.findIndex((e) => e.t > dayStart) - 1
    if (i0 < 0 || list[list.length - 1].t < dayStart + 86400000) break

    const points: TidePoint[] = []
    let i = i0
    for (let hour = 0; hour <= 24; hour++) {
      const t = dayStart + hour * 3600000
      while (i < list.length - 2 && list[i + 1].t <= t) i++
      const local = new Date(t - 3 * 3600000).toISOString().slice(0, 16)
      points.push({ time: local, hour, height: Math.round(heightAt(t, list, i) * 100) / 100 })
    }

    const extremes: TideExtreme[] = []
    list.forEach((e, k) => {
      if (!e.local.startsWith(date)) return
      const prev = list[k - 1]?.h ?? list[k + 1].h
      const next = list[k + 1]?.h ?? prev
      extremes.push({ type: e.h >= prev && e.h >= next ? 'high' : 'low', hour: hourOf(e.local), height: e.h })
    })
    days.push({ date, points, extremes })
  }
  if (!days.length) throw new Error('Tábua de marés desatualizada')
  return days
}

/** 14.5 → "14:30" */
export function formatHour(hour: number): string {
  let total = Math.round(hour * 60)
  if (total >= 24 * 60) total = 24 * 60 - 1
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
