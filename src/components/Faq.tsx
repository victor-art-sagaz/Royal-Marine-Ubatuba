import { useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'
import GlassButton from './GlassButton'
import Reveal from './Reveal'
import { contact } from '../data/site'
import { faq } from '../data/faq'

/**
 * Perguntas frequentes em acordeão: clica na pergunta e a resposta abre
 * deslizando (grid-rows de 0fr para 1fr). Só uma pergunta fica aberta por vez.
 */
export default function Faq() {
  const [openId, setOpenId] = useState<string | null>(null)
  const phone = contact.phones[0]
  const whatsappUrl = `https://wa.me/${phone.whatsappNumber}?text=${encodeURIComponent(
    'Olá! Tenho uma dúvida sobre a Royal Marine - Garagem Náutica.',
  )}`

  return (
    <section id="faq" className="bg-slate-50 py-20" aria-labelledby="faq-titulo">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="text-center">
          <p className="font-serif text-sm italic text-teal-dark">Tire suas dúvidas</p>
          <h2 id="faq-titulo" className="mt-2 font-display text-3xl font-light sm:text-4xl">
            Perguntas frequentes
          </h2>
          <div className="mx-auto my-5 h-0.5 w-10 bg-teal" />
        </Reveal>

        <div className="mt-8 space-y-3">
          {faq.map((item, i) => {
            const isOpen = openId === item.id
            const Icon = item.icon
            const buttonId = `faq-pergunta-${item.id}`
            const panelId = `faq-resposta-${item.id}`
            return (
              <Reveal key={item.id} delay={Math.min(i, 5) * 0.05}>
                <div
                  className={`rounded-2xl border bg-white transition-all duration-300 ${
                    isOpen ? 'border-teal shadow-lg' : 'border-slate-200 shadow-sm hover:border-teal/60'
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                          isOpen ? 'bg-teal text-navy' : 'bg-navy text-teal'
                        }`}
                      >
                        <Icon size={20} />
                      </span>
                      <span className="flex-1 font-display text-lg tracking-wide text-navy">{item.question}</span>
                      <ChevronDown
                        size={22}
                        aria-hidden="true"
                        className={`shrink-0 text-teal-dark transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </h3>

                  {/* Abre e fecha com transição suave: grid-rows-[1fr] aberto, grid-rows-[0fr] fechado */}
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div
                      className={`overflow-hidden transition-[visibility] duration-300 ${isOpen ? 'visible' : 'invisible'}`}
                    >
                      <div className="space-y-3 px-5 pb-5 pl-[4.75rem] text-sm font-light leading-relaxed">
                        {item.answer.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal className="mt-10 text-center">
          <p className="font-light">Não encontrou o que procurava?</p>
          <div className="mt-4">
            <GlassButton href={whatsappUrl} external tone="dark" icon={<MessageCircle size={18} />}>
              Fale com a gente no WhatsApp
            </GlassButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
