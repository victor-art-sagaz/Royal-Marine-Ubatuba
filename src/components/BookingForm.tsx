import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Hand, Send } from 'lucide-react'
import { interestOptions } from '../data/experiences'
import { BOAT_LENGTH, BOAT_WIDTH, BoatController } from '../lib/seaEngine'
import { FIELD_ORDER, maskPhone, validateBooking } from '../lib/validation'
import type { BookingErrors, BookingValues } from '../types'
import BookingConfirmation from './BookingConfirmation'
import { Wordmark } from './Logo'
import MusaBoat from './MusaBoat'
import WaveDivider from './WaveDivider'

const initialValues: BookingValues = {
  name: '',
  email: '',
  phone: '',
  boatName: '',
  boatSize: '',
  interest: '',
  message: '',
  website: '',
}

const inputClass =
  'w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/40'
const labelClass = 'mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-white/75'
const errorClass = 'mt-1.5 text-xs font-medium text-amber-300'

/** Ícone da agenda: azul-marinho, branco e dourado. */
function AgendaBadge() {
  return (
    <span
      className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-[0_8px_22px_-6px_rgba(0,0,0,0.7)] ring-2 ring-white/90"
      style={{ background: 'radial-gradient(circle at 30% 22%, #2d5aa6, #14284b 62%, #0a1a33)' }}
      aria-hidden="true"
    >
      <span className="absolute inset-[3px] rounded-full border border-[#e2bd45]/80" />
      <svg viewBox="0 0 32 32" className="relative h-7 w-7">
        <rect x="4" y="6" width="24" height="22" rx="4" fill="#ffffff" />
        <path d="M4 10a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v3H4z" fill="#c9a227" />
        <rect x="10" y="2.5" width="3" height="7" rx="1.5" fill="#14284b" stroke="#ffffff" strokeWidth="1" />
        <rect x="19" y="2.5" width="3" height="7" rx="1.5" fill="#14284b" stroke="#ffffff" strokeWidth="1" />
        <path d="M10.5 20.5l4 4 7.5-8" fill="none" stroke="#14284b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export default function BookingForm() {
  const reduce = useReducedMotion()
  const [values, setValues] = useState<BookingValues>(initialValues)
  const [errors, setErrors] = useState<BookingErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [showHint, setShowHint] = useState(true)

  const sectionRef = useRef<HTMLElement>(null)
  const waterRef = useRef<HTMLCanvasElement>(null)
  const boatRef = useRef<HTMLDivElement>(null)
  const boatInnerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const buttonCanvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<BoatController | null>(null)

  // Liga a animação do barco (desligada para quem prefere menos movimento)
  useEffect(() => {
    if (reduce) return
    const section = sectionRef.current
    const water = waterRef.current
    const boat = boatRef.current
    const boatInner = boatInnerRef.current
    const button = buttonRef.current
    const buttonCanvas = buttonCanvasRef.current
    if (!section || !water || !boat || !boatInner || !button || !buttonCanvas) return

    const engine = new BoatController({
      section,
      waterCanvas: water,
      boat,
      boatInner,
      button,
      buttonCanvas,
      onFirstMove: () => setShowHint(false),
    })
    engineRef.current = engine
    engine.start()
    return () => {
      engine.stop()
      engineRef.current = null
    }
  }, [reduce])

  function setField<K extends keyof BookingValues>(key: K, value: BookingValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!(key in current)) return current
      const next = { ...current }
      delete next[key as keyof BookingErrors]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Robôs preenchem o campo escondido: nesse caso não fazemos nada.
    if (submitting || values.website.trim() !== '') return

    const found = validateBooking(values)
    setErrors(found)
    const firstWithError = FIELD_ORDER.find((field) => found[field])
    if (firstWithError) {
      document.getElementById(`field-${firstWithError}`)?.focus()
      return
    }

    setSubmitting(true)
    if (engineRef.current) await engineRef.current.playBooking()
    setConfirmOpen(true)
    window.setTimeout(() => {
      engineRef.current?.resetButton()
      setSubmitting(false)
    }, 900)
  }

  return (
    <section
      id="reservas"
      ref={sectionRef}
      className="sea-bg relative isolate min-h-[90svh] overflow-hidden text-white"
    >
      <canvas ref={waterRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden="true" />

      {!reduce ? (
        <div ref={boatRef} className="boat-outer" aria-hidden="true">
          <div
            ref={boatInnerRef}
            className="boat-inner"
            style={{ width: BOAT_WIDTH, height: BOAT_LENGTH, left: -BOAT_WIDTH / 2, top: -BOAT_LENGTH / 2 }}
          >
            <MusaBoat />
          </div>
        </div>
      ) : null}

      <div className="relative mx-auto flex max-w-xl flex-col px-4 pb-16 pt-14 sm:pt-20">
        <div className="relative z-[3] rounded-3xl border border-white/15 bg-navy-dark/55 p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md sm:p-8">
          <div className="mb-6 flex items-center gap-4">
            <AgendaBadge />
            <div className="min-w-0">
              <Wordmark className="w-52 sm:w-60" tone="light" />
              <h2 className="mt-2 font-display text-2xl font-light leading-tight tracking-wide text-white">
                Agende uma visita
              </h2>
            </div>
          </div>
          <p className="mb-5 text-sm font-light leading-relaxed text-white/80">
            Preencha o formulário com seus dados que entraremos em contato.
          </p>

          <form id="booking-form" onSubmit={handleSubmit} noValidate className="grid gap-4">
            {/* Campo-armadilha para robôs (invisível para pessoas) */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label>
                Não preencha este campo
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={(event) => setField('website', event.target.value)}
                />
              </label>
            </div>

            <div>
              <label className={labelClass} htmlFor="field-name">
                Seu nome
              </label>
              <input
                id="field-name"
                className={inputClass}
                type="text"
                autoComplete="name"
                placeholder="Seu nome completo"
                value={values.name}
                onChange={(event) => setField('name', event.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? <p className={errorClass}>{errors.name}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="field-email">
                  E-mail
                </label>
                <input
                  id="field-email"
                  className={inputClass}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nome@email.com"
                  value={values.email}
                  onChange={(event) => setField('email', event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? <p className={errorClass}>{errors.email}</p> : null}
              </div>
              <div>
                <label className={labelClass} htmlFor="field-phone">
                  Telefone
                </label>
                <input
                  id="field-phone"
                  className={inputClass}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(12) 99999-9999"
                  value={values.phone}
                  onChange={(event) => setField('phone', maskPhone(event.target.value))}
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone ? <p className={errorClass}>{errors.phone}</p> : null}
              </div>
            </div>

            <div>
              <span className={labelClass} id="label-interest">
                Interessado em
              </span>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="label-interest">
                {interestOptions.map((option, index) => {
                  const selected = values.interest === option.id
                  const Icon = option.icon
                  return (
                    <button
                      key={option.id}
                      id={index === 0 ? 'field-interest' : undefined}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setField('interest', option.id)}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        selected
                          ? 'border-[#f6e3a0] bg-gold/90 text-navy-dark shadow-[0_6px_18px_-8px_rgba(201,162,39,0.9)]'
                          : 'border-white/15 bg-white/10 text-white/85 hover:bg-white/15'
                      }`}
                    >
                      <Icon size={16} aria-hidden="true" />
                      {option.label}
                    </button>
                  )
                })}
              </div>
              {errors.interest ? <p className={errorClass}>{errors.interest}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="field-boatName">
                  Nome da sua embarcação
                </label>
                <input
                  id="field-boatName"
                  className={inputClass}
                  type="text"
                  maxLength={60}
                  placeholder="Ex.: Sea Dream"
                  value={values.boatName}
                  onChange={(event) => setField('boatName', event.target.value)}
                  aria-invalid={Boolean(errors.boatName)}
                />
                {errors.boatName ? <p className={errorClass}>{errors.boatName}</p> : null}
              </div>
              <div>
                <label className={labelClass} htmlFor="field-boatSize">
                  Tamanho da sua embarcação
                </label>
                <input
                  id="field-boatSize"
                  className={inputClass}
                  type="text"
                  maxLength={20}
                  placeholder="Ex.: 32 pés ou 10 m"
                  value={values.boatSize}
                  onChange={(event) => setField('boatSize', event.target.value)}
                  aria-invalid={Boolean(errors.boatSize)}
                />
                {errors.boatSize ? <p className={errorClass}>{errors.boatSize}</p> : null}
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="field-message">
                Mensagem (opcional)
              </label>
              <textarea
                id="field-message"
                className={`${inputClass} min-h-[96px] resize-y`}
                maxLength={500}
                placeholder="Conte o que você precisa, ou o melhor dia e horário para a visita…"
                value={values.message}
                onChange={(event) => setField('message', event.target.value)}
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message ? <p className={errorClass}>{errors.message}</p> : null}
            </div>
          </form>
        </div>

        {/* Botão: o barco mergulha nele e navega por cima antes de abrir a confirmação */}
        <div className="relative z-[1] flex flex-col items-center pb-10 pt-28 sm:pt-32">
          <button ref={buttonRef} type="submit" form="booking-form" className="reserve-btn" data-sea="off" aria-busy={submitting}>
            <canvas ref={buttonCanvasRef} className="reserve-sea" aria-hidden="true" />
            <span className="reserve-label">
              <Send size={18} aria-hidden="true" />
              Enviar
            </span>
          </button>
          {!reduce ? (
            <p
              className={`mt-4 flex items-center gap-1.5 text-xs text-white/80 transition-opacity duration-500 ${
                showHint ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Hand size={14} aria-hidden="true" />
              Mexa o mouse (ou toque) na água: a lancha navega até você
            </p>
          ) : null}
        </div>
      </div>

      <WaveDivider className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] text-white" />

      {confirmOpen ? <BookingConfirmation values={values} onClose={() => setConfirmOpen(false)} /> : null}
    </section>
  )
}
