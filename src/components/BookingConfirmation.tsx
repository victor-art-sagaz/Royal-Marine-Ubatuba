import { useEffect, useRef } from 'react'
import { Mail, MessageCircle, Phone, Ruler, Ship, User, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { contact } from '../data/site'
import { getInterest } from '../data/experiences'
import { buildWhatsAppUrl } from '../lib/validation'
import type { BookingValues } from '../types'
import Logo, { LogoAnchor } from './Logo'

interface BookingConfirmationProps {
  values: BookingValues
  onClose: () => void
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-navy/10 pb-2">
      <dt className="flex shrink-0 items-center gap-2 text-slate-500">
        <span className="text-teal-dark">{icon}</span>
        {label}
      </dt>
      <dd className="break-all text-right font-medium text-navy">{value}</dd>
    </div>
  )
}

/** Rosa dos ventos bem clarinha, usada como marca-d'água no verso do cartão. */
function CompassWatermark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      <circle cx="100" cy="100" r="92" strokeWidth="2" />
      <circle cx="100" cy="100" r="82" strokeWidth="1" strokeDasharray="2 5" />
      {Array.from({ length: 32 }).map((_, i) => {
        const angle = (i * Math.PI) / 16
        const inner = i % 4 === 0 ? 68 : 76
        return (
          <line
            key={i}
            x1={100 + Math.cos(angle) * inner}
            y1={100 + Math.sin(angle) * inner}
            x2={100 + Math.cos(angle) * 82}
            y2={100 + Math.sin(angle) * 82}
            strokeWidth="1"
          />
        )
      })}
      <path
        d="M100 22 L110 90 L178 100 L110 110 L100 178 L90 110 L22 100 L90 90 Z"
        fill="currentColor"
        stroke="none"
        opacity="0.9"
      />
      <path
        d="M100 46 L105 95 L154 100 L105 105 L100 154 L95 105 L46 100 L95 95 Z"
        fill="currentColor"
        stroke="none"
        opacity="0.5"
        transform="rotate(45 100 100)"
      />
    </svg>
  )
}

/** Cartão que gira: primeiro a logo da Royal Marine (cartão branco), depois o resumo para enviar no WhatsApp. */
export default function BookingConfirmation({ values, onClose }: BookingConfirmationProps) {
  const firstButton = useRef<HTMLAnchorElement>(null)
  const interest = getInterest(values.interest)
  const firstName = values.name.trim().split(' ')[0]

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const timer = window.setTimeout(() => firstButton.current?.focus(), 1800)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(timer)
    }
  }, [onClose])

  return (
    <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4" onClick={onClose}>
      <div
        className="flip-scene w-full max-w-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Mensagem pronta para enviar"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flip-card">
          {/* Frente: cartão branco com a logo original */}
          <div className="flip-face flip-emblem" aria-hidden="true">
            <div className="pointer-events-none absolute inset-2.5 rounded-[1.1rem] border border-gold/45" />
            <Logo className="w-[13.5rem]" title="Royal Marine - Garagem Náutica" />
          </div>

          {/* Verso: resumo, em cartão claro e temático */}
          <div className="flip-face flip-content">
            {/* Costura de corda dourada */}
            <div className="pointer-events-none absolute inset-2 rounded-[1.15rem] border-2 border-dashed border-gold/45" />
            <CompassWatermark className="pointer-events-none absolute -bottom-10 -right-10 h-52 w-52 text-navy/[0.07]" />
            <svg
              viewBox="0 0 400 40"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 w-full text-teal/25"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M0 22 C50 4 100 40 150 22 C200 4 250 40 300 22 C350 4 380 30 400 20 L400 40 L0 40 Z" />
            </svg>

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-slate-500 transition hover:bg-navy/10 hover:text-navy"
              aria-label="Fechar"
            >
              <X size={16} aria-hidden="true" />
            </button>

            <div className="relative mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#1d3a6e] to-navy-dark text-[#f6e3a0] shadow-md ring-2 ring-gold">
                <LogoAnchor className="h-[22px] w-auto" />
              </span>
              <div>
                <h3 className="font-display text-lg font-medium leading-tight tracking-wide text-navy">
                  Tudo pronto{firstName ? `, ${firstName}` : ''}!
                </h3>
                <p className="text-xs normal-case text-slate-600">Confira seus dados antes de enviar</p>
              </div>
            </div>

            <dl className="relative grid gap-2.5 text-sm">
              <Row icon={<User size={15} aria-hidden="true" />} label="Nome" value={values.name.trim()} />
              <Row icon={<Mail size={15} aria-hidden="true" />} label="E-mail" value={values.email.trim()} />
              <Row icon={<Phone size={15} aria-hidden="true" />} label="Telefone" value={values.phone} />
              <Row
                icon={<LogoAnchor className="h-[15px] w-auto" />}
                label="Interesse"
                value={interest ? interest.label : '—'}
              />
              {values.boatName.trim() ? (
                <Row icon={<Ship size={15} aria-hidden="true" />} label="Embarcação" value={values.boatName.trim()} />
              ) : null}
              {values.boatSize.trim() ? (
                <Row icon={<Ruler size={15} aria-hidden="true" />} label="Tamanho" value={values.boatSize.trim()} />
              ) : null}
            </dl>

            <div className="relative mt-4 grid gap-2">
              {contact.phones.map((phone, index) => (
                <a
                  key={phone.whatsappNumber}
                  ref={index === 0 ? firstButton : undefined}
                  href={buildWhatsAppUrl(values, phone.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-white/25 bg-gradient-to-b from-[#2f6fd0] via-[#1f4fa3] to-[#14284b] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_26px_-10px_rgba(20,40,75,0.95)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_20px_rgba(47,111,208,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  WhatsApp {phone.display}
                </a>
              ))}
            </div>

            <p className="relative mt-2.5 text-center text-[11px] leading-snug text-slate-600">
              Vamos abrir o WhatsApp com a mensagem pronta. Escolha o número que preferir.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="relative mx-auto mt-2 block pb-4 text-xs font-medium text-navy underline-offset-4 hover:underline"
            >
              Editar dados
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
