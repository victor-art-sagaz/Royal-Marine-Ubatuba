import { BadgePercent, CalendarClock, Check, Info, MessageCircle } from 'lucide-react'
import GlassButton from './GlassButton'
import { LogoAnchor } from './Logo'
import Reveal from './Reveal'
import { contact } from '../data/site'
import { pricingPlans, pricingSpecials } from '../data/pricing'
import type { PricingPlan } from '../data/pricing'
import { whatsappUrl } from '../lib/whatsapp'

const priceFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const planMessage = (plan: PricingPlan) =>
  `Olá! Vim pelo site da Royal Marine e gostaria de um orçamento do plano "${plan.name}" para a minha embarcação.`

const specialIcons = [BadgePercent, CalendarClock]

/** Seção "Valores": os planos da marina, descontos e botão de orçamento em cada plano. */
export default function Pricing() {
  return (
    <section id="valores" className="bg-white py-20" aria-labelledby="valores-titulo">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-10 text-center">
          <p className="font-serif text-sm italic text-teal-dark">Transparência desde o primeiro contato</p>
          <h2 id="valores-titulo" className="mt-2 font-display text-3xl font-light sm:text-4xl">
            Planos e valores
          </h2>
          <div className="mx-auto mt-5 h-0.5 w-10 bg-teal" />
          <p className="mx-auto max-w-2xl font-light leading-relaxed">
            Vagas em garagem coberta, com banheiro, chuveiro e vestiário à disposição. Todos os planos dão acesso à estética
            náutica da parceira WashBoat, dentro da marina. Escolha o plano que combina com a sua embarcação.
          </p>
        </Reveal>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan, i) => (
            <li key={plan.id}>
              <Reveal delay={(i % 4) * 0.08} className="h-full">
                <article
                  className={`relative flex h-full flex-col overflow-hidden rounded-3xl p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    plan.featured
                      ? 'bg-gradient-to-br from-navy-dark via-navy to-[#0e3a52] text-white'
                      : 'border border-slate-200 bg-white text-navy'
                  }`}
                  aria-labelledby={`plano-${plan.id}`}
                >
                  <LogoAnchor
                    className={`pointer-events-none absolute -right-6 -top-4 h-36 w-auto ${
                      plan.featured ? 'text-white/[0.06]' : 'text-navy/[0.04]'
                    }`}
                  />
                  {plan.featured ? (
                    <span className="mb-3 inline-flex w-fit rounded-full border border-[#e2bd45]/50 bg-[#e2bd45]/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#f3d97a]">
                      Mais completo
                    </span>
                  ) : null}
                  <h3
                    id={`plano-${plan.id}`}
                    className={`relative font-display text-xl tracking-wide ${plan.featured ? 'text-white' : 'text-navy'}`}
                  >
                    {plan.name}
                  </h3>

                  <div className="relative mt-4 space-y-2">
                    {plan.prices.map((price) => (
                      <div key={`${price.label ?? ''}${price.value}`}>
                        {price.label ? (
                          <p className={`text-xs uppercase tracking-wider ${plan.featured ? 'text-teal' : 'text-teal-dark'}`}>
                            {price.label}
                          </p>
                        ) : null}
                        <p className="font-display text-4xl font-light tracking-wide">
                          {priceFormat.format(price.value)}
                          {price.unit ? (
                            <span className={`ml-1.5 text-base ${plan.featured ? 'text-teal' : 'text-teal-dark'}`}>
                              {price.unit}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className={`relative my-5 h-px ${plan.featured ? 'bg-white/15' : 'bg-slate-200'}`} />

                  <ul className="relative flex-1 space-y-2.5 text-sm">
                    {plan.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            plan.featured ? 'bg-teal/25 text-teal' : 'bg-navy text-teal'
                          }`}
                        >
                          <Check size={12} aria-hidden="true" />
                        </span>
                        <span className={plan.featured ? 'text-white/90' : ''}>{item}</span>
                      </li>
                    ))}
                    {plan.note ? (
                      <li className={`flex items-start gap-2.5 italic ${plan.featured ? 'text-white/70' : 'text-slate-500'}`}>
                        <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                        {plan.note}
                      </li>
                    ) : null}
                  </ul>

                  <a
                    href={whatsappUrl(contact.quotePhone.whatsappNumber, planMessage(plan))}
                    target="_blank"
                    rel="noreferrer"
                    className={`relative mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
                      plan.featured
                        ? 'bg-[#e2bd45] text-navy-dark hover:bg-[#f0cd5a]'
                        : 'bg-navy text-white hover:bg-navy-dark'
                    }`}
                  >
                    <MessageCircle size={16} aria-hidden="true" />
                    Quero este plano
                  </a>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        {/* Descontos e vagas especiais */}
        <Reveal className="mt-8">
          <div className="rounded-3xl border border-teal/40 bg-teal/10 p-6">
            <h3 className="font-display text-xl tracking-wide text-navy">Descontos e vagas especiais</h3>
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {pricingSpecials.map((special, i) => {
                const Icon = specialIcons[i] ?? BadgePercent
                return (
                  <li key={special.title} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-teal">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <p className="text-sm font-light leading-relaxed text-navy">
                      <strong className="font-medium">{special.title}.</strong> {special.text}
                    </p>
                  </li>
                )
              })}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <GlassButton
                href={whatsappUrl(
                  contact.quotePhone.whatsappNumber,
                  'Olá! Vim pelo site da Royal Marine e gostaria de saber sobre descontos e vagas especiais.',
                )}
                external
                tone="dark"
                icon={<MessageCircle size={18} />}
              >
                Consultar condições
              </GlassButton>
              <span className="text-xs text-slate-600">WhatsApp {contact.quotePhone.display}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
