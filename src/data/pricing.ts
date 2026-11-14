/**
 * Planos e valores da garagem náutica. Para mudar um preço ou um texto, edite aqui:
 * o visual da seção "Valores" se ajusta sozinho.
 */

export interface PricingPrice {
  /** Texto pequeno antes do preço, ex.: "Até 30 pés". Deixe vazio se não tiver. */
  label?: string
  /** Valor em reais */
  value: number
  /** Texto depois do preço, ex.: "por pé". Deixe vazio se for valor fechado. */
  unit?: string
}

export interface PricingPlan {
  id: string
  name: string
  /** Mostra o selo "Mais completo" */
  featured?: boolean
  prices: PricingPrice[]
  /** O que está incluído */
  includes: string[]
  /** Observação (aparece em itálico, sem o símbolo de "incluído") */
  note?: string
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'mensal-lancha',
    name: 'Mensal – Lancha',
    featured: true,
    prices: [{ value: 103, unit: 'por pé' }],
    includes: ['Descidas ilimitadas', 'Bote de apoio', 'Poita'],
  },
  {
    id: 'mensal-lancha-passeio',
    name: 'Mensal – Lancha de passeio',
    prices: [{ value: 88, unit: 'por pé' }],
    includes: ['4 descidas e 4 subidas por mês', '3 poitas disponíveis'],
    note: 'Não inclui bote de apoio.',
  },
  {
    id: 'avulso-1-mes',
    name: 'Plano de 1 mês – Avulso',
    prices: [
      { label: 'Até 30 pés', value: 130, unit: 'por pé' },
      { label: 'Acima de 30 pés', value: 150, unit: 'por pé' },
    ],
    includes: ['1 subida e 1 descida'],
    note: 'Vaga para manutenção: valor sob consulta.',
  },
  {
    id: 'mensal-jet-ski',
    name: 'Mensal – Jet Ski',
    prices: [{ value: 850, unit: 'por mês' }],
    includes: ['Descidas ilimitadas'],
  },
]

/** Descontos e vagas especiais */
export const pricingSpecials: { title: string; text: string }[] = [
  {
    title: 'Desconto especial',
    text: 'Tem mais de uma lancha, ou um jet ski junto com a lancha? Fale com a gente: você pode ter acesso a um desconto especial.',
  },
  {
    title: 'Vaga diária',
    text: 'Sujeita à disponibilidade. Consulte a nossa equipe antes de vir.',
  },
]
