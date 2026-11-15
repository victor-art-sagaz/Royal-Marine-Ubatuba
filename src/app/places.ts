import type { Place } from '../lib/weather'

/** Praia de Ubatuba que a pessoa pode escolher no app */
export interface Beach extends Place {
  id: string
}

/**
 * Praias de Ubatuba (de sul para norte). Coordenadas aproximadas, na faixa de areia.
 * O app busca maré, ondas e tempo para o ponto escolhido (e um pouco mais ao largo se faltar dado).
 */
export const BEACHES: Beach[] = [
  { id: 'maranduba', name: 'Maranduba', lat: -23.5405, lon: -45.2255 },
  { id: 'lagoinha', name: 'Praia da Lagoinha', lat: -23.5195, lon: -45.1965 },
  { id: 'lazaro', name: 'Praia do Lázaro', lat: -23.5095, lon: -45.1355 },
  { id: 'saco-da-ribeira', name: 'Saco da Ribeira', lat: -23.5017, lon: -45.1176 },
  { id: 'enseada', name: 'Praia da Enseada', lat: -23.4955, lon: -45.0865 },
  { id: 'toninhas', name: 'Praia das Toninhas', lat: -23.4878, lon: -45.0715 },
  { id: 'praia-grande', name: 'Praia Grande', lat: -23.4685, lon: -45.0655 },
  { id: 'itagua', name: 'Itaguá · Centro', lat: -23.4525, lon: -45.0685 },
  { id: 'pereque-acu', name: 'Perequê-Açu', lat: -23.4175, lon: -45.0745 },
  { id: 'itamambuca', name: 'Itamambuca', lat: -23.4015, lon: -45.0125 },
  { id: 'felix', name: 'Praia do Félix', lat: -23.3935, lon: -44.9665 },
  { id: 'picinguaba', name: 'Picinguaba', lat: -23.3765, lon: -44.8375 },
]

export const DEFAULT_BEACH_ID = 'saco-da-ribeira'

export const beachById = (id: string | null | undefined): Beach =>
  BEACHES.find((b) => b.id === id) ?? BEACHES.find((b) => b.id === DEFAULT_BEACH_ID)!
