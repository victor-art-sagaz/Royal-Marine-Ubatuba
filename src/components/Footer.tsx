import { Compass, Facebook, Instagram, LifeBuoy, Mail, MapPin, MessageCircle, Ship, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import { aboutFooter, contact, menuItems } from '../data/site'
import { LogoAnchor } from './Logo'
import WaveDivider from './WaveDivider'

const glassRound =
  'flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]'

const glassPill =
  'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:bg-white/15 hover:text-white hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]'

export default function Footer() {
  return (
    <div>
      <WaveDivider rider="both" className="relative -mb-px text-navy-dark" />
      <footer className="relative overflow-hidden bg-navy-dark text-slate-300">
        {/* Marca d'água: a âncora da logo da Royal Marine */}
        <LogoAnchor className="pointer-events-none absolute -right-14 top-8 h-96 w-auto text-white/[0.045]" />

        <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-14">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Sobre */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-medium tracking-wider text-white">
                <LogoAnchor className="h-[18px] w-auto text-teal" /> Sobre
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">{aboutFooter}</p>
            </div>

            {/* Navegue */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-medium tracking-wider text-white">
                <Compass size={18} className="text-teal" /> Navegue
              </h3>
              <nav className="flex flex-wrap gap-2" aria-label="Rodapé">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.path} to={item.path} className={glassPill}>
                      <Icon size={14} className="text-teal" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Location */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-medium tracking-wider text-white">
                <MapPin size={18} className="text-teal" /> Location
              </h3>
              <ul className="space-y-4 text-sm leading-relaxed text-slate-400">
                {contact.addresses.map((a, i) => (
                  <li key={a.label} className="flex gap-3">
                    {i === 0 ? (
                      <Ship size={18} className="mt-0.5 shrink-0 text-teal" />
                    ) : (
                      <LogoAnchor className="mt-0.5 h-[18px] w-auto shrink-0 text-teal" />
                    )}
                    <span>
                      <span className="font-medium text-slate-200">{a.label}</span>
                      <br />
                      {a.street} – {a.district}
                      <br />
                      {a.city}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-medium tracking-wider text-white">
                <LifeBuoy size={18} className="text-teal" /> Contact us
              </h3>
              <ul className="space-y-3 text-sm text-slate-400">
                {contact.phones.map((p) => (
                  <li key={p.whatsappNumber}>
                    <a
                      href={`https://wa.me/${p.whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 transition hover:text-white"
                    >
                      <MessageCircle size={16} className="text-teal" />
                      {p.display}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 break-all transition hover:text-white">
                    <Mail size={16} className="shrink-0 text-teal" />
                    {contact.email}
                  </a>
                </li>
              </ul>
              <div className="mt-5 flex gap-3">
                <a href={contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className={glassRound}>
                  <Facebook size={20} />
                </a>
                <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className={glassRound}>
                  <Instagram size={20} />
                </a>
                <a href={`mailto:${contact.email}`} aria-label="E-mail" className={glassRound}>
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-2 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
            <Waves size={20} className="text-teal/70" />
            <p>© {new Date().getFullYear()} Royal Marine - Garagem Náutica. Todos os direitos reservados.</p>
            <Link to="/privacidade" className="underline-offset-4 transition hover:text-white hover:underline">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
