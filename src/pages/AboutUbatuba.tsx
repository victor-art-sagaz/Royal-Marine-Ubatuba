import { useState } from 'react'
import { ExternalLink, Mountain, Trees, Waves, ZoomIn } from 'lucide-react'
import CountUp from '../components/CountUp'
import GlassButton from '../components/GlassButton'
import Lightbox from '../components/Lightbox'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import SeaCreatures from '../components/SeaCreatures'
import WaveDivider from '../components/WaveDivider'
import { images } from '../data/site'
import { ubatubaHistoryTitle, ubatubaIntro, ubatubaMoreUrl, ubatubaTimeline } from '../data/ubatuba'

interface GalleryPhoto {
  src: string
  alt: string
  /** Em qual das 3 colunas a foto fica (0 = esquerda, 1 = meio, 2 = direita) */
  column: 0 | 1 | 2
  caption?: string
  credit?: string
  creditUrl?: string
  /** Se o arquivo da foto ainda não existir, a foto simplesmente não aparece. */
  optional?: boolean
}

/**
 * As fotos já estão distribuídas nas colunas de modo que as três terminem com quase a mesma altura.
 * Dentro de cada coluna, a ordem é de cima para baixo.
 */
const gallery: GalleryPhoto[] = [
  { column: 0, src: images.ubatubaGaivotas, alt: 'Gaivotas na areia, com o mar e o morro ao fundo' },
  { column: 0, src: images.ubatubaSurf, alt: 'Surfista dentro do tubo de uma onda, com a Mata Atlântica ao fundo' },
  { column: 0, src: images.ubatubaPlaca, alt: 'Letreiro colorido "Eu amo Ubatuba" à beira-mar' },
  { column: 1, src: images.ubatubaCantinho, alt: 'Pequena praia de águas verdes entre pedras e Mata Atlântica' },
  { column: 1, src: images.ubatubaCaverna, alt: 'Vista do mar e da praia a partir de uma gruta de pedra' },
  { column: 2, src: images.ubatubaPraia, alt: 'Ondas e rocha na areia de uma praia de Ubatuba' },
  {
    column: 2,
    src: images.ubatubaBaleia,
    alt: 'Esqueleto de baleia-jubarte exposto em Ubatuba',
    caption: 'Esqueleto de baleia-jubarte em Ubatuba',
    credit: '@amirimagens',
    creditUrl: 'https://www.instagram.com/amirimagens',
    optional: true,
  },
]

