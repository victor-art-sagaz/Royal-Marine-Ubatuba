import type { Address } from '../types'

/** Endereço em uma linha só, do jeito que o Google Maps entende. */
export function addressQuery(address: Address): string {
  return `${address.street}, ${address.district}, ${address.city}, ${address.cep}`
}

/** Mapa para mostrar dentro da página (iframe, sem precisar de chave). */
export function mapsEmbedUrl(address: Address): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(addressQuery(address))}&output=embed&hl=pt-BR`
}

/** Abre o local no Google Maps (app no celular, site no computador). */
export function mapsPlaceUrl(address: Address): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery(address))}`
}

/**
 * Rota até a Royal Marine. Sem "origin", o Google usa a localização atual
 * da pessoa como ponto de partida; "dir_action=navigate" já deixa tudo pronto
 * para iniciar a navegação no celular.
 */
export function mapsRouteUrl(address: Address): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    addressQuery(address),
  )}&travelmode=driving&dir_action=navigate`
}

/** Atalho opcional para quem prefere o Waze. */
export function wazeUrl(address: Address): string {
  return `https://waze.com/ul?q=${encodeURIComponent(addressQuery(address))}&navigate=yes`
}
