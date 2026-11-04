import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink, Quote, Star } from 'lucide-react'
import { googleReviewsUrl, reviewSummary, reviews } from '../data/reviews'
import { images } from '../data/site'
import GlassButton from './GlassButton'

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 70, scale: 0.98 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -70, scale: 0.98 }),
}

const avatarColors = ['bg-rose-500', 'bg-purple-500', 'bg-sky-600', 'bg-emerald-600', 'bg-amber-600', 'bg-slate-500']

function Stars({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-white/30'}
        />
      ))}
    </div>
  )
}

export default function GoogleReviews() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const total = reviews.length

  const go = useCallback(
    (step: number) => {
      setDirection(step)
      setIndex((i) => (i + step + total) % total)
    },
    [total],
  )

  // Troca sozinho a cada 6,5 segundos (para quando o mouse está em cima)
  useEffect(() => {
    if (paused || total < 2 || reduce) return
    const timer = setInterval(() => go(1), 6500)
    return () => clearInterval(timer)
  }, [paused, total, reduce, go])

  if (total === 0) return null
  const review = reviews[index]
  const initial = review.author.trim().charAt(0).toUpperCase()
  const avatarColor = avatarColors[review.author.length % avatarColors.length]

  return (
    <section className="relative overflow-hidden py-20 text-white">
      <img
        src={images.ubatubaBaia}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/90 via-navy/85 to-navy-dark/95" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <p className="font-serif text-sm italic text-teal">O que dizem nossos clientes</p>
        <h2 className="mt-2 font-display text-3xl font-light tracking-wide text-white sm:text-4xl">
          Avaliações no Google
        </h2>
        <div className="mx-auto my-5 h-0.5 w-10 bg-teal" />

        {/* Resumo do Google */}
        <div className="mx-auto inline-flex items-center gap-4 rounded-full border border-white/15 bg-white/10 px-6 py-3 backdrop-blur-md">
          <span className="font-display text-4xl font-light text-white">
            {reviewSummary.score.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}
          </span>
          <div className="text-left">
            <Stars rating={reviewSummary.score} size={18} />
            <p className="mt-0.5 text-xs text-white/70">
              {reviewSummary.count} avaliações · Royal Marine garagem náutica
            </p>
          </div>
        </div>

        <div
          className="relative mt-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="relative min-h-[260px] sm:min-h-[240px]" aria-live="polite">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.article
                key={review.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduce ? 0 : 0.45, ease: 'easeOut' }}
                className="rounded-3xl border border-white/15 bg-white/10 p-8 text-left shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md sm:p-10"
              >
                <Quote className="mb-4 text-teal" size={34} />
                <p className="font-serif text-lg font-light italic leading-relaxed text-white/95 sm:text-2xl">
                  “{review.text}”
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-medium text-white ${avatarColor}`}
                      aria-hidden="true"
                    >
                      {initial}
                    </div>
                    <div>
                      <p className="font-display text-lg tracking-wider text-white">{review.author}</p>
                      {review.authorInfo ? <p className="text-xs text-white/60">{review.authorInfo}</p> : null}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Stars rating={review.rating} />
                    <p className="text-xs text-white/60">Avaliação no Google</p>
                    {review.isSample ? (
                      <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-0.5 text-[10px] font-medium uppercase tracking-widest text-amber-200">
                        Modelo
                      </span>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {total > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Avaliação anterior"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.25)]"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                {reviews.map((r, i) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setDirection(i > index ? 1 : -1)
                      setIndex(i)
                    }}
                    aria-label={`Ir para a avaliação ${i + 1}`}
                    aria-current={i === index}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === index ? 'w-8 bg-teal' : 'w-2.5 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Próxima avaliação"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.25)]"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ) : null}
        </div>

        {googleReviewsUrl ? (
          <div className="mt-8">
            <GlassButton href={googleReviewsUrl} external icon={<ExternalLink size={16} />}>
              Ver todas no Google
            </GlassButton>
          </div>
        ) : null}
      </div>
    </section>
  )
}
