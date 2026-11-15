import { useEffect, useState } from 'react'
import { Download, Share, SquarePlus, X } from 'lucide-react'
import { isStandalone } from '../lib/standalone'

/** Evento que o Chrome/Android dispara quando o site pode ser instalado como app */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let savedPrompt: InstallPromptEvent | null = null
const listeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    savedPrompt = event as InstallPromptEvent
    listeners.forEach((fn) => fn())
  })
  window.addEventListener('appinstalled', () => {
    savedPrompt = null
    listeners.forEach((fn) => fn())
  })
}


const isIos = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

/**
 * Botão "Instalar o app": no Android/Chrome abre a instalação; no iPhone mostra o passo a passo.
 * Some sozinho quando o site já está aberto como app.
 */
/** Textos do botão (o app troca pelo idioma escolhido; sem eles, fica em português) */
export interface InstallText {
  button: string
  title: string
  close: string
  step1: string
  step2: string
  step3: string
}

export default function InstallAppButton({ className = '', text }: { className?: string; text?: InstallText }) {
  const [, setTick] = useState(0)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [installed, setInstalled] = useState(isStandalone())

  useEffect(() => {
    const update = () => {
      setTick((n) => n + 1)
      setInstalled(isStandalone())
    }
    listeners.add(update)
    return () => {
      listeners.delete(update)
    }
  }, [])

  if (installed) return null
  const canPrompt = savedPrompt !== null
  const ios = isIos()
  if (!canPrompt && !ios) return null

  const install = async () => {
    if (savedPrompt) {
      await savedPrompt.prompt()
      await savedPrompt.userChoice.catch(() => undefined)
      savedPrompt = null
      setTick((n) => n + 1)
    } else {
      setShowIosHelp(true)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center gap-2 rounded-full bg-[#e2bd45] px-5 py-3 text-sm font-medium text-navy-dark shadow-lg transition hover:bg-[#f0cd5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${className}`}
      >
        <Download size={18} aria-hidden="true" /> {text ? text.button : 'Instalar o app Royal Marine'}
      </button>

      {showIosHelp ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="presentation">
          <button
            type="button"
            aria-label={text ? text.close : 'Fechar'}
            onClick={() => setShowIosHelp(false)}
            className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="instalar-titulo"
            className="relative w-full rounded-t-3xl bg-white p-6 text-left text-navy shadow-2xl sm:max-w-sm sm:rounded-3xl"
          >
            <div className="flex items-start justify-between">
              <h2 id="instalar-titulo" className="font-display text-xl tracking-wide">
                {text ? text.title : 'Instalar no iPhone'}
              </h2>
              <button
                type="button"
                onClick={() => setShowIosHelp(false)}
                aria-label={text ? text.close : 'Fechar'}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <ol className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs text-white">1</span>
                <span>
                  {text ? text.step1 : null}
                  {text ? null : <>
                  Abra este site no <strong className="font-medium">Safari</strong> e toque em{' '}
                  <Share size={14} className="inline align-[-2px]" aria-label="Compartilhar" /> (Compartilhar).
                  </>}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs text-white">2</span>
                <span>
                  {text ? text.step2 : <>
                  Escolha <SquarePlus size={14} className="inline align-[-2px]" aria-hidden="true" />{' '}
                  <strong className="font-medium">Adicionar à Tela de Início</strong>.
                  </>}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs text-white">3</span>
                <span>
                  {text ? (
                    text.step3
                  ) : (
                    <>
                      Toque em <strong className="font-medium">Adicionar</strong>. O ícone da Royal Marine aparece na sua tela.
                    </>
                  )}
                </span>
              </li>
            </ol>
          </div>
        </div>
      ) : null}
    </>
  )
}
