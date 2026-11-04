import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CalendarDays, Clock, ExternalLink, User, ZoomIn } from 'lucide-react'
import AppScreens from '../components/AppScreens'
import GlassButton from '../components/GlassButton'
import Lightbox from '../components/Lightbox'
import type { LightboxItem } from '../components/Lightbox'
import ReadingProgress from '../components/ReadingProgress'
import Reveal from '../components/Reveal'
import ShareBar from '../components/ShareBar'
import WaveDivider from '../components/WaveDivider'
import YouTubeFacade from '../components/YouTubeFacade'
import { getPost, posts, readingMinutes } from '../data/posts'
import type { BlogPost } from '../types'
import Coming from './Coming'

/** Foto que abre em tela cheia ao tocar. */
function ZoomFigure({ src, alt, caption, onOpen }: { src: string; alt: string; caption?: string; onOpen: () => void }) {
  return (
    <figure>
      <button
        type="button"
        onClick={onOpen}
        className="group relative block w-full overflow-hidden rounded-3xl shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        aria-label={`Ampliar foto: ${alt}`}
      >
        <img src={src} alt={alt} className="w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
        <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-navy/60 text-white opacity-90 backdrop-blur-md transition group-hover:scale-110 group-hover:bg-navy/80">
          <ZoomIn size={18} aria-hidden="true" />
        </span>
      </button>
      {caption ? <figcaption className="mt-2 text-center font-serif text-xs italic text-slate-500">{caption}</figcaption> : null}
    </figure>
  )
}

