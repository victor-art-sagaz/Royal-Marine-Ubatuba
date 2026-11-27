import { MessageCircle } from 'lucide-react'
import GlassButton from './GlassButton'

interface ShareWhatsAppButtonProps {
  /** Texto que já vai escrito no WhatsApp (o link do site deve estar no final) */
  text: string
  label?: string
  tone?: 'default' | 'gold' | 'dark'
}

/** Botão "Compartilhar no WhatsApp": abre o WhatsApp com o boletim pronto para enviar a amigos e grupos. */
export default function ShareWhatsAppButton({ text, label = 'Compartilhar no WhatsApp', tone = 'gold' }: ShareWhatsAppButtonProps) {
  return (
    <GlassButton
      href={`https://wa.me/?text=${encodeURIComponent(text)}`}
      external
      tone={tone}
      icon={<MessageCircle size={18} aria-hidden="true" />}
    >
      {label}
    </GlassButton>
  )
}
