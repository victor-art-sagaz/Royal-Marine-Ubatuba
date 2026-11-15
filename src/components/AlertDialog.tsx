import { useEffect, useRef, useState } from 'react'
import { BellRing, CalendarPlus, Download, Info, X } from 'lucide-react'
import {
  LEAD_OPTIONS,
  alertTime,
  downloadIcs,
  formatBrazilDay,
  formatBrazilTime,
  googleCalendarUrl,
  leadLabel,
} from '../lib/alerts'
import type { AlertKind, AlertRequest } from '../lib/alerts'

export interface AlertTarget {
  kind: AlertKind
  eventAt: Date
  /** Frase do evento, ex.: "Preia-mar às 14:32 (1,1 m)" */
  summary: string
}

const kindTitle: Record<AlertKind, string> = {
  'tide-high': 'Maré subindo',
  'tide-low': 'Maré baixando',
  rain: 'Chuva chegando',
  wind: 'Vento forte chegando',
}

/**
 * Janela pequena para criar um alerta: escolhe a antecedência, dá um nome e uma observação,
 * e salva no Google Agenda ou no calendário do celular.
 */
export default function AlertDialog({ target, onClose }: { target: AlertTarget | null; onClose: () => void }) {
  const [lead, setLead] = useState<number>(30)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const firstField = useRef<HTMLInputElement>(null)

  // Preenche o nome sugerido sempre que abre para um novo evento
  useEffect(() => {
    if (!target) return
    setLead(30)
    setTitle(`${kindTitle[target.kind]} em 30 min · Royal Marine`)
    setNotes('')
    setSaved(false)
    const t = setTimeout(() => firstField.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [target])

  // Atualiza o tempo no nome sugerido quando a antecedência muda (se a pessoa não renomeou)
  const changeLead = (minutes: number) => {
    if (target) {
      const before = `${kindTitle[target.kind]} em ${leadText(lead)} · Royal Marine`
      if (title === before) setTitle(`${kindTitle[target.kind]} em ${leadText(minutes)} · Royal Marine`)
    }
    setLead(minutes)
  }

  useEffect(() => {
    if (!target) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [target, onClose])

  if (!target) return null

  const request: AlertRequest = { ...target, leadMinutes: lead, title, notes }
  const when = alertTime(request)
  const tooLate = when.getTime() < Date.now()

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="presentation">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="alerta-titulo"
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 text-navy shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-[#e2bd45]">
              <BellRing size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 id="alerta-titulo" className="font-display text-xl tracking-wide">
                Criar alerta
              </h2>
              <p className="text-sm text-slate-600">{target.summary}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-navy"
          >
            <X size={20} />
          </button>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium">Avisar quanto tempo antes?</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {LEAD_OPTIONS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                aria-pressed={lead === minutes}
                onClick={() => changeLead(minutes)}
                className={`rounded-xl border px-2 py-2 text-sm transition ${
                  lead === minutes ? 'border-navy bg-navy text-white' : 'border-slate-200 hover:border-teal'
                }`}
              >
                {leadLabel(minutes)}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 block text-sm font-medium" htmlFor="alerta-nome">
          Nome do alerta
        </label>
        <input
          id="alerta-nome"
          ref={firstField}
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="alerta-obs">
          Observação <span className="font-normal text-slate-500">(opcional)</span>
        </label>
        <textarea
          id="alerta-obs"
          value={notes}
          maxLength={300}
          rows={3}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex.: levar a lancha para a poita, avisar o marinheiro…"
          className="mt-1 w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
        />

        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
          {tooLate ? (
            <span className="text-amber-700">Esse horário de aviso já passou. Escolha um tempo menor.</span>
          ) : (
            <>
              O aviso vai tocar <strong className="font-medium">{formatBrazilDay(when)}</strong>, às{' '}
              <strong className="font-medium">{formatBrazilTime(when)}</strong>.
            </>
          )}
        </p>

        <div className="mt-4 grid gap-2">
          <a
            href={tooLate ? undefined : googleCalendarUrl(request)}
            target="_blank"
            rel="noreferrer"
            aria-disabled={tooLate}
            onClick={(e) => {
              if (tooLate) e.preventDefault()
              else setSaved(true)
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${
              tooLate ? 'cursor-not-allowed bg-slate-200 text-slate-500' : 'bg-navy text-white hover:bg-navy-dark'
            }`}
          >
            <CalendarPlus size={18} aria-hidden="true" /> Salvar no Google Agenda
          </a>
          <button
            type="button"
            disabled={tooLate}
            onClick={() => {
              downloadIcs(request)
              setSaved(true)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-navy px-5 py-3 text-sm font-medium text-navy transition hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
          >
            <Download size={18} aria-hidden="true" /> Salvar no calendário do celular
          </button>
        </div>

        {saved ? (
          <p className="mt-3 text-center text-sm text-teal-dark" role="status">
            Pronto! Confirme o evento na sua agenda para o alerta ficar salvo.
          </p>
        ) : null}

        <p className="mt-4 flex gap-2 text-xs text-slate-500">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          O alerta fica salvo só na sua agenda, o site não guarda nada. Se a previsão mudar depois, o alerta não é
          atualizado. Estimativa por modelo: não use para navegação.
        </p>
      </div>
    </div>
  )
}

function leadText(minutes: number) {
  return minutes < 60 ? `${minutes} min` : minutes === 60 ? '1 hora' : `${minutes / 60} horas`
}
