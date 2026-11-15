/**
 * Alertas de maré e de tempo, salvos na agenda do próprio usuário.
 * Nada é guardado pelo site: o alerta vai para o Google Agenda (link) ou para
 * o calendário do celular/computador (arquivo .ics). A própria agenda toca o aviso.
 */

export type AlertKind = 'tide-high' | 'tide-low' | 'rain' | 'wind'

export interface AlertRequest {
  kind: AlertKind
  /** Momento do evento (ex.: hora da preia-mar ou do início da chuva) */
  eventAt: Date
  /** Quantos minutos antes o aviso deve tocar */
  leadMinutes: number
  title: string
  notes: string
  /** Frase automática que explica o evento, ex.: "Preia-mar às 14:32 (1,1 m)" */
  summary: string
}

export const LEAD_OPTIONS = [15, 30, 60, 120] as const

export const leadLabel = (minutes: number) =>
  minutes < 60 ? `${minutes} min antes` : minutes === 60 ? '1 hora antes' : `${minutes / 60} horas antes`

/** Data em horário de Brasília (UTC-3) a partir de "AAAA-MM-DD" e hora com fração (14.5 = 14:30) */
export function dateAtBrazilHour(date: string, hour: number): Date {
  return new Date(new Date(`${date}T00:00:00-03:00`).getTime() + Math.round(hour * 60) * 60000)
}

/** Data em horário de Brasília a partir de "AAAA-MM-DDTHH:MM" */
export function dateFromBrazilIso(iso: string): Date {
  return new Date(`${iso.slice(0, 16)}:00-03:00`)
}

export function formatBrazilTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}

export function formatBrazilDay(date: Date): string {
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
}

/** Momento em que o aviso deve tocar */
export const alertTime = (req: AlertRequest) => new Date(req.eventAt.getTime() - req.leadMinutes * 60000)

const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

function description(req: AlertRequest): string {
  const lines = [
    req.summary,
    `Aviso: ${leadLabel(req.leadMinutes)}.`,
    req.notes.trim() ? `Observação: ${req.notes.trim()}` : '',
    '',
    'Previsão estimada por modelo, sujeita a mudanças. Não use para navegação.',
    'Royal Marine - Garagem Náutica · royalmarineubatuba.com.br',
  ]
  return lines.filter((l, i) => l !== '' || i === 3).join('\n')
}

/** O evento na agenda começa no momento do aviso e termina no momento da maré/chuva/vento. */
export function googleCalendarUrl(req: AlertRequest): string {
  const start = alertTime(req)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: req.title.trim() || req.summary,
    dates: `${utcStamp(start)}/${utcStamp(req.eventAt)}`,
    details: description(req),
    location: 'Saco da Ribeira, Ubatuba - SP',
    ctz: 'America/Sao_Paulo',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const icsEscape = (text: string) =>
  text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')

/** Quebra linhas longas, como pede o padrão dos arquivos de agenda */
const fold = (line: string) => {
  const parts: string[] = []
  let rest = line
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74))
    rest = ` ${rest.slice(74)}`
  }
  parts.push(rest)
  return parts.join('\r\n')
}

export function icsContent(req: AlertRequest): string {
  const start = alertTime(req)
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@royalmarineubatuba.com.br`
  const title = icsEscape(req.title.trim() || req.summary)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Royal Marine//Alertas de mare e tempo//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(req.eventAt)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${icsEscape(description(req))}`,
    'LOCATION:Saco da Ribeira\\, Ubatuba - SP',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title}`,
    'TRIGGER:PT0S',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .map(fold)
    .join('\r\n')
}

/** Baixa o arquivo .ics: no celular, abre direto o calendário para salvar o alerta */
export function downloadIcs(req: AlertRequest) {
  const blob = new Blob([icsContent(req)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'alerta-royal-marine.ics'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
