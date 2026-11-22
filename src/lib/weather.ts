/**
 * Previsão do tempo e do mar para Ubatuba (Saco da Ribeira).
 * Fontes dos dados: MET Norway (tempo, CC BY 4.0) e CPTEC/INPE (ondas), pelo intermediário em /functions/api.
 * Para trocar de fonte no futuro (ex.: Google Weather API), basta mexer neste arquivo.
 */

/** Um lugar com coordenadas (latitude e longitude) */
export interface Place {
  name: string
  lat: number
  lon: number
}

export const WEATHER_PLACE: Place = {
  name: 'Saco da Ribeira · Ubatuba',
  lat: -23.5017,
  lon: -45.1176,
}

export type WeatherKind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'storm' | 'snow'

export interface WeatherInfo {
  label: string
  kind: WeatherKind
}

/** Traduz o código do tempo (padrão WMO) para texto em português. */
export function describeWeather(code: number): WeatherInfo {
  if (code === 0) return { label: 'Céu limpo', kind: 'clear' }
  if (code === 1) return { label: 'Predomínio de sol', kind: 'clear' }
  if (code === 2) return { label: 'Parcialmente nublado', kind: 'partly' }
  if (code === 3) return { label: 'Nublado', kind: 'cloudy' }
  if (code === 45 || code === 48) return { label: 'Neblina', kind: 'fog' }
  if (code >= 51 && code <= 57) return { label: 'Garoa', kind: 'drizzle' }
  if (code >= 61 && code <= 67) return { label: 'Chuva', kind: 'rain' }
  if (code >= 71 && code <= 77) return { label: 'Frio intenso', kind: 'snow' }
  if (code >= 80 && code <= 82) return { label: 'Pancadas de chuva', kind: 'rain' }
  if (code === 85 || code === 86) return { label: 'Frio intenso', kind: 'snow' }
  if (code >= 95) return { label: 'Tempestade', kind: 'storm' }
  return { label: 'Tempo instável', kind: 'cloudy' }
}

export interface CurrentWeather {
  time: string
  temperature: number
  apparent: number
  humidity: number
  precipitation: number
  code: number
  isDay: boolean
  windSpeed: number
  windDirection: number
  /** Rajadas (km/h) — nem sempre disponível */
  windGusts: number | null
  /** Cobertura de nuvens (%) */
  cloudCover?: number
  /** Visibilidade (metros) */
  visibility?: number
  /** Ponto de orvalho (°C) */
  dewPoint?: number
  /** Índice UV agora */
  uvIndex?: number
}

export interface HourlyPoint {
  time: string
  temperature: number
  precipProb: number
  code: number
  windSpeed: number
  isDay: boolean
}

export interface DailyPoint {
  date: string
  code: number
  tMax: number
  tMin: number
  precipProbMax: number
  windMax: number
  sunrise: string
  sunset: string
  uvMax: number
  waveMax: number | null
}

export interface MarineNow {
  waveHeight: number | null
  wavePeriod: number | null
  waveDirection: number | null
  seaTemp: number | null
}

export interface WeatherBundle {
  current: CurrentWeather
  hourly: HourlyPoint[]
  daily: DailyPoint[]
  marine: MarineNow | null
  fetchedAt: Date
}

/* =====================================================================
 * Fontes gratuitas (via intermediário na Cloudflare, ver pasta /functions/api):
 *   • Tempo: MET Norway (Instituto de Meteorologia da Noruega) — CC BY 4.0
 *   • Ondas: CPTEC/INPE (governo brasileiro)
 * ===================================================================== */

interface MetDetails {
  air_temperature?: number
  relative_humidity?: number
  wind_speed?: number
  wind_speed_of_gust?: number
  wind_from_direction?: number
  cloud_area_fraction?: number
  dew_point_temperature?: number
  fog_area_fraction?: number
  ultraviolet_index_clear_sky?: number
}

interface MetPeriod {
  summary?: { symbol_code?: string }
  details?: {
    precipitation_amount?: number
    probability_of_precipitation?: number
    air_temperature_max?: number
    air_temperature_min?: number
  }
}

interface MetStep {
  time: string
  data: {
    instant: { details: MetDetails }
    next_1_hours?: MetPeriod
    next_6_hours?: MetPeriod
    next_12_hours?: MetPeriod
  }
}

interface MetResponse {
  properties: { timeseries: MetStep[] }
}

