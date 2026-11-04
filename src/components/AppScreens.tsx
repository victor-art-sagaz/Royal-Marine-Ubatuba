import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface Screen {
  src: string
  alt: string
  caption: string
}

interface AppScreensProps {
  title: string
  screens: Screen[]
  /** Chamado ao tocar na tela grande (para ampliar). */
  onOpen?: (index: number) => void
}

const arrow =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-md transition hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white'

/** Carrossel com as telas do aplicativo dentro de um celular. Passa sozinho até a pessoa mexer. */
export default function AppScreens({ title, screens, onOpen }: AppScreensProps) {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const direction = useRef(1)

  function goTo(next: number, manual = true) {
    const total = screens.length
    const target = (next + total) % total
    direction.current = next >= active ? 1 : -1
    setActive(target)
    if (manual) setAuto(false)
  }

  useEffect(() => {
    if (!auto || reduce) return
    const timer = window.setInterval(() => {
      direction.current = 1
      setActive((current) => (current + 1) % screens.length)
    }, 4200)
    return () => window.clearInterval(timer)
  }, [auto, reduce, screens.length])

  const screen = screens[active]

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-dark via-navy to-teal-dark px-5 py-8 text-white shadow-xl sm:px-8"
      aria-label={title}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal/20 blur-3xl" aria-hidden="true" />
      <h2 className="relative text-center font-serif text-lg font-normal normal-case italic tracking-normal text-white sm:text-xl">
        {title}
      </h2>

      <div className="relative mt-6 flex items-center justify-center gap-3 sm:gap-6">
        <button type="button" className={arrow} onClick={() => goTo(active - 1)} aria-label="Tela anterior">
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        {/* Celular */}
        <div className="relative w-[11.5rem] sm:w-56">
          <div className="rounded-[2.2rem] border-[6px] border-[#0a1a33] bg-[#0a1a33] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/20">
            <div className="mx-auto mb-1 mt-0.5 h-1.5 w-14 rounded-full bg-white/15" aria-hidden="true" />
            <button
              type="button"
              onClick={() => onOpen?.(active)}
              className="group relative block aspect-[241/413] w-full overflow-hidden rounded-[1.6rem] bg-navy"
              aria-label={`Ampliar tela: ${screen.caption}`}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={screen.src}
                  src={screen.src}
                  alt={screen.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={reduce ? false : { opacity: 0, x: 40 * direction.current }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -40 * direction.current }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  draggable={false}
                />
              </AnimatePresence>
              <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-navy-dark/70 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <ZoomIn size={16} aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>

        <button type="button" className={arrow} onClick={() => goTo(active + 1)} aria-label="Próxima tela">
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>

      <p className="relative mt-5 text-center text-sm font-medium tracking-wide text-white/90" aria-live="polite">
        {screen.caption}
      </p>

      {/* Miniaturas */}
      <div className="relative mt-4 flex items-center justify-center gap-2.5">
        {screens.map((item, index) => (
          <button
            key={item.src}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Ver tela: ${item.caption}`}
            aria-current={index === active}
            className={`h-14 w-8 overflow-hidden rounded-md border-2 transition sm:h-16 sm:w-9 ${
              index === active
                ? 'scale-110 border-[#f6e3a0] shadow-[0_0_14px_rgba(246,227,160,0.55)]'
                : 'border-white/20 opacity-60 hover:opacity-100'
            }`}
          >
            <img src={item.src} alt="" aria-hidden="true" className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </section>
  )
}
