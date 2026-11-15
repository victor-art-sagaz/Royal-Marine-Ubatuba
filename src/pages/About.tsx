import { CalendarCheck, CalendarHeart, Clock, LifeBuoy, MapPin, Sparkles, Target, UtensilsCrossed, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Faq from '../components/Faq'
import GlassButton from '../components/GlassButton'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import StructureGallery from '../components/StructureGallery'
import { images } from '../data/site'
import type { Feature } from '../types'

const history: string[] = [
  'Inaugurada em dezembro/17, a Royal Marine está localizada em Ubatuba, no Litoral Norte de São Paulo, possui um espaço de 10.000m² e capacidade para até 150 embarcações, sendo todas as vagas cobertas. O lugar mais seguro para a sua embarcação em Ubatuba.',
  'Com Hall social, vestiários, home-box, Wi-Fi, sistema de alarme e monitoramento 24hs, 8 poitas próximas ao canal do Saco da Ribeira, prestação de serviços naval/marítimo (tapeceiro, mecânico, eletricista, serralheiro inox), estética náutica com a parceira WashBoat e despachante náutico, tudo dentro da própria marina.',
  'Nosso diferencial está no atendimento e sistema de operação.',
]

const openingHours =
  'Abrimos todos os dias da semana, inclusive em horário de almoço, permitindo a maior flexibilidade de utilização e manutenção de sua embarcação.'

/** Detalhes exclusivos da Royal Marine */
const exclusives: { icon: LucideIcon; text: string }[] = [
  { icon: LifeBuoy, text: 'Atendimento pré e pós passeio' },
  { icon: UtensilsCrossed, text: 'Não fechamos para o almoço' },
  { icon: CalendarHeart, text: 'Atendimento exclusivo nos feriados' },
]

const mission =
  'Oferecer para nossos clientes atendimento e sistema de operação diferenciado e de qualidade, para cuidar e realizar manutenção das embarcações, com segurança e através de equipe especializada.'

const highlights: Feature[] = [
  {
    icon: Sparkles,
    title: 'Estética náutica',
    text: 'Nos nossos planos, você tem acesso à limpeza e à estética da sua embarcação com a WashBoat, empresa parceira que atende dentro da própria marina. Mais praticidade e excelência na conservação da sua embarcação!',
  },
  {
    icon: MapPin,
    title: 'Localização',
    text: 'Nossa garagem náutica fica localizada em Ubatuba, no Litoral Norte de São Paulo.',
  },
  {
    icon: Wrench,
    title: 'Equipe técnica',
    text: 'Disponibilizamos uma equipe 100% técnica que será responsável por funcionamento e análise das embarcações. Além disso, cada embarcação possui uma ficha exclusiva para registro de funcionamento e avaliação técnica, que mostrará data, horário, tempo decorrido e descrição de ocorrências encontradas.',
  },
]

export default function About() {
  return (
    <>
      <PageHero title="SOBRE NÓS" subtitle="O lugar mais seguro para a sua embarcação em Ubatuba!" image={images.ubatubaBaia} />

      {/* Nossa história */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <Reveal>
          <p className="font-serif text-sm italic text-teal-dark">Desde dezembro de 2017</p>
          <h2 className="mt-2 font-display text-3xl font-light sm:text-4xl">Nossa história</h2>
          <div className="my-5 h-0.5 w-10 bg-teal" />
          {history.map((p) => (
            <p key={p} className="mb-4 font-light leading-relaxed">
              {p}
            </p>
          ))}
          <div className="mt-6 flex gap-4 rounded-2xl border border-teal/40 bg-teal/10 p-5">
            <Clock className="mt-0.5 shrink-0 text-teal-dark" size={24} />
            <p className="font-light leading-relaxed text-navy">{openingHours}</p>
          </div>
          <h3 className="mt-8 font-serif text-sm italic text-teal-dark">Exclusivo da Royal Marine</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {exclusives.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-navy shadow-sm sm:flex-col sm:text-center"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-teal">
                  <Icon size={20} aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-teal/30 to-navy/20 blur-xl" aria-hidden="true" />
            <img
              src={images.galpaoFachada}
              alt="Estrutura em arco da Royal Marine com embarcações guardadas"
              className="relative w-full rounded-3xl object-cover shadow-2xl"
              loading="lazy"
            />
          </div>
        </Reveal>
      </section>

      {/* Nossa missão */}
      <section className="relative overflow-hidden py-20 text-center text-white">
        <img
          src={images.ubatubaOndas}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/90 to-navy/85" />
        <Reveal className="relative mx-auto max-w-3xl px-6">
          <Target className="mx-auto mb-4 text-teal" size={36} />
          <h2 className="font-display text-3xl font-light tracking-wide text-white sm:text-4xl">Nossa missão</h2>
          <div className="mx-auto my-5 h-0.5 w-10 bg-teal" />
          <p className="font-serif text-lg font-light italic leading-relaxed text-white/95 sm:text-xl">“{mission}”</p>
        </Reveal>
      </section>

      {/* Diferenciais */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
          {highlights.map((h, i) => {
            const Icon = h.icon
            return (
              <Reveal key={h.title} delay={i * 0.12}>
                <div className="h-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-teal">
                    <Icon size={26} />
                  </div>
                  <h3 className="font-display text-xl tracking-wide text-navy">{h.title}</h3>
                  <p className="mt-3 text-sm font-light leading-relaxed">{h.text}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Fotos da garagem (aparece quando houver 3 fotos ou mais em src/data/gallery.ts) */}
      <StructureGallery />

      {/* Perguntas frequentes */}
      <Faq />

      {/* Chamada */}
      <section className="relative overflow-hidden py-16 text-center text-white">
        <img
          src={images.ubatubaEnseada}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-navy-dark/75" />
        <Reveal className="relative px-6">
          <h2 className="font-display text-3xl font-light tracking-wide text-white">Venha conhecer a Royal Marine</h2>
          <div className="mt-8">
            <GlassButton to="/contact" icon={<CalendarCheck size={18} />}>
              Agende uma visita
            </GlassButton>
          </div>
        </Reveal>
      </section>
    </>
  )
}
