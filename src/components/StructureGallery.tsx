import { useState } from 'react'
import { Warehouse } from 'lucide-react'
import Lightbox from './Lightbox'
import Reveal from './Reveal'
import { structurePhotos } from '../data/gallery'

/** Minimo de fotos para a seção aparecer. */
const MIN_PHOTOS = 3

/** Galeria da estrutura coberta. Clicou na foto, abre em tela cheia. */
export default function StructureGallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (structurePhotos.length < MIN_PHOTOS) return null

  return (
    <section className="bg-white py-20" aria-labelledby="galeria-titulo">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-10 text-center">
          <p className="font-serif text-sm italic text-teal-dark">Mais de 3.000 m² de vagas cobertas</p>
          <h2 id="galeria-titulo" className="mt-2 font-display text-3xl font-light sm:text-4xl">
            Conheça a estrutura
          </h2>
          <div className="mx-auto mt-5 h-0.5 w-10 bg-teal" />
        </Reveal>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {structurePhotos.map((photo, i) => (
            <li key={photo.src} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
              <Reveal delay={Math.min(i, 5) * 0.05} className="h-full">
                <figure className="group relative h-full overflow-hidden rounded-2xl shadow-md">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    aria-label={`Ampliar foto: ${photo.alt}`}
                    className="block h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      className="h-full min-h-[10rem] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </button>
                  {photo.caption ? (
                    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-navy-dark/85 to-transparent px-4 pb-3 pt-8 text-sm text-white">
                      <Warehouse size={16} className="shrink-0 text-teal" aria-hidden="true" />
                      {photo.caption}
                    </figcaption>
                  ) : null}
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>

      <Lightbox
        items={structurePhotos.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption }))}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />
    </section>
  )
}
