import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react'
import type { WeatherKind } from '../lib/weather'

interface WeatherIconProps {
  kind: WeatherKind
  isDay?: boolean
  size?: number
  className?: string
}

/** Ícone do tempo (sol, nuvem, chuva…) escolhido pelo tipo de tempo. */
export default function WeatherIcon({ kind, isDay = true, size = 24, className = '' }: WeatherIconProps) {
  const props = { size, className, 'aria-hidden': true as const }
  switch (kind) {
    case 'clear':
      return isDay ? <Sun {...props} /> : <Moon {...props} />
    case 'partly':
      return isDay ? <CloudSun {...props} /> : <CloudMoon {...props} />
    case 'cloudy':
      return <Cloud {...props} />
    case 'fog':
      return <CloudFog {...props} />
    case 'drizzle':
      return <CloudDrizzle {...props} />
    case 'rain':
      return <CloudRain {...props} />
    case 'storm':
      return <CloudLightning {...props} />
    case 'snow':
      return <CloudSnow {...props} />
  }
}
