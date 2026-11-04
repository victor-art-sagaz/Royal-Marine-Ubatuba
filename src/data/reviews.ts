import type { Review, ReviewSummary } from '../types'

/**
 * Avaliações reais copiadas do Google ("Royal Marine garagem náutica").
 * Textos mantidos exatamente como os clientes escreveram.
 * Para adicionar mais: copie um bloco abaixo e troque os dados.
 */

// Resumo mostrado pelo Google no momento da cópia (nota 4,9 com 23 avaliações)
export const reviewSummary: ReviewSummary = { score: 4.9, count: 23 }

// Link para o botão "Ver todas no Google" (busca da empresa no Google Maps).
// Se tiver o link direto da página de avaliações, cole aqui no lugar.
export const googleReviewsUrl =
  'https://www.google.com/maps/search/?api=1&query=Royal+Marine+garagem+n%C3%A1utica+Ubatuba'

export const reviews: Review[] = [
  {
    id: 'arthur-skerratt',
    author: 'Arthur Skerratt',
    authorInfo: '2 avaliações',
    rating: 5,
    text: 'Melhor atendimento de ubatuba e infraestrutura magnífica !',
  },
  {
    id: 'vitor-derencius',
    author: 'Vitor Derencius',
    authorInfo: 'Local Guide · 112 avaliações · 15 fotos',
    rating: 5,
    text: 'Serviço prestado pela equipe nota 10, podem deixar tranquilos a sua embarcação com eles.',
  },
  {
    id: 'adriano-chagas',
    author: 'Adriano Chagas',
    authorInfo: '1 avaliação',
    rating: 5,
    text: 'Marina excelente com funcionários de confiança',
  },
  {
    id: 'danilo-galvao',
    author: 'Danilo Galvão',
    authorInfo: 'Local Guide · 75 avaliações · 10 fotos',
    rating: 4,
    text: 'Equipe capacitada, estrutura legal',
  },
  {
    id: 'fabiana-pass',
    author: 'Fabiana Pass',
    authorInfo: 'Local Guide · 172 avaliações · 8 fotos',
    rating: 5,
    text: 'Pessoal muito prestativo. Trabalho muito bem prestado.',
  },
  {
    id: 'agencia-outlabs',
    author: 'Agencia Outlabs',
    authorInfo: '1 avaliação · 1 foto',
    rating: 5,
    text: 'Melhor de ubatuba',
  },
  {
    id: 'mecanica-agricola-mingotte',
    author: 'Mecânica Agrícola Mingotte',
    authorInfo: 'Local Guide · 2 avaliações · 14 fotos',
    rating: 5,
    text: 'Ótimo atendimento',
  },
  {
    id: 'clovis-santos',
    author: 'Clovis Santos',
    authorInfo: 'Local Guide · 134 avaliações · 46 fotos',
    rating: 5,
    text: 'Excelente',
  },
  {
    id: 'giovanna-ricarte',
    author: 'Giovanna Ricarte',
    authorInfo: '1 avaliação',
    rating: 5,
    text: 'Excelente 👏',
  },
]
