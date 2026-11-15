import { BadgePercent, CalendarClock, Check, Info, MessageCircle, Tag } from 'lucide-react'
import GlassButton from './GlassButton'
import { LogoAnchor } from './Logo'
import Reveal from './Reveal'
import { contact } from '../data/site'
import { pricingPlans, pricingSpecials } from '../data/pricing'
import type { PricingPlan } from '../data/pricing'
import { whatsappUrl } from '../lib/whatsapp'

const planMessage = (plan: PricingPlan) =>
  `Olá! Vim pelo site da Royal Marine e gostaria de um orçamento de "${plan.name}" para a minha embarcação.`

const specialIcons = [BadgePercent, CalendarClock]

/** Seção "Planos e valores": cartões com foto de fundo (valores sob consulta), descontos e botão de orçamento em cada plano. */
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

        {/* Aviso único de valores, fora dos cartões */}
        <div className="mb-5 flex justify-center sm:justify-end">
          <a
            href={whatsappUrl(
              contact.quotePhone.whatsappNumber,
              'Olá! Vim pelo site da Royal Marine e gostaria de saber os valores dos planos.',
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#e2bd45]/60 bg-[#e2bd45]/10 px-4 py-2 text-sm text-navy transition hover:bg-[#e2bd45]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
          >
            <Tag size={16} className="text-[#b8901c]" aria-hidden="true" />
            <span>
              <strong className="font-medium">Valores sob consulta</strong> · fale com a nossa equipe
            </span>
          </a>
        </div>

        {/* Cartões centralizados: 1 por linha no celular, 2 no tablet, 3 no computador */}
        <ul className="flex flex-wrap justify-center gap-5">
          {pricingPlans.map((plan, i) => (
            <li
              key={plan.id}
              className="w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
            >
              <Reveal delay={(i % 3) * 0.08} className="h-full">
                <article
                  className={`group relative isolate flex h-full min-h-[21rem] flex-col overflow-hidden rounded-3xl p-6 text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    plan.featured ? 'ring-2 ring-[#e2bd45]' : 'ring-1 ring-white/10'
                  }`}
                  aria-labelledby={`plano-${plan.id}`}
                >
                  {/* Foto de fundo + película escura para o texto ficar legível */}
                  <img
                    src={plan.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-dark/55 via-navy-dark/80 to-navy-dark/95" />
                  <LogoAnchor className="pointer-events-none absolute -right-6 -top-4 -z-10 h-36 w-auto text-white/[0.07]" />

                  {plan.featured ? (
                    <span className="mb-3 inline-flex w-fit rounded-full border border-[#e2bd45]/60 bg-navy-dark/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#f3d97a] backdrop-blur-sm">
                      Mais completo
                    </span>
                  ) : null}
                  <h3 id={`plano-${plan.id}`} className="font-display text-xl uppercase tracking-wide text-white">
                    {plan.name}
                  </h3>
                  {plan.subtitle ? <p className="mt-1 font-serif text-sm italic text-teal">{plan.subtitle}</p> : null}

                  <div className="mt-auto pt-10" />

                  {plan.includes.length || plan.note ? (
                    <>
                      <div className="my-5 h-px bg-white/20" />
                      <ul className="space-y-2.5 text-sm">
                        {plan.includes.map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/30 text-teal">
                              <Check size={12} aria-hidden="true" />
                            </span>
                            <span className="text-white/90">{item}</span>
                          </li>
                        ))}
                        {plan.note ? (
                          <li className="flex items-start gap-2.5 italic text-white/70">
                            <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                            {plan.note}
                          </li>
                        ) : null}
                      </ul>
                    </>
                  ) : null}

                  <a
                    href={whatsappUrl(contact.quotePhone.whatsappNumber, planMessage(plan))}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
                      plan.featured
                        ? 'bg-[#e2bd45] text-navy-dark hover:bg-[#f0cd5a]'
                        : 'border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-navy'
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
