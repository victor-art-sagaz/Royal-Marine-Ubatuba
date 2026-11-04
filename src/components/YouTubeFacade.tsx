import { useState } from 'react'
import { ExternalLink, Play } from 'lucide-react'

interface YouTubeFacadeProps {
  youtubeId: string
  title: string
  credit: string
  /** Imagem usada se a capa do YouTube não carregar. */
  poster: string
}

/**
 * Vídeo do YouTube "sob demanda": mostra a capa e só carrega o player quando a pessoa
 * toca em assistir. Deixa a página mais leve e rápida.
 */
export default function YouTubeFacade({ youtubeId, title, credit, poster }: YouTubeFacadeProps) {
  const [playing, setPlaying] = useState(false)
  const [cover, setCover] = useState(`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`)
  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`

  return (
    <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-navy-dark shadow-xl">
      <div className="relative aspect-video w-full">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 block h-full w-full text-left"
            aria-label={`Assistir ao vídeo: ${title}`}
          >
            <img
              src={cover}
              alt=""
              aria-hidden="true"
              onError={() => setCover(poster)}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-gradient-to-b from-navy-dark/70 via-navy-dark/10 to-navy-dark/70" />
            <span className="absolute inset-x-0 top-0 p-4 sm:p-5">
              <span className="block text-sm font-bold leading-snug text-white sm:text-base">{title}</span>
              <span className="mt-0.5 block text-xs text-white/75">{credit}</span>
            </span>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-gold/50 group-hover:shadow-[0_0_28px_rgba(201,162,39,0.6)]">
                <Play size={32} className="ml-1" fill="currentColor" aria-hidden="true" />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 bg-navy px-4 py-3 text-xs text-white/80">
        <span>Vídeo: {credit}</span>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-white underline-offset-4 hover:underline"
        >
          Assista no YouTube <ExternalLink size={12} aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  )
}
