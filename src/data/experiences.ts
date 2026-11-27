import { Anchor, Ship } from 'lucide-react'
import type { InterestId, InterestOption, SourceId, SourceOption } from '../types'

/** Opções do campo "Interessado em" do formulário de contato. */
export const interestOptions: InterestOption[] = [
  {
    id: 'garagem',
    label: 'Garagem Náutica',
    description: 'Vaga coberta e cuidados com a embarcação',
    icon: Anchor,
  },
  {
    id: 'embarcacao',
    label: 'Embarcação',
    description: 'Serviços e assuntos da sua embarcação',
    icon: Ship,
  },
]

export function getInterest(id: InterestId | ''): InterestOption | undefined {
  return interestOptions.find((option) => option.id === id)
}

/** Opções do campo "Como conheceu a Royal Marine?" (ajuda a saber qual divulgação traz mais clientes). */
export const sourceOptions: SourceOption[] = [
  { id: 'google', label: 'Pesquisa no Google' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'indicacao', label: 'Indicação de amigo ou cliente' },
  { id: 'whatsapp', label: 'Mensagem no WhatsApp' },
  { id: 'passando', label: 'Passei em frente à marina' },
  { id: 'evento', label: 'Evento, revista ou parceiro' },
  { id: 'outro', label: 'Outro' },
]

export function getSource(id: SourceId | ''): SourceOption | undefined {
  return sourceOptions.find((option) => option.id === id)
}
