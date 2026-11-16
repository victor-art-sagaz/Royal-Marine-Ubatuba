import { useEffect, useState } from 'react'
import type { AlertKind } from './alerts'

/**
 * Alertas do app Royal Marine, com notificação no próprio celular.
 *
 * - Os alertas ficam guardados SÓ no aparelho (armazenamento do navegador). Nada vai para servidor.
 * - O aviso aparece como notificação quando chega a hora, desde que o app esteja aberto
 *   ou rodando em segundo plano. Com o app totalmente fechado, o celular pode não avisar:
 *   por isso o app também oferece salvar o alerta na agenda.
 */

export interface AppAlert {
  id: string
  kind: AlertKind
  /** Momento da maré / chuva / vento (ISO) */
  eventAt: string
  /** Momento em que a notificação deve aparecer (ISO) */
  fireAt: string
  leadMinutes: number
  title: string
  notes: string
  summary: string
  createdAt: string
  status: 'scheduled' | 'sent' | 'missed'
}

const STORAGE_KEY = 'royal-marine-alertas-v1'
/** Depois desse tempo do horário marcado, o aviso não é mais enviado (fica como "perdido") */
const LATE_LIMIT_MS = 30 * 60 * 1000
/** Alertas antigos somem da lista depois de 1 dia do evento */
const CLEANUP_MS = 24 * 60 * 60 * 1000

const listeners = new Set<() => void>()
let cache: AppAlert[] | null = null

function read(): AppAlert[] {
  if (cache) return cache
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as AppAlert[]) : []
    cache = Array.isArray(parsed) ? parsed.filter((a) => a && typeof a.id === 'string') : []
  } catch {
    cache = []
  }
  return cache
}

function write(next: AppAlert[]) {
  cache = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Sem armazenamento (modo anônimo, por exemplo): o alerta vale só enquanto o app estiver aberto
  }
  listeners.forEach((fn) => fn())
}

export function listAlerts(): AppAlert[] {
  return [...read()].sort((a, b) => a.fireAt.localeCompare(b.fireAt))
}

export function addAlert(alert: Omit<AppAlert, 'id' | 'createdAt' | 'status'>): AppAlert {
  const full: AppAlert = {
    ...alert,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'scheduled',
  }
  write([...read(), full])
  checkAlerts()
  return full
}

export function removeAlert(id: string) {
  write(read().filter((a) => a.id !== id))
}

/** Lista de alertas que se atualiza sozinha na tela */
export function useAppAlerts(): AppAlert[] {
  const [alerts, setAlerts] = useState<AppAlert[]>(() => (typeof window === 'undefined' ? [] : listAlerts()))
  useEffect(() => {
    const update = () => setAlerts(listAlerts())
    listeners.add(update)
    update()
    return () => {
      listeners.delete(update)
    }
  }, [])
  return alerts
}

/* --------------------------- Permissão de notificação --------------------------- */

export type NotifyPermission = 'granted' | 'denied' | 'default' | 'unsupported'

export function notificationPermission(): NotifyPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function askNotificationPermission(): Promise<NotifyPermission> {
  if (notificationPermission() === 'unsupported') return 'unsupported'
  try {
    const result = await Notification.requestPermission()
    listeners.forEach((fn) => fn())
    return result
  } catch {
    return notificationPermission()
  }
}

/** Permissão atual, atualizada quando muda */
export function useNotificationPermission(): NotifyPermission {
  const [perm, setPerm] = useState<NotifyPermission>(() => notificationPermission())
  useEffect(() => {
    const update = () => setPerm(notificationPermission())
    listeners.add(update)
    window.addEventListener('focus', update)
    return () => {
      listeners.delete(update)
      window.removeEventListener('focus', update)
    }
  }, [])
  return perm
}

/* ----------------------------------- Envio ----------------------------------- */

async function showNotification(alert: AppAlert) {
  const body = [alert.summary, alert.notes.trim()].filter(Boolean).join('\n')
  const options: NotificationOptions = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: alert.id,
    data: { url: alert.kind.startsWith('tide') ? '/app/mare' : '/app/tempo' },
  }
  // 1º: pelo service worker (funciona no app instalado, inclusive em segundo plano)
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) {
        await reg.showNotification(alert.title, options)
        return
      }
    }
  } catch {
    // segue para o jeito simples abaixo
  }
  // 2º: notificação simples, com o app aberto
  try {
    new Notification(alert.title, options)
  } catch {
    // Se o aparelho não deixar, o alerta continua na lista
  }
}

/** Confere se algum alerta chegou na hora. Pode ser chamada a qualquer momento. */
export function checkAlerts() {
  if (typeof window === 'undefined') return
  const now = Date.now()
  const canNotify = notificationPermission() === 'granted'
  let changed = false
  const next = read()
    .filter((a) => now - new Date(a.eventAt).getTime() < CLEANUP_MS)
    .map((a) => {
      if (a.status !== 'scheduled') return a
      const fire = new Date(a.fireAt).getTime()
      if (fire > now) return a
      changed = true
      if (now - fire > LATE_LIMIT_MS || !canNotify) return { ...a, status: 'missed' as const }
      void showNotification(a)
      return { ...a, status: 'sent' as const }
    })
  if (changed || next.length !== read().length) write(next)
}

let started = false

/** Liga a conferência automática (a cada 20 segundos e sempre que o app volta à tela) */
export function startAlertScheduler() {
  if (started || typeof window === 'undefined') return
  started = true
  checkAlerts()
  window.setInterval(checkAlerts, 20000)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkAlerts()
  })
}
