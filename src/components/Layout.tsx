import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, Waves, X } from 'lucide-react'
import { menuItems } from '../data/site'
import { BAND_HEIGHT, BAND_LOGO_W, useLogoFlight } from '../lib/useLogoFlight'
import { useSeo } from '../lib/useSeo'
import Logo, { LogoAnchor } from './Logo'
import Footer from './Footer'

const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

export default function Layout() {
  const [open, setOpen] = useState<boolean>(isDesktop)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  // Título, descrição e prévia de compartilhamento de cada página
  useSeo()

  const logoRef = useRef<HTMLAnchorElement>(null)
  const navRef = useRef<HTMLElement>(null)

  // A logo sai da faixa branca (só na Página Inicial) e vai para a barra lateral ao rolar
  useLogoFlight({ isHome, open, logoRef, navRef })

  // Ao trocar de página: volta ao topo e fecha o menu no celular
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    if (!isDesktop()) setOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen">
      {/* Fundo escuro atrás do menu no celular */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Botão do menu (efeito vidro) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`fixed top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-navy/70 text-white shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-md transition-all duration-300 hover:bg-navy/90 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] ${
          open ? 'left-4 lg:left-[17rem]' : 'left-4'
        }`}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={open}
        aria-controls="menu-lateral"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Logo: começa na faixa branca da Página Inicial e voa até a barra lateral */}
      <Link
        ref={logoRef}
        to="/"
        aria-label="Royal Marine - Garagem Náutica: ir para a página inicial"
        className="fixed left-0 top-0 block origin-top-left will-change-transform"
        style={{ width: BAND_LOGO_W, zIndex: 45 }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 shadow-[0_10px_26px_-6px_rgba(0,0,0,0.55)]"
          style={{ opacity: 'var(--logo-frame, 1)' }}
        />
        <span className="relative block">
          <Logo frameOpacity="var(--logo-frame, 1)" />
        </span>
      </Link>

      {/* Menu lateral */}
      <aside
        id="menu-lateral"
        className={`fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-navy-dark via-navy to-[#0e3a52] text-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu principal"
      >
        <LogoAnchor className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-auto text-white/[0.06]" />
        <nav ref={navRef} className="relative px-4 pb-8 pt-24 will-change-transform">
          <div className="flex flex-col gap-1 rounded-3xl border border-white/10 bg-white/5 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-md">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className="group relative flex items-center rounded-full px-4 py-3 text-sm font-medium"
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <motion.span
                          layoutId="glass-active-pill"
                          className="absolute inset-0 rounded-full border border-white/20 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      ) : (
                        <span className="absolute inset-0 rounded-full bg-white/0 transition-colors duration-200 group-hover:bg-white/10" />
                      )}
                      <span
                        className={`relative z-10 flex items-center gap-3 transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-teal' : 'opacity-80'} />
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
            <Waves size={14} /> Saco da Ribeira · Ubatuba
          </p>
        </nav>
      </aside>

      <div className={`transition-[padding] duration-300 ease-out ${open ? 'lg:pl-64' : 'lg:pl-0'}`}>
        {/* Faixa branca da logo: só na Página Inicial */}
        {isHome ? <div aria-hidden="true" className="bg-white" style={{ height: BAND_HEIGHT }} /> : null}

        <main>
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}
