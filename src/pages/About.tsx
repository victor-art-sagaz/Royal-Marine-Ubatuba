import { CalendarCheck, Clock, MapPin, Sparkles, Target, Wrench } from 'lucide-react'
import Faq from '../components/Faq'
import GlassButton from '../components/GlassButton'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { images } from '../data/site'
import type { Feature } from '../types'

const history: string[] = [
  'Inaugurada em dezembro/17, a Royal Marine está localizada em Ubatuba, no Litoral Norte de São Paulo, possui um espaço de 3.000m² e capacidade para até 80 embarcações, sendo todas as vagas cobertas. Um novo conceito em garagem náutica em Ubatuba.',
  'Com Hall social, vestiários, home-box, Wi-Fi, sistema de alarme e monitoramento online 24hs, sala de rádio e outras novidades que serão implementadas nos próximos meses; tais como: loja de peças e artigos náuticos, conveniência e outros.',
  'Nosso diferencial está no atendimento e sistema de operação.',
]

const openingHours =
  'Abrimos todos os dias da semana, inclusive em horário de almoço, permitindo a maior flexibilidade de utilização e manutenção de sua embarcação.'

const mission =
  'Oferecer para nossos clientes atendimento e sistema de operação diferenciado e de qualidade, para cuidar e realizar manutenção das embarcações, com segurança e através de equipe especializada.'

const highlights: Feature[] = [
  {
    icon: Sparkles,
    title: 'Serviço exclusivo',
    text: 'Para limpeza interna e externa, contamos com outra equipe exclusiva e dedicada somente para esta função. Assim encontramos a excelência na conservação de sua embarcação!',
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
      <PageHero title="SOBRE NÓS" subtitle="Um novo conceito em garagem náutica de Ubatuba!" image={images.ubatubaBaia} />

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
