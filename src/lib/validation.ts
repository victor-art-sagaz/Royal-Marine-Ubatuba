import { contact } from '../data/site'
import { getInterest } from '../data/experiences'
import type { BookingErrors, BookingField, BookingValues } from '../types'

/** Ordem em que os campos aparecem (o primeiro com erro recebe o foco). */
export const FIELD_ORDER: BookingField[] = [
  'name',
  'email',
  'phone',
  'interest',
  'boatName',
  'boatSize',
  'message',
]

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** Máscara de telefone brasileiro: (12) 99999-9999 */
export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateBooking(values: BookingValues): BookingErrors {
  const errors: BookingErrors = {}

  if (values.name.trim().length < 3) {
    errors.name = 'Informe seu nome completo.'
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Informe um e-mail válido. Ex.: nome@email.com'
  }

  const digits = onlyDigits(values.phone)
  const ddd = Number(digits.slice(0, 2))
  const phoneOk =
    (digits.length === 10 || digits.length === 11) &&
    ddd >= 11 &&
    ddd <= 99 &&
    (digits.length === 10 || digits[2] === '9')
  if (!phoneOk) {
    errors.phone = 'Informe o telefone com DDD. Ex.: (12) 99999-9999'
  }

  if (!getInterest(values.interest)) {
    errors.interest = 'Escolha o que você procura.'
  }

  if (values.boatName.trim().length > 60) {
    errors.boatName = 'Use no máximo 60 caracteres.'
  }

  if (values.boatSize.trim().length > 20) {
    errors.boatSize = 'Use no máximo 20 caracteres. Ex.: 32 pés ou 10 m'
  }

  if (values.message.length > 500) {
    errors.message = 'Use no máximo 500 caracteres na mensagem.'
  }

  return errors
}

/** Monta a mensagem já formatada que será enviada para o WhatsApp da Royal Marine. */
export function buildWhatsAppMessage(values: BookingValues): string {
  const interest = getInterest(values.interest)
  const orDash = (text: string) => (text.trim() === '' ? 'Não informado' : text.trim())

  return [
    `Olá, ${contact.name}! ⚓`,
    'Gostaria de agendar uma visita / pedir informações:',
    '',
    `👤 Nome: ${values.name.trim()}`,
    `📧 E-mail: ${values.email.trim()}`,
    `📱 Telefone: ${values.phone}`,
    `🔎 Interessado em: ${interest ? interest.label : 'Não informado'}`,
    `🚤 Embarcação: ${orDash(values.boatName)}`,
    `📏 Tamanho: ${orDash(values.boatSize)}`,
    `📝 Mensagem: ${orDash(values.message)}`,
    '',
    'Aguardo o retorno. Obrigado!',
  ].join('\n')
}

export function buildWhatsAppUrl(values: BookingValues, whatsappNumber: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(values))}`
}
