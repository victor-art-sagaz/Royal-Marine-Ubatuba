/**
 * Planos e valores da garagem náutica. Para mudar um preço, um texto ou a foto de fundo,
 * edite aqui: o visual da seção "Planos e valores" se ajusta sozinho.
 */

export interface PricingPrice {
  /** Texto pequeno antes do preço, ex.: "A partir de". Deixe vazio se não tiver. */
  label?: string
  /** Valor em reais. Deixe sem valor e use "text" para mostrar uma frase no lugar do preço. */
  value?: number
  /** Frase no lugar do preço, ex.: "Valor sob consulta" */
  text?: string
  /** Texto depois do preço, ex.: "por pé". */
  unit?: string
}

export interface PricingPlan {
  id: string
  name: string
  /** Linha pequena abaixo do nome (opcional) */
  subtitle?: string
  /** Mostra o selo "Mais completo" e a borda dourada */
  featured?: boolean
  prices: PricingPrice[]
  /** O que está incluído (pode ficar vazio) */
  includes: string[]
  /** Observação (aparece em itálico) */
  note?: string
  /** Foto de fundo do cartão (pasta public/images) */
  image: string
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'mensal-premium',
    name: 'Mensal Premium',
    featured: true,
    prices: [{ text: 'Valor sob consulta' }],
    includes: ['Descidas ilimitadas', 'Bote de apoio', 'Poita'],
    image: '/images/cuidados/iate-inverno.jpg',
  },
  {
    id: 'mensal-basic',
    name: 'Mensal Basic',
    prices: [{ value: 88, unit: 'por pé' }],
    includes: ['4 descidas e 4 subidas por mês', '3 poitas disponíveis'],
    note: 'Não inclui bote de apoio.',
    image: '/images/cuidados/conves.jpg',
  },
  {
    id: 'vagas-manutencao',
    name: 'Vagas para manutenção',
    subtitle: 'Plano de 1 mês',
    prices: [{ value: 130, unit: 'por pé' }],
    includes: [],
    image: '/images/cuidados/parte-eletrica.jpg',
  },
  {
    id: 'mensal-jet-ski',
    name: 'Mensal – Jet Ski',
    prices: [{ value: 790, unit: 'por mês' }],
    includes: ['Descidas ilimitadas'],
    image: '/images/cuidados/marina-equipe.jpg',
  },
  {
    id: 'operacoes-avulsas',
    name: 'Operações avulsas',
    prices: [{ label: 'A partir de', value: 200, unit: 'por operação' }],
    includes: ['Serviços de lançamento e retirada ao mar'],
    image: '/images/cuidados/timao-seguranca.jpg',
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
