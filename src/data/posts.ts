import { CloudLightning, LifeBuoy, LineChart, Map as MapIcon, Megaphone, Newspaper, Radio, Smartphone, Waves } from 'lucide-react'
import type { BlogPost } from '../types'

/** Do mais novo para o mais antigo. Cada notícia abre na própria página: /news/<id>. */
export const posts: BlogPost[] = [
  {
    id: 'aplicativo-boletim-ao-mar',
    title: 'Aplicativo: Boletim ao mar',
    subtitle: 'Feito para quem gosta de navegar…',
    author: 'Arthur Skerratt',
    date: '29 de dezembro de 2017',
    tag: 'Aplicativo',
    icon: Smartphone,
    cover: '/images/blog/boletim-telas.jpg',
    coverAlt: 'Telas do aplicativo Boletim ao Mar',
    excerpt:
      'Aplicativo feito para quem gosta de navegar… Chega de surpresas com o mar: receba diariamente informativos meteorológicos e informações náuticas sobre as condições de navegação.',
    blocks: [
      {
        type: 'screens',
        title: 'Conheça as telas do aplicativo',
        screens: [
          { src: '/images/blog/boletim-tela-1.jpg', alt: 'Tela de abertura do Boletim ao Mar, com os parceiros', caption: 'Tela de abertura' },
          { src: '/images/blog/boletim-tela-2.jpg', alt: 'Menu principal do Boletim ao Mar com seis botões', caption: 'Menu principal' },
          { src: '/images/blog/boletim-tela-3.jpg', alt: 'Menu lateral do Boletim ao Mar', caption: 'Menu lateral' },
          { src: '/images/blog/boletim-tela-4.jpg', alt: 'Mapa de avisos de mau tempo por região', caption: 'Avisos de mau tempo' },
          { src: '/images/blog/boletim-tela-5.jpg', alt: 'Previsão da Meteoromarinha para a Área Charlie', caption: 'Meteoromarinha' },
        ],
      },
      {
        type: 'p',
        text: 'Você já conhece? Chega de surpresas com o mar, baixe o novo aplicativo BOLETIM AO MAR e receba diariamente informativos meteorológicos sobre as condições do mar e informações náuticas sobre as condições de navegação. Aplicativo disponível para Android e iPhone.',
      },
      {
        type: 'list',
        title: 'Tenha em suas mãos:',
        items: [
          { label: 'Avisos de mau tempo', icon: CloudLightning },
          { label: 'Meteogramas', icon: LineChart },
          { label: 'Meteromarinha', icon: Waves },
          { label: 'Cartas Sinóticas', icon: MapIcon },
          { label: 'Rádio Náutico', icon: Radio },
          { label: 'Aviso aos Navegantes', icon: Megaphone },
        ],
      },
      {
        type: 'p',
        text: 'A Royal Marine se preocupa com os navegantes e procura trazer as novidades e notícias pra você estar sempre bem informado.',
      },
      {
        type: 'link',
        text: 'Para conhecer mais do aplicativo, acesse:',
        label: 'boletimaomar.com.br',
        url: 'http://boletimaomar.com.br/',
      },
      { type: 'partners', src: '/images/blog/parceiros.jpg', alt: 'Parceiros do aplicativo: Marinha do Brasil, DHN, RUMAR e Abrigo do Marinheiro' },
    ],
  },
  {
    id: 'seguranca-na-navegacao-quem-valoriza-a-vida-respeita',
    title: 'Segurança na Navegação: quem valoriza a vida, respeita!',
    subtitle: 'Operação Verão 2017/2018',
    author: 'Arthur Skerratt',
    date: '28 de dezembro de 2017',
    tag: 'Segurança',
    icon: LifeBuoy,
    cover: '/images/blog/seguranca-banner.jpg',
    coverAlt: 'Campanha “Quanto vale uma vida?” da Marinha do Brasil',
    excerpt:
      'A partir do dia 22 de dezembro, a Marinha do Brasil inicia a Operação Verão 2017/2018, uma campanha de conscientização e de fiscalização do tráfego aquaviário.',
    blocks: [
      {
        type: 'p',
        text: 'A partir do dia 22 de dezembro, a Marinha do Brasil inicia a Operação Verão 2017/2018. É uma Campanha voltada para a intensificação de ações de conscientização e de fiscalização do tráfego aquaviário nas áreas de maior concentração de embarcações, sobretudo as de esporte e recreio e de turismo náutico, por ocasião de férias e feriados prolongados.',
      },
      {
        type: 'p',
        text: 'De acordo com informações da Diretoria de Portos e Costas, a principal causa dos acidentes em embarcações de esporte e recreio é a falha humana, o que por vezes pode resultar em consequências irreversíveis. Para minimizar a possibilidade da ocorrência de desastres náuticos, a Campanha deste ano traz como mote a valorização da vida e a responsabilidade do proprietário e do condutor da embarcação, especialmente durante as atividades de lazer.',
      },
      {
        type: 'p',
        text: 'Com o conceito “Segurança da Navegação: quem valoriza a vida, respeita”, a mensagem chega ao público com uma linguagem reflexiva, retratada em imagens de situações de risco, acidentes e suas possíveis consequências. As peças frisam a importância de se adotar atitudes conscientes para prevenir acidentes e garantir a integridade física dos tripulantes, dos passageiros e dos banhistas, promovendo a divulgação das principais regras de navegação e a importância do seu cumprimento para quem deseja aproveitar a época mais quente do ano com segurança.',
      },
      {
        type: 'p',
        text: 'Dados da Superintendência de Segurança do Tráfego Aquaviário da DPC mostram que somente no verão 2016/2017 ocorreram mais de 34% do total dos acidentes registrados até dezembro deste ano. As lanchas e motos aquáticas são destaques nas estatísticas. Nos últimos três verões elas representaram mais de 74% dos casos registrados com embarcações de esporte e recreio.',
      },
      {
        type: 'p',
        text: 'Naufrágio, abalroamento, queda de pessoas na água, incêndio e colisão são os casos que mais chamam a atenção nas estatísticas. De dezembro de 2016 a março de 2017, as embarcações que mais se envolveram com esses acidentes durante o lazer foram lanchas (57%), motos aquáticas (16%) e botes (11%).',
      },
      {
        type: 'source',
        label: 'Texto oficial disponível em:',
        url: 'http://www.dpc.mar.mil.br/pt-br/comunicacao-social/op_verao17_18',
      },
      {
        type: 'video',
        youtubeId: 'uVvuuer8ANU',
        title: 'SOCIEDADE | Marinha lança operação para a temporada das férias.',
        credit: 'Cleber Barbosa',
        poster: '/images/blog/operacao-verao.jpg',
      },
    ],
  },
  {
    id: 'noticia-revista-nautica',
    title: 'Notícia - Revista Náutica',
    subtitle: 'Saco da Ribeira, em Ubatuba, ganha nova marina',
    author: 'Arthur Skerratt - Royal Marine',
    date: '27 de dezembro de 2017',
    tag: 'Na imprensa',
    icon: Newspaper,
    cover: '/images/blog/revista-interior.jpg',
    coverAlt: 'Interior coberto da nova marina do Saco da Ribeira, em Ubatuba',
    excerpt: 'Veja a notícia sobre a Royal Marine Garagem na Revista Náutica.',
    blocks: [
      {
        type: 'p',
        text: 'Foi inaugurada no último dia 4, no Saco da Ribeira, em Ubatuba, uma nova marina com mais de 3 000 m² e capacidade para até 80 embarcações em vagas cobertas. O local conta com vestiários, home-box, sistema de alarme e monitoramento online 24 horas, além de Wi-Fi, sala de rádio e hall social. Lojas náuticas e conveniência serão implementadas nos próximos meses. A marina está com preço promocional de inauguração para as 30 primeiras embarcações.',
      },
      {
        type: 'p',
        text: 'A Royal Marine conta com equipe técnica responsável pelo funcionamento e análise semanal das embarcações, recomendando manutenção preventiva e corretiva, quando necessário, o que diminui transtornos como quebra de embarcação no mar e gastos excessivos desnecessários. Além disso, outra equipe é responsável pela limpeza das embarcações.',
      },
      {
        type: 'p',
        text: 'O local tem lançamentos (subida e descida) ilimitados e funciona todos os dias da semana, inclusive em horário de almoço, para permitir maior flexibilidade de utilização/manutenção das embarcações. De segunda a sexta, fica das 8h às 17h; sábados, domingos e feriados, das 8h às 18h; e durante a temporada de verão, das 8h às 19h.',
      },
      {
        type: 'source',
        label: 'Divulgado em:',
        url: 'http://www.nautica.com.br/saco-da-ribeira-em-ubatuba-ganha-nova-marina',
      },
      {
        type: 'figure',
        src: '/images/blog/revista-fachada.jpg',
        alt: 'Fachada da marina, com a cobertura em arco e o portão azul',
        caption: 'Fachada da Royal Marine no Saco da Ribeira',
      },
    ],
  },
]

export const getPost = (id: string): BlogPost | undefined => posts.find((post) => post.id === id)

/** Tempo de leitura aproximado, em minutos. */
export function readingMinutes(post: BlogPost): number {
  const words = post.blocks.reduce((total, block) => {
    if (block.type === 'p') return total + block.text.split(/\s+/).length
    return total
  }, 0)
  return Math.max(1, Math.round(words / 200))
}
