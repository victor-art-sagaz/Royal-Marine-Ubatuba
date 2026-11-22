/**
 * Tábua de marés de Ubatuba (preia-mares e baixa-mares).
 * Fonte: Harari, J. "Tábuas das marés de Ubatuba, Santos e Cananéia para os anos de 2026 e 2027",
 * Instituto Oceanográfico da Universidade de São Paulo (IO-USP).
 * Estação: Base Norte do IO-USP, Ubatuba (23°30,0' S, 45°07,3' W). Hora legal de Brasília (UTC−3).
 * Alturas em metros em relação ao nível de redução (zero da carta náutica nº 1613); nível médio 0,66 m.
 *
 * Formato: [data e hora local "AAAA-MM-DDTHH:mm", altura em metros]
 * Para atualizar (ex.: 2028), troque a lista pela da nova tábua.
 */
export const TIDE_SOURCE = 'Tábua de marés de Ubatuba — Instituto Oceanográfico da USP (J. Harari), 2026–2027'

export const TIDE_EXTREMES: [string, number][] = [
  // (preenchido a partir da tábua oficial)
]
