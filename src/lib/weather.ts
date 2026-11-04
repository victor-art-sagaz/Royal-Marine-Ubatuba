/**
 * Previsão do tempo e do mar para Ubatuba (Saco da Ribeira).
 * Fonte dos dados: Open-Meteo.com (gratuito, sem chave de acesso).
 * Para trocar de fonte no futuro (ex.: Google Weather API), basta mexer neste arquivo.
 */

export const WEATHER_PLACE = {
  name: 'Saco da Ribeira · Ubatuba',
  lat: -23.4036,
  lon: -45.1127,
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
  windGusts: number
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

interface ForecastResponse {
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    precipitation: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    wind_gusts_10m: number
    is_day: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation_probability: (number | null)[]
    weather_code: number[]
    wind_speed_10m: number[]
    is_day: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: (number | null)[]
    wind_speed_10m_max: number[]
    sunrise: string[]
    sunset: string[]
    uv_index_max: (number | null)[]
  }
}

interface MarineResponse {
  current?: {
    wave_height?: number | null
    wave_direction?: number | null
    wave_period?: number | null
    sea_surface_temperature?: number | null
  }
  daily?: {
    time: string[]
    wave_height_max?: (number | null)[]
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Falha ao buscar dados (${response.status})`)
  return (await response.json()) as T
}

async function fetchMarine(signal?: AbortSignal): Promise<MarineResponse | null> {
  const base = `https://marine-api.open-meteo.com/v1/marine?latitude=${WEATHER_PLACE.lat}&longitude=${WEATHER_PLACE.lon}&daily=wave_height_max&timezone=America%2FSao_Paulo&forecast_days=7`
  try {
    return await getJson<MarineResponse>(
      `${base}&current=wave_height,wave_direction,wave_period,sea_surface_temperature`,
      signal,
    )
  } catch {
    if (signal?.aborted) return null
    try {
      // Tenta de novo só com as ondas (a temperatura da água pode não existir para este ponto)
      return await getJson<MarineResponse>(`${base}&current=wave_height,wave_direction,wave_period`, signal)
    } catch {
      return null
    }
  }
}

export async function fetchWeather(signal?: AbortSignal): Promise<WeatherBundle> {
  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_PLACE.lat}&longitude=${WEATHER_PLACE.lon}` +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day' +
    '&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m,is_day' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max' +
    '&timezone=America%2FSao_Paulo&forecast_days=7&wind_speed_unit=kmh'

  const [forecast, marineRaw] = await Promise.all([getJson<ForecastResponse>(forecastUrl, signal), fetchMarine(signal)])

  const current: CurrentWeather = {
    time: forecast.current.time,
    temperature: forecast.current.temperature_2m,
    apparent: forecast.current.apparent_temperature,
    humidity: forecast.current.relative_humidity_2m,
    precipitation: forecast.current.precipitation,
    code: forecast.current.weather_code,
    isDay: forecast.current.is_day === 1,
    windSpeed: forecast.current.wind_speed_10m,
    windDirection: forecast.current.wind_direction_10m,
    windGusts: forecast.current.wind_gusts_10m,
  }

  // Próximas 24 horas, a partir da hora atual
  const currentHour = `${forecast.current.time.slice(0, 13)}:00`
  const start = Math.max(0, forecast.hourly.time.findIndex((t) => t >= currentHour))
  const hourly: HourlyPoint[] = forecast.hourly.time.slice(start, start + 24).map((time, i) => {
    const index = start + i
    return {
      time,
      temperature: forecast.hourly.temperature_2m[index],
      precipProb: forecast.hourly.precipitation_probability[index] ?? 0,
      code: forecast.hourly.weather_code[index],
      windSpeed: forecast.hourly.wind_speed_10m[index],
      isDay: forecast.hourly.is_day[index] === 1,
    }
  })

  const waveByDate = new Map<string, number | null>()
  marineRaw?.daily?.time.forEach((date, i) => {
    waveByDate.set(date, marineRaw.daily?.wave_height_max?.[i] ?? null)
  })

  const daily: DailyPoint[] = forecast.daily.time.map((date, i) => ({
    date,
    code: forecast.daily.weather_code[i],
    tMax: forecast.daily.temperature_2m_max[i],
    tMin: forecast.daily.temperature_2m_min[i],
    precipProbMax: forecast.daily.precipitation_probability_max[i] ?? 0,
    windMax: forecast.daily.wind_speed_10m_max[i],
    sunrise: forecast.daily.sunrise[i],
    sunset: forecast.daily.sunset[i],
    uvMax: forecast.daily.uv_index_max[i] ?? 0,
    waveMax: waveByDate.get(date) ?? null,
  }))

  const marineCurrent = marineRaw?.current
  const marine: MarineNow | null =
    marineCurrent && typeof marineCurrent.wave_height === 'number'
      ? {
          waveHeight: marineCurrent.wave_height ?? null,
          wavePeriod: marineCurrent.wave_period ?? null,
          waveDirection: marineCurrent.wave_direction ?? null,
          seaTemp: marineCurrent.sea_surface_temperature ?? null,
        }
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
