import { MessageCircle, Printer, Star } from 'lucide-react'
import GlassButton from '../components/GlassButton'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { googleWriteReviewUrl, reviewSummary } from '../data/reviews'
import { contact, images } from '../data/site'
import { whatsappUrl } from '../lib/whatsapp'

/**
 * Página /avaliar: é para onde o QR Code da recepção leva.
 * Mostra o botão para avaliar no Google e, ao lado, o contato direto da equipe.
 */
export default function Review() {
  return (
    <>
      <PageHero title="AVALIE A ROYAL MARINE" subtitle="Sua opinião ajuda outros navegantes" image={images.ubatubaBaia} />

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <Reveal>
          <div className="flex justify-center gap-1" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={34} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <h2 className="mt-5 font-display text-3xl font-light leading-tight sm:text-4xl">
            Obrigado por confiar a sua embarcação a nós
          </h2>
          <div className="mx-auto my-5 h-0.5 w-10 bg-teal" />
          <p className="mx-auto max-w-xl font-light leading-relaxed">
            Conte no Google como foi a sua experiência na Royal Marine. Leva menos de um minuto e ajuda outros donos de
            embarcação a escolher onde guardar o seu sonho.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Hoje temos nota{' '}
            <strong className="font-medium text-navy">
              {reviewSummary.score.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}
            </strong>{' '}
            no Google, com {reviewSummary.count} avaliações.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <GlassButton href={googleWriteReviewUrl} external tone="dark" icon={<Star size={18} aria-hidden="true" />}>
              Avaliar no Google
            </GlassButton>
            <GlassButton
              href={whatsappUrl(contact.quotePhone.whatsappNumber, 'Olá! Gostaria de deixar uma sugestão para a Royal Marine.')}
              external
              tone="dark"
              icon={<MessageCircle size={18} aria-hidden="true" />}
            >
              Falar com a equipe
            </GlassButton>
          </div>
          <p className="mt-4 text-xs font-light text-slate-500">
            Tem uma sugestão ou algo que podemos melhorar? Fale direto com a gente pelo WhatsApp: respondemos pessoalmente.
          </p>
        </Reveal>
      </section>

      {/* QR Code para imprimir e deixar na recepção */}
      <section className="bg-slate-50 py-16 print:bg-white">
        <Reveal className="mx-auto flex max-w-md flex-col items-center px-6 text-center">
          <p className="font-serif text-sm italic text-teal-dark print:hidden">Para a recepção</p>
          <h2 className="mt-2 font-display text-2xl font-light tracking-wide text-navy">Aponte a câmera e avalie</h2>
          <img
            src="/images/qr-avaliar.png"
            alt="QR Code que abre a página de avaliação da Royal Marine"
            width={260}
            height={260}
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            loading="lazy"
          />
          <p className="mt-3 text-sm font-medium text-navy">royalmarineubatuba.com.br/avaliar</p>
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-navy px-5 py-2.5 text-sm font-medium text-navy transition hover:bg-navy hover:text-white print:hidden"
          >
            <Printer size={16} aria-hidden="true" /> Imprimir QR Code
          </button>
        </Reveal>
      </section>
    </>
  )
}
