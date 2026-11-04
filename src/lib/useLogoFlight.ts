import { useEffect, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useReducedMotion } from 'framer-motion'

/** Medidas (em pixels) da logo na faixa branca e na barra lateral. */
export const BAND_LOGO_W = 96
export const BAND_LOGO_TOP = 14
export const DOCK_LOGO_W = 112
export const DOCK_LOGO_TOP = 16
export const SIDEBAR_W = 256

/** Proporção altura/largura do desenho da logo (ver Logo.tsx). */
export const LOGO_RATIO = 1066 / 638

/** Altura da faixa branca da Página Inicial. */
export const BAND_HEIGHT = Math.round(BAND_LOGO_TOP * 2 + BAND_LOGO_W * LOGO_RATIO)

/** Onde a caixa de navegação começa quando a logo ainda não está na barra lateral (pt-24 = 96px). */
const NAV_TOP = 96
const NAV_GAP = 16
/** Quanto a caixa de navegação desce para abrir espaço para a logo. */
const NAV_SHIFT = DOCK_LOGO_TOP + DOCK_LOGO_W * LOGO_RATIO + NAV_GAP - NAV_TOP

/** Quantos pixels de rolagem a logo leva para chegar na barra lateral. */
const SCROLL_RANGE = 240

interface FlightOptions {
  isHome: boolean
  open: boolean
  logoRef: RefObject<HTMLElement>
  navRef: RefObject<HTMLElement>
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/**
 * Faz a logo "voar" da faixa branca (Página Inicial) até a barra lateral esquerda,
 * enquanto a caixa de navegação desce para dar lugar a ela.
 * Nas outras páginas a logo já fica na barra lateral.
 */
export function useLogoFlight({ isHome, open, logoRef, navRef }: FlightOptions): void {
  const reduce = useReducedMotion()
  const state = useRef({
    p: 1, // progresso atual: 0 = na faixa branca, 1 = na barra lateral
    tp: 1, // progresso desejado
    o: 1, // menu aberto (0 a 1) atual
    to: 1, // menu aberto desejado
    raf: 0,
    last: 0,
    running: false,
    isHome,
    reduce: Boolean(reduce),
  })

  const draw = useRef<() => void>(() => undefined)
  const kick = useRef<() => void>(() => undefined)

  // Define as funções que desenham e animam (uma vez só)
  useLayoutEffect(() => {
    const st = state.current

    draw.current = () => {
      const logo = logoRef.current
      const nav = navRef.current
      if (!logo) return
      const vw = document.documentElement.clientWidth
      const desktop = vw >= 1024
      const left = desktop ? st.o * SIDEBAR_W : 0
      const bandX = left + (vw - left) / 2 - BAND_LOGO_W / 2
      const dockX = st.o * SIDEBAR_W - SIDEBAR_W / 2 - DOCK_LOGO_W / 2
      const p = st.p
      const x = bandX + (dockX - bandX) * p
      const y = BAND_LOGO_TOP + (DOCK_LOGO_TOP - BAND_LOGO_TOP) * p
      const scale = 1 + (DOCK_LOGO_W / BAND_LOGO_W - 1) * p
      logo.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
      const f = clamp01((p - 0.3) / 0.7)
      logo.style.setProperty('--logo-frame', (f * f * (3 - 2 * f)).toFixed(3))
      // No celular o menu cobre a página: a logo só passa por cima dele quando já está encaixada
      logo.style.zIndex = desktop || p > 0.98 ? '45' : '20'
      if (nav) nav.style.transform = `translateY(${(p * NAV_SHIFT).toFixed(2)}px)`
    }

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - st.last) / 1000)
      st.last = now
      const k = st.reduce ? 1 : 1 - Math.exp(-dt * 8)
      st.p += (st.tp - st.p) * k
      st.o += (st.to - st.o) * k
      if (Math.abs(st.tp - st.p) < 0.0008) st.p = st.tp
      if (Math.abs(st.to - st.o) < 0.0008) st.o = st.to
      draw.current()
      if (st.p !== st.tp || st.o !== st.to) {
        st.raf = requestAnimationFrame(step)
      } else {
        st.running = false
      }
    }

    kick.current = () => {
      if (st.running) return
      st.running = true
      st.last = performance.now()
      st.raf = requestAnimationFrame(step)
    }

    // Posição inicial (sem animação), antes de a tela ser pintada
    st.reduce = Boolean(reduce)
    st.p = st.tp = st.isHome ? clamp01(window.scrollY / SCROLL_RANGE) : 1
    st.o = st.to = open ? 1 : 0
    draw.current()

    return () => {
      st.running = false
      cancelAnimationFrame(st.raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reage à página atual e ao menu abrir/fechar
  useEffect(() => {
    const st = state.current
    st.reduce = Boolean(reduce)
    st.isHome = isHome
    st.tp = isHome ? clamp01(window.scrollY / SCROLL_RANGE) : 1
    st.to = open ? 1 : 0
    kick.current()
  }, [isHome, open, reduce])

  // Acompanha a rolagem e o tamanho da tela
  useEffect(() => {
    const st = state.current
    const onScroll = () => {
      st.tp = st.isHome ? clamp01(window.scrollY / SCROLL_RANGE) : 1
      kick.current()
    }
    const onResize = () => {
      draw.current()
      kick.current()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])
}
