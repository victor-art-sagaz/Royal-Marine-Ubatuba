import { Anchor, CloudSun, Info, MessageCircle, Mountain, Newspaper } from 'lucide-react'
import type { ContactInfo, MenuItem, Stat } from '../types'

export const menuItems: MenuItem[] = [
  { label: 'Página Inicial', path: '/', icon: Anchor },
  { label: 'Previsão do Tempo', path: '/newpage', icon: CloudSun },
  { label: 'Sobre nós', path: '/about-us', icon: Info },
  { label: 'Nosso Blog', path: '/news', icon: Newspaper },
  { label: 'Contato', path: '/contact', icon: MessageCircle },
  { label: 'Sobre Ubatuba', path: '/newpage1', icon: Mountain },
]

export const contact: ContactInfo = {
  name: 'ROYAL MARINE - GARAGEM NÁUTICA',
  tagline: 'Novo conceito em garagem náutica de Ubatuba!',
  addresses: [
    {
      label: 'Recepção',
      street: 'Rua Marginal, 181',
      district: 'Saco da Ribeira',
      city: 'Ubatuba - SP',
      cep: '11680-000',
    },
    {
      label: 'Garagem',
      street: 'Rua Codó, 96',
      district: 'Saco da Ribeira',
      city: 'Ubatuba - SP',
      cep: '11680-000',
    },
  ],
  phones: [
    { display: '(12) 99248-6817', whatsappNumber: '5512992486817' },
    { display: '(12) 99775-7520', whatsappNumber: '5512997757520' },
  ],
  email: 'contato@royalmarineservice.com.br',
  instagram: 'https://www.instagram.com/royalmarineubatuba',
  facebook: 'https://www.facebook.com/share/1E3gUBK2tD/',
}

export const stats: Stat[] = [
  { value: 3000, suffix: 'm²', label: 'Espaço amplo e coberto' },
  { value: 80, label: 'Vagas Náuticas' },
  { value: 5, label: 'Consultores para te atender' },
  { value: 20, label: 'Anos de experiência' },
]

export const aboutFooter =
  'Novo conceito em Marina, com mais de 3.000m² de vagas cobertas. com vestiários, sistema de alarme e monitoramento online de sua embarcação.'

export const images = {
  galpaoInterior: '/images/galpao-interior.jpg',
  galpaoFachada: '/images/galpao-fachada.jpg',
  ubatubaOndas: '/images/ubatuba-ondas.jpg',
  ubatubaPraia: '/images/ubatuba-praia.jpg',
  ubatubaEnseada: '/images/ubatuba-enseada.jpg',
  ubatubaBaia: '/images/ubatuba-baia.jpg',
  ubatubaSurf: '/images/ubatuba-surf.jpg',
  ubatubaCantinho: '/images/ubatuba-cantinho.jpg',
  ubatubaCaverna: '/images/ubatuba-caverna.jpg',
  ubatubaGaivotas: '/images/ubatuba-gaivotas.jpg',
  ubatubaPlaca: '/images/ubatuba-placa.jpg',
  /** Foto de @amirimagens: coloque o arquivo em public/images/ubatuba-baleia-jubarte.jpg */
  ubatubaBaleia: '/images/ubatuba-baleia-jubarte.jpg',
}
