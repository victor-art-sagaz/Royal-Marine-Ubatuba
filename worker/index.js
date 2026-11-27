/**
 * Servidor do site na Cloudflare (Workers).
 *
 * • /api/om/forecast e /api/om/marine: buscam a previsão no Open-Meteo.
 *   - Com a chave do plano pago guardada na Cloudflare (OPEN_METEO_KEY), usa o servidor exclusivo
 *     para clientes (customer-api), liberado para uso comercial.
 *   - Sem a chave, usa o Open-Meteo gratuito.
 *   - Guarda cada resposta por 15 minutos, para não repetir pedidos iguais.
 * • www.royalmarineubatuba.com.br: leva para royalmarineubatuba.com.br.
 * • Qualquer outro endereço: entrega as páginas do site.
 */

const QUINZE_MIN = 15 * 60

const DESTINOS = {
  forecast: { gratis: 'https://api.open-meteo.com/v1/forecast', pago: 'https://customer-api.open-meteo.com/v1/forecast' },
  marine: { gratis: 'https://marine-api.open-meteo.com/v1/marine', pago: 'https://customer-marine-api.open-meteo.com/v1/marine' },
}

// Ubatuba e arredores: impede que outros sites usem a nossa chave
const dentroDeUbatuba = (lat, lon) => lat >= -23.8 && lat <= -23.2 && lon >= -45.4 && lon <= -44.6

const json = (data, status) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })

async function openMeteo(request, env, ctx, tipo) {
  const url = new URL(request.url)
  const destino = DESTINOS[tipo]
  if (!destino) return json({ error: 'Endereço inválido' }, 404)

  const lat = Number(url.searchParams.get('latitude'))
  const lon = Number(url.searchParams.get('longitude'))
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !dentroDeUbatuba(lat, lon)) {
    return json({ error: 'Local fora de Ubatuba' }, 400)
  }

  // Resposta já guardada?
  const cache = caches.default
  const chaveCache = new Request(`${url.origin}${url.pathname}?${url.searchParams.toString()}`)
  const guardada = await cache.match(chaveCache)
  if (guardada) return guardada

  const params = new URLSearchParams(url.searchParams)
  params.delete('apikey')
  const chave = env.OPEN_METEO_KEY
  if (chave) params.set('apikey', chave)
  const alvo = `${chave ? destino.pago : destino.gratis}?${params.toString()}`

  let resposta
  try {
    resposta = await fetch(alvo, { headers: { 'User-Agent': 'RoyalMarineUbatuba/1.0' } })
  } catch {
    return json({ error: 'Previsão indisponível no momento' }, 502)
  }
  if (!resposta.ok) return json({ error: 'Previsão indisponível no momento' }, 502)

  const pronta = new Response(await resposta.text(), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${QUINZE_MIN}`,
    },
  })
  ctx.waitUntil(cache.put(chaveCache, pronta.clone()))
  return pronta
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    // www.royalmarineubatuba.com.br → royalmarineubatuba.com.br (um endereço só, melhor para o Google)
    if (url.hostname === 'www.royalmarineubatuba.com.br') {
      url.hostname = 'royalmarineubatuba.com.br'
      return Response.redirect(url.toString(), 301)
    }
    if (url.pathname.startsWith('/api/om/')) {
      if (request.method !== 'GET') return json({ error: 'Método não permitido' }, 405)
      return openMeteo(request, env, ctx, url.pathname.slice('/api/om/'.length))
    }
    return env.ASSETS.fetch(request)
  },
}
