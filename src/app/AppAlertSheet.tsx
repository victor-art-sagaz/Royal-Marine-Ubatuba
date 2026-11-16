import { useEffect, useRef, useState } from 'react'
import { BellRing, CalendarPlus, Check, Download, X } from 'lucide-react'
import type { AlertTarget } from '../components/AlertDialog'
import { LEAD_OPTIONS, alertTime, downloadIcs, googleCalendarUrl } from '../lib/alerts'
import type { AlertKind, AlertRequest } from '../lib/alerts'
import { addAlert, askNotificationPermission, useNotificationPermission } from '../lib/appAlerts'
import { useApp } from './i18n'
import type { TKey } from './i18n'

const kindKey: Record<AlertKind, TKey> = {
  'tide-high': 'kindTideHigh',
  'tide-low': 'kindTideLow',
  rain: 'kindRain',
  wind: 'kindWind',
}

const leadShort = (m: number) => (m < 60 ? `${m} min` : m === 60 ? '1 h' : `${m / 60} h`)

/** Gaveta que sobe de baixo para criar um alerta com notificação no app */
export default function AppAlertSheet({ target, onClose }: { target: AlertTarget | null; onClose: () => void }) {
  const [lead, setLead] = useState(30)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [done, setDone] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const permission = useNotificationPermission()
  const nameRef = useRef<HTMLInputElement>(null)
  const { t, time, longDay } = useApp()
  const suggestedTitle = (kind: AlertKind, lead: number) => t('suggested', { kind: t(kindKey[kind]), lead: leadShort(lead) })

  useEffect(() => {
    if (!target) return
    setLead(30)
    setTitle(suggestedTitle(target.kind, 30))
    setNotes('')
    setDone(false)
    setShowCalendar(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  useEffect(() => {
    if (!target) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [target, onClose])

  if (!target) return null

  const request: AlertRequest = { ...target, leadMinutes: lead, title, notes }
  const when = alertTime(request)
  const tooLate = when.getTime() <= Date.now()

  const changeLead = (m: number) => {
    if (title === suggestedTitle(target.kind, lead)) setTitle(suggestedTitle(target.kind, m))
    setLead(m)
  }

  const create = async () => {
    if (tooLate) return
    let perm = permission
    if (perm === 'default') perm = await askNotificationPermission()
    addAlert({
      kind: target.kind,
      eventAt: target.eventAt.toISOString(),
      fireAt: when.toISOString(),
      leadMinutes: lead,
      title: title.trim() || suggestedTitle(target.kind, lead),
      notes: notes.trim(),
      summary: target.summary,
    })
    setDone(true)
    if (perm !== 'granted') setShowCalendar(true)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center" role="presentation">
      <button type="button" aria-label={t('close')} onClick={onClose} className="absolute inset-0 animate-fade-up bg-[#050d1c]/70 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-alerta-titulo"
        className="relative max-h-[90vh] w-full max-w-lg animate-fade-up overflow-y-auto rounded-t-[2rem] border-t border-white/10 bg-gradient-to-b from-[#16305a] to-navy-dark p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-white shadow-2xl landscape:max-h-[95vh]"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/25" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e2bd45] text-navy-dark">
              <BellRing size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 id="app-alerta-titulo" className="font-display text-xl tracking-wide text-white">
                {t('newAlert')}
              </h2>
              <p className="text-sm text-teal">{target.summary}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t('close')} className="rounded-full p-2 text-white/60 hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div className="mt-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal/20 text-teal">
              <Check size={28} aria-hidden="true" />
            </span>
            <p className="mt-3 font-display text-lg">{t('created')}</p>
            <p className="mt-1 text-sm text-white/70">
              {longDay(when)}, {t('atTime', { time: time(when) })}.
            </p>
            {permission === 'granted' ? (
              <p className="mt-3 text-xs text-white/60">{t('createdOk')}</p>
            ) : (
              <p className="mt-3 rounded-xl bg-amber-400/15 p-3 text-xs text-amber-100">{t('createdBlocked')}</p>
            )}
          </div>
        ) : (
          <>
            <p className="mt-5 text-sm font-medium text-white/80">{t('notifyBefore')}</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {LEAD_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={lead === m}
                  aria-label={t('leadBefore', { lead: leadShort(m) })}
                  onClick={() => changeLead(m)}
                  className={`rounded-2xl py-3 text-sm font-medium transition ${
                    lead === m ? 'bg-teal text-navy-dark shadow-lg' : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  {leadShort(m)}
                </button>
              ))}
            </div>

            <label htmlFor="app-alerta-nome" className="mt-4 block text-sm font-medium text-white/80">
              {t('alertName')}
            </label>
            <input
              id="app-alerta-nome"
              ref={nameRef}
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-teal"
            />

            <label htmlFor="app-alerta-obs" className="mt-4 block text-sm font-medium text-white/80">
              {t('note')} <span className="font-normal text-white/50">{t('optional')}</span>
            </label>
            <textarea
              id="app-alerta-obs"
              value={notes}
              maxLength={300}
              rows={2}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notePh')}
              className="mt-1 w-full resize-none rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-teal"
            />

            <p className="mt-4 text-center text-sm text-white/80">
              {tooLate ? (
                <span className="text-amber-200">{t('tooLate')}</span>
              ) : (
                <>
                  {t('notifyOn')} <strong className="font-medium text-white">{longDay(when)}</strong>,{' '}
                  {t('atTime', { time: '' }).trim()} <strong className="font-medium text-white">{time(when)}</strong>
                </>
              )}
            </p>

            <button
              type="button"
              disabled={tooLate}
              onClick={create}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#e2bd45] py-4 text-sm font-semibold text-navy-dark shadow-lg transition hover:bg-[#f0cd5a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <BellRing size={18} aria-hidden="true" />
              {permission === 'default' ? t('allowAndCreate') : t('createAlert')}
            </button>
          </>
        )}

        <div className="mt-4">
          {showCalendar || done ? null : (
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="w-full text-center text-xs text-white/60 underline-offset-4 hover:underline"
            >
              {t('preferCalendar')}
            </button>
          )}
          {showCalendar || done ? (
            <div className="grid grid-cols-2 gap-2">
              <a
                href={tooLate ? undefined : googleCalendarUrl(request)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 py-3 text-xs text-white hover:bg-white/10"
              >
                <CalendarPlus size={16} aria-hidden="true" /> {t('googleCal')}
              </a>
              <button
                type="button"
                disabled={tooLate}
                onClick={() => downloadIcs(request)}
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 py-3 text-xs text-white hover:bg-white/10 disabled:opacity-40"
              >
                <Download size={16} aria-hidden="true" /> {t('calendarFile')}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
