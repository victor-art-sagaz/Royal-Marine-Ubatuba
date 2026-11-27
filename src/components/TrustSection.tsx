import { Anchor, BadgeCheck, CalendarCheck, Gift, MessageCircle, ShieldCheck, Smartphone, Star, Users, Wrench } from 'lucide-react'
import { reviewSummary } from '../data/reviews'
import GlassButton from './GlassButton'
import Reveal from './Reveal'

const reasons = [
  {
    icon: Star,
    title: `Nota ${reviewSummary.score.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} no Google`,
    text: 'Quem guarda a embarcação com a gente aprova. As avaliações são públicas: confira e tire suas conclusões.',
  },
  {
    icon: Anchor,
    title: 'No Saco da Ribeira desde 2017',
    text: 'Garagem náutica própria, com recepção na Rua Marginal e garagem na Rua Codó, no coração náutico de Ubatuba.',
  },
  {
    icon: ShieldCheck,
    title: 'Segurança de verdade',
    text: 'Sistema de alarme e monitoramento 24h: a sua embarcação protegida enquanto você não está.',
  },
  {
    icon: Users,
    title: 'Equipe própria',
    text: '12 consultores que conhecem o mar de Ubatuba e acompanham cada embarcação de perto.',
  },
  {
    icon: Wrench,
    title: 'Tudo dentro da marina',
    text: 'Serviços naval e marítimo, despachante náutico e a estética da parceira WashBoat, sem sair daqui.',
  },
  {
    icon: Smartphone,
    title: 'Sempre investindo',
    text: 'Site novo e app grátis de maré e previsão do tempo, feitos para quem navega em Ubatuba.',
  },
]

const promises = [
  'Atendimento direto pelo WhatsApp, com gente de verdade',
  'Visita sem compromisso: venha conhecer a estrutura',
  'Fotos reais da nossa garagem, sem truques',
]

/** Seção "Por que confiar na Royal Marine" (Página Inicial). */
export default function TrustSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="confianca-titulo">
      <Reveal className="mb-12 text-center">
        <p className="font-serif text-sm italic text-teal-dark">Transparência em primeiro lugar</p>
        <h2 id="confianca-titulo" className="mt-2 font-display text-3xl font-light sm:text-4xl">
          Por que confiar na Royal Marine
        </h2>
        <div className="mx-auto mt-5 h-0.5 w-10 bg-teal" />
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((reason, i) => {
          const Icon = reason.icon
          return (
            <Reveal key={reason.title} delay={(i % 3) * 0.1}>
              <div className="flex h-full gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-teal">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-xl tracking-wide text-navy">{reason.title}</h3>
                  <p className="mt-1.5 text-sm font-light leading-relaxed">{reason.text}</p>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>

      <Reveal className="mt-10">
        <div className="rounded-3xl bg-gradient-to-br from-navy-dark via-navy to-[#0e3a52] p-7 text-white shadow-lg sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h3 className="font-display text-2xl font-light tracking-wide">Nossos compromissos com você</h3>
              <ul className="mt-4 grid gap-2.5">
                {promises.map((promise) => (
                  <li key={promise} className="flex items-start gap-2.5 text-sm font-light text-white/90">
                    <BadgeCheck size={18} className="mt-0.5 shrink-0 text-teal" aria-hidden="true" />
                    {promise}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <GlassButton to="/contact" tone="gold" icon={<CalendarCheck size={18} aria-hidden="true" />}>
                Agende uma visita
              </GlassButton>
              <GlassButton to="/indique" icon={<Gift size={18} aria-hidden="true" />}>
                Indique um amigo
              </GlassButton>
              <GlassButton to="/avaliar" icon={<MessageCircle size={18} aria-hidden="true" />}>
                Já é cliente? Avalie a gente
              </GlassButton>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
