import { Link } from 'react-router-dom'
import {
  Apple,
  Check,
  CloudSun,
  CupSoda,
  Droplets,
  Glasses,
  LifeBuoy,
  MessageCircle,
  Shirt,
  Snowflake,
  Sun,
  Waves,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import GlassButton from '../components/GlassButton'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { contact } from '../data/site'
import { whatsappUrl } from '../lib/whatsapp'

interface CareTopic {
  id: string
  icon: LucideIcon
  kicker: string
  title: string
  text: string
  bullets: string[]
  image: string
  imageAlt: string
}

/** Para mudar um texto ou uma foto desta página, edite aqui. */
const topics: CareTopic[] = [
  {
    id: 'inverno',
    icon: Snowflake,
    kicker: 'Cuidados com a embarcação no inverno',
    title: 'Parada também precisa de atenção',
    text: 'No inverno a embarcação costuma passar mais tempo parada. É nessa época que pequenos cuidados evitam surpresas quando a temporada voltar.',
    bullets: [
      'Coloque o equipamento para funcionar com frequência, mesmo sem sair para navegar.',
      'Mantenha a embarcação em local coberto e protegido.',
      'Faça uma revisão geral antes da primeira saída da temporada.',
    ],
    image: '/images/cuidados/conves.jpg',
    imageAlt: 'Convés de uma lancha com estofados claros, de frente para o mar',
  },
  {
    id: 'oleo',
    icon: Droplets,
    kicker: 'Óleo e combustível',
    title: 'O motor agradece',
    text: 'Use sempre o óleo recomendado pelo fabricante, abasteça com combustível de boa qualidade e coloque o equipamento para funcionar frequentemente.',
    bullets: [
      'Óleo: siga o tipo e o prazo de troca do manual do motor.',
      'Combustível: prefira postos de confiança.',
      'Funcionamento: ligar o motor com frequência ajuda a conservar o sistema.',
    ],
    image: '/images/cuidados/oleo.jpg',
    imageAlt: 'Galão de óleo em um píer com o mar ao fundo',
  },
  {
    id: 'eletrica',
    icon: Zap,
    kicker: 'Parte elétrica e casco',
    title: 'Confira antes de sair',
    text: 'Faça uma checagem completa da parte elétrica e dos itens do casco antes de navegar.',
    bullets: [
      'Luzes de navegação',
      'Bombas',
      'Válvulas do fundo do casco',
      'Mangueiras e abraçadeiras',
      'Respiros do tanque de combustível',
    ],
    image: '/images/cuidados/parte-eletrica.jpg',
    imageAlt: 'Compartimento elétrico de uma embarcação com bateria e módulos',
  },
  {
    id: 'seguranca',
    icon: LifeBuoy,
    kicker: 'Segurança',
    title: 'Navegar tranquilo começa em terra',
    text: 'Seja você o proprietário que conduz a própria embarcação ou o marinheiro particular contratado, a segurança de todos a bordo depende do planejamento.',
    bullets: [
      'Consulte a previsão do tempo e a tábua de maré antes de sair.',
      'Tenha coletes salva-vidas para todas as pessoas a bordo.',
      'Leve a documentação da embarcação e a habilitação em dia.',
      'Avise alguém em terra sobre o roteiro e o horário de volta.',
    ],
    image: '/images/cuidados/timao-seguranca.jpg',
    imageAlt: 'Timão de madeira e painel de uma embarcação, com a praia ao fundo',
  },
]

const checklist: { icon: LucideIcon; title: string; detail: string }[] = [
  { icon: Apple, title: 'Comidas', detail: 'Barras de proteína, salgadinhos e frutas' },
  { icon: CupSoda, title: 'Bebidas', detail: 'Água, suco e refrigerante' },
  { icon: Snowflake, title: 'Gelo potável', detail: 'E roupas para mergulhar' },
  { icon: Shirt, title: 'Roupas secas', detail: 'Para usar depois de se secar, e uma blusa leve corta-vento' },
  { icon: Glasses, title: 'Óculos de sol', detail: 'Boné ou viseira e toalha' },
  { icon: Sun, title: 'Protetor solar', detail: 'E lenços de papel' },
]

export default function BoatCare() {
  const quoteUrl = whatsappUrl(
    contact.quotePhone.whatsappNumber,
    'Olá! Vim pelo site da Royal Marine e gostaria de falar com a equipe sobre cuidados com a minha embarcação.',
  )

  return (
    <>
      <PageHero
        title="CUIDADOS A BORDO"
        subtitle="Dicas para marinheiros particulares e proprietários que conduzem a própria embarcação"
        image="/images/cuidados/iate-inverno.jpg"
      />

      {/* Introdução */}
      <section className="mx-auto max-w-3xl px-6 pt-16 text-center" aria-labelledby="cuidados-titulo">
        <Reveal>
          <p className="font-serif text-sm italic text-teal-dark">Quem cuida, navega mais</p>
          <h2 id="cuidados-titulo" className="mt-2 font-display text-3xl font-light sm:text-4xl">
            Sua embarcação sempre pronta
          </h2>
          <div className="mx-auto my-5 h-0.5 w-10 bg-teal" />
          <p className="font-light leading-relaxed">
            Reunimos os cuidados mais importantes para quem leva a embarcação para o mar: o marinheiro particular contratado
            pelo proprietário ou o próprio dono que conduz. São atitudes simples que garantem passeios mais seguros e uma
            embarcação conservada por mais tempo.
          </p>
        </Reveal>
      </section>

      {/* Tópicos com foto */}
      <div className="mx-auto max-w-6xl space-y-16 px-6 py-16">
        {topics.map((topic, i) => {
          const Icon = topic.icon
          const reverse = i % 2 === 1
          return (
            <section
              key={topic.id}
              id={topic.id}
              aria-labelledby={`cuidado-${topic.id}`}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-12"
            >
              <Reveal className={reverse ? 'md:order-2' : ''}>
                <figure className="overflow-hidden rounded-3xl shadow-xl">
                  <img
                    src={topic.image}
                    alt={topic.imageAlt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-105"
                  />
                </figure>
              </Reveal>
              <Reveal delay={0.1} className={reverse ? 'md:order-1' : ''}>
                <p className="flex items-center gap-2 font-serif text-sm italic text-teal-dark">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-teal">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  {topic.kicker}
                </p>
                <h3 id={`cuidado-${topic.id}`} className="mt-3 font-display text-2xl font-light tracking-wide text-navy sm:text-3xl">
                  {topic.title}
                </h3>
                <div className="my-4 h-0.5 w-10 bg-[#e2bd45]" />
                <p className="font-light leading-relaxed">{topic.text}</p>
                <ul className="mt-4 space-y-2.5">
                  {topic.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/20 text-teal-dark">
                        <Check size={12} aria-hidden="true" />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                {topic.id === 'seguranca' ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/newpage"
                      className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm text-white transition hover:bg-navy-dark"
                    >
                      <CloudSun size={16} aria-hidden="true" /> Previsão do Tempo
                    </Link>
                    <Link
                      to="/tabua-de-mare"
                      className="inline-flex items-center gap-2 rounded-full border border-navy px-4 py-2 text-sm text-navy transition hover:bg-navy hover:text-white"
                    >
                      <Waves size={16} aria-hidden="true" /> Tábua de Maré
                    </Link>
                  </div>
                ) : null}
              </Reveal>
            </section>
          )
        })}
      </div>

      {/* O que levar a bordo */}
      <section className="bg-slate-50 py-20" aria-labelledby="levar-titulo">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mb-10 text-center">
            <p className="font-serif text-sm italic text-teal-dark">Para o passeio ser completo</p>
            <h2 id="levar-titulo" className="mt-2 font-display text-3xl font-light sm:text-4xl">
              O que levar a bordo
            </h2>
            <div className="mx-auto mt-5 h-0.5 w-10 bg-teal" />
          </Reveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {checklist.map(({ icon: Icon, title, detail }, i) => (
              <li key={title}>
                <Reveal delay={(i % 3) * 0.08} className="h-full">
                  <div className="flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-[#e2bd45]">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-display text-lg tracking-wide text-navy">{title}</p>
                      <p className="text-sm font-light">{detail}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Equipe especializada */}
      <section className="relative isolate overflow-hidden py-24 text-center text-white" aria-labelledby="equipe-titulo">
        <img
          src="/images/cuidados/marina-equipe.jpg"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-dark/70 via-navy/80 to-navy-dark/95" />
        <Reveal className="mx-auto max-w-3xl px-6">
          <p className="font-light text-white/90">Tenha sempre a garantia de que a nossa equipe é</p>
          <h2 id="equipe-titulo" className="mt-2 font-display text-4xl font-light tracking-wide text-[#f3d97a] sm:text-5xl">
            100% especializada
          </h2>
          <p className="mt-2 font-light text-white/90">em todas as áreas em que atua!</p>
          <p className="mt-6 font-serif italic text-teal">Aqui na Royal Marine você garante a segurança da sua conquista.</p>
          <div className="mt-8 flex justify-center">
            <GlassButton href={quoteUrl} external tone="gold" icon={<MessageCircle size={18} />}>
              Fale com a nossa equipe
            </GlassButton>
          </div>
        </Reveal>
      </section>
    </>
  )
}
