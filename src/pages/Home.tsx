import { CalendarCheck, MessageCircle, Radio, ShieldCheck, ShowerHead, Video, Warehouse, Wifi } from 'lucide-react'
import GlassButton from '../components/GlassButton'
import GoogleReviews from '../components/GoogleReviews'
import Reveal from '../components/Reveal'
import StatsBand from '../components/StatsBand'
import StructureGallery from '../components/StructureGallery'
import WaveDivider from '../components/WaveDivider'
import { contact, images } from '../data/site'
import { whatsappUrl } from '../lib/whatsapp'
import type { Feature } from '../types'

const features: Feature[] = [
  { icon: Warehouse, title: 'Vagas cobertas', text: 'Mais de 3.000m² de espaço amplo e coberto para até 80 embarcações.' },
  { icon: ShieldCheck, title: 'Sistema de alarme', text: 'Segurança reforçada para o seu patrimônio, todos os dias.' },
  { icon: Video, title: 'Monitoramento online 24h', text: 'Acompanhe a sua embarcação de onde você estiver.' },
  { icon: ShowerHead, title: 'Vestiários', text: 'Conforto para você e sua família antes e depois da navegação.' },
  { icon: Wifi, title: 'Wi-Fi', text: 'Internet disponível na estrutura para a sua comodidade.' },
  { icon: Radio, title: 'Sala de rádio', text: 'Apoio e comunicação para quem vive o mundo náutico.' },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section aria-labelledby="inicio-titulo" className="relative flex min-h-[78vh] items-center justify-center overflow-hidden bg-navy-dark px-6 pb-28 pt-24 text-center">
        <img
          src={images.ubatubaOndas}
          alt="Ondas quebrando em uma costeira de Ubatuba"
          className="absolute inset-0 h-full w-full animate-ken-burns object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/70 via-navy/40 to-navy-dark/80" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="font-serif text-sm italic text-teal sm:text-base">Royal Marine · Garagem Náutica</p>
          <h1 id="inicio-titulo" className="mt-4 font-display text-4xl font-light leading-tight tracking-wide text-white sm:text-6xl">
            NOVA GARAGEM NÁUTICA
            <br />
            DE UBATUBA
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-light text-white/90 sm:text-lg">
            Cuidamos da sua embarcação para manter o seu sonho em perfeito estado.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4">
            {/* Chamada principal: visível logo ao abrir o site, até no celular */}
            <GlassButton
              href={whatsappUrl(contact.phones[0].whatsappNumber)}
              external
              tone="gold"
              icon={<MessageCircle size={18} />}
            >
              Solicitar orçamento
            </GlassButton>
            <GlassButton to="/contact" icon={<CalendarCheck size={18} />}>
              Agende uma visita
            </GlassButton>
            <GlassButton to="/about-us">Conheça a garagem</GlassButton>
          </div>
        </div>
        <WaveDivider className="absolute inset-x-0 bottom-0 text-white" />
      </section>

      {/* Equipe */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <Reveal>
          <div className="relative pb-12 pr-8 sm:pr-12">
            <img
              src={images.galpaoInterior}
              alt="Interior coberto da garagem náutica Royal Marine, em Ubatuba"
              className="w-full rounded-2xl object-cover shadow-xl"
              loading="lazy"
            />
            <img
              src={images.galpaoFachada}
              alt="Estrutura metálica azul do telhado e embarcações guardadas na Royal Marine"
              className="absolute bottom-0 right-0 w-1/2 rounded-2xl border-4 border-white object-cover shadow-2xl"
              loading="lazy"
            />
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="font-serif text-sm italic text-teal-dark">Quem cuida do seu sonho</p>
          <h2 className="mt-2 font-display text-3xl font-light leading-tight sm:text-4xl">Equipe que você pode confiar</h2>
          <div className="my-5 h-0.5 w-10 bg-teal" />
          <p className="mb-4 font-light leading-relaxed">
            Somos especializados em cuidar de sua embarcação e manter seu sonho em perfeito estado!
          </p>
          <p className="mb-4 font-light leading-relaxed">
            Aqui você encontra uma equipe que você pode confiar, atendimento de qualidade, com agilidade, uma relação de
            respeito e estrutura para você e sua família.
          </p>
          <p className="font-light leading-relaxed">Nosso objetivo é cuidar do seu sonho com qualidade!</p>
        </Reveal>
      </section>

      {/* Diferenciais */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-12 text-center">
            <p className="font-serif text-sm italic text-teal-dark">Novo conceito em marina</p>
            <h2 className="mt-2 font-display text-3xl font-light sm:text-4xl">Tudo para a sua embarcação</h2>
            <div className="mx-auto mt-5 h-0.5 w-10 bg-teal" />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <Reveal key={f.title} delay={(i % 3) * 0.1}>
                  <div className="h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-teal">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-display text-xl tracking-wide text-navy">{f.title}</h3>
                    <p className="mt-2 text-sm font-light leading-relaxed">{f.text}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <StructureGallery />

      <StatsBand />

      <GoogleReviews />

      {/* Chamada final */}
      <section className="relative overflow-hidden py-20 text-center text-white">
        <img
          src={images.ubatubaPraia}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/80 to-navy/80" />
        <Reveal className="relative mx-auto max-w-3xl px-6">
          <h2 className="font-display text-3xl font-light tracking-wide text-white sm:text-4xl">Agende uma visita</h2>
          <p className="mt-4 font-light text-white/90">
            Venha conhecer a Royal Marine ou fale com a nossa equipe pelo WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <GlassButton to="/contact" icon={<CalendarCheck size={18} />}>
              Preencher formulário
            </GlassButton>
            {contact.phones.map((p) => (
              <GlassButton
                key={p.whatsappNumber}
                href={`https://wa.me/${p.whatsappNumber}`}
                external
                icon={<MessageCircle size={18} />}
              >
                {p.display}
              </GlassButton>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  )
}
