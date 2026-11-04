import { useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CalendarDays, Clock, User } from 'lucide-react'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { posts, readingMinutes } from '../data/posts'
import { images } from '../data/site'
import type { BlogPost } from '../types'

const ALL = 'Todas'

/** Cartão que inclina de leve conforme o mouse passa por cima. */
function PostCard({ post }: { post: BlogPost }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const Icon = post.icon

  function onMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`
  }

  function onLeave() {
    if (cardRef.current) cardRef.current.style.transform = ''
  }

  return (
    <div
      ref={cardRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="h-full transition-transform duration-300 ease-out will-change-transform"
    >
      <Link
        to={`/news/${post.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-navy-dark via-navy to-teal-dark">
          <img
            src={post.cover}
            alt={post.coverAlt}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-navy/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            <Icon size={13} aria-hidden="true" /> {post.tag}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-serif text-lg font-normal normal-case italic leading-snug tracking-normal text-teal-dark transition-colors group-hover:text-navy sm:text-xl">
            {post.title}
          </h3>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <User size={13} aria-hidden="true" /> {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} aria-hidden="true" /> {post.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} aria-hidden="true" /> {readingMinutes(post)} min de leitura
            </span>
          </p>
          <p className="mt-4 flex-1 text-sm font-light leading-relaxed">{post.excerpt}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-navy">
            Ler notícia
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </div>
  )
}

export default function News() {
  const [filter, setFilter] = useState(ALL)
  const tags = useMemo(() => [ALL, ...Array.from(new Set(posts.map((post) => post.tag)))], [])
  const visible = filter === ALL ? posts : posts.filter((post) => post.tag === filter)

  return (
    <>
      <PageHero title="NOVIDADES" subtitle="Novo conceito em garagem náutica de Ubatuba!" image={images.ubatubaPraia} />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mb-8">
          <h2 className="font-display text-3xl font-light normal-case sm:text-4xl">
            Fique atualizado sobre tudo que acontece no mundo náutico!
          </h2>
          <div className="mt-5 h-0.5 w-10 bg-teal" />
        </Reveal>

        {/* Filtro por assunto */}
        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filtrar notícias por assunto">
          {tags.map((tag) => {
            const selected = filter === tag
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setFilter(tag)}
                aria-pressed={selected}
                className="group relative rounded-full px-5 py-2 text-sm font-medium"
              >
                {selected ? (
                  <motion.span
                    layoutId="news-filter-pill"
                    className="absolute inset-0 rounded-full border border-navy/30 bg-navy shadow-[0_0_15px_rgba(20,40,75,0.3)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : (
                  <span className="absolute inset-0 rounded-full border border-slate-200 bg-white transition-colors group-hover:bg-slate-100" />
                )}
                <span className={`relative z-10 transition-colors ${selected ? 'text-white' : 'text-navy'}`}>{tag}</span>
              </button>
            )
          })}
        </div>

        <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </>
  )
}
