/**
 * Busca dados no Open-Meteo passando pelo nosso servidor na Cloudflare (/api/om/...).
 *
 * Por que passar pelo servidor: o plano pago do Open-Meteo usa uma chave (senha de acesso).
 * A chave fica guardada só na Cloudflare e nunca aparece no site.
 * Se o servidor não responder (por exemplo, na prévia da Vercel), o site busca direto
 * no Open-Meteo gratuito, para a previsão nunca ficar em branco.
 */

const ROTAS: [string, string][] = [
  ['https://api.open-meteo.com/v1/forecast', '/api/om/forecast'],
  ['https://marine-api.open-meteo.com/v1/marine', '/api/om/marine'],
]

/** Troca o endereço do Open-Meteo pelo do nosso servidor (ou devolve null se não for do Open-Meteo) */
function rotaInterna(url: string): string | null {
  for (const [externo, interno] of ROTAS) {
    if (url.startsWith(`${externo}?`)) return interno + url.slice(externo.length)
  }
  return null
}

export async function openMeteoFetch(url: string, signal?: AbortSignal): Promise<Response> {
  const interna = rotaInterna(url)
  if (interna) {
    try {
      const res = await fetch(interna, { signal })
      // Só aceita se a resposta for mesmo de previsão (JSON), e não a página do site
      if (res.ok && (res.headers.get('content-type') ?? '').includes('application/json')) return res
    } catch (erro) {
      if (signal?.aborted) throw erro
    }
  }
  return fetch(url, { signal })
}