export default function AboutUbatuba() {
  const [missing, setMissing] = useState<string[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const visible = gallery.filter((photo) => !missing.includes(photo.src))
  const columns = [0, 1, 2].map((column) => visible.filter((photo) => photo.column === column))
  // Ordem das fotos na tela cheia: coluna da esquerda, do meio e da direita, de cima para baixo
  const ordered = columns.flat()

  return (
    <>
      <PageHero title="SOBRE UBATUBA" subtitle="Um pouquinho mais sobre Ubatuba para você…" image={images.ubatubaBaia} />

      {/* Introdução */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <Reveal>
          <img
            src={images.ubatubaBaia}
            alt="Baía de Ubatuba cercada de montanhas cobertas de Mata Atlântica"
            className="w-full rounded-3xl object-cover shadow-2xl"
            loading="lazy"
          />
        </Reveal>
        <Reveal delay={0.15}>
          <h2 className="font-serif text-2xl font-normal normal-case italic tracking-normal text-navy sm:text-3xl">
            Um pouquinho mais sobre Ubatuba para você…
          </h2>
          <div className="my-5 h-0.5 w-10 bg-teal" />
          {ubatubaIntro.map((p) => (
            <p key={p} className="mb-4 font-light leading-relaxed">
              {p}
            </p>
          ))}
        </Reveal>
      </section>

      {/* Mar: números e fotos, com tartarugas e baleias nadando ao fundo */}
      <section className="deep-sea relative isolate overflow-hidden pb-28 pt-24 text-white">
        <SeaCreatures />
        <WaveDivider rider="none" className="absolute inset-x-0 top-0 z-[1] rotate-180 text-white" />

        <div className="relative z-[2]">
          <div className="mx-auto grid max-w-4xl gap-6 px-6 text-center sm:grid-cols-3">
            <Reveal>
              <Waves className="mx-auto mb-2 text-teal" size={28} />
              <div className="font-display text-5xl font-light text-white">
                <CountUp to={102} />
              </div>
              <div className="mx-auto my-3 h-0.5 w-8 bg-teal" />
              <p className="font-serif text-sm italic text-teal">praias</p>
            </Reveal>
            <Reveal delay={0.1}>
              <Mountain className="mx-auto mb-2 text-teal" size={28} />
              <div className="font-display text-5xl font-light text-white">
                +<CountUp to={20} />
              </div>
              <div className="mx-auto my-3 h-0.5 w-8 bg-teal" />
              <p className="font-serif text-sm italic text-teal">ilhas</p>
            </Reveal>
            <Reveal delay={0.2}>
              <Trees className="mx-auto mb-2 text-teal" size={28} />
              <div className="font-display text-3xl font-light leading-[3.75rem] text-white">Mata Atlântica</div>
              <div className="mx-auto my-3 h-0.5 w-8 bg-teal" />
              <p className="font-serif text-sm italic text-teal">intocada em grande parte do território</p>
            </Reveal>
          </div>

          {/* Galeria */}
          <div className="mx-auto mt-16 max-w-6xl px-6">
            <div className="grid items-start gap-4 md:grid-cols-3">
              {columns.map((photos, column) => (
                <div key={column} className="flex flex-col gap-4">
                  {photos.map((photo, row) => (
                    <Reveal key={photo.src} delay={(column + row) * 0.08}>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(ordered.indexOf(photo))}
                        className="group relative block w-full overflow-hidden rounded-3xl border-4 border-white/90 bg-navy-dark shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                        aria-label={`Ampliar foto: ${photo.alt}`}
                      >
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="block h-auto w-full transition duration-700 group-hover:scale-105"
                          loading="lazy"
                          onError={() => {
                            if (photo.optional) setMissing((list) => [...list, photo.src])
                          }}
                        />
                        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-navy-dark/50 text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                          <ZoomIn size={18} aria-hidden="true" />
                        </span>
                        {photo.credit ? (
                          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-dark/85 to-transparent px-4 pb-3 pt-8 text-left text-xs text-white/90">
                            Foto: <span className="font-medium text-teal">{photo.credit}</span>
                          </span>
                        ) : null}
                      </button>
                    </Reveal>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <WaveDivider className="absolute inset-x-0 bottom-0 z-[1] text-slate-50" />
      </section>

      <Lightbox
        items={ordered.map((photo) => ({
          src: photo.src,
          alt: photo.alt,
          caption: photo.caption,
          credit: photo.credit,
          creditUrl: photo.creditUrl,
        }))}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />

      {/* História */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="mb-12">
            <h2 className="font-serif text-2xl font-normal normal-case italic leading-snug tracking-normal text-navy sm:text-3xl">
              {ubatubaHistoryTitle}
            </h2>
            <div className="mt-5 h-0.5 w-10 bg-teal" />
          </Reveal>

          <ol className="relative border-l-2 border-teal/50 pl-8">
            {ubatubaTimeline.map((item, i) => (
              <li key={item.label} className="relative pb-10 last:pb-0">
                <span className="absolute -left-[2.6rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-teal bg-white">
                  <span className="h-2 w-2 rounded-full bg-navy" />
                </span>
                <Reveal delay={(i % 3) * 0.05}>
                  <h3 className="font-display text-lg tracking-wide text-navy">{item.label}</h3>
                  <p className="mt-2 font-light leading-relaxed">{item.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Saiba mais */}
      <section className="relative overflow-hidden py-16 text-center text-white">
        <img
          src={images.ubatubaOndas}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-navy-dark/80" />
        <Reveal className="relative px-6">
          <p className="font-serif text-sm italic text-teal">Conheça mais da história em</p>
          <div className="mt-5">
            <GlassButton href={ubatubaMoreUrl} external icon={<ExternalLink size={16} />}>
              ubatuba.sp.gov.br/a-cidade
            </GlassButton>
          </div>
        </Reveal>
      </section>
    </>
  )
}