export interface WaveItem {
  /** Hora em UTC (ISO) */
  hora: string
  altura: number | null
  direcao: number | null
  agitacao: string | null
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Falha ao buscar dados (${response.status})`)
  return (await response.json()) as T
}

/** Pontos do mar perto do lugar */
export function seaPoints(place: Place): Place[] {
  return [place]
}

/** Previsão do tempo do MET Norway para o lugar (guardada 3 h pela Cloudflare) */
export function fetchMet(place: Place, signal?: AbortSignal) {
  return getJson<MetResponse>(`/api/tempo?lat=${place.lat.toFixed(2)}&lon=${place.lon.toFixed(2)}`, signal)
}

/** Previsão de ondas de Ubatuba do CPTEC/INPE (guardada 3 h pela Cloudflare) */
export async function fetchWaves(signal?: AbortSignal): Promise<WaveItem[]> {
  try {
    const data = await getJson<{ itens?: WaveItem[] }>('/api/ondas', signal)
    return data.itens ?? []
  } catch {
    return []
  }
}

/** Hora UTC (ISO) → hora de Brasília "AAAA-MM-DDTHH:mm" */
export const toBrazilLocal = (iso: string) => new Date(Date.parse(iso) - 3 * 3600000).toISOString().slice(0, 16)

/** Converte o ícone do MET Norway no código de tempo que o site já usa */
export function metSymbolToCode(symbol?: string): number {
  const s = (symbol ?? '').replace(/_(day|night|polartwilight)$/, '')
  if (!s) return 3
  if (s.includes('thunder')) return 95
  if (s.includes('snow')) return 73
  if (s.includes('sleet')) return 67
  if (s.includes('rainshowers')) return s.startsWith('light') ? 80 : s.startsWith('heavy') ? 82 : 81
  if (s.includes('rain')) return s.startsWith('light') ? 61 : s.startsWith('heavy') ? 65 : 63
  if (s === 'fog') return 45
  if (s === 'cloudy') return 3
  if (s === 'partlycloudy') return 2
  if (s === 'fair') return 1
  return 0
}

/** Nascer e pôr do sol (hora de Brasília, "AAAA-MM-DDTHH:mm") — fórmula da NOAA */
export function sunTimes(date: string, lat: number, lon: number): { sunrise: string; sunset: string } {
  const d = new Date(`${date}T12:00:00Z`)
  const start = Date.UTC(d.getUTCFullYear(), 0, 0)
  const dayOfYear = Math.floor((d.getTime() - start) / 86400000)
  const g = ((2 * Math.PI) / 365) * (dayOfYear - 1)
  const eq =
    229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g))
  const decl =
    0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g)
  const rad = (x: number) => (x * Math.PI) / 180
  const cosHa = Math.cos(rad(90.833)) / (Math.cos(rad(lat)) * Math.cos(decl)) - Math.tan(rad(lat)) * Math.tan(decl)
  const ha = (Math.acos(Math.max(-1, Math.min(1, cosHa))) * 180) / Math.PI
  const toLocal = (utcMinutes: number) => {
    const local = Math.round(utcMinutes - 180)
    const h = Math.floor(local / 60)
    const m = local % 60
    return `${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  return { sunrise: toLocal(720 - 4 * (lon + ha) - eq), sunset: toLocal(720 - 4 * (lon - ha) - eq) }
}

/** Sensação térmica (fórmula de Steadman, com vento em m/s) */
function apparentTemp(t: number, rh: number, windMs: number) {
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * t) / (237.7 + t))
  return t + 0.33 * e - 0.7 * windMs - 4
}

/** Chance de chuva: usa a do MET Norway; se não vier, estima pela quantidade prevista */
function rainChance(p?: MetPeriod, hours = 1) {
  const prob = p?.details?.probability_of_precipitation
  if (typeof prob === 'number') return prob
  const perHour = (p?.details?.precipitation_amount ?? 0) / hours
  if (perHour >= 1) return 90
  if (perHour >= 0.5) return 70
  if (perHour >= 0.2) return 50
  if (perHour > 0) return 30
  return 0
}

const isDayAt = (symbol: string | undefined, local: string, lat: number, lon: number) => {
  if (symbol?.endsWith('_night')) return false
  if (symbol?.endsWith('_day')) return true
  const { sunrise, sunset } = sunTimes(local.slice(0, 10), lat, lon)
  return local >= sunrise && local < sunset
}

