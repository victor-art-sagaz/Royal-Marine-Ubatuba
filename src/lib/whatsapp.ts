/** Mensagem que já aparece escrita quando a pessoa abre o WhatsApp pelo site. */
export const defaultWhatsappMessage =
  'Olá! Vim pelo site da Royal Marine e gostaria de informações sobre vagas na garagem náutica.'

/** Monta o link do WhatsApp (celular abre o app, computador abre o WhatsApp Web). */
export function whatsappUrl(number: string, message: string = defaultWhatsappMessage): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
