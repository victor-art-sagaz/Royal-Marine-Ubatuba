import { Anchor, Compass, Fish, LifeBuoy, Sparkles, Sun, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Loja do Navegante (TESTE)
 *
 * Os produtos abaixo são EXEMPLOS para ver o visual da página.
 * Na versão final, a lista virá do robô de ofertas (todo dia) e cada link será o link de afiliado
 * gerado no painel do Programa de Afiliados do Mercado Livre.
 */

export type StoreCategoryId = 'seguranca' | 'motor' | 'limpeza' | 'ancoragem' | 'navegacao' | 'pesca' | 'praia'

export interface StoreCategory {
  id: StoreCategoryId
  label: string
  description: string
  icon: LucideIcon
  /** Termo usado no botão "Ver mais no Mercado Livre" da categoria */
  searchTerm: string
}

export interface StoreProduct {
  id: string
  category: StoreCategoryId
  name: string
  /** Texto no nosso jeito de escrever (curto, útil, sem exagero) */
  blurb: string
  /** Dica prática da equipe Royal Marine */
  tip?: string
  /** Link do produto (na versão final: link de afiliado do Mercado Livre) */
  url: string
  /** Foto do produto (na versão final: a foto do anúncio, vinda do Mercado Livre) */
  image?: string
  /** Preço e desconto (na versão final: atualizados todo dia pelo robô) */
  price?: number
  oldPrice?: number
  /** true = produto de exemplo, só para o teste */
  example?: boolean
}

/** Busca no Mercado Livre por um termo (usado nos exemplos e no "Ver mais") */
export function mercadoLivreSearchUrl(term: string): string {
  const slug = term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `https://lista.mercadolivre.com.br/${slug}`
}

export const storeCategories: StoreCategory[] = [
  {
    id: 'seguranca',
    label: 'Segurança a bordo',
    description: 'Itens que a Capitania pede e que ninguém deveria esquecer no píer.',
    icon: LifeBuoy,
    searchTerm: 'colete salva vidas nautico',
  },
  {
    id: 'motor',
    label: 'Motor e mecânica',
    description: 'Manutenção básica para o motor não te deixar na mão no meio da baía.',
    icon: Wrench,
    searchTerm: 'motor de popa manutencao',
  },
  {
    id: 'limpeza',
    label: 'Limpeza e estética',
    description: 'Para o casco e o estofado aguentarem o sol e o sal de Ubatuba.',
    icon: Sparkles,
    searchTerm: 'limpeza nautica barco',
  },
  {
    id: 'ancoragem',
    label: 'Amarração e ancoragem',
    description: 'Cabos, defensas e âncoras para atracar e fundear com tranquilidade.',
    icon: Anchor,
    searchTerm: 'defensa nautica barco',
  },
  {
    id: 'navegacao',
    label: 'Navegação e eletrônicos',
    description: 'Rádio, GPS e proteção para o celular a bordo.',
    icon: Compass,
    searchTerm: 'radio vhf nautico portatil',
  },
  {
    id: 'pesca',
    label: 'Pesca',
    description: 'Do molinete à caixa de iscas, para aproveitar a maré certa.',
    icon: Fish,
    searchTerm: 'pesca embarcada',
  },
  {
    id: 'praia',
    label: 'Praia e verão',
    description: 'Conforto para a família no passeio e na areia.',
    icon: Sun,
    searchTerm: 'caixa termica praia',
  },
]

function example(id: string, category: StoreCategoryId, name: string, blurb: string, search: string, tip?: string): StoreProduct {
  return { id, category, name, blurb, tip, url: mercadoLivreSearchUrl(search), example: true }
}

export const storeProducts: StoreProduct[] = [
  example('colete', 'seguranca', 'Colete salva-vidas homologado', 'Um por pessoa a bordo, do tamanho certo para cada um, inclusive as crianças.', 'colete salva vidas homologado marinha', 'Confira a etiqueta de homologação da Marinha antes de comprar.'),
  example('kit-socorros', 'seguranca', 'Kit de primeiros socorros à prova d’água', 'Fica seco dentro do porão e resolve os pequenos acidentes do passeio.', 'kit primeiros socorros a prova d agua'),
  example('lanterna', 'seguranca', 'Lanterna estanque', 'Para a volta no fim da tarde e para qualquer imprevisto à noite.', 'lanterna estanque a prova d agua'),
  example('oleo-2t', 'motor', 'Óleo 2 tempos náutico', 'Feito para motor que trabalha na água salgada. Siga o tipo indicado pelo fabricante do seu motor.', 'oleo 2 tempos nautico', 'Na dúvida sobre o óleo certo, pergunte à nossa equipe antes de comprar.'),
  example('bateria', 'motor', 'Bateria náutica', 'Aguenta a vibração do mar e a partida do motor depois de dias parado.', 'bateria nautica'),
  example('graxa', 'motor', 'Graxa marítima', 'Protege peças e engates contra a corrosão do sal.', 'graxa maritima nautica'),
  example('shampoo', 'limpeza', 'Shampoo náutico', 'Tira o sal do casco sem atacar o gelcoat. Ideal depois de cada saída.', 'shampoo nautico barco'),
  example('cera', 'limpeza', 'Cera para gelcoat', 'Devolve o brilho e cria uma camada contra o sol forte do verão.', 'cera gelcoat nautica', 'Para a estética completa, a WashBoat atende dentro da marina.'),
  example('vinil', 'limpeza', 'Limpador e protetor de vinil', 'Cuida dos estofados e evita que rachem com o sol.', 'limpador protetor vinil nautico'),
  example('defensa', 'ancoragem', 'Defensa náutica', 'Protege o casco ao encostar no píer ou em outra embarcação.', 'defensa nautica'),
  example('cabo', 'ancoragem', 'Cabo de amarração', 'Cabo trançado próprio para água salgada, que não endurece com o tempo.', 'cabo de amarracao nautico'),
  example('ancora', 'ancoragem', 'Âncora para lancha', 'Para fundear nas praias e ilhas da região com segurança.', 'ancora para lancha'),
  example('vhf', 'navegacao', 'Rádio VHF portátil', 'Contato com outras embarcações e com o socorro no canal 16.', 'radio vhf portatil nautico'),
  example('gps', 'navegacao', 'GPS náutico portátil', 'Marca os pontos de pesca e o caminho de volta.', 'gps nautico portatil'),
  example('capa-celular', 'navegacao', 'Capa estanque para celular', 'O celular a bordo, seco e funcionando, até na chuva.', 'capa estanque celular'),
  example('molinete', 'pesca', 'Conjunto de vara e molinete', 'Para a pesca embarcada nas ilhas de Ubatuba.', 'vara e molinete pesca embarcada', 'Veja na nossa Tábua de Maré os melhores horários para pescar.'),
  example('caixa-pesca', 'pesca', 'Caixa de pesca', 'Iscas, anzóis e linhas organizados e longe da água.', 'caixa de pesca'),
  example('caixa-termica', 'praia', 'Caixa térmica', 'Bebida gelada o passeio inteiro.', 'caixa termica 40 litros'),
  example('guarda-sol', 'praia', 'Guarda-sol de praia', 'Sombra para a família na parada da praia.', 'guarda sol praia'),
  example('protetor', 'praia', 'Protetor solar resistente à água', 'No mar, o sol queima mais rápido do que parece.', 'protetor solar resistente a agua'),
]

export function getStoreCategory(id: StoreCategoryId): StoreCategory | undefined {
  return storeCategories.find((category) => category.id === id)
}
