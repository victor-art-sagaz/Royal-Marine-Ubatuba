import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface CountUpProps {
  to: number
  suffix?: string
  duration?: number
}

/** Número que "sobe" até o valor final quando aparece na tela. */
export default function CountUp({ to, suffix = '', duration = 1800 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion()
  const [value, setValue] = useState<number>(reduce ? to : 0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setValue(to)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(to * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, to, duration, reduce])

  return (
    <span ref={ref}>
      {value.toLocaleString('pt-BR')}
      {suffix}
    </span>
  )
}
