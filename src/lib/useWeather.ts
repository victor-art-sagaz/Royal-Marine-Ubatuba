import { useCallback, useEffect, useState } from 'react'
import { fetchWeather } from './weather'
import type { WeatherBundle } from './weather'

type WeatherState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: WeatherBundle }

const REFRESH_MS = 15 * 60 * 1000

/** Busca a previsão e atualiza sozinho a cada 15 minutos. */
export function useWeather() {
  const [state, setState] = useState<WeatherState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const data = await fetchWeather(controller.signal)
        setState({ status: 'ready', data })
      } catch {
        if (controller.signal.aborted) return
        // Se já tínhamos dados, mantém os antigos; senão mostra o erro.
        setState((current) => (current.status === 'ready' ? current : { status: 'error' }))
      }
    }

    load()
    const timer = window.setInterval(load, REFRESH_MS)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [attempt])

  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return { state, reload }
}
