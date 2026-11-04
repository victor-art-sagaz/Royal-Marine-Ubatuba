import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export interface LightboxItem {
  src: string
  alt: string
  caption?: string
  /** Crédito da foto, ex.: "@amirimagens" */
  credit?: string
  creditUrl?: string
}

interface LightboxProps {
  items: LightboxItem[]
  /** Posição da imagem aberta. null = fechado. */
  index: number | null
  onClose: () => void
  onChange: (index: number) => void
}

const roundButton =
  'flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-md transition hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white'

/** Tela cheia para ampliar fotos: setas, teclado (← → Esc) e arrastar o dedo para trocar. */
export default function Lightbox({ items, index, onClose, onChange }: LightboxProps) {
  const open = index !== null
  const startX = useRef<number | null>(null)

  const go = useCallback(
    (step: number) => {
      if (index === null || items.length < 2) return
      onChange((index + step + items.length) % items.length)
    },
    [index, items.length, onChange],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, go, onClose])

  const item = index !== null ? items[index] : null

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          key="lightbox"
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-navy-dark/90 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          onPointerDown={(event) => {
            startX.current = event.clientX
          }}
          onPointerUp={(event) => {
            if (startX.current === null) return
            const distance = event.clientX - startX.current
            startX.current = null
            if (Math.abs(distance) > 60) go(distance < 0 ? 1 : -1)
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className={`${roundButton} absolute right-4 top-4`}
            aria-label="Fechar foto"
          >
            <X size={20} aria-hidden="true" />
          </button>

          {items.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  go(-1)
                }}
                className={`${roundButton} absolute left-3 top-1/2 -translate-y-1/2`}
                aria-label="Foto anterior"
              >
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  go(1)
                }}
                className={`${roundButton} absolute right-3 top-1/2 -translate-y-1/2`}
                aria-label="Próxima foto"
              >
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            </>
          ) : null}

          <motion.img
            key={item.src}
            src={item.src}
            alt={item.alt}
            className="max-h-[78vh] max-w-full rounded-2xl object-contain shadow-2xl"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            draggable={false}
          />
          <div className="mt-4 text-center text-sm text-white/85" onClick={(event) => event.stopPropagation()}>
            {item.caption ? <p className="font-serif italic">{item.caption}</p> : null}
            {item.credit ? (
              <p className="mt-1 text-xs text-white/75">
                Foto:{' '}
                {item.creditUrl ? (
                  <a
                    href={item.creditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-teal underline-offset-4 hover:underline"
                  >
                    {item.credit}
                  </a>
                ) : (
                  <span className="font-medium text-teal">{item.credit}</span>
                )}
              </p>
            ) : null}
            {items.length > 1 ? (
              <p className="mt-1 text-xs text-white/55">
                {(index ?? 0) + 1} de {items.length}
              </p>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
