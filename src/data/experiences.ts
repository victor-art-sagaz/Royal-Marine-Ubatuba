import { Anchor, Ship } from 'lucide-react'
import type { InterestId, InterestOption } from '../types'

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