function PostView({ post }: { post: BlogPost }) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const Icon = post.icon

  const index = posts.findIndex((item) => item.id === post.id)
  const newer = index > 0 ? posts[index - 1] : undefined
  const older = index < posts.length - 1 ? posts[index + 1] : undefined

  // O "cartão de capa" só aparece quando o texto não começa com as telas do aplicativo (que já são a capa)
  const showCover = post.blocks[0]?.type !== 'screens'

  // Todas as fotos da notícia, na ordem, para a tela cheia
  const gallery = useMemo<LightboxItem[]>(() => {
    const list: LightboxItem[] = []
    if (showCover) list.push({ src: post.cover, alt: post.coverAlt })
    for (const block of post.blocks) {
      if (block.type === 'figure') list.push({ src: block.src, alt: block.alt, caption: block.caption })
      if (block.type === 'screens') {
        for (const screen of block.screens) list.push({ src: screen.src, alt: screen.alt, caption: screen.caption })
      }
    }
    return list
  }, [post, showCover])

  const openPhoto = (src: string) => {
    const position = gallery.findIndex((item) => item.src === src)
    if (position >= 0) setLightbox(position)
  }

  return (
    <>
      <ReadingProgress />

      {/* Cabeçalho */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-dark via-navy to-teal-dark px-6 pb-28 pt-24 text-white">
        <Icon
          aria-hidden="true"
          strokeWidth={0.7}
          className="pointer-events-none absolute -bottom-10 -right-10 h-80 w-80 text-white/[0.06]"
        />
        <div className="relative mx-auto max-w-3xl">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md transition hover:-translate-x-0.5 hover:bg-white/20"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Voltar ao blog
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
            <span className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <Icon size={13} aria-hidden="true" /> {post.tag}
            </span>
            <h1 className="mt-4 font-display text-3xl font-light normal-case leading-tight tracking-wide text-white sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 font-serif text-base italic text-teal sm:text-lg">{post.subtitle}</p>
            <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/75">
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
          </motion.div>
        </div>
        <WaveDivider className="absolute inset-x-0 bottom-0 text-white" />
      </section>

      <article className="mx-auto max-w-3xl space-y-8 px-6 pb-8 pt-2">
        {showCover ? (
          <div className="-mt-20 relative z-10">
            <Reveal>
              <ZoomFigure src={post.cover} alt={post.coverAlt} onOpen={() => openPhoto(post.cover)} />
            </Reveal>
          </div>
        ) : null}

        {post.blocks.map((block, i) => {
          switch (block.type) {
            case 'p':
              return (
                <Reveal key={i}>
                  <p className="text-[1.03rem] font-light leading-[1.85]">{block.text}</p>
                </Reveal>
              )
            case 'figure':
              return (
                <Reveal key={i}>
                  <ZoomFigure src={block.src} alt={block.alt} caption={block.caption} onOpen={() => openPhoto(block.src)} />
                </Reveal>
              )
            case 'list':
              return (
                <Reveal key={i}>
                  <h2 className="font-display text-xl font-medium normal-case tracking-wide text-navy">{block.title}</h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {block.items.map((item, n) => {
                      const ItemIcon = item.icon
                      return (
                        <motion.li
                          key={item.label}
                          initial={{ opacity: 0, x: -18 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: '-40px' }}
                          transition={{ duration: 0.5, delay: n * 0.08, ease: 'easeOut' }}
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-teal hover:shadow-lg"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-teal">
                            <ItemIcon size={19} aria-hidden="true" />
                          </span>
                          <span className="text-sm font-medium text-navy">{item.label}</span>
                        </motion.li>
                      )
                    })}
                  </ul>
                </Reveal>
              )
            case 'source':
              return (
                <Reveal key={i}>
                  <p className="text-sm text-slate-600">
                    {block.label}{' '}
                    <a
                      href={block.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-medium text-teal-dark underline underline-offset-4 transition hover:text-navy"
                    >
                      {block.url}
                    </a>
                  </p>
                </Reveal>
              )
            case 'link':
              return (
                <Reveal key={i}>
                  <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-bold italic text-navy">{block.text}</p>
                    <GlassButton href={block.url} external tone="dark" icon={<ExternalLink size={16} aria-hidden="true" />}>
                      {block.label}
                    </GlassButton>
                  </div>
                </Reveal>
              )
            case 'video':
              return (
                <Reveal key={i}>
                  <YouTubeFacade youtubeId={block.youtubeId} title={block.title} credit={block.credit} poster={block.poster} />
                </Reveal>
              )
            case 'screens':
              return (
                <Reveal key={i}>
                  <AppScreens title={block.title} screens={block.screens} onOpen={(n) => openPhoto(block.screens[n].src)} />
                </Reveal>
              )
            case 'partners':
              return (
                <Reveal key={i}>
                  <p className="mb-2 text-center text-xs uppercase tracking-[0.2em] text-slate-500">Parceiros do aplicativo</p>
                  <img src={block.src} alt={block.alt} className="w-full rounded-2xl border border-slate-200" loading="lazy" />
                </Reveal>
              )
            default:
              return null
          }
        })}

        <Reveal>
          <div className="border-t border-slate-200 pt-8">
            <p className="mb-4 font-serif text-sm italic text-teal-dark">Gostou? Compartilhe esta notícia:</p>
            <ShareBar title={post.title} />
          </div>
        </Reveal>
      </article>

      {/* Anterior e próxima notícia */}
      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-3xl gap-4 px-6 sm:grid-cols-2">
          {older ? (
            <Link
              to={`/news/${older.id}`}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" /> Post mais antigo
              </span>
              <span className="mt-2 block font-serif text-base italic leading-snug text-teal-dark">{older.title}</span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          {newer ? (
            <Link
              to={`/news/${newer.id}`}
              className="group rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:col-start-2"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                Post mais novo <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
              <span className="mt-2 block font-serif text-base italic leading-snug text-teal-dark">{newer.title}</span>
            </Link>
          ) : null}
        </div>
        <div className="mt-8 text-center">
          <GlassButton to="/news" tone="dark">
            Ver todas as notícias
          </GlassButton>
        </div>
      </section>

      <Lightbox items={gallery} index={lightbox} onClose={() => setLightbox(null)} onChange={setLightbox} />
    </>
  )
}

export default function NewsPost() {
  const { id } = useParams()
  const post = id ? getPost(id) : undefined
  if (!post) return <Coming title="NOTÍCIA NÃO ENCONTRADA" subtitle="Essa notícia não existe ou mudou de endereço." />
  return <PostView key={post.id} post={post} />
}
