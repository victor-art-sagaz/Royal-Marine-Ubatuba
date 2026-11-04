import { useEffect, useRef, useState } from 'react'
import { Check, Facebook, Link2, Linkedin, Mail, MessageCircle } from 'lucide-react'

interface ShareBarProps {
  title: string
}

const pill =
  'inline-flex items-center gap-2 rounded-full border border-navy/20 bg-navy/5 px-4 py-2 text-sm font-medium text-navy shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy hover:text-white hover:shadow-[0_0_18px_rgba(20,40,75,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy'

/** Botões para compartilhar a notícia (e copiar o link). */
export default function ShareBar({ title }: ShareBarProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const url = typeof window !== 'undefined' ? window.location.href : ''
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copie o link da notícia:', url)
      return
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        className={pill}
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle size={16} aria-hidden="true" /> WhatsApp
      </a>
      <a
        className={pill}
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Facebook size={16} aria-hidden="true" /> Compartilhar
      </a>
      <a
        className={pill}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Linkedin size={16} aria-hidden="true" /> LinkedIn
      </a>
      <a className={pill} href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}>
        <Mail size={16} aria-hidden="true" /> Correio
      </a>
      <button type="button" className={pill} onClick={copyLink} aria-live="polite">
        {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
        {copied ? 'Link copiado!' : 'Copiar link'}
      </button>
    </div>
  )
}
