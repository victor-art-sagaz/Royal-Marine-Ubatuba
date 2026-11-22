/**
 * Intermediário da previsão do tempo (roda na Cloudflare, de graça).
 *
 * O site e o app pedem /api/tempo?lat=..&lon=.. e este arquivo busca a previsão no
 * MET Norway (Instituto de Meteorologia da Noruega), que é gratuito inclusive para uso comercial.
 * Regras do MET Norway que cumprimos aqui:
 *   • identificar quem pede (User-Agent com nome e contato);
 *   • guardar a resposta por pelo menos 3 horas fora da região nórdica.
 * Assim, mesmo com a cidade inteira usando, o MET Norway recebe poucos pedidos.
 */

const UA = 'RoyalMarineUbatuba/1.0 (+https://royalmarineubatuba.com.br; contatoroyalmarine@gmail.com)'
const TRES_HORAS = 3 * 60 * 60

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })

export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  const lat = Number(url.searchParams.get('lat'))
  const lon = Number(url.searchParams.get('lon'))

  // Só Ubatuba e arredores: evita que outros sites usem o nosso intermediário
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -23.8 || lat > -23.2 || lon < -45.4 || lon > -44.6) {
    return json({ error: 'Local fora de Ubatuba' }, 400)
  }

  // Arredonda para aproveitar a mesma resposta guardada entre praias vizinhas
  const la = lat.toFixed(2)
  const lo = lon.toFixed(2)
  const cache = caches.default
  const cacheKey = new Request(`${url.origin}/api/tempo?lat=${la}&lon=${lo}`)

  const guardada = await cache.match(cacheKey)
  if (guardada) return guardada

  let resposta
  try {
    resposta = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${la}&lon=${lo}`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
    })
  } catch {
    return json({ error: 'Previsão indisponível no momento' }, 502)
  }
  if (!resposta.ok) return json({ error: 'Previsão indisponível no momento' }, 502)

  const corpo = await resposta.text()
  const pronta = new Response(corpo, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Navegador guarda 30 min; a Cloudflare guarda 3 horas
      'Cache-Control': `public, max-age=1800, s-maxage=${TRES_HORAS}`,
      'Access-Control-Allow-Origin': url.origin,
    },
  })
  context.waitUntil(cache.put(cacheKey, pronta.clone()))
  return pronta
}
