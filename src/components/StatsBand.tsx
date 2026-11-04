import { Anchor, Clock, Ship, Users, Warehouse } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { images, stats } from '../data/site'
import CountUp from './CountUp'
import Reveal from './Reveal'

const statIcons: LucideIcon[] = [Warehouse, Anchor, Users, Clock]

export default function StatsBand() {
  return (
    <section className="relative overflow-hidden py-20 text-white">
      <img
        src={images.ubatubaEnseada}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/85 via-navy/75 to-navy-dark/90" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mb-12 text-center">
          <Ship className="mx-auto mb-3 text-teal" size={30} />
          <h2 className="font-display text-3xl font-light tracking-wide text-white sm:text-4xl">
            Estrutura pensada para a sua embarcação
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {stats.map((s, i) => {
            const Icon = statIcons[i] ?? Anchor
            return (
              <Reveal key={s.label} delay={i * 0.1}>
                <div className="h-full rounded-3xl border border-white/15 bg-white/10 p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/15">
                  <Icon className="mx-auto mb-3 text-teal" size={26} />
                  <div className="font-display text-4xl font-light text-white sm:text-5xl">
                    <CountUp to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mx-auto my-3 h-0.5 w-8 bg-teal" />
                  <div className="font-serif text-xs italic text-teal sm:text-sm">{s.label}</div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