export async function fetchWeather(signal?: AbortSignal, place: Place = WEATHER_PLACE): Promise<WeatherBundle> {
  const [met, waves] = await Promise.all([fetchMet(place, signal), fetchWaves(signal)])
  const steps = met.properties.timeseries
  const kmh = (ms?: number) => (ms ?? 0) * 3.6

  // "Agora" = o passo mais recente que já começou
  const now = Date.now()
  let idx = 0
  steps.forEach((s, i) => {
    if (Date.parse(s.time) <= now) idx = i
  })
  const cur = steps[idx]
  const d = cur.data.instant.details
  const curLocal = toBrazilLocal(cur.time)
  const curSymbol = cur.data.next_1_hours?.summary?.symbol_code ?? cur.data.next_6_hours?.summary?.symbol_code
  const temp = d.air_temperature ?? 0
  const current: CurrentWeather = {
    time: curLocal,
    temperature: temp,
    apparent: apparentTemp(temp, d.relative_humidity ?? 70, d.wind_speed ?? 0),
    humidity: d.relative_humidity ?? 0,
    precipitation: cur.data.next_1_hours?.details?.precipitation_amount ?? 0,
    code: metSymbolToCode(curSymbol),
    isDay: isDayAt(curSymbol, curLocal, place.lat, place.lon),
    windSpeed: kmh(d.wind_speed),
    windDirection: d.wind_from_direction ?? 0,
    windGusts: typeof d.wind_speed_of_gust === 'number' ? kmh(d.wind_speed_of_gust) : null,
    cloudCover: d.cloud_area_fraction,
    dewPoint: d.dew_point_temperature,
    uvIndex: d.ultraviolet_index_clear_sky,
  }

  // Próximas 24 horas (passos de 1 hora)
  const hourly: HourlyPoint[] = steps
    .slice(idx)
    .filter((s) => s.data.next_1_hours)
    .slice(0, 24)
    .map((s) => {
      const local = toBrazilLocal(s.time)
      const symbol = s.data.next_1_hours?.summary?.symbol_code
      return {
        time: local,
        temperature: s.data.instant.details.air_temperature ?? 0,
        precipProb: rainChance(s.data.next_1_hours, 1),
        code: metSymbolToCode(symbol),
        windSpeed: kmh(s.data.instant.details.wind_speed),
        isDay: isDayAt(symbol, local, place.lat, place.lon),
      }
    })

  // Ondas: maior altura de cada dia
  const waveByDate = new Map<string, number>()
  waves.forEach((w) => {
    if (w.altura == null) return
    const date = toBrazilLocal(w.hora).slice(0, 10)
    waveByDate.set(date, Math.max(waveByDate.get(date) ?? 0, w.altura))
  })

  // Próximos 7 dias
  const dates = Array.from(new Set(steps.map((s) => toBrazilLocal(s.time).slice(0, 10)))).slice(0, 7)
  const daily: DailyPoint[] = dates.map((date) => {
    const day = steps.filter((s) => toBrazilLocal(s.time).startsWith(date))
    const temps = day.flatMap((s) => [
      s.data.instant.details.air_temperature,
      s.data.next_6_hours?.details?.air_temperature_max,
      s.data.next_6_hours?.details?.air_temperature_min,
    ]).filter((v): v is number => typeof v === 'number')
    // Ícone do dia: o mais perto do meio-dia
    const noon = day.reduce<MetStep | null>((best, s) => {
      const h = Number(toBrazilLocal(s.time).slice(11, 13))
      const bh = best ? Number(toBrazilLocal(best.time).slice(11, 13)) : 99
      return Math.abs(h - 12) < Math.abs(bh - 12) ? s : best
    }, null)
    const noonSymbol = noon?.data.next_6_hours?.summary?.symbol_code ?? noon?.data.next_1_hours?.summary?.symbol_code
    const sun = sunTimes(date, place.lat, place.lon)
    return {
      date,
      code: metSymbolToCode(noonSymbol),
      tMax: temps.length ? Math.max(...temps) : 0,
      tMin: temps.length ? Math.min(...temps) : 0,
      precipProbMax: Math.max(
        0,
        ...day.map((s) => (s.data.next_1_hours ? rainChance(s.data.next_1_hours, 1) : rainChance(s.data.next_6_hours, 6))),
      ),
      windMax: Math.max(0, ...day.map((s) => kmh(s.data.instant.details.wind_speed))),
      sunrise: sun.sunrise,
      sunset: sun.sunset,
      uvMax: Math.max(0, ...day.map((s) => s.data.instant.details.ultraviolet_index_clear_sky ?? 0)),
      waveMax: waveByDate.get(date) ?? null,
    }
  })

  // Ondas agora: a previsão mais próxima do momento atual
  const nearest = waves
    .filter((w) => w.altura != null)
    .sort((a, b) => Math.abs(Date.parse(a.hora) - now) - Math.abs(Date.parse(b.hora) - now))[0]
  const marine: MarineNow | null = nearest
    ? { waveHeight: nearest.altura, wavePeriod: null, waveDirection: nearest.direcao, seaTemp: null }
    : null

  return { current, hourly, daily, marine, fetchedAt: new Date() }
}

/** Direção do vento/onda em pontos cardeais (L = Leste, O = Oeste). */
export function directionLabel(degrees: number): string {
  const points = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO']
  return points[Math.round((((degrees % 360) + 360) % 360) / 45) % 8]
}

export type SeaLevel = 'calmo' | 'moderado' | 'agitado'

/** Resumo simples (apenas orientativo) do estado do mar. */
export function seaLevel(waveHeight: number | null, windGusts: number): SeaLevel {
  const wave = waveHeight ?? 0
  if (wave > 1.5 || windGusts > 45) return 'agitado'
  if (wave > 0.8 || windGusts > 30) return 'moderado'
  return 'calmo'
}
