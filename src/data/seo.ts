/**
 * Dados usados pelo Google e pelas prévias de compartilhamento (títulos e descrições das páginas).
 *
 * IMPORTANTE: se o endereço do site mudar, troque SITE_URL aqui e também
 * em index.html, public/robots.txt e public/sitemap.xml.
 */
export const SITE_URL = 'https://royalmarineservice.com.br'
export const SITE_NAME = 'Royal Marine - Garagem Náutica'
export const OG_IMAGE = '/images/og-royal-marine.jpg'

export interface PageSeo {
  title: string
  description: string
  /** true = pede ao Google para não listar esta página. */
  noindex?: boolean
}

export const defaultSeo: PageSeo = {
  title: 'Royal Marine - Garagem Náutica | Ubatuba',
  description:
    'Royal Marine - Garagem Náutica. Novo conceito em garagem náutica de Ubatuba, com mais de 3.000m² de vagas cobertas, alarme e monitoramento online 24 horas.',
}

/** Uma entrada por endereço do site (sem a barra final). A Página Inicial é "/". */
export const pageSeo: Record<string, PageSeo> = {
  '/': defaultSeo,
  '/newpage': {
    title: 'Previsão do Tempo e do Mar em Ubatuba | Royal Marine',
    description:
      'Veja a previsão do tempo, do vento e das ondas em Ubatuba antes de sair com a sua embarcação. Informação para navegar com mais segurança.',
  },
  '/about-us': {
    title: 'Sobre nós | Royal Marine - Garagem Náutica',
    description:
      'Conheça a Royal Marine, garagem náutica inaugurada em dezembro de 2017 em Ubatuba, com 3.000m², capacidade para 80 embarcações e todas as vagas cobertas.',
  },
  '/news': {
    title: 'Nosso Blog | Royal Marine - Garagem Náutica',
    description: 'Notícias, dicas de segurança e novidades para quem gosta de navegar, direto da Royal Marine em Ubatuba.',
  },
  '/contact': {
    title: 'Contato e Reservas | Royal Marine - Garagem Náutica',
    description:
      'Fale com a Royal Marine pelo WhatsApp, peça informações sobre vagas ou agende uma visita. Rua Marginal, 181 - Saco da Ribeira, Ubatuba - SP.',
  },
  '/newpage1': {
    title: 'Sobre Ubatuba | Royal Marine - Garagem Náutica',
    description:
      'Conheça Ubatuba, no Litoral Norte de São Paulo: praias, enseadas, baleias-jubarte e muito mais para quem ama o mar.',
  },
  '/privacidade': {
    title: 'Política de Privacidade | Royal Marine - Garagem Náutica',
    description: 'Saiba como a Royal Marine cuida dos seus dados pessoais, de acordo com a LGPD.',
  },
}

/** Página que não existe: o Google não deve listar. */
export const notFoundSeo: PageSeo = {
  title: 'Página não encontrada | Royal Marine - Garagem Náutica',
  description: defaultSeo.description,
  noindex: true,
}
