import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Bell, BellOff, BellRing, CloudSun, Globe, Trash2, User, Waves, X, Camera } from 'lucide-react'
import { LogoAnchor } from '../components/Logo'
import InstallAppButton from '../components/InstallAppButton'
import {
  askNotificationPermission,
  removeAlert,
  startAlertScheduler,
  useAppAlerts,
  useNotificationPermission,
} from '../lib/appAlerts'
import { useSeo } from '../lib/useSeo'
import { AppPrefsProvider, LANGS, useApp } from './i18n'
import { LanguageSheet } from './AppExtras'
import { ProfileSheet } from './AppProfile'

const tabs = [
  { to: '/app/mare', key: 'tabTide' as const, icon: Waves },
  { to: '/app/tempo', key: 'tabWeather' as const, icon: CloudSun },
  { to: '/app/mural', key: 'feedTab' as const, icon: Camera },
]

/** Ondas desenhadas que correm no fundo do app */
function BackgroundWaves() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-64 overflow-hidden opacity-60" aria-hidden="true">
      {[
        { color: 'rgba(116,186,197,0.10)', anim: 'animate-wave-drift-slow', bottom: 40 },
        { color: 'rgba(116,186,197,0.16)', anim: 'animate-wave-drift', bottom: 0 },
      ].map((w) => (
        <svg
          key={w.bottom}
          className={`absolute left-0 h-40 w-[200%] ${w.anim}`}
          style={{ bottom: w.bottom }}
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0 60 Q 150 25 300 60 T 600 60 T 900 60 T 1200 60 V 120 H 0 Z" fill={w.color} />
        </svg>
      ))}
    </div>
  )
}

