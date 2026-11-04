import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getPost } from '../data/posts'
import { defaultSeo, notFoundSeo, OG_IMAGE, pageSeo, SITE_URL } from '../data/seo'
import type { PageSeo } from '../data/seo'

/** Acha (ou cria) uma tag no <head> da página. */
function ensureTag(selector: string, create: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  return el
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  const el = ensureTag(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement('meta')
    m.setAttribute(attr, key)
    return m
  })
  el.setAttribute('content', content)
}

/** Descobre o título e a descrição da página pelo endereço atual. */
function seoFor(pathname: string): PageSeo {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  const postMatch = path.match(/^\/news\/([^/]+)$/)
  if (postMatch) {
    const post = getPost(postMatch[1])
    if (post) {
      return { title: `${post.title} | Royal Marine`, description: post.excerpt }
    }
    return notFoundSeo
  }

  return pageSeo[path] ?? (path === '' ? defaultSeo : notFoundSeo)
}

/**
 * Atualiza o título, a descrição e os endereços de compartilhamento a cada troca de página.
 * Use uma vez só, no Layout.
 */
export function useSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const seo = seoFor(pathname)
    const cleanPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
    const url = `${SITE_URL}${cleanPath === '/' ? '/' : cleanPath}`

    // Endereços de teste da Vercel (…vercel.app) não devem aparecer no Google: só o domínio oficial
    const isTestAddress = window.location.hostname.endsWith('.vercel.app')

    document.title = seo.title
    setMeta('name', 'description', seo.description)
    setMeta(
      'name',
      'robots',
      isTestAddress ? 'noindex, nofollow' : seo.noindex ? 'noindex, follow' : 'index, follow',
    )

    setMeta('property', 'og:title', seo.title)
    setMeta('property', 'og:description', seo.description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', `${SITE_URL}${OG_IMAGE}`)
    setMeta('name', 'twitter:title', seo.title)
    setMeta('name', 'twitter:description', seo.description)

    const canonical = ensureTag('link[rel="canonical"]', () => {
      const l = document.createElement('link')
      l.setAttribute('rel', 'canonical')
      return l
    })
    canonical.setAttribute('href', url)
  }, [pathname])
}
