/**
 * Intermediário da previsão de ondas (roda na Cloudflare, de graça).
 *
 * Busca a previsão de ondas de Ubatuba no CPTEC/INPE (governo brasileiro, gratuito),
 * transforma em um formato simples e guarda por 3 horas.
 * Resposta: { atualizado, itens: [{ hora (UTC), altura (m), direcao (graus), agitacao }] }
 */

const CPTEC = 'http://servicos.cptec.inpe.br/XML'
const TRES_HORAS = 3 * 60 * 60

const json = (data, status = 200, maxAge = 0) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': maxAge ? `public, max-age=1800, s-maxage=${maxAge}` : 'no-store',
    },
  })

/** Pontos cardeais (em inglês ou português) → graus */
const PONTOS = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, L: 90, ESE: 112.5, LSE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SSO: 202.5, SW: 225, SO: 225, WSW: 247.5, OSO: 247.5, W: 270, O: 270,
  WNW: 292.5, ONO: 292.5, NW: 315, NO: 315, NNW: 337.5, NNO: 337.5,
}

const tag = (xml, nome) => {
  const m = xml.match(new RegExp(`<${nome}>([^<]*)</${nome}>`))
  return m ? m[1].trim() : null
}

async function texto(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'RoyalMarineUbatuba/1.0' } })
  if (!r.ok) throw new Error(`CPTEC ${r.status}`)
  return r.text()
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  const cache = caches.default
  const cacheKey = new Request(`${url.origin}/api/ondas`)
  const guardada = await cache.match(cacheKey)
  if (guardada) return guardada

  try {
    // 1) Código do CPTEC para Ubatuba-SP
    const lista = await texto(`${CPTEC}/listaCidades?city=ubatuba`)
    const cidades = lista.split('<cidade>').slice(1)
    const sp = cidades.find((c) => tag(c, 'uf') === 'SP') ?? cidades[0]
    const id = sp ? tag(sp, 'id') : null
    if (!id) throw new Error('Cidade não encontrada')

    // 2) Ondas dos próximos dias
    const xml = await texto(`${CPTEC}/cidade/${id}/todos/tempos/ondas.xml`)
    const itens = xml
      .split('<previsao>')
      .slice(1)
      .map((bloco) => {
        // Ex.: "22-11-2026 12h Z"
        const dia = tag(bloco, 'dia') ?? ''
        const m = dia.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2})h/)
        const altura = Number((tag(bloco, 'altura') ?? '').replace(',', '.'))
        const dir = (tag(bloco, 'direcao') ?? '').toUpperCase()
        return m
          ? {
              hora: `${m[3]}-${m[2]}-${m[1]}T${m[4].padStart(2, '0')}:00:00Z`,
              altura: Number.isFinite(altura) ? altura : null,
              direcao: dir in PONTOS ? PONTOS[dir] : null,
              agitacao: tag(bloco, 'agitacao'),
            }
          : null
      })
      .filter(Boolean)
    if (!itens.length) throw new Error('Sem previsão de ondas')

    const pronta = json({ atualizado: tag(xml, 'atualizacao'), itens }, 200, TRES_HORAS)
    context.waitUntil(cache.put(cacheKey, pronta.clone()))
    return pronta
  } catch {
    return json({ error: 'Previsão de ondas indisponível no momento' }, 502)
  }
}
