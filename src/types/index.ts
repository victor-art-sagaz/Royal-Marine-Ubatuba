import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
  label: string
  path: string
  icon: LucideIcon
}

export interface Stat {
  value: number
  suffix?: string
  label: string
}

export interface Feature {
  icon: LucideIcon
  title: string
  text: string
}

export interface Address {
  label: string
  street: string
  district: string
  city: string
  cep: string
}

export interface Phone {
  display: string
  whatsappNumber: string
}

export interface ContactInfo {
  name: string
  tagline: string
  addresses: Address[]
  phones: Phone[]
  email: string
  instagram: string
  facebook: string
}

export interface Review {
  id: string
  author: string
  /** Texto que o Google mostra abaixo do nome, ex.: "Local Guide · 134 avaliações" */
  authorInfo?: string
  rating: number
  text: string
  /** true = texto de modelo (não é avaliação real). */
  isSample?: boolean
}

export interface ReviewSummary {
  score: number
  count: number
}

/** Pedaços de um texto do blog, na ordem em que aparecem na página. */
export type PostBlock =
  | { type: 'p'; text: string }
  | { type: 'figure'; src: string; alt: string; caption?: string }
  | { type: 'list'; title: string; items: { label: string; icon: LucideIcon }[] }
  | { type: 'source'; label: string; url: string }
  | { type: 'link'; text: string; label: string; url: string }
  | { type: 'video'; youtubeId: string; title: string; credit: string; poster: string }
  | { type: 'screens'; title: string; screens: { src: string; alt: string; caption: string }[] }
  | { type: 'partners'; src: string; alt: string }

export interface BlogPost {
  /** Também é o endereço da página: /news/<id> */
  id: string
  title: string
  subtitle: string
  author: string
  date: string
  excerpt: string
  tag: string
  icon: LucideIcon
  cover: string
  coverAlt: string
  blocks: PostBlock[]
}

/** Uma pergunta frequente (FAQ) com a resposta. */
export interface FaqItem {
  id: string
  question: string
  /** Cada texto vira um parágrafo. */
  answer: string[]
  icon: LucideIcon
}

export interface TimelineItem {
  label: string
  text: string
}

/* ---------- Formulário de contato / agendamento ---------- */

export type InterestId = 'garagem' | 'embarcacao'

export interface InterestOption {
  id: InterestId
  label: string
  description: string
  icon: LucideIcon
}

export interface BookingValues {
  name: string
  email: string
  phone: string
  boatName: string
  boatSize: string
  interest: InterestId | ''
  message: string
  /** Campo-armadilha contra robôs: precisa ficar sempre vazio. */
  website: string
}

export type BookingField = Exclude<keyof BookingValues, 'website'>

export type BookingErrors = Partial<Record<BookingField, string>>
