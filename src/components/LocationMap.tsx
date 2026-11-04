import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Anchor, ExternalLink, MapPin, MessageCircle, Navigation, Ship } from 'lucide-react'
import { contact } from '../data/site'
import { mapsEmbedUrl, mapsPlaceUrl, mapsRouteUrl, wazeUrl } from '../lib/maps'
import GlassButton from './GlassButton'

const tabIcons = [Ship, Anchor]

export default function LocationMap() {
  const [active, setActive] = useState(0)
  const address = contact.addresses[active]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-dark via-navy to-navy-dark py-20 text-white">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center">
          <p className="font-serif text-sm italic text-teal">Venha nos visitar</p>
          <h2 className="mt-2 font-display text-3xl font-light tracking-wide text-white sm:text-4xl">Como chegar</h2>
          <div className="mx-auto my-5 h-0.5 w-10 bg-teal" />
        </div>

        {/* Abas: Recepção / Garagem */}
        <div className="mx-auto mb-8 flex w-fit gap-1 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
          {contact.addresses.map((item, index) => {
            const Icon = tabIcons[index] ?? MapPin
            const isActive = index === active
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={isActive}
                className={`relative flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="map-tab-pill"
                    className="absolute inset-0 rounded-full border border-white/20 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} className={isActive ? 'text-teal' : 'opacity-80'} />
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Mapa do Google */}
          <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] lg:min-h-[460px]">
            <AnimatePresence mode="wait">
              <motion.iframe
                key={address.label}
                title={`Mapa do Google: ${address.label} da Royal Marine`}
                src={mapsEmbedUrl(address)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
            </AnimatePresence>
          </div>

          {/* Endereço e atalhos */}
          <div className="flex flex-col justify-between gap-6 rounded-3xl border border-white/15 bg-white/10 p-7 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div>
              <p className="flex items-center gap-2 font-serif text-sm italic text-teal">
                <MapPin size={16} /> {address.label}
              </p>
              <p className="mt-3 font-display text-2xl font-light normal-case leading-snug tracking-wide text-white">
                {address.street}
              </p>
              <p className="mt-1 text-sm font-light leading-relaxed text-white/80">
                {address.district}
                <br />
                {address.city} · CEP {address.cep}
              </p>
              <p className="mt-4 text-xs leading-relaxed text-white/60">
                Toque em “Traçar rota” e o Google Maps abre com a sua localização atual como ponto de partida, tudo
                pronto para iniciar a navegação.
              </p>
            </div>

            <div className="grid gap-3">
              <GlassButton href={mapsRouteUrl(address)} external tone="gold" icon={<Navigation size={18} />}>
                Traçar rota até a Royal Marine
              </GlassButton>
              <GlassButton href={mapsPlaceUrl(address)} external icon={<ExternalLink size={16} />}>
                Abrir no Google Maps
              </GlassButton>
              <GlassButton href={wazeUrl(address)} external icon={<Navigation size={16} />}>
                Abrir no Waze
              </GlassButton>
            </div>

            <div className="border-t border-white/10 pt-5">
              <p className="mb-3 font-display text-sm tracking-wider text-white/90">Ligue pra gente</p>
              <div className="flex flex-wrap gap-2">
                {contact.phones.map((phone) => (
                  <GlassButton
                    key={phone.whatsappNumber}
                    href={`https://wa.me/${phone.whatsappNumber}`}
                    external
                    icon={<MessageCircle size={16} />}
                    className="px-4 py-2"
                  >
                    {phone.display}
                  </GlassButton>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
