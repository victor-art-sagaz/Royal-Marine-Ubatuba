/**
 * Atividade dos peixes pelo método solunar: os peixes tendem a se alimentar mais
 * quando a Lua passa por cima (ou por baixo) do lugar (períodos maiores) e quando
 * nasce ou se põe (períodos menores). Na Lua Nova e na Lua Cheia a atividade é maior.
 *
 * Os cálculos da Lua são uma versão simplificada da biblioteca SunCalc (licença BSD, Vladimir Agafonkin).
 * É uma estimativa, para planejar a pescaria.
 */

const rad = Math.PI / 180
const dayMs = 1000 * 60 * 60 * 24
const J1970 = 2440588
const J2000 = 2451545
const e = rad * 23.4397 // inclinação da Terra

const toDays = (date: Date) => date.valueOf() / dayMs - 0.5 + J1970 - J2000

const rightAscension = (l: number, b: number) =>
  Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l))
const declination = (l: number, b: number) =>
  Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l))
const altitude = (H: number, phi: number, dec: number) =>
  Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H))
const siderealTime = (d: number, lw: number) => rad * (280.16 + 360.9856235 * d) - lw

function sunCoords(d: number) {
  const M = rad * (357.5291 + 0.98560028 * d)
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M))
  const L = M + C + rad * 102.9372 + Math.PI
  return { dec: declination(L, 0), ra: rightAscension(L, 0) }
}

function moonCoords(d: number) {
  const L = rad * (218.316 + 13.176396 * d)
  const M = rad * (134.963 + 13.064993 * d)
  const F = rad * (93.272 + 13.22935 * d)
  const l = L + rad * 6.289 * Math.sin(M)
  const b = rad * 5.128 * Math.sin(F)
  const dt = 385001 - 20905 * Math.cos(M)
  return { ra: rightAscension(l, b), dec: declination(l, b), dist: dt }
}

/** Altura da Lua no céu (em radianos) para um lugar e momento. */
function moonAltitude(date: Date, lat: number, lon: number): number {
  const lw = rad * -lon
  const phi = rad * lat
  const d = toDays(date)
  const c = moonCoords(d)
  const H = siderealTime(d, lw) - c.ra
  return altitude(H, phi, c.dec)
}

/** Fase da Lua: 0 = nova, 0.25 = crescente, 0.5 = cheia, 0.75 = minguante. */
export function moonPhase(date: Date): { phase: number; fraction: number } {
  const d = toDays(date)
  const s = sunCoords(d)
  const m = moonCoords(d)
  const sdist = 149598000
  const phi = Math.acos(
    Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra),
  )
  const inc = Math.atan2(sdist * Math.sin(phi), m.dist - sdist * Math.cos(phi))
  const angle = Math.atan2(
    Math.cos(s.dec) * Math.sin(s.ra - m.ra),
    Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra),
  )
  return { fraction: (1 + Math.cos(inc)) / 2, phase: 0.5 + (0.5 * inc * (angle < 0 ? -1 : 1)) / Math.PI }
}

export function moonPhaseName(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return 'Lua Nova'
  if (phase < 0.22) return 'Lua Crescente'
  if (phase < 0.28) return 'Quarto Crescente'
  if (phase < 0.47) return 'Crescente Gibosa'
  if (phase < 0.53) return 'Lua Cheia'
  if (phase < 0.72) return 'Minguante Gibosa'
  if (phase < 0.78) return 'Quarto Minguante'
  return 'Lua Minguante'
}

export type ActivityLevel = 'muito alta' | 'alta' | 'média' | 'baixa'

export interface SolunarPeriod {
  kind: 'maior' | 'menor'
  /** Hora central do período (0 a 24) */
  hour: number
  start: number
  end: number
}

export interface SolunarDay {
  moonName: string
  /** Iluminação da Lua, de 0 a 1 */
  illumination: number
  periods: SolunarPeriod[]
  /** Nota de 0 a 100 para cada hora (24 valores) */
  hourly: number[]
  average: number
  level: ActivityLevel
}

export function levelOf(score: number): ActivityLevel {
  if (score >= 72) return 'muito alta'
  if (score >= 55) return 'alta'
  if (score >= 38) return 'média'
  return 'baixa'
}

/**
 * Calcula a atividade dos peixes de um dia (horário de Brasília, UTC-3).
 * @param date AAAA-MM-DD
 */
export function solunarDay(date: string, lat: number, lon: number): SolunarDay {
  const start = new Date(`${date}T00:00:00-03:00`).getTime()
  const stepMin = 5
  const samples: { hour: number; alt: number }[] = []
  // Uma hora antes e depois do dia, para pegar eventos na virada
  for (let m = -60; m <= 24 * 60 + 60; m += stepMin) {
    samples.push({ hour: m / 60, alt: moonAltitude(new Date(start + m * 60000), lat, lon) })
  }

  const periods: SolunarPeriod[] = []
  for (let i = 1; i < samples.length - 1; i++) {
    const a = samples[i - 1]
    const b = samples[i]
    const c = samples[i + 1]
    // Lua passando por cima (ponto mais alto) ou por baixo (ponto mais baixo): período maior, 2 horas
    if ((b.alt > a.alt && b.alt >= c.alt) || (b.alt < a.alt && b.alt <= c.alt)) {
      periods.push({ kind: 'maior', hour: b.hour, start: b.hour - 1, end: b.hour + 1 })
    }
    // Lua nascendo ou se pondo: período menor, 1 hora
    if ((a.alt < 0 && b.alt >= 0) || (a.alt > 0 && b.alt <= 0)) {
      const t = a.hour + ((b.hour - a.hour) * a.alt) / (a.alt - b.alt)
      periods.push({ kind: 'menor', hour: t, start: t - 0.5, end: t + 0.5 })
    }
  }

  const { phase, fraction } = moonPhase(new Date(start + 12 * 3600000))
  // 1 na Lua Nova e na Cheia, 0 nos quartos
  const distance = Math.min(Math.abs(phase), Math.abs(phase - 0.5), Math.abs(phase - 1))
  const phaseFactor = Math.max(0, 1 - distance / 0.25)
  const base = 22 + 18 * phaseFactor

  const hourly = Array.from({ length: 24 }, (_, h) => {
    const center = h + 0.5
    let score = base
    for (const p of periods) {
      const dist = Math.abs(center - p.hour)
      const sigma = p.kind === 'maior' ? 0.9 : 0.6
      const weight = p.kind === 'maior' ? 48 : 28
      score += weight * (0.7 + 0.3 * phaseFactor) * Math.exp(-(dist * dist) / (2 * sigma * sigma))
    }
    return Math.round(Math.min(100, score))
  })

  const sorted = [...hourly].sort((x, y) => y - x)
  // Média das 8 melhores horas: é o que importa para quem vai pescar
  const average = Math.round(sorted.slice(0, 8).reduce((s, v) => s + v, 0) / 8)

  return {
    moonName: moonPhaseName(phase),
    illumination: fraction,
    periods: periods.filter((p) => p.hour >= 0 && p.hour < 24).sort((x, y) => x.hour - y.hour),
    hourly,
    average,
    level: levelOf(average),
  }
}
