/**
 * Dados usados pelo Google e pelas prévias de compartilhamento (títulos e descrições das páginas).
 *
 * IMPORTANTE: se o endereço do site mudar, troque SITE_URL aqui e também
 * em index.html, public/robots.txt e public/sitemap.xml.
 */
export const SITE_URL = 'https://royalmarineubatuba.com.br'
export const SITE_NAME = 'Royal Marine - Garagem Náutica'
export const OG_IMAGE = '/images/og-royal-marine.jpg'

export interface PageSeo {
  title: string
  description: string
  /** true = pede ao Google para não listar esta página. */
  noindex?: boolean
}

export const defaultSeo: PageSeo = {
  title: 'Garagem Náutica em Ubatuba | Vagas Cobertas | Royal Marine',
  description:
    'Garagem náutica em Ubatuba com 10.000m² de vagas cobertas para até 150 embarcações, poitas, monitoramento 24h e serviços náuticos. Solicite um orçamento.',
}

/** Uma entrada por endereço do site (sem a barra final). A Página Inicial é "/". */
export const pageSeo: Record<string, PageSeo> = {
  '/': defaultSeo,
  '/newpage': {
    title: 'Previsão do Tempo e do Mar em Ubatuba | Royal Marine',
    description:
      'Veja a previsão do tempo, do vento e das ondas em Ubatuba antes de sair com a sua embarcação. Informação para navegar com mais segurança.',
  },
  '/tabua-de-mare': {
    title: 'Tábua de Maré em Ubatuba | Royal Marine',
    description:
      'Preia-mares e baixa-mares do Saco da Ribeira, em Ubatuba, com gráfico da maré do dia e previsão da atividade dos peixes para a sua pescaria.',
  },
  '/cuidados-a-bordo': {
    title: 'Cuidados a Bordo | Dicas para Marinheiros | Royal Marine',
    description:
      'Cuidados com óleo, combustível, parte elétrica, segurança e o que levar a bordo: dicas da Royal Marine para marinheiros particulares e proprietários em Ubatuba.',
  },
  '/about-us': {
    title: 'Sobre nós | Royal Marine - Garagem Náutica',
    description:
      'Conheça a Royal Marine, garagem náutica inaugurada em dezembro de 2017 em Ubatuba, com 10.000m², capacidade para 150 embarcações e todas as vagas cobertas.',
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
  '/app/mare': {
    title: 'Maré · App Royal Marine',
    description: 'Tábua de maré do Saco da Ribeira com alertas no celular. App Royal Marine.',
    noindex: true,
  },
  '/app/tempo': {
    title: 'Tempo · App Royal Marine',
    description: 'Previsão do tempo em Ubatuba com alertas de chuva e vento. App Royal Marine.',
    noindex: true,
  },
  '/termos-de-uso': {
    title: 'Termos de Uso | Royal Marine - Garagem Náutica',
    description: 'Regras de uso do site e do app da Royal Marine, incluindo as informações de maré, tempo e alertas.',
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