/** Lista dos alertas criados no app */
function AlertsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const alerts = useAppAlerts()
  const permission = useNotificationPermission()
  const { t, time, longDay } = useApp()
  if (!open) return null
  const upcoming = alerts.filter((a) => a.status === 'scheduled')
  const past = alerts.filter((a) => a.status !== 'scheduled')

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center" role="presentation">
      <button type="button" aria-label={t('close')} onClick={onClose} className="absolute inset-0 bg-[#050d1c]/70 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="meus-alertas"
        className="relative max-h-[85vh] w-full max-w-lg animate-fade-up overflow-y-auto rounded-t-[2rem] border-t border-white/10 bg-gradient-to-b from-[#16305a] to-navy-dark p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-white landscape:max-h-[92vh]"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/25" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <h2 id="meus-alertas" className="font-display text-xl tracking-wide text-white">
            {t('myAlerts')}
          </h2>
          <button type="button" onClick={onClose} aria-label={t('close')} className="rounded-full p-2 text-white/60 hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {permission !== 'granted' ? (
          <div className="mt-4 rounded-2xl bg-amber-400/15 p-4 text-sm text-amber-100">
            {permission === 'default' ? (
              <>
                {t('allowNotifText')}
                <button
                  type="button"
                  onClick={() => askNotificationPermission()}
                  className="mt-3 block rounded-full bg-[#e2bd45] px-4 py-2 text-xs font-semibold text-navy-dark"
                >
                  {t('allowNotif')}
                </button>
              </>
            ) : permission === 'denied' ? (
              t('notifDenied')
            ) : (
              t('notifUnsupported')
            )}
          </div>
        ) : null}

        {upcoming.length === 0 ? (
          <p className="mt-6 text-center text-sm text-white/60">
            {t('noAlerts')}
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {upcoming.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                <BellRing size={18} className="shrink-0 text-[#e2bd45]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-white/60">
                    {longDay(new Date(a.fireAt))}, {time(new Date(a.fireAt))} · {a.summary}
                  </p>
                  {a.notes ? <p className="truncate text-xs italic text-teal">{a.notes}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeAlert(a.id)}
                  aria-label={t('deleteAlert', { name: a.title })}
                  className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {past.length ? (
          <>
            <p className="mt-5 text-xs uppercase tracking-wider text-white/40">{t('pastAlerts')}</p>
            <ul className="mt-2 space-y-1">
              {past.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 text-xs text-white/50">
                  <span className="truncate">
                    {a.title} · {a.status === 'sent' ? t('sent') : t('notSent')}
                  </span>
                  <button type="button" onClick={() => removeAlert(a.id)} aria-label={t('deleteAlert', { name: a.title })} className="p-1">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <p className="mt-6 text-[11px] leading-relaxed text-white/40">
          {t('alertsFoot')}
        </p>
      </div>
    </div>
  )
}

/**
 * Casca do app instalado: só Tábua de Maré e Previsão do Tempo.
 * Visual próprio (fundo azul-marinho, abas embaixo, ondas animadas) mantendo as cores e fontes do site.
 */
export default function AppShell() {
  return (
    <AppPrefsProvider>
      <ShellLayout />
    </AppPrefsProvider>
  )
}

function ShellLayout() {
  const [showAlerts, setShowAlerts] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { t, lang } = useApp()
  const flag = LANGS.find((l) => l.code === lang)?.flag
  const alerts = useAppAlerts()
  const permission = useNotificationPermission()
  const pending = alerts.filter((a) => a.status === 'scheduled').length
  useSeo()

  useEffect(() => {
    startAlertScheduler()
    const previous = document.documentElement.style.backgroundColor
    document.documentElement.style.backgroundColor = '#0a1a33'
    return () => {
      document.documentElement.style.backgroundColor = previous
    }
  }, [])

  return (
    <div className="relative isolate min-h-screen bg-gradient-to-b from-navy-dark via-[#0f2347] to-[#0b2a3f] text-white">
      <BackgroundWaves />

      {/* Topo */}
      {/* Com o celular deitado (tela baixa), o topo e as abas ficam mais finos */}
      <header
        className={`sticky top-0 z-30 border-b border-white/10 bg-navy-dark/80 pb-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl [@media(orientation:landscape)_and_(max-height:520px)]:pb-1.5 [@media(orientation:landscape)_and_(max-height:520px)]:pt-[max(0.375rem,env(safe-area-inset-top))]`}
      >
        <div className="mx-auto flex max-w-lg items-center justify-between landscape:max-w-5xl">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
              <LogoAnchor className="h-6 w-auto animate-bob text-white" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-base tracking-[0.2em]">ROYAL MARINE</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#e2bd45]">{t('appTitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowLang(true)}
              aria-label={t('language')}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <Globe size={20} />
              <span className="absolute -bottom-0.5 -right-0.5 text-[13px] leading-none" aria-hidden="true">
                {flag}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowAlerts(true)}
              aria-label={`${t('myAlerts')}${pending ? `, ${t('alertsScheduled', { n: pending })}` : ''}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {permission === 'denied' ? <BellOff size={20} /> : <Bell size={20} />}
              {pending ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e2bd45] px-1 text-[10px] font-bold text-navy-dark">
                  {pending}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setShowProfile(true)}
              aria-label="Meu perfil"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Pedido de notificações (aparece até a pessoa responder) */}
      {permission === 'default' ? (
        <div className="mx-auto mt-3 max-w-lg px-4 landscape:max-w-5xl">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e2bd45]/30 bg-[#e2bd45]/10 p-3">
            <BellRing size={20} className="shrink-0 text-[#e2bd45]" aria-hidden="true" />
            <p className="flex-1 text-xs text-white/85">{t('notifBanner')}</p>
            <button
              type="button"
              onClick={() => askNotificationPermission()}
              className="shrink-0 rounded-full bg-[#e2bd45] px-3 py-2 text-xs font-semibold text-navy-dark"
            >
              {t('enable')}
            </button>
          </div>
        </div>
      ) : null}

      <main
        className={`mx-auto max-w-lg pb-32 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-4 landscape:max-w-5xl [@media(orientation:landscape)_and_(max-height:520px)]:pb-24`}
      >
        <Outlet />
        <div className="mt-8 flex justify-center">
          <InstallAppButton
            text={{
              button: t('installApp'),
              title: t('installIos'),
              close: t('close'),
              step1: t('ios1'),
              step2: t('ios2'),
              step3: t('ios3'),
            }}
          />
        </div>
      </main>

      {/* Abas embaixo */}
      <nav
        aria-label={t('navLabel')}
        className={`fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] [@media(orientation:landscape)_and_(max-height:520px)]:pb-[max(0.375rem,env(safe-area-inset-bottom))]`}
      >
        <div className="mx-auto flex max-w-xs items-center gap-1 rounded-full border border-white/15 bg-navy-dark/85 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {tabs.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }: { isActive: boolean }) =>
                `flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-all duration-300 [@media(orientation:landscape)_and_(max-height:520px)]:py-2 ${
                  isActive ? 'bg-teal text-navy-dark shadow-lg' : 'text-white/70 hover:text-white'
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {t(key)}
            </NavLink>
          ))}
        </div>
      </nav>

      <AlertsSheet open={showAlerts} onClose={() => setShowAlerts(false)} />
      <LanguageSheet open={showLang} onClose={() => setShowLang(false)} />
      <ProfileSheet open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}
