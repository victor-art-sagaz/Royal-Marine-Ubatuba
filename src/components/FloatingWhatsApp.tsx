import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { contact } from '../data/site'
import { whatsappUrl } from '../lib/whatsapp'

/**
 * Botão fixo do WhatsApp no canto inferior direito.
 * - Com um só número: abre direto a conversa.
 * - Com mais de um número (como agora): abre uma listinha para escolher com quem falar.
 * Os números vêm de src/data/site.ts, então é lá que você troca ou acrescenta telefones.
 */
export default function FloatingWhatsApp() {
  const phones = contact.phones
  const multiple = phones.length > 1
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Fecha a listinha com Esc ou ao tocar fora dela
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  if (phones.length === 0) return null

  const buttonClasses =
    'group relative flex h-14 items-center justify-center gap-2 rounded-full bg-[#0e7466] px-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#0b5f54] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-5'

  const content = (
    <>
      {/* Anel suave que pulsa de tempos em tempos (desligado para quem pede menos movimento) */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-full bg-[#0e7466] opacity-40 motion-safe:animate-ping [animation-duration:3s] motion-reduce:hidden"
      />
      {open ? <X size={24} aria-hidden="true" /> : <MessageCircle size={26} aria-hidden="true" />}
      <span className="hidden text-sm font-medium tracking-wide sm:inline">
        {open ? 'Fechar' : 'Fale com a gente'}
      </span>
    </>
  )

  return (
    <div
      ref={rootRef}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-20 flex flex-col items-end gap-3 print:hidden"
    >
      {multiple && open ? (
        <div
          id="whatsapp-opcoes"
          className="w-64 rounded-2xl border border-white/15 bg-navy-dark/95 p-3 text-white shadow-2xl backdrop-blur-md"
        >
          <p className="px-2 pb-2 pt-1 font-serif text-xs italic text-teal">Com quem você quer falar?</p>
          <ul className="space-y-1">
            {phones.map((phone) => (
              <li key={phone.whatsappNumber}>
                <a
                  href={whatsappUrl(phone.whatsappNumber)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <MessageCircle size={18} className="shrink-0 text-teal" aria-hidden="true" />
                  <span>
                    <span className="block text-xs text-white/60">WhatsApp</span>
                    {phone.display}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {multiple ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="whatsapp-opcoes"
          aria-label={open ? 'Fechar opções de WhatsApp' : 'Falar com a Royal Marine pelo WhatsApp'}
          className={buttonClasses}
        >
          {content}
        </button>
      ) : (
        <a
          href={whatsappUrl(phones[0].whatsappNumber)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Falar com a Royal Marine pelo WhatsApp ${phones[0].display}`}
          className={buttonClasses}
        >
          {content}
        </a>
      )}
    </div>
  )
}
