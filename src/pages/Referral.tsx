import { useEffect, useRef, useState } from 'react'
import { Check, Gift, Handshake, Link2, MessageCircle, Send, UserPlus } from 'lucide-react'
import GlassButton from '../components/GlassButton'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { contact, images } from '../data/site'
import { SITE_URL } from '../data/seo'
import { whatsappUrl } from '../lib/whatsapp'

const steps = [
  {
    icon: UserPlus,
    title: 'Escreva o seu nome',
    text: 'Digite o seu nome abaixo para criar o seu link de indicação.',
  },
  {
    icon: Send,
    title: 'Envie para um amigo',
    text: 'Mande o link pelo WhatsApp para quem tem embarcação e procura um lugar seguro em Ubatuba.',
  },
  {
    icon: Handshake,
    title: 'Seu amigo fecha com a gente',
    text: 'Ele preenche o formulário pelo link, já com a sua indicação marcada, e a nossa equipe entra em contato.',
  },
  {
    icon: Gift,
    title: 'Você ganha um benefício',
    text: 'Quando o seu indicado fechar, você ganha um benefício na sua mensalidade. Consulte as condições com a nossa equipe.',
  },
]

/** Página /indique: programa "Indique um amigo". */
export default function Referral() {
  const [name, setName] = useState('')
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const cleanName = name.trim().slice(0, 60)
  const link = cleanName ? `${SITE_URL}/contact?indicacao=${encodeURIComponent(cleanName)}` : ''
  const message = cleanName
    ? [
        'Oi! Guardo a minha embarcação na *Royal Marine – Garagem Náutica*, no Saco da Ribeira, em Ubatuba, e recomendo. ⚓',
        'Vagas cobertas, monitoramento 24h e uma equipe que cuida de verdade.',
        '',
        'Conheça e agende uma visita pelo meu link:',
        link,
      ].join('\n')
    : ''

  async function copyLink() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      window.prompt('Copie o seu link de indicação:', link)
      return
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 2200)
  }

  return (
    <>
      <PageHero title="INDIQUE UM AMIGO" subtitle="Indicou, fechou, ganhou" image={images.ubatubaEnseada} />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal className="mb-12 text-center">
          <p className="font-serif text-sm italic text-teal-dark">Programa de indicação Royal Marine</p>
          <h2 className="mt-2 font-display text-3xl font-light sm:text-4xl">Como funciona</h2>
          <div className="mx-auto mt-5 h-0.5 w-10 bg-teal" />
        </Reveal>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <Reveal key={step.title} delay={i * 0.1}>
                <li className="h-full list-none rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-teal">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="font-display text-3xl font-light text-gold">{i + 1}</span>
                  </div>
                  <h3 className="font-display text-xl tracking-wide text-navy">{step.title}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed">{step.text}</p>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </section>

      {/* Gerador do link */}
      <section className="sea-bg relative overflow-hidden py-16 text-white">
        <Reveal className="relative mx-auto max-w-xl px-6">
          <div className="rounded-3xl border border-white/15 bg-navy-dark/55 p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md sm:p-8">
            <h2 className="font-display text-2xl font-light tracking-wide">Crie o seu link de indicação</h2>
            <label htmlFor="referral-name" className="mt-5 mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-white/75">
              Seu nome
            </label>
            <input
              id="referral-name"
              type="text"
              maxLength={60}
              autoComplete="name"
              placeholder="Ex.: João Silva"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/40"
            />

            {link ? (
              <>
                <p className="mt-4 break-all rounded-xl bg-white/10 px-3.5 py-2.5 text-xs text-white/80">{link}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <GlassButton
                    href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                    external
                    tone="gold"
                    icon={<MessageCircle size={18} aria-hidden="true" />}
                  >
                    Enviar pelo WhatsApp
                  </GlassButton>
                  <button
                    type="button"
                    onClick={copyLink}
                    aria-live="polite"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/20"
                  >
                    {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
                    {copied ? 'Link copiado!' : 'Copiar link'}
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm font-light text-white/70">Digite o seu nome para aparecer o link e o botão do WhatsApp.</p>
            )}
          </div>
          <p className="mt-6 text-center text-xs font-light text-white/75">
            Dúvidas sobre o benefício?{' '}
            <a
              href={whatsappUrl(contact.quotePhone.whatsappNumber, 'Olá! Quero saber mais sobre o programa Indique um amigo.')}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-white"
            >
              Fale com a nossa equipe
            </a>
            .
          </p>
        </Reveal>
      </section>
    </>
  )
}
